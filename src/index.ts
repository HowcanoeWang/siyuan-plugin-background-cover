import {
    Plugin,
    showMessage,
    confirm,
    Dialog,
    Menu,
    openTab,
    adaptHotkey,
    getFrontend,
    getBackend,
    IModel,
    Setting, fetchPost
} from "siyuan";

import { KernelApi } from "./api";
import { settings } from './configs';
import { error, info, CloseCV } from './utils';
import packageInfo from '../plugin.json'

enum imgMode {
    image = 0,
    live2d = 1,
}

const pluginImgDataDir = `/data/storage/petal/${packageInfo.name}/base64`

// 需要针对下面的主题进行适配
const toAdaptThemes = {
    "Savor": {
        // element id : [LightMode color, Darkmode Color]
        "toolbar": [`var(--b3-toolbar-background)`, `var(--b3-toolbar-background)`]
    }
}

export default class SwitchBgCover extends Plugin {

    private customTab: () => IModel;
    private isMobile: boolean;
    private body = document.body;
    private ka = new KernelApi();
    private cv = new CloseCV();

    private targetNode = document.getElementsByTagName('html')[0];

    async onload() {
        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

        // 图标的制作参见帮助文档
        this.addIcons(`<symbol id="iconLogo" viewBox="0 0 32 32">
        <path d="M26 28h-20v-4l6-10 8.219 10 5.781-4v8z"></path>
        <path d="M26 15c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3c1.657 0 3 1.343 3 3z"></path>
        <path d="M28.681 7.159c-0.694-0.947-1.662-2.053-2.724-3.116s-2.169-2.030-3.116-2.724c-1.612-1.182-2.393-1.319-2.841-1.319h-15.5c-1.378 0-2.5 1.121-2.5 2.5v27c0 1.378 1.122 2.5 2.5 2.5h23c1.378 0 2.5-1.122 2.5-2.5v-19.5c0-0.448-0.137-1.23-1.319-2.841zM24.543 5.457c0.959 0.959 1.712 1.825 2.268 2.543h-4.811v-4.811c0.718 0.556 1.584 1.309 2.543 2.268zM28 29.5c0 0.271-0.229 0.5-0.5 0.5h-23c-0.271 0-0.5-0.229-0.5-0.5v-27c0-0.271 0.229-0.5 0.5-0.5 0 0 15.499-0 15.5 0v7c0 0.552 0.448 1 1 1h7v19.5z"></path>
        </symbol>`);

        settings.setPlugin(this);
        //初始化数据
        await settings.load();

        const topBarElement = this.addTopBar({
            icon: "iconLogo",
            title: this.i18n.addTopBarIcon,
            position: "right",
            callback: () => {
                if (this.isMobile) {
                    this.showMobileTodo();
                    // this.addMenu();
                } else {
                    let rect = topBarElement.getBoundingClientRect();
                    // 如果被隐藏，则使用更多按钮
                    if (rect.width === 0) {
                        rect = document.querySelector("#barMore").getBoundingClientRect();
                    }
                    if (rect.width === 0) {
                        rect = document.querySelector("#barPlugins").getBoundingClientRect();
                    }
                    this.addMenu(rect);
                }
            }
        });

        // 绑定快捷键
        this.addCommand({
            langKey: "selectPictureRandomLabel",
            hotkey: "⇧⌘F7",
            callback: () => {
                this.selectPictureRandom();
            }
        });

        info(this.i18n.helloPlugin);

        const observer = new MutationObserver(this.themeOnChange);
        observer.observe(this.targetNode, {attributes: true});

    }

    ///////////////////////////////
    // siyuan template functions //
    ///////////////////////////////
    onLayoutReady() {
        // load the user setting data
        this.followPluginSettings();
        
        info(`frontend: ${getFrontend()}; backend: ${getBackend()}`);
    }

    onunload() {
        info(`${this.i18n.byePlugin}`)
        settings.save();
    }

    private eventBusLog({detail}: any) {
        info(detail);
    }

    //////////////////////
    // Plugin functions //
    //////////////////////
    private showMobileTodo() {
        showMessage(`${this.i18n.mobileNotSupported}`, 1000, "info")
    }

    private showIndev(msg:string='') {
        const dialog = new Dialog({
            title: `${this.i18n.inDevTitle}`,
            content: `<div class="b3-dialog__content">${this.i18n.inDev}<span>${msg}</span></div>`,
            width: this.isMobile ? "92vw" : "520px",
        });
    }

    private bugReportFunction() {
        const dialog = new Dialog({
            title: `${this.i18n.bugReportLabel}`,
            content: `
            <div class="b3-dialog__content">${this.i18n.bugReportConfirmText}</div>
            <div class="b3-dialog__action">
                <button class="b3-button b3-button--cancel">${this.i18n.cancel}</button><div class="fn__space"></div>
                <button class="b3-button b3-button--text">${this.i18n.confirm}</button>
            </div>
            <div class="b3-dialog__action">
            `,
            width: this.isMobile ? "92vw" : "520px",
        });

        const btnsElement = dialog.element.querySelectorAll(".b3-button");

        // cancel button
        btnsElement[0].addEventListener("click", () => {
            dialog.destroy();
        });

        // still report
        btnsElement[1].addEventListener("click", () => {
            window.open('https://github.com/HowcanoeWang/siyuan-plugin-background-cover/issues', '_blank');
            dialog.destroy();
        });
    }

    private selectPictureByHand() {
        this.showIndev();
    }

    private selectPictureRandom() {
        this.showIndev();
    }

    private async addSingleImageFile() {
        const pickerOpts = {
            types: [
              {
                description: "Images",
                accept: {
                  "image/*": [".png", ".jpeg", ".jpg", ".jiff"],
                },
              },
            ],
            excludeAcceptAllOption: true,
            multiple: false,
        };

        // return an Array
        const fileHandle = await window.showOpenFilePicker(pickerOpts);
        let file = await fileHandle[0].getFile();

        const uploadResult = await this.ka.putFile(`${pluginImgDataDir}/${file.name}`, file);
        console.log(uploadResult)
    }

    private addDirectory() {
        this.showIndev();
    }

    private getThemeInfo() {
        // 0 -> light, 1 -> dark
        const themeMode = (window as any).siyuan.config.appearance.mode
        let themeName = ''
        
        if (themeMode === 0 ) {
            themeName = (window as any).siyuan.config.appearance.themeLight
        }else{
            themeName = (window as any).siyuan.config.appearance.themeDark
        }

        return [themeMode, themeName]
    }

    private themeOnChange() {
        console.log(`Theme changed! ${this.targetNode}`)
    }

    private async adaptThemeElementColor() {
        let oldColor = {};
        const [themeMode, themeName] = this.getThemeInfo();

        // 当目前的主题需要特殊适配时
        if (themeName in toAdaptThemes) {
            let Ele = toAdaptThemes[themeName as keyof typeof toAdaptThemes]

            let keyE: keyof typeof Ele; 
            for (keyE in Ele) {
                let element = document.getElementById(keyE);

                const originalColor = getComputedStyle( element ,null).getPropertyValue('background-color');
    
                let targetColorStr = Ele[keyE][themeMode]
                let targetColor = ''
                if (targetColorStr.slice(0,4) === 'var(') {
                    const cssvar = targetColorStr.slice(4,-1)
                    targetColor = getComputedStyle(document.querySelector(':root')).getPropertyValue(cssvar);
                }
                
                element.style.setProperty('background-color', targetColor, 'important');
    
                oldColor[keyE] = originalColor

                // console.log(keyE, oldColor, targetColor, targetColorStr, element)
            }

            settings.set('oldColor', oldColor)
        }else{
            settings.set('oldColor', {})
        }

        settings.save()
    }

    private async recoverThemeElementColor () {
        const [themeMode, themeName] = this.getThemeInfo();
        if (themeName in toAdaptThemes) {
            let Ele = settings.get('oldColor')

            let keyE: keyof typeof Ele; 
            for (keyE in Ele) {
                let element = document.getElementById(keyE);
                element.style.removeProperty('background-color');
            }

            settings.set('oldColor', {})
        }
        settings.save()
    }

    private changeOpacity(opacity: number){
        let bodyOpacity = 0.59 + (0.4 - (opacity*0.4));
        this.body.style.setProperty('opacity', bodyOpacity.toString());
    }

    private async pluginOnOff() {
        settings.set('activate', !settings.get('activate'))
        settings.save();
        this.followPluginSettings();
    }

    private changeBackground(background:string, mode:imgMode) {
        // code inspired from: 
        // https://github.com/Zuoqiu-Yingyi/siyuan-theme-dark-plus/blob/main/script/module/background.js
        if (mode === imgMode.image) {
            this.body.style.setProperty('background-image', `url('${background}')`);
            this.body.style.setProperty('background-repeat', 'no-repeat');
            this.body.style.setProperty('background-attachment', 'fixed');
            this.body.style.setProperty('background-size', 'cover');
            this.body.style.setProperty('background-position', 'center');
        }else if (mode == imgMode.live2d){
            this.showIndev();
        }else{
            showMessage(`[${this.i18n.addTopBarIcon} Plugin][Error] Background type [${mode}] is not supported, `, 7000, "error");
        }
    }

    private removeBackground(mode:imgMode) {
        // code inspired from: 
        // https://github.com/Zuoqiu-Yingyi/siyuan-theme-dark-plus/blob/main/script/module/background.js
        // >>> let element = document.querySelector('.fn__flex-1.protyle.fullscreen') || document.body;
        // >>> document.documentElement.style.removeProperty(config.theme.background.color.propertyName);
        if (mode === imgMode.image) {
            this.body.style.removeProperty('background-image');
            this.body.style.removeProperty('background-repeat');
            this.body.style.removeProperty('background-attachment');
            this.body.style.removeProperty('background-size');
            this.body.style.removeProperty('background-position');
            this.body.style.removeProperty('opacity');
        }else if (mode == imgMode.live2d){
            this.showIndev();
        }else{
            showMessage(`[${this.i18n.addTopBarIcon} Plugin][Error] Background type [${mode}] is not supported, `, 7000, "error");
        }
    }

    openSetting() {
        const dialog = new Dialog({
            title: `${this.i18n.addTopBarIcon} ${this.i18n.settingLabel}`,
            content: `
            <label class="fn__flex b3-label">
                <div class="fn__flex-1">
                    ${this.i18n.autoRefreshLabel}
                    <div class="b3-label__text">${this.i18n.autoRefreshDes}</div>
                </div>
                <span class="fn__flex-center" />
                <input
                    class="b3-switch fn__flex-center"
                    type="checkbox"
                    value="${settings.get('autoRefresh')}"
                />
            </label>
            <label class="fn__flex b3-label">
                <div class="fn__flex-1">
                    ${this.i18n.imgPathLabel}
                    <div class="fn__hr"></div>
                    <input class="b3-text-field fn__block" id="apiKey" value="${settings.get('imgPath')}">
                </div>
            </label>
            <label class="fn__flex b3-label config__item">
                <div class="fn__flex-1">
                    ${this.i18n.opacityLabel}
                    <div class="b3-label__text">${this.i18n.opacityDes}</div>
                </div>
                <div class="b3-tooltips b3-tooltips__n fn__flex-center" aria-label="${settings.get('opacity')}">   
                    <input class="b3-slider fn__size200" id="fontSize" max="1" min="0.1" step="0.05" type="range" value="${settings.get('opacity')}">
                </div>
            </label>
            <label class="fn__flex b3-label">
                <div class="fn__flex-1">
                    ${this.i18n.randomDirectoryLabel}
                    <div class="b3-label__text">${this.i18n.randomDirectoryDes}</div>
                    <div class="fn__hr"></div>
                    <input class="b3-text-field fn__block" id="apiKey" value="${settings.get('imgDir')}">
                </div>
            </label>
            <label class="b3-label config__item fn__flex">
                <div class="fn__flex-1">
                ${this.i18n.resetConfigLabel}
                    <div class="b3-label__text">${this.i18n.resetConfigDes}</div>
                </div>
                <span class="fn__space"></span>
                <button class="b3-button b3-button--outline fn__flex-center fn__size200" id="appearanceRefresh">
                    <svg><use xlink:href="#iconRefresh"></use></svg>
                    ${this.i18n.reset}
                </button>
            </label>
            <label class="fn__flex b3-label config__item">
                <div class="fn__flex-1">
                    ${this.i18n.currentVersionLabel} v${packageInfo.version}
                    <span id="isInsider"></span>
                    <!--div class="b3-label__text"><a href="https://github.com/siyuan-note/siyuan/releases" target="_blank">${this.i18n.viewAllVersionsText}</a></div-->
                </div>
                <div class="fn__space"></div>
                <!--div class="fn__flex-center fn__size200 config__item-line">
                    <button id="checkUpdateBtn" class="b3-button b3-button--outline fn__block">
                        <svg><use xlink:href="#iconRefresh"></use></svg>检查更新
                    </button>
                    <div class="fn__hr fn__none"></div>
                    <button id="menuSafeQuit" class="b3-button b3-button--outline fn__block fn__none">
                        <svg><use xlink:href="#iconQuit"></use></svg>退出应用
                    </button>
                </div-->
            </label>
            `,
            width: this.isMobile ? "92vw" : "520px",
        });

        // the first Auto refresh settings
        const autoRefreshElement = dialog.element.querySelectorAll("input")[0];
        autoRefreshElement.checked = settings.get('autoRefresh');

        autoRefreshElement.addEventListener("click", () => {
            settings.set('autoRefresh', !settings.get('autoRefresh'));
            autoRefreshElement.value = `${settings.get('autoRefresh')}`;
            settings.save();
        })

        // current image path
        const imgPathElement = dialog.element.querySelectorAll("input")[1];
        imgPathElement.addEventListener("click", () => {
            this.showIndev();
        })

        // transparency/opacity slider
        const opacityElement = dialog.element.querySelectorAll("input")[2];
        opacityElement.addEventListener("change", () => {
            settings.set('opacity', parseFloat(opacityElement.value));
            if (settings.get('activate')) {
                this.changeOpacity(settings.get('opacity'));
            }
            settings.save();
        })
        opacityElement.addEventListener("input", () => {
            // update the aira-label value
            opacityElement.parentElement.setAttribute('aria-label', opacityElement.value);
        })

        // img dir 
        const imgDirElement = dialog.element.querySelectorAll("input")[3];
        imgDirElement.addEventListener("click", () => {
            this.showIndev();
        })

        // reset panel
        const resetSettingElement = dialog.element.querySelectorAll("button")[0];
        resetSettingElement.addEventListener("click", () => {
            settings.reset();
            settings.save();
            this.followPluginSettings();
        })

        // const inputElement = dialog.element.querySelector("textarea");
        // inputElement.value = this.data[STORAGE_NAME].imgPath;

        // const btnsElement = dialog.element.querySelectorAll(".b3-button");
        // dialog.bindInput(inputElement, () => {
        //     (btnsElement[1] as HTMLButtonElement).click();
        // });

        // inputElement.focus();

        // btnsElement[0].addEventListener("click", () => {
        //     dialog.destroy();
        // });
        // btnsElement[1].addEventListener("click", () => {
        //     this.saveData(STORAGE_NAME, {readonlyText: inputElement.value});
        //     dialog.destroy();
        // });
    }

    private followPluginSettings() {
        if (settings.get('activate')) {
            this.changeBackground(settings.get('imgPath'), settings.get('imageFileType'))
            this.adaptThemeElementColor()
            this.changeOpacity(settings.get('opacity'))
        }else{
            this.removeBackground(settings.get('imageFileType'))
            this.recoverThemeElementColor()
        }
        // todo: update the text string in URL
    }

    ////////////////////
    // Plugin UI init //
    ////////////////////
    private addMenu(rect?: DOMRect) {
        const menu = new Menu("topBarSample", () => {});
        menu.addItem({
            icon:"iconIndent",
            label: `${this.i18n.selectPictureLabel}`,
            type: "submenu",
            submenu: [
                {
                    icon: "iconHand",
                    label: `${this.i18n.selectPictureManualLabel}`,
                    click: () => {
                        this.selectPictureByHand();
                    }
                }, 
                {
                    icon: "iconMark",
                    label: `${this.i18n.selectPictureRandomLabel}`,
                    accelerator: this.commands[0].customHotkey,
                    click: () => {
                        this.selectPictureRandom();
                    }
                }, 
            ]
        });
        menu.addItem({
            icon:"iconAdd",
            label: `${this.i18n.addImageLabel}`,
            type: "submenu",
            submenu: [
                {
                    icon: "iconImage",
                    label: `${this.i18n.addSingleImageLabel}`,
                    click: () => {
                        this.addSingleImageFile();
                    }
                }, 
                {
                    icon:"iconFolder",
                    label: `${this.i18n.addDirectoryLabel}`,
                    click: () => {
                        this.addDirectory();
                    }
                }, 
            ]
        });
        menu.addItem({
            id: 'pluginOnOffMenu',
            icon: `${settings.get('activate') ? 'iconClose' : 'iconSelect'}`,
            label: `${settings.get('activate') ? this.i18n.closeBackgroundLabel : this.i18n.openBackgroundLabel}`,
            click: () => {
                this.pluginOnOff();
            }
        });

        menu.addSeparator();

        menu.addItem({
            icon: "iconGithub",
            label: `${this.i18n.bugReportLabel}`,
            click: () => {
                this.bugReportFunction()
            }
        });
        menu.addItem({
            icon: "iconSettings",
            label: `${this.i18n.settingLabel}`,
            click: () => {
                this.openSetting();
            }
        });

        if (this.isMobile) {
            menu.fullscreen();
        } else {
            menu.open({
                x: rect.right,
                y: rect.bottom,
                isLeft: true,
            });
        }
    }
}
