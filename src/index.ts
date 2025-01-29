import {
    Plugin,
    showMessage,
    confirm,
    Dialog,
    Menu,
    // openTab,
    // adaptHotkey,
    getFrontend,
    getBackend,
    // IModel,
    // Setting, fetchPost
} from "siyuan";

import { KernelApi } from "./siyuanAPI";
import { configs } from './configs';
import {
    error, warn, info, debug,
    CloseCV, MD5, OS, Numpy,
    getCurrentThemeInfo
} from './utils';
import * as cst from './constants';
import * as topbarUI from "./topbarUI";
import * as noticeUI from "./noticeUI";
import * as settingsUI from "./settingsUI";
import * as fileManagerUI from "./fileManagerUI"
import * as bgRender from "./bgRender"

import packageInfo from '../plugin.json'
import "./index.scss";

// pythonic style
let os = new OS();
let ka = new KernelApi();
let cv2 = new CloseCV();
let np = new Numpy();

export default class BgCoverPlugin extends Plugin {

    public isMobileLayout: boolean;
    public isBrowser: boolean;
    public isAndroidBackend: boolean;
    public htmlThemeNode = document.getElementsByTagName('html')[0];

    async onload() {
        const frontEnd = getFrontend();
        const backEnd = getBackend();

        this.isMobileLayout = frontEnd === "mobile" || frontEnd === "browser-mobile";
        this.isBrowser = frontEnd.includes("browser");
        this.isAndroidBackend = backEnd === "android";

        window.bgCoverPlugin = {
            i18n: this.i18n,
            isMobileLayout: this.isMobileLayout,
            isBrowser: this.isBrowser,
            isAndroid: this.isAndroidBackend,
        };
        
        // 图标的制作参见帮助文档
        this.addIcons(cst.diyIcon.iconLogo);

        configs.setPlugin(this);
        //初始化数据
        await configs.load();
        await topbarUI.initTopbar(this)

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
            langKey: "reduceBackgroundOpacity",
            hotkey: "⇧⌘7",
            callback: () => {
                settingsUI.opacityShortcut(false);

            }
        });
        this.addCommand({
            langKey: "addBackgroundOpacity",
            hotkey: "⇧⌘8",
            callback: () => {
                settingsUI.opacityShortcut(true);

            }
        });
        this.addCommand({
            langKey: "reduceBackgroundBlur",
            hotkey: "⇧⌘9",
            callback: () => {
                settingsUI.blurShortcut(false);

            }
        });
        this.addCommand({
            langKey: "addBackgroundBlur",
            hotkey: "⇧⌘0",
            callback: () => {
                settingsUI.blurShortcut(true);

            }
        });

        // 侦测theme主题有没有发生变化
        const themeChangeObserver = new MutationObserver(await this.themeOnChange.bind(this));
        themeChangeObserver.observe(this.htmlThemeNode, { attributes: true });
        info(this.i18n.helloPlugin);
    }

    async onLayoutReady() {
        bgRender.createBgLayer();
        
        await fileManagerUI.checkCacheDirctory();

        // load the user setting data
        const [themeMode, themeName] = getCurrentThemeInfo();
        configs.set('prevTheme', themeName);

        await bgRender.applySettings();

        debug(`frontend: ${getFrontend()}; backend: ${getBackend()}`);

        // 去除检测到主题变化的提示(因为此时已经刷新了)
        noticeUI.removeThemeRefreshDialog();
    }

    onunload() {
        info(`${this.i18n.byePlugin}`);
        configs.save('[index.ts][onunload]');

        // remove changes when deactivate plugin
        var bgLayer = document.getElementById('bglayer');
        bgLayer.remove();
        document.body.style.removeProperty('opacity');
    }

    // private eventBusLog({detail}: any) {
    //     info(detail);
    // }

    private async themeOnChange() {
        const [themeMode, themeName] = getCurrentThemeInfo();
        let prevTheme = configs.get('prevTheme')

        debug(`Theme changed! from ${prevTheme} to ${themeMode} | ${themeName}`)

        if (prevTheme !== themeName) {
            // 更换主题时且没有重载时，提示需要刷新笔记页面
            configs.set('prevTheme', themeName);
            await configs.save('[index][themeOnChange]')
            noticeUI.themeRefreshDialog();
            // 如果重载了，这个界面会在onLoadReady时被去掉
        }
    }

    public openSetting() {
        settingsUI.openSettingDialog(this);
    }
}
