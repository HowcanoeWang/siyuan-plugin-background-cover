import {
    Plugin,
    showMessage,
    // confirm,
    Dialog,
    Menu,
    // openTab,
    // adaptHotkey,
    getFrontend,
    getBackend,
    // IModel,
    // Setting, fetchPost
} from "siyuan";

import { KernelApi } from "./api";
import { settings } from './configs';
import { error, info, CloseCV, MD5, getThemeInfo } from './utils';
import * as v from './constants'
import packageInfo from '../plugin.json'


export default class SwitchBgCover extends Plugin {

    private isMobile: boolean;
    private body = document.body;
    private ka = new KernelApi();
    private cv = new CloseCV();

    private htmlThemeNode = document.getElementsByTagName('html')[0];

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

        // 侦测theme主题有没有发生变化
        const themeChangeObserver = new MutationObserver(this.themeOnChange);
        themeChangeObserver.observe(this.htmlThemeNode, {attributes: true});

    }

    ///////////////////////////////
    // siyuan template functions //
    ///////////////////////////////
    onLayoutReady() {
        // load the user setting data
        const [themeMode, themeName] = getThemeInfo();
        settings.set('prevTheme', themeName);
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

    private async selectPictureByHand() {
        this.showIndev();
    }

    private selectPictureRandom() {
        this.showIndev();
    }

    private async addSingleLocalImageFile() {
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

        let file_content = await file.text()
        var md5 = MD5(file_content).toString();

        if (md5 in settings.get('fileidx')) {
            const dialog = new Dialog({
                title: `${this.i18n.inDevTitle}`,
                content: `<div class="b3-dialog__content">${this.i18n.imageFileExist}</div>`,
                width: this.isMobile ? "92vw" : "520px",
            });
        }else{
            const hashedName = `${md5}-${file.name}`

            let bgObj = v.bgObj

            bgObj = {
                name : hashedName,
                hash : md5,
                mode : v.bgMode.image,
                path : `${v.pluginImgDataDir.slice(5)}/${hashedName}`
            }
    
            const uploadResult = await this.ka.putFile(`${v.pluginImgDataDir}/${hashedName}`, file);

            let fileidx = settings.get('fileidx')

            fileidx[md5] = bgObj

            this.changeBackground(bgObj.path, v.bgMode.image)

            settings.set('bgObj', bgObj)
            settings.set('fileidx', fileidx)
            settings.save()
        }

        console.log(settings)
    }

    private async addSingleURLImageFile() {
        this.showIndev();
    }

    private addDirectory() {
        this.showIndev();
    }

    private async removeDirectory(dir:string){
        let out = await this.ka.readDir(dir);
        for (var i = 0; i < out.data.length; i++) {
            let item = out.data[i]

            if (item.isDir) {
                continue
            }else{
                let full_path = `${dir}/${item.name}`
                console.log(full_path)

                await this.ka.removeFile(full_path)
            }
        }
    }

    private themeOnChange() {
        const [themeMode, themeName] = getThemeInfo();
        // info(`Theme changed! ${themeMode} | ${themeName}`)

        // 当目前的主题需要特殊适配时
        if (settings.get('activate') && themeName in v.toAdaptThemes) {
            let Ele = v.toAdaptThemes[themeName as keyof typeof v.toAdaptThemes]

            let keyE: keyof typeof Ele; 
            for (keyE in Ele) {
                let element = document.getElementById(keyE);
    
                let targetColorStr = Ele[keyE][themeMode]
                let targetColor = ''
                if (targetColorStr.slice(0,4) === 'var(') {
                    const cssvar = targetColorStr.slice(4,-1)
                    targetColor = getComputedStyle(document.querySelector(':root')).getPropertyValue(cssvar);
                }else if (targetColorStr.slice(0,4) === 'rgb(') {
                    targetColor = targetColorStr
                }else if (targetColorStr.slice(0,4) === 'rgba') {
                    targetColor = this.cv.removeAlpha(targetColorStr)
                }else if (targetColorStr.slice(0,1) === '#') {
                    targetColor = this.cv.hex2rgba(targetColorStr)
                }else{
                    error(`Unable to parse the color string [${targetColorStr}}], not 'var(--xxx)', 'rgb(xxx)', 'rgba(xxx)', '#hex'`)
                }
                
                element.style.setProperty('background-color', targetColor, 'important');
                info(`Adapt '${themeName}' theme element '${element}' to background-color: ${targetColor}`)
            }
        }else{
            // 恢复主题默认的设置
            const prevTheme = settings.get('prevTheme')
            if (prevTheme in v.toAdaptThemes) {
                let Ele = v.toAdaptThemes[prevTheme as keyof typeof v.toAdaptThemes]

                let keyE: keyof typeof Ele; 
                for (keyE in Ele) {
                    let element = document.getElementById(keyE);
                    element.style.removeProperty('background-color');
                }
            }
        }
        settings.set('prevTheme', themeName);
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

    private changeBackground(background:string, mode:v.bgMode) {
        // code inspired from: 
        // https://github.com/Zuoqiu-Yingyi/siyuan-theme-dark-plus/blob/main/script/module/background.js
        if (mode === v.bgMode.image) {
            this.body.style.setProperty('background-image', `url('${background}')`);
            this.body.style.setProperty('background-repeat', 'no-repeat');
            this.body.style.setProperty('background-attachment', 'fixed');
            this.body.style.setProperty('background-size', 'cover');
            this.body.style.setProperty('background-position', 'center');
        }else if (mode == v.bgMode.live2d){
            this.showIndev();
        }else{
            showMessage(`[${this.i18n.addTopBarIcon} Plugin][Error] Background type [${mode}] is not supported, `, 7000, "error");
        }
    }

    private removeBackground(mode:v.bgMode) {
        // code inspired from: 
        // https://github.com/Zuoqiu-Yingyi/siyuan-theme-dark-plus/blob/main/script/module/background.js
        // >>> let element = document.querySelector('.fn__flex-1.protyle.fullscreen') || document.body;
        // >>> document.documentElement.style.removeProperty(config.theme.background.color.propertyName);
        if (mode === v.bgMode.image) {
            this.body.style.removeProperty('background-image');
            this.body.style.removeProperty('background-repeat');
            this.body.style.removeProperty('background-attachment');
            this.body.style.removeProperty('background-size');
            this.body.style.removeProperty('background-position');
            this.body.style.removeProperty('opacity');
        }else if (mode == v.bgMode.live2d){
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
                    <div class="b3-label__text">
                        ${this.i18n.autoRefreshDes}
                    </div>
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
                    <input class="b3-text-field fn__block" id="apiKey" value="${settings.get('bgObj') === undefined ? v.demoImgURL : settings.get('bgObj').name}" disabled>
                </div>
            </label>
            <label class="fn__flex b3-label config__item">
                <div class="fn__flex-1">
                    ${this.i18n.opacityLabel}
                    <div class="b3-label__text">
                        ${this.i18n.opacityDes}
                    </div>
                </div>
                <div class="b3-tooltips b3-tooltips__n fn__flex-center" aria-label="${settings.get('opacity')}">   
                    <input class="b3-slider fn__size200" id="fontSize" max="1" min="0.1" step="0.05" type="range" value="${settings.get('opacity')}">
                </div>
            </label>
            <label class="fn__flex b3-label">
                <div class="fn__flex-1">
                    ${this.i18n.cacheDirectoryLabel}
                    <div class="b3-label__text">
                        ${this.i18n.cacheDirectoryDes}
                        <span class="selected svelte-c3a8hl">
                            [ ${Object.keys(settings.get('fileidx')).length} ]
                        </span>
                    </div>
                    <div class="fn__hr"></div>
                    <input class="b3-text-field fn__block" id="apiKey" value="${v.pluginAssetsDirOS}" disabled>
                </div>
            </label>
            <label class="b3-label config__item fn__flex">
                <div class="fn__flex-1">
                ${this.i18n.resetConfigLabel}
                    <div class="b3-label__text">
                        ${this.i18n.resetConfigDes}<span class="selected svelte-c3a8hl">${this.i18n.resetConfigDes2}
                        </span>
                    </div>
                </div>
                <span class="fn__space"></span>
                <button class="b3-button b3-button--outline fn__flex-center fn__size100" id="appearanceRefresh">
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

        // reset panel
        const resetSettingElement = dialog.element.querySelectorAll("button")[0];
        resetSettingElement.addEventListener("click", () => {
            this.removeDirectory(v.pluginImgDataDir);
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
            // 缓存文件夹中没有图片 | 用户刚刚使用这个插件 | 用户刚刚重置了插件数据
            if (Object.keys(settings.get('fileidx')).length === 0 || settings.get('bgObj') === undefined) {
                this.changeBackground(v.demoImgURL, v.bgMode.image)
            }else{
                let bgObj = settings.get('bgObj')
                this.changeBackground(bgObj.path, bgObj.type)
            }
            
            this.themeOnChange()
            this.changeOpacity(settings.get('opacity'))
        }else{
            // 缓存文件夹中没有图片 | 用户刚刚使用这个插件 | 用户刚刚重置了插件数据
            if (Object.keys(settings.get('fileidx')).length === 0 || settings.get('bgObj') === undefined) {
                this.removeBackground(v.bgMode.image)
            }else{
                let bgObj = settings.get('bgObj')
                this.removeBackground(bgObj.type)
            }

            this.themeOnChange()
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
                        this.addSingleLocalImageFile();
                    }
                }, 
                {
                    icon: "iconLink",
                    label: `${this.i18n.addSingleURLImageLabel}`,
                    click: () => {
                        this.addSingleURLImageFile();
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
