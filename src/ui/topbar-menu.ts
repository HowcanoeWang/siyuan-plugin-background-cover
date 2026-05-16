import { Menu, getFrontend, fetchPost } from "siyuan"
import { configStore } from "../stores/config"
import { isDesktop } from "../utils/fs"
import { getFileUrl } from "../utils/fs"
import { svelteDialog } from "../libs/dialog"
import UrlDialog from "./url-dialog.svelte"
import LocalDirDialog from "./local-dir-dialog.svelte"

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
            title: "添加本地目录",
            component: LocalDirDialog,
            width: "520px",
            height: "auto",
            props: {
                onConfirm: (path: string) => {
                    const folders = [...configStore.get("localFolders"), path]
                    configStore.set("localFolders", folders)
                    configStore.save()
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
                    const dataUrl = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader()
                        reader.onload = () => resolve(reader.result as string)
                        reader.onerror = () => reject(reader.error)
                        reader.readAsDataURL(file)
                    })

                    await new Promise<void>((resolve) => {
                        fetchPost("/api/file/putFile", {
                            path: `data/public/siyuan-plugin-background-cover/${file.name}`,
                            file: dataUrl,
                        }, (res: any) => {
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
                    console.warn('[topbar-menu] upload failed:', file.name, e)
                }
            }

            if (lastUrl) {
                configStore.set("currentFile", lastUrl)
                configStore.save()
                const { renderImage, renderVideo } = await import("../services/bgRender")
                if (lastUrl.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)) {
                    renderVideo(lastUrl)
                } else {
                    renderImage(lastUrl)
                }
            }

            document.body.removeChild(input)
            cb.onOpenSettings("sources")
        })
        input.click()
    }

    function showUrlDialog() {
        svelteDialog({
            title: "添加网络背景资源",
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

    function buildAddBackgroundSubmenu(): any[] {
        const items: any[] = []
        if (isDesktop()) {
            items.push({
                icon: "iconFolder",
                label: "添加本地目录",
                click: showLocalDirDialog,
            })
        }
        items.push(
            {
                icon: "iconImage",
                label: "多个本地背景资源",
                click: pickMultipleFiles,
            },
            {
                icon: "iconLink",
                label: "网络背景资源",
                click: showUrlDialog,
            },
            {
                icon: "iconFilesRoot",
                label: i18n.addNoteAssetsDirectoryLabel ?? "Add assets folder",
                click: () => cb.onOpenSettings("sources"),
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
        label: "添加背景",
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
