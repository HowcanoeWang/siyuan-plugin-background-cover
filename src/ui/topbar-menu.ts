import { Menu, getFrontend, fetchPost } from "siyuan"
import { configStore } from "../stores/config"
import { isDesktop } from "../utils/fs"
import { getFileUrl } from "../utils/fs"
import { putFile as apiPutFile } from "../utils/api"
import { classifyFileType } from "../constants"
import { svelteDialog, confirmDialog } from "../libs/dialog"
import { log } from "../utils/logger"
import UrlDialog from "./url-dialog.svelte"
import LocalDirDialog from "./local-dir-dialog.svelte"
import AssetPicker from "./sources/asset-picker.svelte"

interface MenuCallbacks {
    onOpenSettings: (tab?: string) => void
    toggleBackground: () => void
    randomSelect: () => void
}

export function buildTopBarMenu(
    triggerElement: HTMLElement,
    pluginInstance: any,
    cb: MenuCallbacks,
): Menu {
    const i18n = (window as any).bgCoverPlugin?.i18n ?? {}
    const isMobile = getFrontend() === "mobile" || getFrontend() === "browser-mobile"

    function showLocalDirDialog() {
        const dlg = svelteDialog({
            title: i18n.addLocalDirTitle,
            component: LocalDirDialog,
            width: "520px",
            height: "auto",
            props: {
                onConfirm: (path: string) => {
                    const folders = [...configStore.get("localFolders"), path]
                    configStore.set("localFolders", folders)
                    configStore.save()
                    log("[bgCover] menu: linkLocalDir", path)
                    dlg.close()
                    cb.onOpenSettings("sources")
                },
            },
        })
    }

    function pickMultipleFiles() {
        const input = document.createElement('input')
        input.type = 'file'
        input.multiple = true
        input.accept = 'image/*,video/*'
        input.style.display = 'none'
        document.body.appendChild(input)
        input.addEventListener('change', async () => {
            const files = input.files
            if (!files || files.length === 0) {
                document.body.removeChild(input)
                return
            }

            let lastUrl = ""

            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                try {
                    const formData = new FormData()
                    formData.append("path", `data/public/siyuan-plugin-background-cover/${file.name}`)
                    formData.append("isDir", "false")
                    formData.append("modTime", Math.floor(Date.now() / 1000).toString())
                    formData.append("file", file)

                    await new Promise<void>((resolve) => {
                        fetchPost("/api/file/putFile", formData, (res: any) => {
                            if (res.code === 0) {
                                lastUrl = getFileUrl(
                                    `data/public/siyuan-plugin-background-cover/${file.name}`,
                                    'upload'
                                )
                            }
                            resolve()
                        })
                    })
                } catch (e) {
                    console.warn('[bgCover] upload failed:', file.name, e)
                }
            }

            if (lastUrl) {
                log("[bgCover] menu: pickMultipleFiles done, lastUrl =", lastUrl)
                configStore.set("currentFile", lastUrl)
                configStore.save()
                const { renderImage, renderVideo, changeOpacity, changeBlur } = await import("../services/bgRender")
                if (lastUrl.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)) {
                    renderVideo(lastUrl)
                } else {
                    renderImage(lastUrl)
                }
                changeOpacity(configStore.get("opacity"))
                changeBlur(configStore.get("blur"))
            }

            document.body.removeChild(input)
            cb.onOpenSettings("sources")
        })
        input.click()
    }

    function showAssetsDirDialog() {
        const dlg = svelteDialog({
            title: i18n.addAssetsDirTitle,
            component: AssetPicker,
            width: "520px",
            height: "auto",
            props: {
                onConfirm: (paths: string[]) => {
                    const dirs = [...configStore.get("assetDirs")]
                    for (const dir of paths) {
                        if (dir && !dirs.includes(dir)) dirs.push(dir)
                    }
                    configStore.set("assetDirs", dirs)
                    configStore.save()
                    log("[bgCover] menu: linkAssetsDir", paths)
                    dlg.close()
                    cb.onOpenSettings("sources")
                },
            },
        })
    }

    function showUrlDialog() {
        log("[bgCover] menu: showUrlDialog")
        const dlg = svelteDialog({
            title: i18n.addUrlTitle,
            component: UrlDialog,
            width: "520px",
            height: "auto",
            props: {
                onSuccess: (uploadUrl?: string) => {
                    if (uploadUrl) {
                        configStore.set("currentFile", uploadUrl)
                        configStore.save()
                        import("../services/bgRender").then(m => {
                            if (uploadUrl.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)) {
                                m.renderVideo(uploadUrl)
                            } else {
                                m.renderImage(uploadUrl)
                            }
                            m.changeOpacity(configStore.get("opacity"))
                            m.changeBlur(configStore.get("blur"))
                        })
                    }
                    dlg.close()
                    cb.onOpenSettings("sources")
                },
            },
        })
    }

    function pickFolderFiles() {
        const input = document.createElement('input')
        input.type = 'file'
        input.setAttribute('webkitdirectory', '')
        input.style.display = 'none'
        document.body.appendChild(input)
        input.addEventListener('change', async () => {
            const files = input.files
            if (!files || files.length === 0) {
                document.body.removeChild(input)
                return
            }

            const validFiles: File[] = []
            for (let i = 0; i < files.length; i++) {
                if (classifyFileType(files[i].name) !== null) {
                    validFiles.push(files[i])
                }
            }

            if (validFiles.length === 0) {
                document.body.removeChild(input)
                return
            }

            if (validFiles.length >= 30) {
                const confirmed = await new Promise<boolean>((resolve) => {
                    confirmDialog({
                        title: i18n.bulkUploadTitle,
                        content: (i18n.bulkUploadWarning).replace('{count}', String(validFiles.length)),                        confirm: () => resolve(true),
                        cancel: () => resolve(false),
                        width: "420px",
                    })
                })
                if (!confirmed) {
                    document.body.removeChild(input)
                    return
                }
            }

            let lastUrl = ""

            for (const file of validFiles) {
                try {
                    const ok = await apiPutFile(
                        `data/public/siyuan-plugin-background-cover/${file.name}`,
                        file,
                    )
                    if (ok) {
                        lastUrl = getFileUrl(
                            `data/public/siyuan-plugin-background-cover/${file.name}`,
                            'upload'
                        )
                    }
                } catch (e) {
                    console.warn('[bgCover] folder upload failed:', file.name, e)
                }
            }

            if (lastUrl) {
                log("[bgCover] menu: pickFolderFiles done, lastUrl =", lastUrl)
                configStore.set("currentFile", lastUrl)
                configStore.save()
                const { renderImage, renderVideo, changeOpacity, changeBlur } = await import("../services/bgRender")
                if (lastUrl.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)) {
                    renderVideo(lastUrl)
                } else {
                    renderImage(lastUrl)
                }
                changeOpacity(configStore.get("opacity"))
                changeBlur(configStore.get("blur"))
            }

            document.body.removeChild(input)
            cb.onOpenSettings("sources")
        })
        input.click()
    }

    function buildAddBackgroundSubmenu(): any[] {
        const items: any[] = []
        if (isDesktop()) {
            items.push({
                icon: "iconFolder",
                label: i18n.linkLocalDir,
                click: showLocalDirDialog,
            })
        }
        items.push(
            {
                icon: "iconFilesRoot",
                label: i18n.addNoteAssetsDirectoryLabel,
                click: showAssetsDirDialog,
            },
            {
                icon: "iconFiles",
                label: i18n.uploadMultipleFiles,
                click: pickMultipleFiles,
            },
            {
                icon: "iconFolder",
                label: i18n.uploadEntireDir,
                click: pickFolderFiles,
            },
            {
                icon: "iconLink",
                label: i18n.addNetworkResource,
                click: showUrlDialog,
            }
        )
        return items
    }

    const menu = new Menu("bgCoverMenu", () => {})
    menu.addItem({
        icon: "iconIndent",
        label: i18n.selectPictureLabel,
        type: "submenu",
        submenu: [
            {
                icon: "iconHand",
                label: i18n.selectPictureManualLabel,
                accelerator: pluginInstance?.commands?.[0]?.customHotkey,
                click: () => cb.onOpenSettings("sources"),
            },
            {
                icon: "iconMark",
                label: i18n.selectPictureRandomLabel,
                accelerator: pluginInstance?.commands?.[1]?.customHotkey,
                click: () => cb.randomSelect(),
            },
        ],
    })
    menu.addItem({
        icon: "iconAdd",
        label: i18n.addBackground,
        type: "submenu",
        submenu: buildAddBackgroundSubmenu(),
    })
    menu.addItem({
        icon: configStore.get("activate") ? "iconClose" : "iconSelect",
        label: configStore.get("activate")
            ? i18n.closeBackgroundLabel
            : i18n.openBackgroundLabel,
        accelerator: pluginInstance?.commands?.[2]?.customHotkey,
        click: () => cb.toggleBackground(),
    })
    menu.addSeparator()
    menu.addItem({
        icon: "iconSettings",
        label: i18n.settingLabel,
        click: () => cb.onOpenSettings(),
    })

    if (isMobile) {
        menu.fullscreen()
    } else {
        const rect = triggerElement.getBoundingClientRect()
        menu.open({ x: rect.right, y: rect.bottom, isLeft: true })
    }

    return menu
}
