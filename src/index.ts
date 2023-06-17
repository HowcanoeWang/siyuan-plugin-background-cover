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

const SETTING = "imgbg-setting";
enum imgMode {
    image = 0,
    live2d = 1,
}

export default class SwitchBgCover extends Plugin {

    private customTab: () => IModel;
    private isMobile: boolean;
    private body = document.body;

    onload() {
        this.data[SETTING] = {
            autoRefresh: true,
        	// 当前配置的背景图路径
            // imgPath: 'd:/onedrive/test.png',
            imgPath: 'https://pbs.twimg.com/media/FyBE0bUakAELfeF?format=jpg&name=4096x4096',
            // 当前配置的背景图透明度
            opacity: 0.2,
            // 图片类型 1:本地文件，2：https
            imageFileType: 0,
            imgDir: `${this.i18n.emptyImgPath}`,
            activate: false
        };

        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

        // 图标的制作参见帮助文档
        this.addIcons(`<symbol id="iconLogo" viewBox="0 0 32 32">
        <path d="M26 28h-20v-4l6-10 8.219 10 5.781-4v8z"></path>
        <path d="M26 15c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3c1.657 0 3 1.343 3 3z"></path>
        <path d="M28.681 7.159c-0.694-0.947-1.662-2.053-2.724-3.116s-2.169-2.030-3.116-2.724c-1.612-1.182-2.393-1.319-2.841-1.319h-15.5c-1.378 0-2.5 1.121-2.5 2.5v27c0 1.378 1.122 2.5 2.5 2.5h23c1.378 0 2.5-1.122 2.5-2.5v-19.5c0-0.448-0.137-1.23-1.319-2.841zM24.543 5.457c0.959 0.959 1.712 1.825 2.268 2.543h-4.811v-4.811c0.718 0.556 1.584 1.309 2.543 2.268zM28 29.5c0 0.271-0.229 0.5-0.5 0.5h-23c-0.271 0-0.5-0.229-0.5-0.5v-27c0-0.271 0.229-0.5 0.5-0.5 0 0 15.499-0 15.5 0v7c0 0.552 0.448 1 1 1h7v19.5z"></path>
        </symbol>`);

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

        console.log(this.i18n.helloPlugin, this.data[SETTING]);
    }

    ///////////////////////////////
    // siyuan template functions //
    ///////////////////////////////
    onLayoutReady() {

        // this.loadData(STORAGE_NAME);

        if (this.data[SETTING].activate) {
            this.activatePlugin();
        }
        
        console.log(`frontend: ${getFrontend()}; backend: ${getBackend()}`);
    }

    // onunload() {
    //     console.log(this.i18n.byePlugin);
    // }

    private eventBusLog({detail}: any) {
        console.log(detail);
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
                <button class="b3-button b3-button--text" onclick="javascript:window.open('https://github.com/HowcanoeWang/siyuan-plugin-background-cover/issues', '_blank');">${this.i18n.confirm}</button>
            </div>
            `,
            width: this.isMobile ? "92vw" : "520px",
        });
    }

    private selectPictureByHand() {
        this.showIndev();
    }

    private selectPictureRandom() {
        this.showIndev();
    }

    private addSingleImage() {
        this.showIndev();
    }

    private addDirectory() {
        this.showIndev();
    }

    private changeOpacity(opacity: number){
        let bodyOpacity = 0.59 + (0.4 - (opacity*0.4));
        this.body.style.setProperty('opacity', bodyOpacity.toString());
    }

    private changeOpacityMenu() {
        this.changeOpacity(0.5);
    }

    private pluginOnOff() {
        if (this.data[SETTING].activate) {
            // turn off the background
            this.data[SETTING].activate = false;
            this.removeBackground(this.data[SETTING].imageFileType);
        }else{
            // turn on the background
            this.data[SETTING].activate = true;
            this.activatePlugin();
        }
    }

    private changeBackground(background:string, mode:imgMode) {
        // code inspired from: 
        // https://github.com/Zuoqiu-Yingyi/siyuan-theme-dark-plus/blob/main/script/module/background.js
        if (mode === imgMode.image) {
            this.body.style.setProperty('background-image', `url("${background}")`);
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
                    value="${this.data[SETTING].autoRefresh}"
                />
            </label>
            <label class="fn__flex b3-label">
                <div class="fn__flex-1">
                    ${this.i18n.imgPathLabel}
                    <div class="fn__hr"></div>
                    <input class="b3-text-field fn__block" id="apiKey" value="${this.data[SETTING].imgPath}">
                </div>
            </label>
            <label class="fn__flex b3-label config__item">
                <div class="fn__flex-1">
                    ${this.i18n.opacityLabel}
                    <div class="b3-label__text">${this.i18n.opacityDes}</div>
                </div>
                <div class="b3-tooltips b3-tooltips__n fn__flex-center" aria-label="${this.data[SETTING].opacity}">   
                    <input class="b3-slider fn__size200" id="fontSize" max="1" min="0.1" step="0.05" type="range" value="${this.data[SETTING].opacity}">
                </div>
            </label>
            <label class="fn__flex b3-label">
                <div class="fn__flex-1">
                    ${this.i18n.randomDirectoryLabel}
                    <div class="b3-label__text">${this.i18n.randomDirectoryDes}</div>
                    <div class="fn__hr"></div>
                    <input class="b3-text-field fn__block" id="apiKey" value="${this.data[SETTING].imgDir}">
                </div>
            </label>
            `,
            width: this.isMobile ? "92vw" : "520px",
        });

        // the first Auto refresh settings
        const autoRefreshElement = dialog.element.querySelectorAll("input")[0];
        autoRefreshElement.checked = this.data[SETTING].autoRefresh;

        autoRefreshElement.addEventListener("click", () => {
            this.data[SETTING].autoRefresh = !this.data[SETTING].autoRefresh;
            autoRefreshElement.value = `${this.data[SETTING].autoRefresh}`;
            console.log(this.data[SETTING]);
        })

        // current image path
        const imgPathElement = dialog.element.querySelectorAll("input")[1];

        // transparency/opacity slider
        const opacityElement = dialog.element.querySelectorAll("input")[2];
        opacityElement.addEventListener("change", () => {
            this.data[SETTING].opacity = parseFloat(opacityElement.value);
            if (this.data[SETTING].activate) {
                this.changeOpacity(this.data[SETTING].opacity);
            }
        })
        opacityElement.addEventListener("input", () => {
            // update the aira-label value
            opacityElement.parentElement.setAttribute('aria-label', opacityElement.value);
        })

        // img dir 
        const imgDirElement = dialog.element.querySelectorAll("input")[3];

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

    private activatePlugin() {
        this.changeBackground(this.data[SETTING].imgPath, imgMode.image);
        this.changeOpacity(this.data[SETTING].opacity);
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
                        this.addSingleImage();
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
            icon: `${this.data[SETTING].activate ? 'iconClose' : 'iconSelect'}`,
            label: `${this.data[SETTING].activate ? this.i18n.closeBackgroundLabel : this.i18n.openBackgroundLabel}`,
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
