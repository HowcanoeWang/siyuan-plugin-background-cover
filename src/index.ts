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
    getThemeInfo
} from './utils';
import * as cst from './constants';
import * as adp from './themeAdapterUI';
import * as topbarUI from "./topbarUI";
import * as noticeUI from "./noticeUI";
import * as settingsUI from "./settingsUI";
import * as fileManagerUI from "./fileManagerUI"
import * as bgRender from "./bgRender"
import * as themeAdapterUI from "./themeAdapterUI";

import packageInfo from '../plugin.json'
import "./index.scss";

// pythonic style
let os = new OS();
let ka = new KernelApi();
let cv2 = new CloseCV();
let np = new Numpy();

export default class BgCoverPlugin extends Plugin {

    public isMobile: boolean;

    public htmlThemeNode = document.getElementsByTagName('html')[0];

    public cssThemeStyle: cst.cssThemeOldStyle = {};

    async onload() {
        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

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
                topbarUI.selectPictureByHand(this);
            }
        });
        this.addCommand({
            langKey: "selectPictureRandomLabel",
            hotkey: "⇧⌘F7",
            callback: () => {
                topbarUI.selectPictureRandom(this, true);
            }
        });
        this.addCommand({
            langKey: "openBackgroundLabel",
            hotkey: "⇧⌘F4",
            callback: () => {
                topbarUI.pluginOnOff(this);
            }
        });

        // 侦测theme主题有没有发生变化
        const themeChangeObserver = new MutationObserver(await this.themeOnChange.bind(this));
        themeChangeObserver.observe(this.htmlThemeNode, { attributes: true });
        info(this.i18n.helloPlugin);
    }

    async onLayoutReady() {
        this.cssThemeStyle = {}

        bgRender.createBgLayer();

        // 给layouts, dockLeft, dockRight三个元素的父级面板，增加一个方便定位的ID值
        let dockPanelElement = document.getElementById('layouts').parentElement
        dockPanelElement.id = 'dockPanel'

        await fileManagerUI.checkCacheDirctory(this);

        // load the user setting data
        const [themeMode, themeName] = getThemeInfo();
        configs.set('prevTheme', themeName);

        // this.changeOpacity(0.85);
        await bgRender.applySettings(this);

        debug(`frontend: ${getFrontend()}; backend: ${getBackend()}`);

        // 临时debug用，不用每次都打开
        themeAdapterUI.adaptConfigEditor(this);
    }

    onunload() {
        info(`${this.i18n.byePlugin}`);
        configs.save();

        let dockPanelElement = document.getElementById('dockPanel');
        dockPanelElement.id = null;
    }

    // private eventBusLog({detail}: any) {
    //     info(detail);
    // }

    private async themeOnChange() {
        const [themeMode, themeName] = getThemeInfo();
        let prevTheme = configs.get('prevTheme')

        debug(`Theme changed! from ${prevTheme} to ${themeMode} | ${themeName}`)

        if (prevTheme !== themeName) {
            // 更换主题时，强制刷新笔记页面
            configs.set('prevTheme', themeName);
            await configs.save()
            window.location.reload()
        }
    }
}
