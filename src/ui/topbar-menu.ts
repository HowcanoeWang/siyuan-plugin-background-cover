import { Menu, getFrontend, fetchPost } from "siyuan"
import { configStore } from "../stores/config"
import { isDesktop } from "../utils/fs"
import { getFileUrl } from "../utils/fs"
import { putFile as apiPutFile } from "../utils/api"
import { classifyFileType } from "../types"
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
        svelteDialog({
            title: i18n.addLocalDirTitle ?? "添加本地目录",
            component: LocalDirDialog,
            width: "520px",
            height: "auto",
            props: {
                onConfirm: (path: string) => {
                    const folders = [...configStore.get("localFolders"), path]
                    configStore.set("localFolders", folders)
                    configStore.save()
                    log("[bgCover] menu: linkLocalDir", path)
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
        svelteDialog({
            title: i18n.addAssetsDirTitle ?? "选择 data/assets/ 下的子文件夹作为图片源",
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
                    cb.onOpenSettings("sources")
                },
            },
        })
    }

    function showUrlDialog() {
        log("[bgCover] menu: showUrlDialog")
        svelteDialog({
            title: i18n.addUrlTitle ?? "添加网络背景资源",
            component: UrlDialog,
            width: "520px",
            height: "auto",
            props: {
                onSuccess: () => {
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
                        title: i18n.bulkUploadTitle ?? "大量文件警告",
                        content: (i18n.bulkUploadWarning ?? "此次将上传 {count} 张图片/视频，确定全部上传吗？").replace('{count}', String(validFiles.length)),
                        confirm: () => resolve(true),
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
                label: i18n.linkLocalDir ?? "链接本地目录",
                click: showLocalDirDialog,
            })
        }
        items.push(
            {
                icon: "iconFilesRoot",
                label: i18n.addNoteAssetsDirectoryLabel ?? "链接资源目录",
                click: showAssetsDirDialog,
            },
            {
                icon: "iconFiles",
                label: i18n.uploadMultipleFiles ?? "上传多个文件",
                click: pickMultipleFiles,
            },
            {
                icon: "iconFolder",
                label: i18n.uploadEntireDir ?? "上传整个目录",
                click: pickFolderFiles,
            },
            {
                icon: "iconLink",
                label: i18n.addNetworkResource ?? "添加网络资源",
                click: showUrlDialog,
            }
        )
        return items
    }

    const menu = new Menu("bgCoverMenu", () => {})
    menu.addItem({
        icon: "iconIndent",
        label: i18n.selectPictureLabel ?? "Select Pictures",
        type: "submenu",
        submenu: [
            {
                icon: "iconHand",
                label: i18n.selectPictureManualLabel ?? "Manual Selection",
                accelerator: pluginInstance?.commands?.[0]?.customHotkey,
                click: () => cb.onOpenSettings("sources"),
            },
            {
                icon: "iconMark",
                label: i18n.selectPictureRandomLabel ?? "Random Selection",
                accelerator: pluginInstance?.commands?.[1]?.customHotkey,
                click: () => cb.randomSelect(),
            },
        ],
    })
    menu.addItem({
        icon: "iconAdd",
        label: i18n.addBackground ?? "添加背景",
        type: "submenu",
        submenu: buildAddBackgroundSubmenu(),
    })
    menu.addItem({
        icon: configStore.get("activate") ? "iconClose" : "iconSelect",
        label: configStore.get("activate")
            ? i18n.closeBackgroundLabel ?? "Close Background"
            : i18n.openBackgroundLabel ?? "Open Background",
        accelerator: pluginInstance?.commands?.[2]?.customHotkey,
        click: () => cb.toggleBackground(),
    })
    menu.addSeparator()
    menu.addItem({
        icon: "iconSettings",
        label: i18n.settingLabel ?? "Settings",
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
