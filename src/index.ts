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
import { error, info, debug, CloseCV, MD5, getThemeInfo } from './utils';
import * as cst from './constants'

import packageInfo from '../plugin.json'
import "./index.scss";


export default class SwitchBgCover extends Plugin {

    private isMobile: boolean;
    private ka = new KernelApi();
    private cv = new CloseCV();

    private htmlThemeNode = document.getElementsByTagName('html')[0];

    private bgLayer = document.createElement('div')

    async onload() {
        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

        // 图标的制作参见帮助文档
        this.addIcons(cst.diyIcon.iconLogo);

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
        this.addCommand({
            langKey: "openBackgroundLabel",
            hotkey: "⇧⌘F6",
            callback: () => {
                this.pluginOnOff();
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
        this.createBgLayer();

        // load the user setting data
        const [themeMode, themeName] = getThemeInfo();
        settings.set('prevTheme', themeName);
        this.applySettings();
        
        if (settings.get('inDev')) {
            debug(`frontend: ${getFrontend()}; backend: ${getBackend()}`);
        }
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
    private createBgLayer() {
        this.bgLayer.id = "bglayer"
        this.bgLayer.className = "bglayer"

        document.body.appendChild(this.bgLayer)
    }

    private async pluginOnOff() {
        settings.set('activate', !settings.get('activate'))
        settings.save();
        this.applySettings();
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

            let bgObj = cst.bgObj

            bgObj = {
                name : file.name,
                hash : md5,
                mode : cst.bgMode.image,
                path : `${cst.pluginImgDataDir.slice(5)}/${hashedName}`  // slice(5) to remove '/data'
            }
    
            const uploadResult = await this.ka.putFile(`${cst.pluginImgDataDir}/${hashedName}`, file);

            let fileidx = settings.get('fileidx')

            fileidx[md5] = bgObj

            settings.set('bgObj', bgObj)
            settings.set('fileidx', fileidx)
            settings.save()

            this.applySettings();
        }
    }

    private async addSingleURLImageFile() {
        this.showIndev();
    }

    private addDirectory() {
        this.showIndev();
    }

    private async removeDirectory(dir:string){
        let out = await this.ka.readDir(dir);
        if (out !== null || out !== undefined) {
            for (var i = 0; i < out.data.length; i++) {
                let item = out.data[i]
    
                if (item.isDir) {
                    // 如果是文件夹，则跳过
                    continue
                }else{
                    let full_path = `${dir}/${item.name}`
                    console.log(full_path)
    
                    await this.ka.removeFile(full_path)
                }
            }
        }
    }

    private themeOnChange() {
        const [themeMode, themeName] = getThemeInfo();
        debug(`Theme changed! ${themeMode} | ${themeName}`)

        // 当目前的主题需要特殊适配时
        if (settings.get('activate') && themeName in cst.toAdaptThemes) {
            let Ele = cst.toAdaptThemes[themeName as keyof typeof cst.toAdaptThemes]

            for (let keyE in Ele) {
                let element = document.getElementById(keyE);
    
                let targetColorStr = Ele[keyE][themeMode]
                let targetColor = ''
                if (targetColorStr.slice(0,4) === 'var(') {
                    const cssvar = targetColorStr.slice(4,-1)
                    targetColor = getComputedStyle(document.querySelector(':root')).getPropertyValue(cssvar);
                }else if (targetColorStr.slice(0,3) === 'rgb') {
                    targetColor = targetColorStr
                }else if (targetColorStr.slice(0,1) === '#') {
                    targetColor = this.cv.hex2rgba(targetColorStr)
                }else{
                    error(`Unable to parse the color string [${targetColorStr}}], not 'var(--xxx)', 'rgb(xxx)', 'rgba(xxx)', '#hex'`)
                }
                
                debug(`Adapt '${themeName}' theme element '${keyE}' to background-color: ${targetColor}`, element)
                element.style.setProperty('background-color', targetColor, 'important');
            }
        }else{
            // 恢复主题默认的设置
            const prevTheme = settings.get('prevTheme')
            if (prevTheme in cst.toAdaptThemes) {
                let Ele = cst.toAdaptThemes[prevTheme as keyof typeof cst.toAdaptThemes]

                for (let keyE in Ele) {
                    let element = document.getElementById(keyE);
                    element.style.removeProperty('background-color');
                }
            }
        }
        settings.set('prevTheme', themeName);
    }

    private changeBackground(background:string, mode:cst.bgMode) {
        if (mode === cst.bgMode.image) {
            this.bgLayer.style.setProperty('background-image', `url('${background}')`);
        }else if (mode == cst.bgMode.live2d){
            this.showIndev();
        }else{
            showMessage(`[${this.i18n.addTopBarIcon} Plugin][Error] Background type [${mode}] is not supported, `, 7000, "error");
        }
    }

    private changeOpacity(opacity: number){
        let bodyOpacity = 0.99 - 0.25 * opacity;

        let addOpacityElement: string[]
        addOpacityElement = ["toolbar", "dockLeft", "layouts", "dockRight", "dockBottom", "status"]

        for (let eid in addOpacityElement) {
            var changeItem = document.getElementById(addOpacityElement[eid])
            if (settings.get('activate')) {
                changeItem.style.setProperty('opacity', bodyOpacity.toString())
            }else{
                changeItem.style.removeProperty('opacity')
            }
        }
    }

    private changeBlur(blur: number) {
        this.bgLayer.style.setProperty('filter', `blur(${blur}px)`)
    }

    private applySettings() {
        if (settings.get('activate')) {
            this.bgLayer.style.removeProperty('display')
        }else{
            this.bgLayer.style.setProperty('display', 'none')
        }

        // 缓存文件夹中没有图片 | 用户刚刚使用这个插件 | 用户刚刚重置了插件数据
        if (Object.keys(settings.get('fileidx')).length === 0 || settings.get('bgObj') === undefined) {
            // 使用默认的了了妹图片ULR来当作背景图
            this.changeBackground(cst.demoImgURL, cst.bgMode.image)
        }else{
            let bgObj = settings.get('bgObj')
            this.changeBackground(bgObj.path, bgObj.mode)
        }

        this.themeOnChange()
        this.changeOpacity(settings.get('opacity'))

        this.changeBlur(settings.get('blur'))

        // update current image URL
        let crtImageNameElement = document.getElementById('crtImgName')
        if ( crtImageNameElement === null || crtImageNameElement === undefined ) {
            debug(`Element ctrImgName not exists`) 
        }else{
            crtImageNameElement.textContent = cst.demoImgURL.toString()
        }
    }

    openSetting() {
        const dialog = new Dialog({
            title: `${this.i18n.addTopBarIcon} ${this.i18n.settingLabel}`,
            content: `
            <!--
            // info panel part
            -->
            <label class="fn__flex b3-label">
                <div class="fn__flex-1">
                    ${this.i18n.imgPathLabel}
                    <div class="b3-label__text">
                        <code id="crtImgName" class="fn__code">${settings.get('bgObj') === undefined ? cst.demoImgURL : settings.get('bgObj').name}</code>
                    </div>
                </div>
            </label>
            <label class="fn__flex b3-label">
                <div class="fn__flex-1">
                    <div class="fn__flex">
                        ${this.i18n.cacheDirectoryLabel}
                        <span class="fn__space"></span>
                        <span style="color: var(--b3-theme-on-surface)">${this.i18n.cacheDirectoryDes}</span>
                        <span class="selected" style="color: rgb(255,0,0)">
                            [ ${Object.keys(settings.get('fileidx')).length} ]
                        </span>
                    </div>
                    <div class="b3-label__text">
                        <a href="file:///${cst.pluginAssetsDirOS}/" style="word-break: break-all">${cst.pluginAssetsDirOS}</a>
                    </div>
                </div>
            </label>

            <!--
            // onoff switch part, Input[0] - Input [1]
            -->

            <label class="fn__flex b3-label">
                <div class="fn__flex-1">
                    ${this.i18n.openBackgroundLabel}
                    <div class="b3-label__text">
                        ${this.i18n.openBackgroundLabelDes}
                    </div>
                </div>
                <span class="fn__flex-center" />
                <input
                    id="autoRefreshInput"
                    class="b3-switch fn__flex-center"
                    type="checkbox"
                    value="${settings.get('activate')}"
                />
            </label>
            <label class="fn__flex b3-label">
                <div class="fn__flex-1">
                    ${this.i18n.autoRefreshLabel}
                    <div class="b3-label__text">
                        ${this.i18n.autoRefreshDes}
                    </div>
                </div>
                <span class="fn__flex-center" />
                <input
                    id="autoRefreshInput"
                    class="b3-switch fn__flex-center"
                    type="checkbox"
                    value="${settings.get('autoRefresh')}"
                />
            </label>

            <!--
            // slider part Input[2] - Input [3]
            -->

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
            <label class="fn__flex b3-label config__item">
                <div class="fn__flex-1">
                    ${this.i18n.blurLabel}
                    <div class="b3-label__text">
                        ${this.i18n.blurDes}
                    </div>
                </div>
                <div class="b3-tooltips b3-tooltips__n fn__flex-center" aria-label="${settings.get('blur')}">   
                    <input class="b3-slider fn__size200" id="fontSize" max="10" min="0" step="1" type="range" value="${settings.get('blur')}">
                </div>
            </label>

            <!--
            // reset panel part, Button[0]
            -->

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

            <!--
            // debug panel part, input[4]
            -->

            <label class="fn__flex b3-label config__item">
                <div class="fn__flex-1">
                    ${this.i18n.currentVersionLabel} v${packageInfo.version}
                    <div class="b3-label__text">
                        ${this.i18n.inDevModeDes}
                    </div>
                </div>
                <span class="fn__flex-center" />
                <input
                    class="b3-switch fn__flex-center"
                    type="checkbox"
                    value="${settings.get('inDev')}"
                />
            </label>
            `,
            width: this.isMobile ? "92vw" : "520px",
        });

        // plugin onoff switch
        const activateElement = dialog.element.querySelectorAll("input")[0];
        activateElement.checked = settings.get('activate');

        activateElement.addEventListener("click", () => {
            settings.set('activate', !settings.get('activate'));
            autoRefreshElement.value = `${settings.get('activate')}`;
            settings.save();
            this.applySettings();
        })

        // the Auto refresh switch
        const autoRefreshElement = dialog.element.querySelectorAll("input")[1];
        autoRefreshElement.checked = settings.get('autoRefresh');

        autoRefreshElement.addEventListener("click", () => {
            settings.set('autoRefresh', !settings.get('autoRefresh'));
            autoRefreshElement.value = `${settings.get('autoRefresh')}`;
            settings.save();
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

        // blur slider
        const blurElement = dialog.element.querySelectorAll("input")[3];
        blurElement.addEventListener("change", () => {
            settings.set('blur', parseFloat(blurElement.value));
            if (settings.get('activate')) {
                this.changeBlur(settings.get('blur'));
            }
            settings.save();
        })
        blurElement.addEventListener("input", () => {
            // update the aira-label value
            blurElement.parentElement.setAttribute('aria-label', blurElement.value);
        })


        // reset panel
        const resetSettingElement = dialog.element.querySelectorAll("button")[0];
        resetSettingElement.addEventListener("click", () => {
            this.removeDirectory(cst.pluginImgDataDir);
            settings.reset();
            settings.save();
            this.applySettings();
        })

        // the dev mode settings
        const devModeElement = dialog.element.querySelectorAll("input")[4];
        devModeElement.checked = settings.get('inDev');

        devModeElement.addEventListener("click", () => {
            settings.set('inDev', !settings.get('inDev'));
            devModeElement.value = `${settings.get('inDev')}`;
            settings.save();
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

    ////////////////////
    // Plugin UI init //
    ////////////////////
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

    private addMenu(rect?: DOMRect) {
        const menu = new Menu("topBarSample", () => {});
        // menu.addItem({
        //     icon:"iconIndent",
        //     label: `${this.i18n.selectPictureLabel}`,
        //     type: "submenu",
        //     submenu: [
        //         {
        //             icon: "iconHand",
        //             label: `${this.i18n.selectPictureManualLabel}`,
        //             click: () => {
        //                 this.selectPictureByHand();
        //             }
        //         }, 
        //         {
        //             icon: "iconMark",
        //             label: `${this.i18n.selectPictureRandomLabel}`,
        //             accelerator: this.commands[0].customHotkey,
        //             click: () => {
        //                 this.selectPictureRandom();
        //             }
        //         }, 
        //     ]
        // });
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
                // {
                //     icon: "iconLink",
                //     label: `${this.i18n.addSingleURLImageLabel}`,
                //     click: () => {
                //         this.addSingleURLImageFile();
                //     }
                // }, 
                // {
                //     icon:"iconFolder",
                //     label: `${this.i18n.addDirectoryLabel}`,
                //     click: () => {
                //         this.addDirectory();
                //     }
                // }, 
            ]
        });
        menu.addItem({
            id: 'pluginOnOffMenu',
            icon: `${settings.get('activate') ? 'iconClose' : 'iconSelect'}`,
            label: `${settings.get('activate') ? this.i18n.closeBackgroundLabel : this.i18n.openBackgroundLabel}`,
            accelerator: this.commands[1].customHotkey,
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
