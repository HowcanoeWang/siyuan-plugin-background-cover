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

    public bgLayer = document.createElement('canvas');

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
                this.selectPictureByHand();
            }
        });
        this.addCommand({
            langKey: "selectPictureRandomLabel",
            hotkey: "⇧⌘F7",
            callback: () => {
                this.selectPictureRandom(true);
            }
        });
        this.addCommand({
            langKey: "openBackgroundLabel",
            hotkey: "⇧⌘F4",
            callback: () => {
                this.pluginOnOff();
            }
        });

        // 侦测theme主题有没有发生变化
        const themeChangeObserver = new MutationObserver(await this.themeOnChange.bind(this));
        themeChangeObserver.observe(this.htmlThemeNode, { attributes: true });

        info(this.i18n.helloPlugin);
    }

    ///////////////////////////////
    // siyuan template functions //
    ///////////////////////////////
    async onLayoutReady() {
        this.cssThemeStyle = {}

        this.createBgLayer();

        // 给layouts, dockLeft, dockRight三个元素的父级面板，增加一个方便定位的ID值
        let dockPanelElement = document.getElementById('layouts').parentElement
        dockPanelElement.id = 'dockPanel'

        await fileManagerUI.checkCacheDirctory(this);

        // load the user setting data
        const [themeMode, themeName] = getThemeInfo();
        configs.set('prevTheme', themeName);

        // this.changeOpacity(0.85);
        await this.applySettings();

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

    //////////////////////
    // Plugin functions //
    //////////////////////
    private createBgLayer() {
        this.bgLayer.id = "bglayer";
        this.bgLayer.className = "bglayer";

        document.body.appendChild(this.bgLayer);
    };


    public async pluginOnOff() {
        configs.set('activate', !configs.get('activate'))
        configs.save();
        this.applySettings();
    }

    public useDefaultLiaoLiaoBg() {
        debug(`[Func][applySettings] 没有缓存任何图片，使用默认的了了妹图片ULR来当作背景图`)
        this.changeBackgroundContent(cst.demoImgURL, cst.bgMode.image)
        configs.set('bgObj', undefined);
    }

    public async selectPictureByHand() {
        await fileManagerUI.selectPictureDialog(this);
    };

    public async selectPictureRandom(manualPress: boolean = false) {
        const cacheImgNum = fileManagerUI.getCacheImgNum()
        if (cacheImgNum === 0) {
            // 没有缓存任何图片，使用默认的了了妹图片ULR来当作背景图
            this.useDefaultLiaoLiaoBg();
            showMessage(`${this.i18n.noCachedImg4random}`, 3000, "info")
        } else if (cacheImgNum === 1) {
            // 只有一张图，无法进行随机抽选(无变化)
            if (manualPress) {
                showMessage(`${this.i18n.selectPictureRandomNotice}`, 3000, "info")
            }
            let belayerElement = document.getElementById('bglayer')
            if (belayerElement.style.getPropertyValue('background-image') === '') {
                // 如果当前背景不存在任何图片
                let bgObj = configs.get('bgObj')
                this.changeBackgroundContent(bgObj.path, bgObj.mode)
            }
        } else {
            // 随机选择一张图
            let fileidx = configs.get('fileidx')
            let crt_hash = configs.get('bgObj').hash
            let r_hash = ''
            while (true) {
                let r = Math.floor(Math.random() * cacheImgNum)
                r_hash = Object.keys(fileidx)[r]
                debug(`[Func][selectPictureRandom] 随机抽一张，之前：${crt_hash}，随机到：${r_hash}`)
                if (r_hash !== crt_hash) {
                    // 确保随机到另一张图而不是当前的图片
                    debug(`[Func][selectPictureRandom] 已抽到不同的背景图${r_hash}，进行替换`)
                    break
                }
            }
            debug('[Func][selectPictureRandom] 跳出抽卡死循环,前景图为：', fileidx[r_hash])
            this.changeBackgroundContent(fileidx[r_hash].path, fileidx[r_hash].mode)
            configs.set('bgObj', fileidx[r_hash])
        }
        await configs.save()
        settingsUI.updateSettingPanelElementStatus()
    }

    public async addSingleLocalImageFile() {

        const cacheImgNum = fileManagerUI.getCacheImgNum();

        if (cacheImgNum >= cst.cacheMaxNum) {
            showMessage(this.i18n.addSingleImageExceed1 + cst.cacheMaxNum + this.i18n.addSingleImageExceed2, 7000, 'error');
        }else{
            const pickerOpts = {
                types: [
                    {
                        description: "Images",
                        accept: {
                            "image/*": cst.supportedImageSuffix,
                        },
                    },
                ],
                excludeAcceptAllOption: true,
                multiple: false,
            };
    
            // return an Array
            const fileHandle = await window.showOpenFilePicker(pickerOpts);
            let file = await fileHandle[0].getFile();
    
            let bgObj = await fileManagerUI.uploadOneImage(this, file);
    
            // 文件不重复且上传成功
            if (bgObj !== undefined) {
                await configs.save();
                this.changeBackgroundContent(bgObj.path, bgObj.mode);
                settingsUI.updateSettingPanelElementStatus();
            };
        };
    };

    public async addDirectory() {
        const cacheImgNum = fileManagerUI.getCacheImgNum();

        const directoryHandle = await window.showDirectoryPicker();
        const fileEntries = await directoryHandle.values();


        let fileContainer:Array<File> = []

        // 遍历文件夹中的每个文件
        for await (const fileEntry of fileEntries) {
            // 检查文件类型是否为文件，排除文件夹
            if (fileEntry.kind === 'file') {
                const file = await fileEntry.getFile();
                const fileName = file.name;

                const [prefix, suffix] = os.splitext(fileName)
                // suffix = 'jpg'
                debug(`[Func][addDirectory] 当前图片${fileName}后缀为${suffix}, 存在于允许的图片后缀(${cst.supportedImageSuffix})中：${cst.supportedImageSuffix.includes(`.${suffix}`)}`)
                if (cst.supportedImageSuffix.includes(`.${suffix}`)) {

                    let md5 = fileManagerUI.imgExistsInCache(this, file, false);

                    if (md5 !== 'exists') {
                        fileContainer.push(file)
                    }else{
                        debug(`[Func][addDirectory] 当前图片${fileName}md5为${md5}, 存在于缓存中`)
                    }
                }

                debug(`[Func][addDirectory] fileContainer`, fileContainer)
            }

            if (fileContainer.length >= cst.cacheMaxNum - cacheImgNum) {
                showMessage(this.i18n.addDirectoryLabelError1 + cst.cacheMaxNum + this.i18n.addDirectoryLabelError2, 7000, 'error')
                break
            }
        }

        if (fileContainer.length >= 30) {
            confirm(
                this.i18n.addDirectoryLabelConfirmTitle,
                `${this.i18n.addDirectoryLabelConfirm1} ${fileContainer.length} ${this.i18n.addDirectoryLabelConfirm2}`,
                async () => {
                    // 同意上传，则开始批量上传
                    await fileManagerUI.batchUploadImages(this, fileContainer, true);
                }
            )
        }else{
             // 要上传的数量比较少，直接开始批量上传
            await fileManagerUI.batchUploadImages(this, fileContainer, true);
        }
    }

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

    public changeBackgroundContent(background: string, mode: cst.bgMode) {
        if (mode === cst.bgMode.image) {
            debug(`[Func][changeBackgroundContent] 替换当前背景图片为${background}`)
            this.bgLayer.style.setProperty('background-image', `url('${background}')`);
        } else if (mode == cst.bgMode.live2d) {
            noticeUI.showIndev();
        } else {
            showMessage(`[${this.i18n.addTopBarIcon} Plugin][Error] Background type [${mode}] is not supported, `, 7000, "error");
        }
    };

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

    public changeOpacity(alpha: number, tranMode: number, adaptMode: boolean) {
        // opacity mode: fully transparent (adaptMode=False)
        // css mode: only background transparent (adaptMode=True)
        let opacity = 0.99 - 0.25 * alpha;

        const [themeMode, themeName] = getThemeInfo();

        let operateElement: {
            opacity: {
                operateOpacityElement: string[],
                zIndexValue: string[],
                operateElementStyle: string[],
                operateCssStyle: string[]
            },
            css: {
                operateOpacityElement: string[],
                zIndexValue: string[],
                operateElementStyle: string[],
                operateCssStyle: string[]
            },
        }
        operateElement = {
            // opacity模式：修改组件的opactiy来实现前景的透明, themeAdapt=false
            opacity: {
                operateOpacityElement: ["toolbar", "dockPanel", "dockBottom", "status"],
                // 调整opacity还需要修改z-index的值，不然会导致按钮点击不了
                // https://blog.csdn.net/weixin_51474815/article/details/121070612
                // 
                // 使用下面的代码，获取所有的z-index值：
                // window.document.defaultView.getComputedStyle(
                //    document.getElementById('layouts')
                // ).getPropertyValue('z-index');
                // 计算之后的结果为（默认的结果）：
                //    layouts -> 10 (部分主题)
                //    toolbar -> auto
                //    dockLeft -> auto
                //    dockRight -> auto
                //    dockBottom -> auto
                //    status -> 2
                zIndexValue: ['2', '1', '2', '3'],
                operateElementStyle: [],
                operateCssStyle: [],
            },
            // css模式：修改组件背景颜色的alpha值，来实现前景的透明, themeAdapt=true
            css: {
                operateOpacityElement: [],
                zIndexValue: ['1'],
                operateElementStyle: ["toolbar", "dockLeft", "dockRight", "dockBottom", "status"],
                operateCssStyle: [
                    ".layout-tab-bar", ".layout-tab-container", 
                    ".protyle", ".protyle-breadcrumb", ".protyle-content"]
            }
        }

        // 获取constance.ts的配置中，所有需要适配主题对应的element id和对应的css值
        let themeAdaptObject: cst.themeAdaptObject;
        let themeAdaptElement: string[] = [];

        if (themeName in adp.toAdaptThemes) { // 如果当前的主题在主题适配列表中
            // 获取constance.ts的配置中，所有需要适配主题对应的element id和对应的css值
            themeAdaptObject = adp.toAdaptThemes[themeName];
            // >>> "Savor": {...}
            themeAdaptElement = Object.keys(themeAdaptObject) as string[];
            // >>> ["toolbar", ".protyle", ...]

            // 合并并去除重复项
            for (let i in themeAdaptElement) {
                const itemName = themeAdaptElement[i];

                // 如果是".xxxx"开头，说明这边要改的是css的样式
                debug(`[Func][chageOpacity] 添加主题适配列表内容${itemName}.slice(0,1) === '.'`, itemName.slice(0,1) === '.')
                if (itemName.slice(0,1) === '.') {
                    // 如果不含有当前的元素，则添加
                    if (!operateElement.css.operateCssStyle.includes(itemName)) {
                        operateElement.css.operateCssStyle.push(itemName);
                    }
                }else{
                    if (!operateElement.css.operateElementStyle.includes(itemName)) {
                        operateElement.css.operateElementStyle.push(itemName);
                    }
                }
            }
        }

        debug(`[Func][changeOpacity] operateElement: `, operateElement)

        /**
         * 用户打开图片背景
         */
        if (configs.get('activate')) {

            let addOpacityElement: string[];
            let zIndexValue: string[];
            let addElementStyle: string[];
            let editCssStyle: string[];

            let rmOpacityElement: string[];
            let rmElementStyle: string[];
            let restoreCssStyle: string[];

            if (adaptMode) { // 开启css的透明模式
                addOpacityElement = operateElement.css.operateOpacityElement;
                zIndexValue = operateElement.css.zIndexValue;
                addElementStyle = operateElement.css.operateElementStyle;
                editCssStyle = operateElement.css.operateCssStyle;

                rmOpacityElement = operateElement.opacity.operateOpacityElement;
                rmElementStyle = operateElement.opacity.operateElementStyle;
                restoreCssStyle = operateElement.opacity.operateCssStyle;
            } else {  // 开启 opacity 透明模式
                addOpacityElement = operateElement.opacity.operateOpacityElement;
                zIndexValue = operateElement.opacity.zIndexValue;
                addElementStyle = operateElement.opacity.operateElementStyle;
                editCssStyle = operateElement.opacity.operateCssStyle;

                rmOpacityElement = operateElement.css.operateOpacityElement;
                rmElementStyle = operateElement.css.operateElementStyle;
                restoreCssStyle = operateElement.css.operateCssStyle;
            }

            // 遍历修改opacity
            for (let eid in addOpacityElement) {
                var changeItem = document.getElementById(addOpacityElement[eid]);

                changeItem.style.setProperty('opacity', opacity.toString());
                changeItem.style.setProperty('z-index', zIndexValue[eid]);
            }
            for (let eid in rmOpacityElement) {
                var changeItem = document.getElementById(rmOpacityElement[eid]);

                changeItem.style.removeProperty('opacity');
                changeItem.style.removeProperty('z-index');
            }

            // 遍历修改Alpha
            if (addElementStyle.length > 0) {
                for (let eid in addElementStyle) {
                    const elementid: string = addElementStyle[eid];
                    var changeItem = document.getElementById(elementid);

                    var themeAdaptColor: string;
                    var adaptColor: string;

                    debug(`[Func][changeOpacity] 修改元素ID为${elementid}的元素alpha值`);

                    if (themeAdaptElement.includes(elementid)) {
                        // 如果当前元素的css在主题适配列表中，直接获取适配列表中的配置
                        themeAdaptColor = themeAdaptObject[elementid][themeMode];
                        adaptColor = eval('`' + themeAdaptColor + '`'); // 有些配置涉及到运算
                    } else {
                        // 不需要针对主题进行适配，直接计算当前元素的颜色alpha值
                        themeAdaptColor = getComputedStyle(changeItem, null).getPropertyValue('background-color');
                        adaptColor = cv2.changeColorOpacity(themeAdaptColor, opacity);
                    }

                    debug(`[Func][changeOpacity] ${elementid} originalColor: ${themeAdaptColor}, adaptColor: ${adaptColor}`);

                    changeItem.style.setProperty('background-color', adaptColor, 'important');
                    changeItem.style.setProperty('background-blend-mode', `lighten`);
                }
            }
            if (rmElementStyle.length > 0) {
                for (let eid in rmElementStyle) {
                    const elementid: string = rmElementStyle[eid];
                    var changeItem = document.getElementById(elementid);

                    changeItem.style.removeProperty('background-color');
                    changeItem.style.removeProperty('background-blend-mode');
                }
            }

            // 遍历修改css自身的值
            if (adaptMode) {
                var sheets = document.styleSheets;
                if (editCssStyle.length + restoreCssStyle.length > 0) {
                    // 遍历所有的css style，找到指定的css
                    for (var i in sheets) {
                        debug(`[Func][changeOpacity] 当前遍历到的CSS Style文件为：`, sheets[i].href)
                        try {
                            var rules = sheets[i].cssRules;
                        } catch (err) {
                            const errorMessage = `[${this.i18n.addTopBarIcon} Plugin] ${this.i18n.themeCssReadDOMError}<br>ErrorFile: <code>${sheets[i].href}</code> when calling <code> document.styleSheets[${i}].cssRules;</code>`
                            // showMessage(errorMessage, 0, 'error');
    
                            error(errorMessage, err);
                            continue;
                        }
                        for (var r in rules) {
                            let rule = rules[r] as CSSStyleRule;
                            let csstext = rule.selectorText;
            
                            // 需要修改的css属性
                            if (editCssStyle.includes(csstext)) {
                                let cssColor = rule.style.getPropertyValue('background-color');
                                if (!cssColor) {  // 当前样式不存在颜色值，就赋一个白色
                                    cssColor = 'rgb(255,255,255)';
                                    this.cssThemeStyle[csstext] = 'null';
                                }else{
                                    this.cssThemeStyle[csstext] = cssColor;
                                }
                                
                                let transparentColor: string
                                if (themeAdaptElement.includes(csstext)) {
                                    // 如果当前元素的css在主题适配列表中，直接获取适配列表中的配置
                                    themeAdaptColor = themeAdaptObject[csstext][themeMode];
                                    transparentColor = eval('`' + themeAdaptColor + '`'); // 有些配置涉及到运算
                                } else {
                                    // 不需要针对主题进行适配，直接计算当前元素的颜色alpha值
                                    if ([".protyle", ".protyle-breadcrumb", ".protyle-content"].includes(csstext)) {
                                        transparentColor = cv2.changeColorOpacity(cssColor, 0);
                                    }else{
                                        transparentColor = cv2.changeColorOpacity(cssColor, opacity);
                                    }
                                }
                                
                                rule.style.setProperty('background-color', transparentColor, 'important');
                                debug(`[Func][changeOpacity]修改css属性表${csstext},从${cssColor}修改为透明色${transparentColor}`, rule.style);
                            }
    
                            // 需要恢复的css属性
                            if (restoreCssStyle.includes(csstext)) {
                                let originalColor = this.cssThemeStyle[csstext]
                                // 主题中该项css样式为空，则直接删除这个项
                                if (originalColor !== 'null') {
                                    rule.style.setProperty('background-color', originalColor);
                                }else{
                                    rule.style.removeProperty('background-color')
                                }
                                
                                debug(`[Func][changeOpacity]恢复css属性表${csstext}为主题默认色${this.cssThemeStyle[csstext]}`, rule.style);
                            }
                        }
                    }
                }
            }
            debug('cssThemeStyle Value:', this.cssThemeStyle);
            
        /**
         * 用户关闭图片背景
         */
        } else {
            // 插件不启用，则需要删除之前添加的所有元素的值
            let removeOpacityElement = np.merge(
                operateElement.opacity.operateOpacityElement,
                operateElement.css.operateOpacityElement,
            )
            debug(`[Func][changeOpacity] 移除下列元素的opacity和z-index值:`, removeOpacityElement)
            for (let eid in removeOpacityElement) {
                const elementid: string = removeOpacityElement[eid]
                var changeItem = document.getElementById(elementid)
                changeItem.style.removeProperty('opacity')
                changeItem.style.removeProperty('z-index')
            }

            let removeCssElement = np.merge(
                operateElement.opacity.operateElementStyle,
                operateElement.css.operateElementStyle,
            );
            debug(`[Func][changeOpacity] 移除下列元素的background-color和blend-mode值:`, removeCssElement);
            for (let eid in removeCssElement) {
                const elementid: string = removeCssElement[eid];
                var changeItem = document.getElementById(elementid);
                changeItem.style.removeProperty('background-color');
                changeItem.style.removeProperty('background-blend-mode');
            };

            // 恢复之前的css样式值
            let removeCssStyle = np.merge(
                operateElement.opacity.operateCssStyle,
                operateElement.css.operateCssStyle,
            );

            var sheets = document.styleSheets;
            if (removeCssStyle.length > 0 && adaptMode) {
                // 遍历所有的css style，找到指定的css
                for (var i in sheets) {
                    debug(`[Func][changeOpacity] 当前遍历到的CSS Style文件为：`, sheets[i])
                    try {
                        var rules = sheets[i].cssRules;
                    } catch (err) {
                        const errorMessage = `[${this.i18n.addTopBarIcon} Plugin] ${this.i18n.themeCssReadDOMError}<br>ErrorFile: <code>${sheets[i].href}</code> when calling <code> document.styleSheets[${i}].cssRules;</code>`
                        // showMessage(errorMessage, 0, 'error');

                        error(errorMessage, err);
                        continue;
                    }

                    for (var r in rules) {
                        let rule = rules[r] as CSSStyleRule;
                        // switch (rules[r].constructor.name) {
                        //     case 'CSSStyleRule': 
                        //         rule = rules[r] as CSSStyleRule;
                        //     case 'CSSImportRule':
                        //         // todo
                        //         continue;
                        // }
                        let csstext = rule.selectorText;
        
                        // 需要修改的css属性
                        if (removeCssStyle.includes(csstext)) {
                            let originalColor = this.cssThemeStyle[csstext]
                            // 主题中该项css样式为空，则直接删除这个项
                            if (originalColor !== 'null') {
                                rule.style.setProperty('background-color', originalColor);
                            }else{
                                rule.style.removeProperty('background-color')
                            }
                        };
                    };
                };
            };
        };
    };

    public changeBlur(blur: number) {
        this.bgLayer.style.setProperty('filter', `blur(${blur}px)`)
    }

    public changeBgPosition(x: string, y: string) {
        if (x == null || x == undefined) {
            debug(`[Func][changeBgPosition] xy未定义，不进行改变`)
            this.bgLayer.style.setProperty('background-position', `center`);
        } else {
            debug(`[Func][changeBgPosition] 修改background-position为${x}% ${y}%`)
            this.bgLayer.style.setProperty('background-position', `${x}% ${y}%`);
        }
    }

    public async applySettings() {
        if (configs.get('activate')) {
            this.bgLayer.style.removeProperty('display')
        } else {
            this.bgLayer.style.setProperty('display', 'none')
        }

        // 缓存文件夹中没有图片 | 用户刚刚使用这个插件 | 用户刚刚重置了插件数据 | 当前文件404找不到
        const cacheImgNum = fileManagerUI.getCacheImgNum()
        debug(`[Func][applySettings] cacheImgNum= ${cacheImgNum}`)
        if (cacheImgNum === 0) {
            // 没有缓存任何图片，使用默认的了了妹图片ULR来当作背景图
            this.useDefaultLiaoLiaoBg();
        } else if (configs.get('bgObj') === undefined) {
            // 缓存中有1张以上的图片，但是设置的bjObj却是undefined，随机抽一张
            debug(`[Func][applySettings] 缓存中有1张以上的图片，但是设置的bjObj却是undefined，随机抽一张`)
            await this.selectPictureRandom()
        } else {
            // 缓存中有1张以上的图片，bjObj也有内容且图片存在
            debug(`[Func][applySettings] 缓存中有1张以上的图片，bjObj也有内容且图片存在`)
            let bgObj = configs.get('bgObj')
            let fileidx = configs.get('fileidx')
            // 没有开启启动自动更换图片，则直接显示该图片
            if (bgObj.hash in fileidx && !configs.get('autoRefresh')) {
                debug(`[Func][applySettings] 没有开启启动自动更换图片，则直接显示当前图片`)
                this.changeBackgroundContent(bgObj.path, bgObj.mode)
            } else {
                // 当bjObj找不到404 | 用户选择随机图片，则随机调一张作为bjObj
                debug(`[Func][applySettings] 用户选择随机图片，则随机调一张作为bjObj`)
                await this.selectPictureRandom()
            }
        }

        this.changeOpacity(configs.get('opacity'), configs.get('transMode'), configs.get('adaptMode'))
        this.changeBlur(configs.get('blur'))
        if (configs.get('bgObj') === undefined){
            this.changeBgPosition(null, null)
        }else{
            this.changeBgPosition(configs.get('bgObj').offx, configs.get('bgObj').offy)
        }
        
        settingsUI.updateSettingPanelElementStatus()
    }
}
