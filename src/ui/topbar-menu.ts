import { Menu, getFrontend } from "siyuan"
import { configStore } from "../stores/config"
import { isDesktop } from "../utils/fs"
import { svelteDialog } from "../libs/dialog"
import UrlDialog from "./url-dialog.svelte"

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

    function pickLocalFolder(callback: (dir: string) => void) {
        const input = document.createElement('input')
        input.type = 'file'
        input.setAttribute('webkitdirectory', '')
        input.style.display = 'none'
        document.body.appendChild(input)
        input.addEventListener('change', () => {
            const files = input.files
            if (files && files.length > 0) {
                const firstPath = (files[0] as any).path ?? files[0].webkitRelativePath
                const dir = firstPath.includes('/')
                    ? firstPath.substring(0, firstPath.lastIndexOf('/'))
                    : firstPath
                callback(dir)
            }
            document.body.removeChild(input)
        })
        input.click()
    }

    function pickMultipleFiles(callback: (files: FileList) => void) {
        const input = document.createElement('input')
        input.type = 'file'
        input.multiple = true
        input.accept = 'image/*,video/*'
        input.style.display = 'none'
        document.body.appendChild(input)
        input.addEventListener('change', () => {
            if (input.files && input.files.length > 0) {
                callback(input.files)
            }
            document.body.removeChild(input)
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
                click: () => {
                    pickLocalFolder((dir: string) => {
                        const folders = [...configStore.get("localFolders"), dir]
                        configStore.set("localFolders", folders)
                        configStore.save()
                        cb.onOpenSettings("sources")
                    })
                },
            })
        }
        items.push(
            {
                icon: "iconImage",
                label: "多个本地背景资源",
                click: () => {
                    pickMultipleFiles(async (files: FileList) => {
                        for (let i = 0; i < files.length; i++) {
                            const file = files[i]
                            const fsp = (window as any).require?.('fs/promises')
                            if (isDesktop() && fsp && (file as any).path) {
                                try {
                                    const srcPath = (file as any).path
                                    const wsDir = (window as any).siyuan?.config?.system?.workspaceDir ?? ''
                                    const dest = `${wsDir}/data/public/siyuan-plugin-background-cover/${file.name}`
                                    await fsp.copyFile(srcPath, dest)
                                } catch (e) {
                                    console.warn('[topbar-menu] copyFile failed:', e)
                                }
                            } else {
                                const reader = new FileReader()
                                await new Promise<void>((resolve) => {
                                    reader.onload = () => {
                                const fetchPost = (window as any).fetchPost
                                fetchPost?.('/api/file/putFile', {
                                            path: `data/public/siyuan-plugin-background-cover/${file.name}`,
                                            file: reader.result,
                                        }, () => resolve())
                                    }
                                    reader.onerror = () => resolve()
                                    reader.readAsDataURL(file)
                                })
                            }
                        }
                        cb.onOpenSettings("sources")
                    })
                },
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
