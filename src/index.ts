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
import { 
    error, warn, info, debug, 
    CloseCV, MD5,  OS,
    getThemeInfo 
} from './utils';
import * as cst from './constants'

import packageInfo from '../plugin.json'
import "./index.scss";

// pythonic style
let os = new OS();
let ka = new KernelApi();
let cv2 = new CloseCV();

export default class SwitchBgCover extends Plugin {

    private isMobile: boolean;

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

        // 侦测theme主题有没有发生变化
        const themeChangeObserver = new MutationObserver(this.themeOnChange.bind(this));
        themeChangeObserver.observe(this.htmlThemeNode, {attributes: true});

        info(this.i18n.helloPlugin);
    }

    ///////////////////////////////
    // siyuan template functions //
    ///////////////////////////////
    async onLayoutReady() {
        this.createBgLayer();

        await this.checkCacheDirctory();

        // load the user setting data
        const [themeMode, themeName] = getThemeInfo();
        settings.set('prevTheme', themeName);

        // this.changeOpacity(0.85);
        await this.applySettings();
        
        debug(`frontend: ${getFrontend()}; backend: ${getBackend()}`);
    }

    onunload() {
        info(`${this.i18n.byePlugin}`)
        settings.save();
    }

    // private eventBusLog({detail}: any) {
    //     info(detail);
    // }

    //////////////////////
    // Plugin functions //
    //////////////////////
    private createBgLayer() {
        this.bgLayer.id = "bglayer"
        this.bgLayer.className = "bglayer"

        document.body.appendChild(this.bgLayer)
    }


    private async checkCacheDirctory(){
        // check image files
        let imgFiles = await os.listdir(cst.pluginImgDataDir)
        interface fileIndex  {
            [key:string]: cst.bgObj;
        }

        let fileidx: fileIndex = {}
        let fileidx_db: fileIndex = settings.get('fileidx')
        let notCorrectCacheImgs = []
        let extraCacheImgs = []
        let missingCacheImgs = []

        if (fileidx_db === undefined || fileidx_db === null ) {
            debug(`The settings.fileidx is empty {}`)
        }

        for (let i in imgFiles){
            let item = imgFiles[i]
            if (item.isDir) {
                // live2d的文件目录
                continue
            }else{
                // 背景图片
                debug(`[Func][checkCacheDirectory] Check ${item.name} in cached dir`)
                if (item.name.slice(0,5) === 'hash-'){
                    const [hash_name, suffix] = os.splitext(item.name.split('-')[1])

                    debug(hash_name, fileidx_db, extraCacheImgs)

                    if (hash_name in fileidx_db){
                        let bgObj_old = fileidx_db[hash_name]
                        
                        // 对于旧版本的fileidx_db, 检查bgObj的属性是否有遗漏，有的话就补上新属性
                        if (bgObj_old.offx === undefined || 
                            bgObj_old.width === undefined || 
                            bgObj_old.width === 0) {
                            // 旧版缓存，需要更新
                            const imageSize = await cv2.getImageSize(bgObj_old.path)

                            let bgObj: cst.bgObj = {
                                name: bgObj_old.name,
                                path: bgObj_old.path,
                                hash: bgObj_old.hash,
                                mode: bgObj_old.mode,
                                offx: 50,
                                offy: 50,
                                height: imageSize.height,
                                width: imageSize.width
                            }

                            fileidx[hash_name] = bgObj

                            debug("settings.fileidx为旧版配置，已更新", bgObj)
                        }else{
                            fileidx[hash_name] = bgObj_old
                        }
                    }else{
                        // 在缓存文件夹中，但图片并不在fileidx中（图片多余了）
                        extraCacheImgs.push(item.name)
                        ka.removeFile(`${cst.pluginImgDataDir}/${item.name}`)
                    }
                }else{
                    // 非法缓存图片
                    notCorrectCacheImgs.push(item.name)
                    ka.removeFile(`${cst.pluginImgDataDir}/${item.name}`)
                }
            }
        }

        // 在缓存文件夹中不存在，更新缓存文件夹
        for (let k in fileidx_db){
            if (!(k in fileidx)) {
                missingCacheImgs.push(fileidx_db[k].name)
            }
        }

        settings.set('fileidx', fileidx)
        await settings.save()

        debug(`[Func][checkCacheDirctory]notCorrectCacheImgs: ${notCorrectCacheImgs}, missingCacheImgs: ${extraCacheImgs}`)
        // raise warning to users
        if (notCorrectCacheImgs.length !== 0) {
            let msgInfo = `${this.i18n.cacheImgWrongName}<br>[${notCorrectCacheImgs}]<br>${this.i18n.doNotOperateCacheFolder}`
            showMessage(msgInfo, 7000, "info")
            info(msgInfo)
        }

        if (extraCacheImgs.length !== 0) {
            let msgInfo = `${this.i18n.cacheImgExtra}<br>[${extraCacheImgs}]<br>${this.i18n.doNotOperateCacheFolder}`
            showMessage(msgInfo, 7000, "info")
            info(msgInfo)
        }

        if (missingCacheImgs.length !== 0) {
            let msgInfo = `${this.i18n.cacheImgMissing}<br>[${missingCacheImgs}]<br>${this.i18n.doNotOperateCacheFolder}`
            showMessage(msgInfo, 7000, "info")
            info(msgInfo)
        }

        // check live 2d files
        // let live2dFiles = await os.listdir(cst.pluginLive2DataDir)
    }

    private async pluginOnOff() {
        settings.set('activate', !settings.get('activate'))
        settings.save();
        this.applySettings();
    }

    private async selectPictureByHand() {
        this.showIndev();
    }

    private async selectPictureRandom() {
        const cacheImgNum = this.getCacheImgNum()
        if (cacheImgNum === 0) {
            // 没有缓存任何图片，使用默认的了了妹图片ULR来当作背景图
            this.changeBackgroundContent(cst.demoImgURL, cst.bgMode.image)
            settings.set('bgObj', undefined)
            showMessage(`${this.i18n.noCachedImg4random}`, 3000, "info")
        }else{
            // 随机选择一张图
            let fileidx = settings.get('fileidx')
            const r = Math.floor(Math.random() * cacheImgNum)
            const r_hash = Object.keys(fileidx)[r]
            this.changeBackgroundContent(fileidx[r_hash].path, fileidx[r_hash].mode)
            settings.set('bgObj', fileidx[r_hash])
        }
        await settings.save()
        this.updateSettingPanelValues()
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

        showMessage(`${file.name}-${(file.size/1024/1024).toFixed(2)}MB<br>${this.i18n.addSingleImageUploadNotice}`, 3000, "info")

        // let file_content = await file.text()
        var md5 = MD5(`${file.name}${file.size}${file.lastModified}`.slice(0,15));

        if (settings.get('fileidx') !== undefined && md5 in settings.get('fileidx')) {
            const dialog = new Dialog({
                title: `${this.i18n.inDevTitle}`,
                content: `<div class="b3-dialog__content">${this.i18n.imageFileExist}</div>`,
                width: this.isMobile ? "92vw" : "520px",
            });
        }else{
            const [prefix, suffix] = os.splitext(file.name)
            const hashedName = `hash-${md5}.${suffix}`

            const uploadResult = await ka.putFile(`${cst.pluginImgDataDir}/${hashedName}`, file);

            if (uploadResult.code === 0) {
                let fileidx = settings.get('fileidx')

                if (fileidx === undefined || fileidx === null) {
                    fileidx = {}
                }

                let bgObj = cst.bgObj

                // slice(5) to remove '/data' prefix
                const imgPath = `${cst.pluginImgDataDir.slice(5)}/${hashedName}`  

                const imageSize = await cv2.getImageSize(imgPath)

                bgObj = {
                    name : file.name,
                    hash : md5,
                    mode : cst.bgMode.image,
                    path : imgPath,
                    offx : 50,
                    offy : 50,
                    width: imageSize.width,
                    height: imageSize.width
                }

                fileidx[md5] = bgObj
    
                settings.set('bgObj', bgObj)
                settings.set('fileidx', fileidx)
                await settings.save()

                debug(`[func][addSingleLocalImageFile]: fileidx ${fileidx}`)
    
                this.changeBackgroundContent(bgObj.path, bgObj.mode)
                this.updateSettingPanelValues();
            }else{
                error(`fail to upload file ${file.name} with error code ${uploadResult}`)
            }
        }
    }

    private addDirectory() {
        this.showIndev();
    }

    private async themeOnChange() {
        const [themeMode, themeName] = getThemeInfo();
        let prevTheme = settings.get('prevTheme')

        debug(`Theme changed! from ${prevTheme} to ${themeMode} | ${themeName}`)

        if (prevTheme !== themeName) {
            // 更换主题时，强制刷新笔记页面
            settings.set('prevTheme', themeName);
            await settings.save()
            window.location.reload()
        }
    }

    private changeBackgroundContent(background:string, mode:cst.bgMode) {
        if (mode === cst.bgMode.image) {
            this.bgLayer.style.setProperty('background-image', `url('${background}')`);
        }else if (mode == cst.bgMode.live2d){
            this.showIndev();
        }else{
            showMessage(`[${this.i18n.addTopBarIcon} Plugin][Error] Background type [${mode}] is not supported, `, 7000, "error");
        }
    }

    private changeOpacity(alpha:number, themeAdapt:boolean){
        // let opacity = 0.99 - 0.25 * settings.get('opacity');
        let opacity = 0.99 - 0.25 * alpha;

        const [themeMode, themeName] = getThemeInfo();

        if (cst.noAdaptThemes.includes(themeName)) {
            themeAdapt = false;
        }

        // 默认直接调整opacity和z_index来忽略各个主体之间的差异
        let operateOpacityElement: string[]
        let allOpacityElement: string[] = [
            "layouts", "toolbar", "dockLeft", "dockRight", "dockBottom", "status"
        ]
        if (themeAdapt) {
            operateOpacityElement = ["layouts"]
        }else{
            operateOpacityElement = [
                "layouts", "toolbar", "dockLeft", "dockRight", "dockBottom", "status"
            ]
        }
        
        for (let eid in allOpacityElement) {
            // 调整opacity还需要修改z-index的值，不然会导致按钮点击不了
            // https://blog.csdn.net/weixin_51474815/article/details/121070612
            // 
            // 使用下面的代码，获取所有的z-index值：
            // window.document.defaultView.getComputedStyle(
            //    document.getElementById('layouts')
            // ).getPropertyValue('z-index');
            // 计算之后的结果为：
            // layouts -> 10
            // toolbar -> auto
            // dockLeft -> auto
            // dockRight -> auto
            // dockBottom -> auto
            // status -> 2
            const o_zindex = window.document.defaultView.getComputedStyle(
                document.getElementById(allOpacityElement[eid])
            ).getPropertyValue('z-index')
            debug('original z-index', o_zindex)

            const z_index: string[] = ['auto', '7', 'auto', 'auto', 'auto', 'auto', '2']

            var changeItem = document.getElementById(allOpacityElement[eid])

            if (settings.get('activate')) {
                debug(`allOpacityElement[eid] ${allOpacityElement[eid]} in operateOpacityElement ${operateOpacityElement}`, operateOpacityElement.includes(allOpacityElement[eid]))

                if (operateOpacityElement.includes(allOpacityElement[eid])) {
                    changeItem.style.setProperty('opacity', opacity.toString())
                    changeItem.style.setProperty('z-index', z_index[eid])
                }else{
                    changeItem.style.removeProperty('opacity')
                    changeItem.style.removeProperty('z-index')
                }
            }else{
                changeItem.style.removeProperty('opacity')
                changeItem.style.removeProperty('z-index')
            }
        }


        // change the color via rgba alpha
        let addAlphaElement: string[] = ["toolbar", "dockLeft", "dockRight", "dockBottom", "status"]

        // 创建适配的键值容器
        interface themeAdaptObject{
            [key: string]: string[]
        }
        let themeAdaptObject: themeAdaptObject
        let themeAdaptElement: string[] = []

        if (themeName in cst.toAdaptThemes) {
            themeAdaptObject = cst.toAdaptThemes[themeName] as themeAdaptObject
            themeAdaptElement = Object.keys(themeAdaptObject) as string[]
        }

        // 合并键值
        let mergedElemet: string[]
        if (themeAdaptElement.length !== 0) {
            mergedElemet = [...new Set([...addAlphaElement ,...themeAdaptElement ])]
        }else{
            mergedElemet = addAlphaElement
        }

        // 遍历每一个键值
        for (let eid in mergedElemet) {
            // 启用插件并开启了主题适配
            const elementid:string = mergedElemet[eid]
            var changeItem = document.getElementById(elementid)
            if (settings.get('activate') && themeAdapt) {
                
                var originalColor:string
                var adaptColor:string
    
                // 当前元素使用进行主题适配的颜色
                debug('[Func][changeOpacity]',
                    'elementid: ', elementid, 
                    'themeAdaptElement', themeAdaptElement, 
                    themeAdaptElement.includes(elementid)
                )
                
                if (themeAdaptElement.includes(elementid)){
                    originalColor = themeAdaptObject[elementid][themeMode]
                    // 根据适配的定义
                    // 'rgba(255, 255, 255, 0)' -> use directly
                    // 'rgb(237, 236, 233, ${opacity})' -> adapt with alpha value
                    adaptColor = eval('`'+originalColor+'`')
                }else{
                    // 不需要针对主题进行适配，直接计算当前元素的颜色
                    originalColor = getComputedStyle( changeItem ,null).getPropertyValue('background-color');
                    adaptColor = cv2.changeColorOpacity(originalColor, opacity);
                }
    
                debug(`[Func][changeOpacity] ${elementid} originalColor: ${originalColor}, adaptColor: ${adaptColor}`)

                changeItem.style.setProperty('background-color', adaptColor, 'important');
                changeItem.style.setProperty('background-blend-mode', `lighten`)
            }else{
                changeItem.style.removeProperty('background-color')
                changeItem.style.removeProperty('background-blend-mode')
            }
        }
    }

    private changeBlur(blur:number) {
        this.bgLayer.style.setProperty('filter', `blur(${blur}px)`)
    }

    public changeBgPosition(x:string, y:string) {
        if (x == null || x == undefined) {
            this.bgLayer.style.setProperty('background-position', `center`);
        }else{
            this.bgLayer.style.setProperty('background-position', `${x}% ${y}%`);
        }  
    }

    private async applySettings() {
        if (settings.get('activate')) {
            this.bgLayer.style.removeProperty('display')
        }else{
            this.bgLayer.style.setProperty('display', 'none')
        }

        // 缓存文件夹中没有图片 | 用户刚刚使用这个插件 | 用户刚刚重置了插件数据 | 当前文件404找不到
        const cacheImgNum = this.getCacheImgNum()
        if (cacheImgNum === 0){
            // 没有缓存任何图片，使用默认的了了妹图片ULR来当作背景图
            this.changeBackgroundContent(cst.demoImgURL, cst.bgMode.image)
            settings.set('bgObj', undefined)
        }else if(settings.get('bgObj') === undefined){
            // 缓存中有1张以上的图片，但是设置的bjObj却是undefined，随机抽一张
            await this.selectPictureRandom()
        }else{
            // 缓存中有1张以上的图片，bjObj也有内容且图片存在
            let bgObj = settings.get('bgObj')
            let fileidx = settings.get('fileidx')
            // 没有开启启动自动更换图片，则直接显示该图片
            if (bgObj.hash in fileidx && !settings.get('autoRefresh')) {
                this.changeBackgroundContent(bgObj.path, bgObj.mode)
            }else{
                // 当bjObj找不到404 | 用户选择随机图片，则随机调一张作为bjObj
                await this.selectPictureRandom()
            }
        }

        // this.themeOnChange()
        this.changeOpacity(settings.get('opacity'), settings.get('themeAdapt'))
        this.changeBlur(settings.get('blur'))
        this.changeBgPosition(
            settings.get('bgObj').offx.toString, 
            settings.get('bgObj').offy.toString
        )
        this.updateSettingPanelValues()
    }

    private updateSettingPanelValues(){
        // update current image URL
        let crtImageNameElement = document.getElementById('crtImgName')
        if ( crtImageNameElement === null || crtImageNameElement === undefined ) {
            // debug(`Setting panel not open`) 
        }else{
            crtImageNameElement.textContent = cst.demoImgURL.toString()
        }

        // update onoff switch button
        let onoffElement = document.getElementById('onoffInput') as HTMLInputElement
        if ( onoffElement === null || onoffElement === undefined ) {
            // debug(`Setting panel not open`) 
        }else{
            onoffElement.checked = settings.get('activate');
        }

        this.updateOffsetSwitch()
    }

    private updateOffsetSwitch(){
        let cxElement = document.getElementById('cx') as HTMLInputElement
        let cyElement = document.getElementById('cy') as HTMLInputElement

        if ( cxElement === null || cxElement === undefined ) {
            // debug(`Setting panel not open`) 
        }else{
            let bglayerElement = document.getElementById('bglayer')
            const container_h = parseInt(getComputedStyle(bglayerElement).height)  // -> '1280px'
            const container_w = parseInt(getComputedStyle(bglayerElement).width)
    
            let fullside = cv2.getFullSide(
                container_w, container_h, 
                settings.get('bgObj').width, settings.get('bgObj').height
            )
    
            if (fullside === 'X') {
                cxElement.disabled = true
                cyElement.disabled = false
                cxElement.style.setProperty('opacity', '0.1')
                cyElement.style.removeProperty('opacity')
            }else{
                cyElement.disabled = true
                cxElement.disabled = false
                cyElement.style.setProperty('opacity', '0.1')
                cxElement.style.removeProperty('opacity')
            }
        }
    }

    private getCacheImgNum() {
        let cacheImgNum: number
        let fileidx = settings.get('fileidx')
        if (fileidx === null || fileidx == undefined ){
            cacheImgNum = 0
        }else{
            cacheImgNum = Object.keys(settings.get('fileidx')).length
        }

        return cacheImgNum
    }

    openSetting() {
        const cacheImgNum = this.getCacheImgNum();

        const dialog = new Dialog({
            title: `${this.i18n.addTopBarIcon}(v${packageInfo.version}) ${this.i18n.settingLabel}`,
            content: `
            <!--
            // info panel part， input [0] [1]
            -->
            <label class="fn__flex b3-label">
                <div class="fn__flex-1">
                    ${this.i18n.imgPathLabel}
                    <div class="b3-label__text">
                        <code id="crtImgName" class="fn__code">${settings.get('bgObj') === undefined ? cst.demoImgURL : settings.get('bgObj').name}</code>
                    </div>
                </div>
                <div class="fn__flex-center">  
                    <div>
                        <label for="cx">X</label> 
                        <input class="b3-slider fn__size50" id="cx" max="100" min="0" step="5" type="range" value=${settings.get('bgObj') === undefined ? '50' : settings.get('bgObj').offx}>
                    </div>
                    <div>
                        <label for="cy">Y</label> 
                        <input class="b3-slider fn__size50" id="cy" max="100" min="0" step="5" type="range" value=${settings.get('bgObj') === undefined ? '50' : settings.get('bgObj').offy}>
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
                            [ ${cacheImgNum} ]
                        </span>
                    </div>
                    <div class="b3-label__text">
                        <a href="file:///${cst.pluginAssetsDirOS}/" style="word-break: break-all">${cst.pluginAssetsDirOS}</a>
                    </div>
                </div>
            </label>

            <!--
            // onoff switch part, Input[2] - Input [3]
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
                    id="onoffInput"
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
            // slider part Input[4] - Input [5]
            -->

            <label class="fn__flex b3-label config__item">
                <div class="fn__flex-1">
                    ${this.i18n.opacityLabel}
                    <div class="b3-label__text">
                        ${this.i18n.opacityDes}
                    </div>
                </div>
                <div class="b3-tooltips b3-tooltips__n fn__flex-center" aria-label="${settings.get('opacity')}">   
                    <input class="b3-slider fn__size200" max="1" min="0.1" step="0.05" type="range" value="${settings.get('opacity')}">
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
                    <input class="b3-slider fn__size200" max="10" min="0" step="1" type="range" value="${settings.get('blur')}">
                </div>
            </label>

            <!--
            // reset panel part, Button[0]
            -->

            <label class="b3-label config__item fn__flex">
                <div class="fn__flex-1">
                ${this.i18n.resetConfigLabel}
                    <div class="b3-label__text">
                        ${this.i18n.resetConfigDes}<span class="selected" style="color:rgb(255,0,0)">${this.i18n.resetConfigDes2}
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
            // debug panel part, input[6] [7]
            -->


            <label class="fn__flex b3-label config__item">
                <div class="fn__flex-1">
                    ${this.i18n.themeAdaptLabel}
                    <div id="themeAdaptDes" class="b3-label__text">
                        ${this.i18n.themeAdaptDes}
                    </div>
                </div>
                <span class="fn__flex-center" />
                <input
                    id="themeAdaptInput"
                    class="b3-switch fn__flex-center"
                    type="checkbox"
                    value="${settings.get('themeAdapt')}"
                />
            </label>
            <label class="fn__flex b3-label config__item">
                <div class="fn__flex-1">
                    ${this.i18n.inDevModeLabel}
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

        // image position slider
        const cxElement = dialog.element.querySelectorAll("input")[0];
        const cyElement = dialog.element.querySelectorAll("input")[1];

        this.updateOffsetSwitch()
        window.addEventListener('resize', this.updateOffsetSwitch)

        let elementsArray = [cxElement, cyElement]
        // 用循环给两个element绑定相同的函数功能
        for (let i=0; i<2; i++) {
            // 拖动的时候，修改图片的位置
            elementsArray[i].addEventListener("input", () => {
                debug(elementsArray, cxElement.value, cyElement.value)
                this.changeBgPosition(cxElement.value, cyElement.value)
            })
            // 停止拖动的时候，保存图片的位置
            elementsArray[i].addEventListener("change", () => {
                //
                let bgObj = settings.get('bgObj')
                bgObj.offx = cxElement.value
                bgObj.offy = cyElement.value

                settings.set('bgObj', bgObj)

                let fileidx = settings.get('fileidx')
                fileidx[bgObj.hash] = bgObj

                settings.set('fileidx', fileidx)

                settings.save();
            })
        }

        // plugin onoff switch
        const activateElement = dialog.element.querySelectorAll("input")[2];
        activateElement.checked = settings.get('activate');

        activateElement.addEventListener("click", () => {
            settings.set('activate', !settings.get('activate'));
            activateElement.value = settings.get('activate');
            settings.save();
            this.applySettings();
        })

        // the Auto refresh switch
        const autoRefreshElement = dialog.element.querySelectorAll("input")[3];
        autoRefreshElement.checked = settings.get('autoRefresh');

        autoRefreshElement.addEventListener("click", () => {
            settings.set('autoRefresh', !settings.get('autoRefresh'));
            autoRefreshElement.value = `${settings.get('autoRefresh')}`;
            settings.save();
        })

        // transparency/opacity slider
        const opacityElement = dialog.element.querySelectorAll("input")[4];
        opacityElement.addEventListener("change", () => {
            settings.set('opacity', parseFloat(opacityElement.value));
            if (settings.get('activate')) {
                this.changeOpacity(settings.get('opacity'), settings.get('themeAdapt'));
            }
            settings.save();
        })
        opacityElement.addEventListener("input", () => {
            // update the aira-label value
            opacityElement.parentElement.setAttribute('aria-label', opacityElement.value);
        })

        // blur slider
        const blurElement = dialog.element.querySelectorAll("input")[5];
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
            os.rmtree(cst.pluginImgDataDir);
            settings.reset();
            settings.save();
            this.applySettings();
        })

        // the theme adapt switches
        const themeAdaptElement = dialog.element.querySelectorAll("input")[6];
        const themeAdaptDesElement = document.getElementById("themeAdaptDes");
        // 白名单模式
        const [themeMode, themeName] = getThemeInfo();
        if (cst.noAdaptThemes.includes(themeName)){
            themeAdaptElement.disabled = true
            themeAdaptElement.checked = false
            themeAdaptDesElement.textContent = this.i18n.themeNoAdaptTitle
        }else{
            themeAdaptElement.disabled = false
            themeAdaptElement.checked = settings.get('themeAdapt');
            themeAdaptDesElement.textContent = this.i18n.themeAdaptDes
        }

        themeAdaptElement.addEventListener("click", () => {
            settings.set('themeAdapt', !settings.get('themeAdapt'));
            themeAdaptElement.value = `${settings.get('themeAdapt')}`;
            this.changeOpacity(settings.get('opacity'), settings.get('themeAdapt'));
            settings.save();
        })

        // the dev mode settings
        const devModeElement = dialog.element.querySelectorAll("input")[7];
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
        menu.addItem({
            icon:"iconIndent",
            label: `${this.i18n.selectPictureLabel}`,
            type: "submenu",
            submenu: [
                // {
                //     icon: "iconHand",
                //     label: `${this.i18n.selectPictureManualLabel}`,
                //     click: () => {
                //         this.selectPictureByHand();
                //     }
                // }, 
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
