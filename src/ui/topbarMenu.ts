import { Menu, getFrontend } from "siyuan"
import { configStore } from "../stores/config"
import { isDesktop } from "../utils/fs"
import { devLog } from "../utils/logger"
import {
    showLocalDirDialog,
    showAssetsDirDialog,
    showUrlDialog,
    pickMultipleFiles,
    pickFolderFiles,
} from "./dialogs"

interface MenuItemConfig {
    icon: string
    label: string
    click: () => void
    accelerator?: string
    type?: string
    submenu?: MenuItemConfig[]
}

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

    async function applyLastUploaded(url: string) {
        configStore.set("currentFile", url)
        configStore.save()
        const { renderImage, renderVideo, changeOpacity, changeBlur } = await import("../services/bgRender")
        if (url.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)) {
            renderVideo(url)
        } else {
            renderImage(url)
        }
        changeOpacity(configStore.get("opacity"))
        changeBlur(configStore.get("blur"))
    }

    function buildAddBackgroundSubmenu(): MenuItemConfig[] {
        const items: MenuItemConfig[] = []
        if (isDesktop()) {
            items.push({
                icon: "iconFolder",
                label: i18n.linkLocalDir,
                click: () => showLocalDirDialog((path) => {
                    const folders = [...configStore.get("localFolders"), path]
                    configStore.set("localFolders", folders)
                    configStore.save()
                    devLog("[bgCover] menu: linkLocalDir", path)
                    cb.onOpenSettings("sources")
                }),
            })
        }
        items.push(
            {
                icon: "iconFilesRoot",
                label: i18n.addNoteAssetsDirectoryLabel,
                click: () => showAssetsDirDialog((paths) => {
                    const dirs = [...configStore.get("assetDirs")]
                    for (const dir of paths) {
                        if (dir && !dirs.includes(dir)) dirs.push(dir)
                    }
                    configStore.set("assetDirs", dirs)
                    configStore.save()
                    devLog("[bgCover] menu: linkAssetsDir", paths)
                    cb.onOpenSettings("sources")
                }),
            },
            {
                icon: "iconFiles",
                label: i18n.uploadMultipleFiles,
                click: () => pickMultipleFiles((lastUrl) => {
                    devLog("[bgCover] menu: pickMultipleFiles done, lastUrl =", lastUrl)
                    applyLastUploaded(lastUrl)
                    cb.onOpenSettings("sources")
                }),
            },
            {
                icon: "iconFolder",
                label: i18n.uploadEntireDir,
                click: () => pickFolderFiles((lastUrl) => {
                    devLog("[bgCover] menu: pickFolderFiles done, lastUrl =", lastUrl)
                    applyLastUploaded(lastUrl)
                    cb.onOpenSettings("sources")
                }),
            },
            {
                icon: "iconLink",
                label: i18n.uploadNetworkResource,
                click: () => showUrlDialog((uploadUrl) => {
                    if (uploadUrl) {
                        applyLastUploaded(uploadUrl)
                    }
                    cb.onOpenSettings("sources")
                }),
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
