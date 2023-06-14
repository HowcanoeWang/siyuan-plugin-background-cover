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
import "./index.scss";

const STORAGE_NAME = "imgbgcover-config";

export default class PluginSample extends Plugin {

    private customTab: () => IModel;
    private isMobile: boolean;

    onload() {
        this.data[STORAGE_NAME] = {
            autoRefresh: true,
        	// 当前配置的背景图路径
            imgPath: 'd:/onedrive/test.png',
            // 当前配置的背景图透明度
            opacity: 0.7,
            // 图片类型 1:本地文件，2：https
            imageFileType: 1,
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
            langKey: `${this.i18n.selectPictureRandomLabel}`,
            hotkey: "⇧⌘F7",
            callback: () => {
                this.selectPictureRandom();
            }
        });

        console.log(this.i18n.helloPlugin);
    }

    ///////////////////////////////
    // siyuan template functions //
    onLayoutReady() {
        this.loadData(STORAGE_NAME);
        console.log(`frontend: ${getFrontend()}; backend: ${getBackend()}`);
    }

    onunload() {
        console.log(this.i18n.byePlugin);
    }

    private eventBusLog({detail}: any) {
        console.log(detail);
    }
    ///////////////////////////////

    //////////////////////
    // Plugin functions //
    private showMobileTodo() {
        showMessage(`${this.i18n.mobileNotSupported}`, 1000, "info")
    }

    private showIndev() {
        const dialog = new Dialog({
            title: `${this.i18n.inDevTitle}`,
            content: `<div class="b3-dialog__content">${this.i18n.inDev}</div>`,
            width: this.isMobile ? "92vw" : "520px",
        });
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

    private openURL(url: string) {
        window.open(url, "_blank");
    }

    private changeOpacity(alpha: number){
        this.showIndev();
    }

    private changeOpacityMenu() {
        this.changeOpacity(0.5);
    }

    private closeBackground() {
        this.showIndev();
    }

    private openSetting() {
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
                    value="${this.data[STORAGE_NAME].autoRefresh}"
                />
            </label>
            <label class="fn__flex b3-label">
                <div class="fn__flex-1">
                    ${this.i18n.imgPathLabel}
                    <div class="fn__hr"></div>
                    <input class="b3-text-field fn__block" id="apiKey" value="${this.data[STORAGE_NAME].imgPath}">
                </div>
            </label>
            <label class="fn__flex b3-label config__item">
                <div class="fn__flex-1">
                    ${this.i18n.opacityLabel}
                    <div class="b3-label__text">${this.i18n.opacityDes}</div>
                </div>
                <div class="b3-tooltips b3-tooltips__n fn__flex-center" aria-label="${this.data[STORAGE_NAME].opacity}">   
                    <input class="b3-slider fn__size200" id="fontSize" max="1" min="0" step="0.05" type="range" value="${this.data[STORAGE_NAME].opacity}">
                </div>
            </label>
            <label class="fn__flex b3-label">
                <div class="fn__flex-1">
                    ${this.i18n.randomDirectoryLabel}
                    <div class="b3-label__text">${this.i18n.randomDirectoryDes}</div>
                    <div class="fn__hr"></div>
                    <input class="b3-text-field fn__block" id="apiKey" value="${this.data[STORAGE_NAME].imgDir}">
                </div>
            </label>
            `,
            width: this.isMobile ? "92vw" : "520px",
        });

        // the first Auto refresh settings
        const autoRefreshElement = dialog.element.querySelectorAll("input")
        autoRefreshElement[0].checked = this.data[STORAGE_NAME].autoRefresh;

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
    private addMenu(rect?: DOMRect) {
        const menu = new Menu("topBarSample", () => {
            console.log(this.i18n.byeMenu);
        });
        menu.addItem({
            icon:"iconImage",
            label: `${this.i18n.selectPictureLabel}`,
            type: "submenu",
            submenu: [
                {
                    icon: "iconHand",
                    label: `${this.i18n.selectPictureManualLabel}`,
                    click: () => {
                        this.showIndev();
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
            icon:"iconClose",
            label: `${this.data[STORAGE_NAME].activate ? this.i18n.closeBackgroundLabel : this.i18n.openBackgroundLabel}`,
            click: () => {
                this.closeBackground();
            }
        });

        menu.addSeparator();

        menu.addItem({
            icon: "iconGithub",
            label: `${this.i18n.bugReportLabel}`,
            click: () => {
                this.openURL("https://github.com/HowcanoeWang/siyuan-plugin-background-cover/issues");
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
