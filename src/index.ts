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
import * as adp from './themeAdapt';
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
        this.adaptConfigEditor();
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



    public async adaptConfigEditor() {
        const [themeMode, themeName] = getThemeInfo();

        const configEditor = new Dialog({
            title: this.i18n.themeAdaptContentDes,
            width: this.isMobile ? "92vw" : "520px",
            height: "75vh",
            content: `
            <div class="fn__flex-column" style="height:100%; overflow: auto; box-sizing: border-box;">

                <div class="b3-label file-tree config-keymap" id="keymapList" style="height:100%;">
                    <div class="fn__flex config__item">
                        <a href="https://github.com/HowcanoeWang/siyuan-plugin-background-cover/discussion">${this.i18n.themeAdaptEditorShare}</a>
                    </div>

                    <div class="fn__hr"></div>

                    <div class="fn__flex config__item">
                        <span>${this.i18n.themeAdaptEditorDes1}</span>

                        <span class="fn__space"></span>
                        
                        <code style="color:red;">${themeName}</code> 

                        <span class="fn__space"></span>

                        <span>${this.i18n.themeAdaptEditorDes2}</span>
                        
                        <span class="fn__space"></span>
                        
                        <code style="color:red;">${themeMode === 0 ? this.i18n.themeAdaptEditorMode0 : this.i18n.themeAdaptEditorMode1}</code>
                    </div>
                    
                    <div class="fn__hr"></div>

                    <div class="fn__flex config__item">
                        <span>${this.i18n.themeAdaptEditorDes3}</span>
                    </div>

                    <div class="fn__hr"></div>

                    <!-- Top menu -->
                    <div class="b3-list b3-list--border b3-list--background">

                        <!-- 第一级菜单 start -->
                        <div class="b3-list-item b3-list-item--narrow b3-list-item--hide-action toggle">
                            <span class="b3-list-item__toggle b3-list-item__toggle--hl">
                                <svg class="b3-list-item__arrow b3-list-item__arrow--open"><use xlink:href="#iconRight"></use></svg>
                            </span>
                            <span class="b3-list-item__text ft__on-surface">${this.i18n.transparentModeOpacity}</span>
                            <span data-type="clear" class="b3-list-item__action b3-tooltips b3-tooltips__w" aria-label="${this.i18n.addElement}">
                                <svg>
                                    <use xlink:href="#iconAdd"></use>
                                </svg>
                            </span>
                        </div>

                        <div class="b3-list__panel">

                            <!-- 第二级菜单 start -->
                            <div class="b3-list-item b3-list-item--narrow b3-list-item--hide-action toggle">
                                <span class="b3-list-item__toggle b3-list-item__toggle--hl">
                                    <svg class="b3-list-item__arrow b3-list-item__arrow--open"><use xlink:href="#iconRight"></use></svg>
                                </span>
                                <span class="b3-list-item__text ft__on-surface">$toolbar</span>
                                <span data-type="clear" class="b3-list-item__action b3-tooltips b3-tooltips__w" aria-label="${this.i18n.addStyle}">
                                    <svg>
                                        <use xlink:href="#iconAdd"></use>
                                    </svg>
                                </span>
                                <span data-type="clear" class="b3-list-item__action b3-tooltips b3-tooltips__w" aria-label="${this.i18n.delete}">
                                    <svg>
                                        <use xlink:href="#iconTrashcan"></use>
                                    </svg>
                                </span>
                            </div>

                            <div class="b3-list__panel">

                                <!-- 第三级菜单 start -->
                                <label class="b3-list-item b3-list-item--narrow b3-list-item--hide-action">
                                    <span class="b3-list-item__text"><code>background-color</code></span>
                                    <span data-type="clear" class="b3-list-item__action b3-tooltips b3-tooltips__w" aria-label="${this.i18n.delete}">
                                        <svg>
                                            <use xlink:href="#iconTrashcan"></use>
                                        </svg>
                                    </span>
                                    <span data-type="update" class="config-keymap__key">rgba(237, 236, 233, \${opacity})</span>
                                    <input data-key="editor​general​alignCenter" data-value="⌥C" data-default="⌥C"
                                        class="b3-text-field fn__none" value="rgba(237, 236, 233, \${opacity})" spellcheck="false">
                                </label>
                                <!-- 第三级菜单 end -->

                            </div>
                            <!-- 第二级菜单 end -->

                        </div>
                        <!-- 第一级菜单 end -->

                    </div>
                    <!-- Top menu -->

                    <div class="b3-list b3-list--border b3-list--background">

                        <div class="b3-list-item b3-list-item--narrow b3-list-item--hide-action toggle">
                            <span class="b3-list-item__toggle b3-list-item__toggle--hl">
                                <svg class="b3-list-item__arrow"><use xlink:href="#iconRight"></use></svg>
                            </span>
                            <span class="b3-list-item__text ft__on-surface">${this.i18n.transparentModeCss}</span>
                            <span data-type="clear" class="b3-list-item__action b3-tooltips b3-tooltips__w" aria-label="${this.i18n.addElement}">
                            <svg>
                                <use xlink:href="#iconAdd"></use>
                            </svg>
                        </span>
                        </div>

                    </div>


                </div>

                <!--label class="b3-label fn__flex">
                    <div class="fn__flex-1">
                        <a href="https://github.com/HowcanoeWang/siyuan-plugin-background-cover/discussion">${this.i18n.themeAdaptEditorShare}</a>
                    </div>
                </label-->

                <div class="b3-dialog__action">
                    <button class="b3-button b3-button--cancel">${this.i18n.cancel}</button>
                    <div class="fn__space"></div>
                    <button class="b3-button b3-button--text">${this.i18n.import}</button>
                    <div class="fn__space"></div>
                    <button class="b3-button b3-button--text">${this.i18n.save}</button>
                    <div class="fn__space"></div>
                    <button class="b3-button b3-button--text">${this.i18n.export}</button>
                </div>
            </div>`
        });
    };
}
