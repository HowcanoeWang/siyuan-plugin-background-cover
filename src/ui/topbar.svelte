<script lang="ts">
    import { Menu, getFrontend } from "siyuan"
    import { configStore } from "../../stores/config"
    import { isDesktop } from "../../utils/fs"

    interface Props {
        pluginInstance: any
        onOpenSettings: (tab?: string) => void
    }

    let { pluginInstance, onOpenSettings }: Props = $props()

    const i18n = (window as any).bgCoverPlugin?.i18n ?? {}
    const isMobile = getFrontend() === "mobile" || getFrontend() === "browser-mobile"

    function buildAddImageSubmenu(): any[] {
        const items: any[] = []
        if (isDesktop()) {
            items.push({
                icon: "iconFolder",
                label: "添加本地目录",
                click: () => {},
            })
        }
        items.push(
            {
                icon: "iconImage",
                label: "上传多张本地图片",
                click: () => {},
            },
            {
                icon: "iconLink",
                label: "上传一张网络图片",
                click: () => {},
            },
            {
                icon: "iconFilesRoot",
                label: i18n.addNoteAssetsDirectoryLabel ?? "Add assets folder",
                click: () => {},
            }
        )
        return items
    }

    function buildMenu(): Menu {
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
                    click: () => onOpenSettings("sources"),
                },
                {
                    icon: "iconMark",
                    label: i18n.selectPictureRandomLabel ?? "Random Selection",
                    accelerator: pluginInstance?.commands?.[1]?.customHotkey,
                    click: () => {},
                },
            ],
        })
        menu.addItem({
            icon: "iconAdd",
            label: "添加图片",
            type: "submenu",
            submenu: buildAddImageSubmenu(),
        })
        menu.addItem({
            icon: configStore.get("activate") ? "iconClose" : "iconSelect",
            label: configStore.get("activate")
                ? i18n.closeBackgroundLabel ?? "Close Background"
                : i18n.openBackgroundLabel ?? "Open Background",
            accelerator: pluginInstance?.commands?.[2]?.customHotkey,
            click: () => {
                configStore.setAndSave("activate", !configStore.get("activate"))
            },
        })
        menu.addSeparator()
        menu.addItem({
            icon: "iconSettings",
            label: i18n.settingLabel ?? "Settings",
            click: () => onOpenSettings(),
        })

        if (isMobile) {
            menu.fullscreen()
        }
        return menu
    }

    export function showMenu(triggerElement: HTMLElement, pluginInstance: any, onOpenSettings: (tab?: string) => void) {
        const menu = buildMenu()
        if (!isMobile) {
            const rect = triggerElement.getBoundingClientRect()
            menu.open({ x: rect.right, y: rect.bottom, isLeft: true })
        }
        return menu
    }
</script>
