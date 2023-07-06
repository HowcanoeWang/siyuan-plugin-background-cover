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

import { KernelApi } from "./api";
import { settings } from './configs';
import {
    error, warn, info, debug,
    CloseCV, MD5, OS, Numpy,
    getThemeInfo
} from './utils';
import * as cst from './constants'
import * as adp from './themeAdapt'

import packageInfo from '../plugin.json'
import "./index.scss";

// pythonic style
let os = new OS();
let ka = new KernelApi();
let cv2 = new CloseCV();
let np = new Numpy();

export default class SwitchBgCover extends Plugin {

    private isMobile: boolean;

    private htmlThemeNode = document.getElementsByTagName('html')[0];

    private bgLayer = document.createElement('canvas');

    private cssThemeStyle: cst.cssThemeOldStyle = {};

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

        await this.checkCacheDirctory();

        // load the user setting data
        const [themeMode, themeName] = getThemeInfo();
        settings.set('prevTheme', themeName);

        // this.changeOpacity(0.85);
        await this.applySettings();

        debug(`frontend: ${getFrontend()}; backend: ${getBackend()}`);

        this.adaptConfigEditor();
    }

    onunload() {
        info(`${this.i18n.byePlugin}`);
        settings.save();

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


    private async checkCacheDirctory() {
        // check verion and remove old cache directory
        if ((window as any).siyuan.config.system.kernelVersion >= '2.9.3') {
            let oldpluginAssetsDir = `/data/plugins/${packageInfo.name}/assets`;

            let imgFiles = await os.listdir(oldpluginAssetsDir);
            if (imgFiles !== null && imgFiles.length > 0) {
                showMessage(this.i18n.cacheDirectoryMove, 7000, "info");
                await os.rmtree(oldpluginAssetsDir);
            }
        }

        // check image files
        let imgFiles = await os.listdir(cst.pluginImgDataDir)

        let fileidx: cst.fileIndex = {}
        let fileidx_db: cst.fileIndex = settings.get('fileidx')
        let notCorrectCacheImgs = []
        let extraCacheImgs = []
        let missingCacheImgs = []

        if (fileidx_db === undefined || fileidx_db === null) {
            debug(`The settings.fileidx is empty {}`)
        }

        for (let i in imgFiles) {
            let item = imgFiles[i]
            if (item.isDir) {
                // live2d的文件目录
                continue
            } else {
                // 背景图片
                debug(`[Func][checkCacheDirectory] Check ${item.name} in cached dir`)
                if (item.name.slice(0, 5) === 'hash-') {
                    const [hash_name, suffix] = os.splitext(item.name.split('-')[1])

                    debug(hash_name, fileidx_db, extraCacheImgs)

                    if (hash_name in fileidx_db) {
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
                        } else {
                            fileidx[hash_name] = bgObj_old
                        }
                    } else {
                        // 在缓存文件夹中，但图片并不在fileidx中（图片多余了）
                        extraCacheImgs.push(item.name)
                        ka.removeFile(`${cst.pluginImgDataDir}/${item.name}`)
                    }
                } else {
                    // 非法缓存图片
                    notCorrectCacheImgs.push(item.name)
                    ka.removeFile(`${cst.pluginImgDataDir}/${item.name}`)
                }
            }
        }

        // 在缓存文件夹中不存在，更新缓存文件夹
        for (let k in fileidx_db) {
            if (!(k in fileidx)) {
                missingCacheImgs.push(fileidx_db[k].name)
            }
        }

        settings.set('fileidx', fileidx)
        await settings.save()

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

    private useDefaultLiaoLiaoBg() {
        debug(`[Func][applySettings] 没有缓存任何图片，使用默认的了了妹图片ULR来当作背景图`)
        this.changeBackgroundContent(cst.demoImgURL, cst.bgMode.image)
        settings.set('bgObj', undefined);
    }

    private async clearCacheFolder(mode: cst.bgMode){
        // 图片模式
        if (mode == cst.bgMode.image) {
            // 这里应该获取fileidx里面的列表，而不是文件夹内的文件，不然图片缺失的话，删除不掉
            // todo
            let imgList = await os.listdir(cst.pluginImgDataDir);
            let fileidx = settings.get('fileidx')

            // 此部分魔改os.rmtree，因为要考虑到未来的可拓展性，有可能存在live2d的种类，因此不能直接简单的fileidx={}来解决
            for (let i in imgList) {
                let item = imgList[i]

                if (item.isDir) {
                    // 如果是文件夹，则递归删除，由于这个已经是根目录了，里面的任何文件夹直接无脑删除
                    os.rmtree(`${cst.pluginImgDataDir}/${item.name}/`)
                }else{
                    let full_path = `${cst.pluginImgDataDir}/${item.name}`
                    await ka.removeFile(full_path)

                    const [hash_name, suffix] = os.splitext(item.name.split('-')[1])

                    delete fileidx[hash_name]
                }
            }

            settings.set('fileidx', fileidx)

            // 清除缓存控制面板中的列表项和图片缓存
            let ulContainerElement = document.getElementById('cacheImgList');
            ulContainerElement.innerHTML = null;

            let displayDivElement = document.getElementById("displayCanvas");
            displayDivElement.innerHTML = null;

        // live2d 模式
        } else if (mode == cst.bgMode.live2d) {
            // os.rmtree(cst.pluginLive2DataDir);
            // todo
        }

        const cacheImgNum = this.getCacheImgNum();
        if (cacheImgNum === 0) {
            // 没有缓存任何图片，使用默认的了了妹图片ULR来当作背景图
            this.useDefaultLiaoLiaoBg();
        };

        await settings.save();
    }

    private generateCacheImgList(){
        // parent id :
        // template:
        // 
        // <li data-path="20230609230328-7vp057x.png" class="b3-list-item b3-list-item--hide-action">
        //     <span class="b3-list-item__text">
        //         20230609230328-7vp057x.png
        //     </span>
        //     <span data-type="open" class="b3-tooltips b3-tooltips__w b3-list-item__action" aria-label="${this.i18n.setAsBg}">
        //         <svg><use xlink:href="#iconHideDock"></use></svg>
        //     </span>
        //     <span data-type="clear" class="b3-tooltips b3-tooltips__w b3-list-item__action" aria-label="${this.i18n.delete}">
        //         <svg><use xlink:href="#iconTrashcan"></use></svg>
        //     </span>
        // </li>
        function _displayImg(bgObj:cst.bgObj) {
            let displayDivElement = document.getElementById("displayCanvas");

            displayDivElement.innerHTML = `<img style="max-height: 100%" src="${bgObj.path}">`
        }

        function _setAsBg(bgObj:cst.bgObj) {
            this.changeBackgroundContent(bgObj.path, bgObj.mode);
            settings.set('bgObj', bgObj);

            settings.save();
        };

        function _rmBg(bgObj:cst.bgObj){
            debug('Remove the background');
            
            // 移除管理面板中的项目
            let ulContainerElement = document.getElementById('cacheImgList');
            let rmLiEle = ulContainerElement.querySelectorAll(`[data-hash="${bgObj.hash}"]`)[0];
            rmLiEle.remove();

            // 清理管理面板下方的图片预览
            let displayDivElement = document.getElementById("displayCanvas");
            displayDivElement.innerHTML = null;

            // 移除fileidx中的项目
            this.selectPictureRandom();
            let fileidx = settings.get('fileidx');
            delete fileidx[bgObj.hash]
            settings.set('fileidx', fileidx)

            // 调用os来移除本地文件夹中的缓存文件
            debug(`[Func][_rmBg] 移除下列路径的图片：${cst.pluginImgDataDir}/${bgObj.name}`)
            ka.removeFile(`data/${bgObj.path}`)

            // 检查当前文件数量是否为空，如果为空则设置为默认了了图
            const cacheImgNum = this.getCacheImgNum();
            if (cacheImgNum === 0) {
                // 没有缓存任何图片，使用默认的了了妹图片ULR来当作背景图
                this.useDefaultLiaoLiaoBg();
            };

            settings.save();
        };

        let listHtml:Array<HTMLLIElement> = []
        let fileidx = settings.get('fileidx')
        for (const i in fileidx) {
            let bgObj = fileidx[i]

            let parser = new DOMParser();
            let ulElementHtml = parser.parseFromString(
            `
            <li data-hash="${bgObj.hash}" class="b3-list-item b3-list-item--hide-action">
                <span class="b3-list-item__text">
                    ${bgObj.name}
                </span>
                <span data-type="open" class="b3-tooltips b3-tooltips__w b3-list-item__action" aria-label="${this.i18n.setAsBg}">
                    <svg><use xlink:href="#iconHideDock"></use></svg>
                </span>
                <span data-type="clear" class="b3-tooltips b3-tooltips__w b3-list-item__action" aria-label="${this.i18n.delete}">
                    <svg><use xlink:href="#iconTrashcan"></use></svg>
                </span>
            </li>
            `,
            'text/html'
            ).body.firstChild as HTMLLIElement

            let setBgBtn = ulElementHtml.querySelectorAll('span')[1]
            let delBtn = ulElementHtml.querySelectorAll('span')[2]
            
            setBgBtn.addEventListener('click', _setAsBg.bind(this, bgObj));
            delBtn.addEventListener('click', _rmBg.bind(this, bgObj));

            ulElementHtml.addEventListener('mouseenter', _displayImg.bind(this, bgObj))

            listHtml.push(ulElementHtml)
        }

        return listHtml
    }

    private async selectPictureByHand() {
        const cacheManagerDialog = new Dialog({
            title: this.i18n.selectPictureManagerTitle,
            width: this.isMobile ? "92vw" : "520px",
            height: "92vh",
            content: `
            <div class="fn__flex-column" style="height: 100%">
                <div class="layout-tab-bar fn__flex">

                    <!-- tab 1 title -->
                    <div class="item item--full item--focus" data-type="remove">
                        <span class="fn__flex-1"></span>
                        <span class="item__text">${this.i18n.selectPictureManagerTab1}</span>
                        <span class="fn__flex-1"></span>
                    </div>

                    <!-- tab 2 title -->
                    <!--div class="item item--full" data-type="missing">
                        <span class="fn__flex-1"></span>
                        <span class="item__text">${this.i18n.selectPictureManagerTab2}</span>
                        <span class="fn__flex-1"></span>
                    </div-->
                </div>
                <div class="fn__flex-1">

                    <!-- tab 1 -->

                    <div class="config-assets" data-type="remove" data-init="true">
                        <div class="fn__hr--b"></div>

                        <label class="fn__flex" style="justify-content: flex-end;">
                            <button id="removeAllImgs" class="b3-button b3-button--outline fn__flex-center fn__size200">
                                <svg class="svg"><use xlink:href="#iconTrashcan"></use></svg>
                                ${this.i18n.deleteAll}
                            </button>
                            <div class="fn__space"></div>
                        </label>

                        <div class="fn__hr"></div>

                        <ul id="cacheImgList" class="b3-list b3-list--background config-assets__list">

                            <li data-path="20230609230328-7vp057x.png" class="b3-list-item b3-list-item--hide-action">
                                <span class="b3-list-item__text">
                                    20230609230328-7vp057x.png
                                </span>
                                <span data-type="open" class="b3-tooltips b3-tooltips__w b3-list-item__action" aria-label="${this.i18n.setAsBg}">
                                    <svg><use xlink:href="#iconHideDock"></use></svg>
                                </span>
                                <span data-type="clear" class="b3-tooltips b3-tooltips__w b3-list-item__action" aria-label="${this.i18n.delete}">
                                    <svg><use xlink:href="#iconTrashcan"></use></svg>
                                </span>
                            </li>
                            
                        </ul>

                        <!-- after rendering -->
                        <!--div class="config-assets__preview" data-path="assets/xxxx.png">
                            <img style="max-height: 100%" src="assets/xxxx.png">
                        </div-->

                        <!-- default empty -->
                        <div id="displayCanvas" class="config-assets__preview"></div>
                    </div>

                    <!-- tab 2, class add fn__none to cancle display -->

                    <!--div class="fn__none config-assets" data-type="missing">
                        <div class="fn__hr"></div>
                        <ul class="b3-list b3-list--background config-assets__list">
                            <li class="fn__loading"><img src="/stage/loading-pure.svg"></li>
                        </ul>
                        <div class="fn__hr"></div>
                    </div>
                </div>
            </div>
            `
        })

        // init the image list when open
        let listHtmlArray = this.generateCacheImgList();
        const cacheImgListElement = document.getElementById('cacheImgList');
        cacheImgListElement.innerHTML = '';
        for (const element of listHtmlArray) {
            cacheImgListElement.appendChild(element);
          }

        debug('[Func][selectPictureByHand]', listHtmlArray, cacheImgListElement);

        let deleteAllImgBtn = document.getElementById('removeAllImgs');
        deleteAllImgBtn.addEventListener('click', this.clearCacheFolder.bind(this, cst.bgMode.image));

    }

    private async selectPictureRandom(manualPress: boolean = false) {
        const cacheImgNum = this.getCacheImgNum()
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
                let bgObj = settings.get('bgObj')
                this.changeBackgroundContent(bgObj.path, bgObj.mode)
            }
        } else {
            // 随机选择一张图
            let fileidx = settings.get('fileidx')
            let crt_hash = settings.get('bgObj').hash
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
            settings.set('bgObj', fileidx[r_hash])
        }
        await settings.save()
        this.updateSettingPanelElementStatus()
    }

    private imgIsInCache(file: File, notice: boolean = true): string {
        let fileidx = settings.get('fileidx')
        var md5 = MD5(`${file.name}${file.size}${file.lastModified}`.slice(0, 15));
        if (fileidx !== undefined && md5 in fileidx) {
            if (notice) {
                const dialog = new Dialog({
                    title: `${this.i18n.inDevTitle}`,
                    content: `<div class="b3-dialog__content">${this.i18n.imageFileExist}</div>`,
                    width: this.isMobile ? "92vw" : "520px",
                });
            }else{
                debug(`[Func][imgIsInCache] 当前图片${file.name}已存在`)
            }
            return 'exists'
        } else {
            return md5
        }
    }

    private async uploadOneImage(file: File) {
        let fileSizeMB: number = (file.size / 1024 / 1024)

        showMessage(`${file.name}-${fileSizeMB.toFixed(2)}MB<br>${this.i18n.addSingleImageUploadNotice}`, 3000, "info")

        let md5 = this.imgIsInCache(file)

        let fileidx = settings.get('fileidx');
        if (fileidx === undefined || fileidx === null) {
            fileidx = {};
        };

        // 检查是否已经在缓存目录中存在了该图片
        if (md5 !== 'exists') {
            const [prefix, suffix] = os.splitext(file.name)
            const hashedName = `hash-${md5}.${suffix}`

            const uploadResult = await ka.putFile(`${cst.pluginImgDataDir}/${hashedName}`, file);

            if (uploadResult.code === 0) {
                // slice(5) to remove '/data' prefix
                const imgPath = `${cst.pluginImgDataDir.slice(5)}/${hashedName}`

                const imageSize = await cv2.getImageSize(imgPath)

                let bgObj: cst.bgObj = {
                    name: file.name,
                    hash: md5,
                    mode: cst.bgMode.image,
                    path: imgPath,
                    offx: 50,
                    offy: 50,
                    width: imageSize.width,
                    height: imageSize.height
                }

                fileidx[bgObj.hash] = bgObj;

                settings.set('bgObj', bgObj);
                settings.set('fileidx', fileidx);

                debug(`[func][addSingleLocalImageFile]: fileidx ${fileidx}`);

                return bgObj
            } else {
                error(`fail to upload file ${file.name} with error code ${uploadResult}`)
                return null
            }
        }
    }

    private async batchUploadImages(fileArray: Array<File>, applySetting:boolean=false) {
        let bgObj:cst.bgObj;

        debug('[Func][batchUploadImages] fileArray', fileArray)

        if (fileArray.length === 0) {
            debug('[Func][batchUploadImages] fileArray为空，不存在需要上传的图片')
        }else{
            for (let i in fileArray) {
                let file = fileArray[i];
    
                bgObj = await this.uploadOneImage(file);
    
                debug('[Func][batchUploadImages] 在上传的循环内', bgObj)
            };
    
            await settings.save();
    
            if (applySetting){
                debug('[Func][batchUploadImages] 在应用设置的判断内', bgObj)
                this.changeBackgroundContent(bgObj.path, bgObj.mode);
                this.updateSettingPanelElementStatus();
            }
        }
    }

    private async addSingleLocalImageFile() {

        const cacheImgNum = this.getCacheImgNum();

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
    
            let bgObj = await this.uploadOneImage(file);
    
            // 文件不重复且上传成功
            if (bgObj !== null) {
                await settings.save();
                this.changeBackgroundContent(bgObj.path, bgObj.mode);
                this.updateSettingPanelElementStatus();
            };
        };
    };

    private async addDirectory() {
        const cacheImgNum = this.getCacheImgNum();

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

                    let md5 = this.imgIsInCache(file, false)

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
                    await this.batchUploadImages(fileContainer, true);
                }
            )
        }else{
             // 要上传的数量比较少，直接开始批量上传
            await this.batchUploadImages(fileContainer, true);
        }
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

    private changeBackgroundContent(background: string, mode: cst.bgMode) {
        if (mode === cst.bgMode.image) {
            debug(`[Func][changeBackgroundContent] 替换当前背景图片为${background}`)
            this.bgLayer.style.setProperty('background-image', `url('${background}')`);
        } else if (mode == cst.bgMode.live2d) {
            this.showIndev();
        } else {
            showMessage(`[${this.i18n.addTopBarIcon} Plugin][Error] Background type [${mode}] is not supported, `, 7000, "error");
        }
    };

    private async adaptConfigEditor() {
        const [themeMode, themeName] = getThemeInfo();

        const configEditor = new Dialog({
            title: this.i18n.themeAdaptContentDes,
            width: this.isMobile ? "92vw" : "520px",
            content: `
            <div class="fn__flex-column" style="height: 100%">

                <div class="b3-label file-tree config-keymap" id="keymapList" style="height:50vh;">
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
            </div>
            `
        });
    };

    private changeOpacity(alpha: number, tranMode: number, adaptMode: boolean) {
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
        if (settings.get('activate')) {

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

    private changeBlur(blur: number) {
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

    private async applySettings() {
        if (settings.get('activate')) {
            this.bgLayer.style.removeProperty('display')
        } else {
            this.bgLayer.style.setProperty('display', 'none')
        }

        // 缓存文件夹中没有图片 | 用户刚刚使用这个插件 | 用户刚刚重置了插件数据 | 当前文件404找不到
        const cacheImgNum = this.getCacheImgNum()
        debug(`[Func][applySettings] cacheImgNum= ${cacheImgNum}`)
        if (cacheImgNum === 0) {
            // 没有缓存任何图片，使用默认的了了妹图片ULR来当作背景图
            this.useDefaultLiaoLiaoBg();
        } else if (settings.get('bgObj') === undefined) {
            // 缓存中有1张以上的图片，但是设置的bjObj却是undefined，随机抽一张
            debug(`[Func][applySettings] 缓存中有1张以上的图片，但是设置的bjObj却是undefined，随机抽一张`)
            await this.selectPictureRandom()
        } else {
            // 缓存中有1张以上的图片，bjObj也有内容且图片存在
            debug(`[Func][applySettings] 缓存中有1张以上的图片，bjObj也有内容且图片存在`)
            let bgObj = settings.get('bgObj')
            let fileidx = settings.get('fileidx')
            // 没有开启启动自动更换图片，则直接显示该图片
            if (bgObj.hash in fileidx && !settings.get('autoRefresh')) {
                debug(`[Func][applySettings] 没有开启启动自动更换图片，则直接显示当前图片`)
                this.changeBackgroundContent(bgObj.path, bgObj.mode)
            } else {
                // 当bjObj找不到404 | 用户选择随机图片，则随机调一张作为bjObj
                debug(`[Func][applySettings] 用户选择随机图片，则随机调一张作为bjObj`)
                await this.selectPictureRandom()
            }
        }

        this.changeOpacity(settings.get('opacity'), settings.get('transMode'), settings.get('adaptMode'))
        this.changeBlur(settings.get('blur'))
        if (settings.get('bgObj') === undefined){
            this.changeBgPosition(null, null)
        }else{
            this.changeBgPosition(settings.get('bgObj').offx, settings.get('bgObj').offy)
        }
        
        this.updateSettingPanelElementStatus()
    }

    private updateSettingPanelElementStatus() {
        // update current image URL
        let crtImageNameElement = document.getElementById('crtImgName')
        if (crtImageNameElement === null || crtImageNameElement === undefined) {
            // debug(`Setting panel not open`) 
        } else {
            let bgObj = settings.get('bgObj')
            if (settings.get('bgObj') === undefined) {
                crtImageNameElement.textContent = cst.demoImgURL.toString()
            } else {
                crtImageNameElement.textContent = bgObj.name
            }
        }

        this.updateOffsetSwitch()

        // 更新setting中的[imgNum]数字
        let cacheImgNumEle = document.getElementById('cacheImgNumElement')
        if (cacheImgNumEle === null || cacheImgNumEle === undefined) {
            // debug(`Setting panel not open`) 
        } else {
            const cacheImgNum = this.getCacheImgNum()
            cacheImgNumEle.textContent = `[ ${cacheImgNum} ]`
        }

        // update onoff switch button
        this._updateCheckedElement('onoffInput', settings.get('activate'))

        // 更新autorefresh按钮
        this._updateCheckedElement('autoRefreshInput', settings.get('autoRefresh'))

        // 更新opacity滑动条
        this._updateSliderElement('opacityInput', settings.get('opacity'))

        // 更新blur滑动条
        this._updateSliderElement('blurInput', settings.get('blur'))

        this._updateCheckedElement('themeAdaptInput', settings.get('adaptMode'))

        // 更新开发者模式按钮
        this._updateCheckedElement('devModeInput', settings.get('inDev'))

    }

    private _updateSliderElement(elementid:string, value:string, setAriaLabel:boolean=true) {
        let sliderElement = document.getElementById(elementid) as HTMLInputElement
        if (sliderElement === null || sliderElement=== undefined) {
            // debug(`Setting panel not open`) 
        } else {
            sliderElement.value = value;
            if (setAriaLabel) {
                sliderElement.parentElement.setAttribute('aria-label', value);
            }
        }
    }

    private _updateCheckedElement(elementid:string, value:boolean) {
        let checkedElement = document.getElementById(elementid) as HTMLInputElement
        if (checkedElement === null || checkedElement === undefined) {
            // debug(`Setting panel not open`) 
        } else {
            checkedElement.checked = value;
        }
    }


    private updateOffsetSwitch() {
        let cxElement = document.getElementById('cx') as HTMLInputElement
        let cyElement = document.getElementById('cy') as HTMLInputElement

        if (cxElement === null || cxElement === undefined) {
            // debug(`Setting panel not open`) 
        } else {
            let bglayerElement = document.getElementById('bglayer')
            if (settings.get('activate')) {
                const container_h = parseInt(getComputedStyle(bglayerElement).height)  // -> '1280px'
                const container_w = parseInt(getComputedStyle(bglayerElement).width)

                let fullside: string
                // 使用默认的了了图
                if (settings.get('bgObj') === undefined) {
                    fullside = cv2.getFullSide(
                        container_w, container_h,
                        2458, 1383 // 默认了了图的宽高
                    )
                    // 重新设置一下x和y的值
                    cxElement.value = '50'
                    cyElement.value = '50'
                }else{
                    fullside = cv2.getFullSide(
                        container_w, container_h,
                        settings.get('bgObj').width, settings.get('bgObj').height
                    )
                }

                if (fullside === 'X') {
                    cxElement.disabled = true
                    cyElement.disabled = false
                    cxElement.style.setProperty('opacity', '0.1')
                    cyElement.style.removeProperty('opacity')
                } else {
                    cyElement.disabled = true
                    cxElement.disabled = false
                    cyElement.style.setProperty('opacity', '0.1')
                    cxElement.style.removeProperty('opacity')
                }
            } else {
                cyElement.disabled = true
                cxElement.disabled = true
                cyElement.style.setProperty('opacity', '0.1')
                cxElement.style.setProperty('opacity', '0.1')
            }
        }
    }

    private getCacheImgNum() {
        let cacheImgNum: number
        let fileidx = settings.get('fileidx')
        if (fileidx === null || fileidx == undefined) {
            cacheImgNum = 0
        } else {
            cacheImgNum = Object.keys(settings.get('fileidx')).length
        }

        return cacheImgNum
    }

    openSetting() {
        const cacheImgNum = this.getCacheImgNum();

        const dialog = new Dialog({
            title: `${this.i18n.addTopBarIcon}(v${packageInfo.version}) ${this.i18n.settingLabel}`,
            width: this.isMobile ? "92vw" : "max(520px, 50vw)",
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
                <div class="fn__flex-center">  
                    <div>
                        <label for="cx">X</label> 
                        <input id="cx" class="b3-slider fn__size50"  max="100" min="0" step="5" type="range" value=${settings.get('bgObj') === undefined ? '50' : settings.get('bgObj').offx}>
                    </div>
                    <div>
                        <label for="cy">Y</label> 
                        <input id="cy" class="b3-slider fn__size50"  max="100" min="0" step="5" type="range" value=${settings.get('bgObj') === undefined ? '50' : settings.get('bgObj').offy}>
                    </div>
                </div>
            </label>
            <label class="fn__flex b3-label">
                <div class="fn__flex-1">
                    <div class="fn__flex">
                        ${this.i18n.cacheDirectoryLabel}
                        <span class="fn__space"></span>
                        <span style="color: var(--b3-theme-on-surface)">${this.i18n.cacheDirectoryDes}</span>
                        <span id="cacheImgNumElement" class="selected" style="color: rgb(255,0,0)">
                            [ ${cacheImgNum} ]
                        </span>
                    </div>
                    <div class="b3-label__text">
                        <a href="file:///${cst.pluginAssetsDirOS}/" style="word-break: break-all">${cst.pluginAssetsDirOS}</a>
                    </div>
                </div>
                <span class="fn__space"></span>
                <button id="cacheManagerBtn" class="b3-button b3-button--outline fn__flex-center fn__size100" id="appearanceRefresh">
                    <svg><use xlink:href="#iconDatabase"></use></svg>
                    ${this.i18n.cacheManager}
                </button>
            </label>

            <!--
            // onoff switch part
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
                    <input id="opacityInput" class="b3-slider fn__size200" max="1" min="0.1" step="0.05" type="range" value="${settings.get('opacity')}">
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
                    <input id="blurInput" class="b3-slider fn__size200" max="10" min="0" step="1" type="range" value="${settings.get('blur')}">
                </div>
            </label>

            <!--
            // theme mode and adapt configs
            -->

            <label class="fn__flex b3-label config__item">
                <div class="fn__flex-1">
                    ${this.i18n.transparentMode}
                    <div class="b3-label__text">${this.i18n.transparentModeDes}</div>
                </div>
                <span class="fn__space"></span>
                <select id="transModeSelect" class="b3-select fn__flex-center fn__size200">
                    <option value="0" selected="">${this.i18n.transparentModeOpacity}</option>
                    <option value="1">${this.i18n.transparentModeCss}</option>
                </select>
            </label>

            <label class="fn__flex b3-label config__item">
                <div class="fn__flex-1">
                    <div class="fn__flex">
                        ${this.i18n.themeAdaptLabel}
                        <span class="fn__space"></span>
                        <a id="adaptConfigEditorURL">${this.i18n.themeAdaptContentDes}</a>
                    </div>
                    
                    <div id="themeAdaptDes" class="b3-label__text">
                        ${this.i18n.themeAdaptDes}
                    </div>
                </div>

                <span class="fn__space"></span>
                <input
                    id="themeAdaptInput"
                    class="b3-switch fn__flex-center"
                    type="checkbox"
                    value="${settings.get('adaptMode')}"
                />
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
                <button id="resetBtn" class="b3-button b3-button--outline fn__flex-center fn__size100" id="appearanceRefresh">
                    <svg><use xlink:href="#iconRefresh"></use></svg>
                    ${this.i18n.reset}
                </button>
            </label>

            <!--
            // debug panel part
            -->

            <label class="fn__flex b3-label config__item">
                <div class="fn__flex-1">
                    ${this.i18n.inDevModeLabel}
                    <div class="b3-label__text">
                        ${this.i18n.inDevModeDes}
                    </div>
                </div>
                <span class="fn__flex-center" />
                <input
                    id="devModeInput"
                    class="b3-switch fn__flex-center"
                    type="checkbox"
                    value="${settings.get('inDev')}"
                />
            </label>
            `
        });

        // image position slider
        const cxElement = document.getElementById('cx') as HTMLInputElement;
        const cyElement = document.getElementById('cy') as HTMLInputElement;

        this.updateOffsetSwitch()
        window.addEventListener('resize', this.updateOffsetSwitch)

        let elementsArray = [cxElement, cyElement]
        // 用循环给两个element绑定相同的函数功能
        for (let i = 0; i < 2; i++) {
            // 拖动的时候，修改图片的位置
            elementsArray[i].addEventListener("input", () => {
                debug(elementsArray, cxElement.value, cyElement.value)
                this.changeBgPosition(cxElement.value, cyElement.value)
            })
            // 停止拖动的时候，保存图片的位置
            elementsArray[i].addEventListener("change", () => {
                //
                let bgObj = settings.get('bgObj')

                // 使用默认的了了图，此时bgObj为undefined，没有下面这些属性，跳过
                if (bgObj !== undefined) {

                    bgObj.offx = cxElement.value
                    bgObj.offy = cyElement.value
    
                    settings.set('bgObj', bgObj)
    
                    let fileidx = settings.get('fileidx')
                    fileidx[bgObj.hash] = bgObj
    
                    settings.set('fileidx', fileidx)
    
                    settings.save();
                }

            })
        }

        // cacheManger button
        const cacheManagerElement = document.getElementById('cacheManagerBtn') as HTMLButtonElement;
        cacheManagerElement.addEventListener("click", async () => {
            dialog.destroy();
            this.selectPictureByHand();
        })

        // plugin onoff switch
        const activateElement = document.getElementById('onoffInput') as HTMLInputElement;
        activateElement.checked = settings.get('activate');

        activateElement.addEventListener("click", () => {
            settings.set('activate', !settings.get('activate'));
            activateElement.value = settings.get('activate');
            settings.save();
            this.applySettings();
        })

        // the Auto refresh switch
        const autoRefreshElement = document.getElementById('autoRefreshInput') as HTMLInputElement;
        autoRefreshElement.checked = settings.get('autoRefresh');

        autoRefreshElement.addEventListener("click", () => {
            settings.set('autoRefresh', !settings.get('autoRefresh'));
            autoRefreshElement.value = `${settings.get('autoRefresh')}`;
            settings.save();
        })

        // transparency/opacity slider
        const opacityElement = document.getElementById('opacityInput') as HTMLInputElement;
        opacityElement.addEventListener("change", () => {
            settings.set('opacity', parseFloat(opacityElement.value));
            if (settings.get('activate')) {
                this.changeOpacity(settings.get('opacity'), settings.get('transMode'), settings.get('adaptMode'));
            }
            settings.save();
        })
        opacityElement.addEventListener("input", () => {
            // update the aira-label value
            opacityElement.parentElement.setAttribute('aria-label', opacityElement.value);
        })

        // blur slider
        const blurElement =  document.getElementById('blurInput') as HTMLInputElement;
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

        // the transparent mode selection
        const transModeElement = document.getElementById('transModeSelect') as HTMLSelectElement;

        transModeElement.value = settings.get('transMode');

        transModeElement.addEventListener('change', () => {
            settings.set('transMode', transModeElement.value);
            this.changeOpacity(settings.get('opacity'), settings.get('transMode'), settings.get('adaptMode'));
            settings.save();
        });

        const configEditorURL = document.getElementById('adaptConfigEditorURL') as HTMLLinkElement
        configEditorURL.addEventListener('click', () => {
            this.adaptConfigEditor();
        });

        // the theme adapt switches
        const themeAdaptElement = document.getElementById('themeAdaptInput') as HTMLInputElement;
        this._updateCheckedElement('themeAdaptInput',  settings.get('adaptMode'));

        themeAdaptElement.addEventListener("click", () => {
            settings.set('adaptMode', !settings.get('adaptMode'));
            themeAdaptElement.value = `${settings.get('adaptMode')}`;
            this.changeOpacity(settings.get('opacity'),  settings.get('transMode'), settings.get('adaptMode'));
            settings.save();
        });

        // reset panel
        const resetSettingElement = document.getElementById('resetBtn') as HTMLButtonElement;
        resetSettingElement.addEventListener("click", async () => {
            os.rmtree(cst.pluginImgDataDir);
            settings.reset();
            await settings.save();
            await this.applySettings();
        })

        // the dev mode settings
        const devModeElement = document.getElementById('devModeInput') as HTMLInputElement;
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

    private showIndev(msg: string = '') {
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
            width: this.isMobile ? "92vw" : `520px`,
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
        const menu = new Menu("topBarSample", () => { });
        menu.addItem({
            icon: "iconIndent",
            label: `${this.i18n.selectPictureLabel}`,
            type: "submenu",
            submenu: [
                {
                    icon: "iconHand",
                    label: `${this.i18n.selectPictureManualLabel}`,
                    accelerator: this.commands[0].customHotkey,
                    click: () => {
                        this.selectPictureByHand();
                    }
                }, 
                {
                    icon: "iconMark",
                    label: `${this.i18n.selectPictureRandomLabel}`,
                    accelerator: this.commands[1].customHotkey,
                    click: () => {
                        this.selectPictureRandom(true);
                    }
                },
            ]
        });
        menu.addItem({
            icon: "iconAdd",
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
                    icon: "iconFolder",
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
            accelerator: this.commands[2].customHotkey,
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
