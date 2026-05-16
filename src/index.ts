import {
    Plugin,
    getFrontend,
    Menu,
} from "siyuan"

import { SettingUtils } from "./libs/setting-utils"
import { svelteDialog } from "./libs/dialog"
import { configStore } from "./stores/config"
import SettingPanel from "./ui/setting-panel.svelte"

export { SettingUtils }
export { svelteDialog }

const STORAGE_NAME = "settings"

export default class BgCoverPlugin extends Plugin {

    public isMobileLayout: boolean
    private settingUtils: SettingUtils

    async onload() {
        const frontEnd = getFrontend()
        this.isMobileLayout = frontEnd === "mobile" || frontEnd === "browser-mobile"

        await configStore.load()

        ;(window as any).bgCoverPlugin = {
            i18n: this.i18n,
            isMobileLayout: this.isMobileLayout,
            plugin: this,
            configStore,
        }

        this.addIcons(`<symbol id="iconCoverBg" viewBox="0 0 32 32">
<path d="M4 4h24v24H4z"/>
</symbol>`)

        this.addCommand({ langKey: "selectPictureManualLabel", hotkey: "⇧⌘F6", callback: () => {} })
        this.addCommand({ langKey: "selectPictureRandomLabel", hotkey: "⇧⌘F7", callback: () => {} })
        this.addCommand({ langKey: "openBackgroundLabel", hotkey: "⇧⌘F4", callback: () => {} })
        this.addCommand({ langKey: "reduceBackgroundOpacityLabel", hotkey: "⇧⌘7", callback: () => {} })
        this.addCommand({ langKey: "addBackgroundOpacityLabel", hotkey: "⇧⌘8", callback: () => {} })
        this.addCommand({ langKey: "reduceBackgroundBlurLabel", hotkey: "⇧⌘9", callback: () => {} })
        this.addCommand({ langKey: "addBackgroundBlurLabel", hotkey: "⇧⌘0", callback: () => {} })

        this.settingUtils = new SettingUtils({
            plugin: this,
            name: STORAGE_NAME,
        })
        this.settingUtils.addItem({
            key: "hint",
            value: "",
            type: "hint",
            title: this.i18n.notImplementTitle,
            description: this.i18n.notImplementMsg,
        })

        console.log(this.i18n.helloPlugin)
    }

    onLayoutReady() {
        const topBarElement = this.addTopBar({
            icon: "iconCoverBg",
            title: this.i18n.addTopBarIcon,
            position: "right",
            callback: () => this.addMenu(topBarElement),
        })
        this.settingUtils.load().catch(e =>
            console.error("Error loading settings:", e)
        )
    }

    openSetting(): void {
        svelteDialog({
            title: "Background Cover",
            width: "800px",
            height: "35rem",
            component: SettingPanel,
            props: { app: this.app },
        })
    }

    onunload() {
        console.log(this.i18n.byePlugin)
    }

    private addMenu(topBarElement: HTMLElement) {
        const menu = new Menu("bgCoverMenu", () => {})
        menu.addItem({
            icon: "iconSettings",
            label: this.i18n.settingLabel,
            click: () => this.openSetting(),
        })
        menu.addItem({
            icon: "iconImage",
            label: this.i18n.notImplementMsg,
            type: "readonly",
        })
        if (this.isMobileLayout) {
            menu.fullscreen()
        } else {
            const rect = topBarElement.getBoundingClientRect()
            menu.open({ x: rect.right, y: rect.bottom, isLeft: true })
        }
    }
}
