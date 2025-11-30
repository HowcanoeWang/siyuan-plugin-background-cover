import {
    Plugin,
    getFrontend,
    getBackend,
    IObject
} from "siyuan";

import { confmngr } from './utils/configs';
// import { configStore } from '@/services/configStore';

import { info, debug} from './utils/logger'
import { getCurrentThemeInfo} from './utils/theme';

import * as cst from './utils/constants';
import * as bgRender from "./services/bgRender"

import * as topbarUI from "./ui/topbar";
import * as noticeUI from "./ui/notice";
import * as settingsUI from "./ui/settings";
import * as fileManagerUI from "./ui/fileManager"

export default class BgCoverPlugin extends Plugin {

    /** 插件的唯一实例 */
    static instance: BgCoverPlugin;

    public isMobile: boolean;
    public isBrowser: boolean;
    public isAndroid: boolean;
    public htmlThemeNode = document.getElementsByTagName('html')[0];
    static i18n: IObject;

    async onload() {
        const frontEnd = getFrontend();
        const backEnd = getBackend();

        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";
        this.isBrowser = frontEnd.includes("browser");
        this.isAndroid = backEnd === "android";

        // 暴露给 confmngr 实例
        confmngr.plugin = this;

        // 图标的制作参见帮助文档
        this.addIcons(cst.diyIcon.iconLogo);

        await topbarUI.initTopbar(this);

        // 绑定快捷键
        this.addCommand({
            langKey: "selectPictureManualLabel",
            hotkey: "⇧⌘F6",
            callback: () => {
                topbarUI.selectPictureByHand();
            }
        });
        this.addCommand({
            langKey: "selectPictureRandomLabel",
            hotkey: "⇧⌘F7",
            callback: () => {
                topbarUI.selectPictureRandom(true);
            }
        });
        this.addCommand({
            langKey: "openBackgroundLabel",
            hotkey: "⇧⌘F4",
            callback: () => {
                topbarUI.pluginOnOff();
            }
        });
        this.addCommand({
            langKey: "reduceBackgroundOpacityLabel",
            hotkey: "⇧⌘7",
            callback: () => {
                settingsUI.opacityShortcut(false);

            }
        });
        this.addCommand({
            langKey: "addBackgroundOpacityLabel",
            hotkey: "⇧⌘8",
            callback: () => {
                settingsUI.opacityShortcut(true);

            }
        });
        this.addCommand({
            langKey: "reduceBackgroundBlurLabel",
            hotkey: "⇧⌘9",
            callback: () => {
                settingsUI.blurShortcut(false);

            }
        });
        this.addCommand({
            langKey: "addBackgroundBlurLabel",
            hotkey: "⇧⌘0",
            callback: () => {
                settingsUI.blurShortcut(true);

            }
        });

        // 侦测theme主题有没有发生变化
        // const themeChangeObserver = new MutationObserver(await this.themeOnChange.bind(this));
        // themeChangeObserver.observe(this.htmlThemeNode, { attributes: true });
        info(this.i18n.helloPlugin);
    }

    async onLayoutReady() {
        
        //初始化数据
        // configStore.load();
        await confmngr.load();

        bgRender.createBgLayer();
        
        await fileManagerUI.checkAssetsDir();

        // load the user setting data
        const [themeMode, themeName] = getCurrentThemeInfo();
        confmngr.set('prevTheme', themeName);

        await bgRender.applySettings();

        debug(`frontend: ${getFrontend()}; backend: ${getBackend()}`);

        // 去除检测到主题变化的提示(因为此时已经刷新了)
        noticeUI.removeThemeRefreshDialog();
    }

    onunload() {
        // solve cloud sync conflicts
        // configs.save('[index.ts][onunload]');

        // remove changes when deactivate plugin
        var bgLayer = document.getElementById('bglayer');
        bgLayer.remove();
        document.body.style.removeProperty('opacity');

        info(`${this.i18n.byePlugin}`);
    }

    private async themeOnChange() {
        const [themeMode, themeName] = getCurrentThemeInfo();
        let prevTheme = confmngr.get('prevTheme')

        debug(`Theme changed! from ${prevTheme} to ${themeMode} | ${themeName}`)

        if (prevTheme !== themeName) {
            // 更换主题时且没有重载时，提示需要刷新笔记页面
            confmngr.set('prevTheme', themeName);
            await confmngr.save('[index][themeOnChange]')
            noticeUI.themeRefreshDialog();
            // 如果重载了，这个界面会在onLoadReady时被去掉
        }
    }

    public openSetting() {
        settingsUI.openSettingDialog(this);
    }
}
