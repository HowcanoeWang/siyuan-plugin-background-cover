import {
    Plugin,
    getFrontend,
    getBackend,
    IObject
} from "siyuan";

import { configStore } from '@/services/configStore';
import { pluginStore } from './services/pluginStore';

import { info, debug} from './utils/logger'

import * as cst from './utils/constants';
import * as bgRender from "./services/bgRender"

import * as topbarUI from "./ui/topbar";
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

        // 图标的制作参见帮助文档
        this.addIcons(cst.diyIcon.iconLogo);

        pluginStore.set(this);

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
        configStore.load();
        
        // await fileManagerUI.checkAssetsDir();

        // 初始化背景渲染服务
        // 它会自动订阅 configStore 的后续变化
        bgRender.initBgRenderService(); // [2] 调用初始化


        debug(`frontend: ${getFrontend()}; backend: ${getBackend()}`);
    }

    onunload() {
        // solve cloud sync conflicts
        // configs.save('[index.ts][onunload]');

        // 销毁服务，清理所有副作用
        bgRender.destroyBgRenderService(); // [3] 调用销毁

        pluginStore.set(null); // [4] 插件卸载时清空 Store，是个好习惯

        info(`${this.i18n.byePlugin}`);
    }

    public openSetting() {
        settingsUI.openSettingDialog(this);
    }
}
