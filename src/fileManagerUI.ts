import BgCoverPlugin from "./index"
import packageInfo from '../plugin.json'

import { Dialog, showMessage } from "siyuan";
import { KernelApi } from "./siyuanAPI";
import { configs } from "./configs";
import * as cst from "./constants";
import * as settingsUI from "./settingsUI";
import * as bgRender from "./bgRender";
import * as topbarUI from "./topbarUI";

import {
    error, warn, info, debug,
    CloseCV, MD5, OS, Numpy,
    getCurrentThemeInfo
} from './utils';

// pythonic style
let os = new OS();
let cv2 = new CloseCV();
let ka = new KernelApi();

//////////////////////
// File System Core //
//////////////////////

export function getCacheImgNum() {
    let cacheImgNum: number
    let fileidx = configs.get('fileidx')
    if (fileidx === null || fileidx == undefined) {
        cacheImgNum = 0
    } else {
        cacheImgNum = Object.keys(configs.get('fileidx')).length
    }

    return cacheImgNum
}

export async function checkCacheDirctory() {
    // check verion and remove old cache directory
    if ((window as any).siyuan.config.system.kernelVersion >= '2.9.3') {
        let oldpluginAssetsDir = `/data/plugins/${packageInfo.name}/assets`;

        let imgFiles = await os.listdir(oldpluginAssetsDir);
        if (imgFiles !== null && imgFiles.length > 0) {
            showMessage(window.bgCoverPlugin.i18n.cacheDirectoryMove, 7000, "info");
            await os.rmtree(oldpluginAssetsDir);
        }
    }

    // if config version < 0.3.2, need to the clear cache to update new hash logic
    if (configs.get('version') < '0.3.2' ) {
        showMessage(window.bgCoverPlugin.i18n.updateHashNotice, 7000, 'info');
        await clearCacheFolder(cst.bgMode.image);
        configs.set('version', packageInfo.version);
    }

    // check image files
    let imgFiles = await os.listdir(cst.pluginImgDataDir)

    let fileidx: cst.fileIndex = {}
    let fileidx_db: cst.fileIndex = configs.get('fileidx')
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
            debug(`[fileManagerUI][checkCacheDirectory] Check ${item.name} in cached dir`)
            if (item.name.slice(0, 5) === 'hash-') {
                const [hash_name, suffix] = os.splitext(item.name.split('-')[1])

                debug(`[fileManagerUI][checkCacheDirectory] hash_name: `, hash_name, fileidx_db, extraCacheImgs)

                // window.fo = await os.openFile(
                //     `${cst.pluginImgDataDir.slice(5)}/${item.name}`, 
                //     item.name, 
                //     "image/*"
                // );
                // debug(`[fileManagerUI][checkCacheDirectory] open file to File object`)

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
                    // 更新版本：把多余的图片添加到缓存中而不是删除
                    extraCacheImgs.push(item.name)
                    //ka.removeFile(`${cst.pluginImgDataDir}/${item.name}`)
                    // slice(5) to remove '/data' prefix
                    const imgPath = `${cst.pluginImgDataDir.slice(5)}/${item.name}`
                    const imageSize = await cv2.getImageSize(imgPath)

                    debug(`[fileManagerUI][checkCacheDirectory] the cached local file ${item.name} has md5: ${hash_name}`)

                    let bgObj: cst.bgObj = {
                        name: item.name,
                        path: imgPath,
                        hash: hash_name,
                        mode: cst.bgMode.image,
                        offx: 50,
                        offy: 50,
                        height: imageSize.height,
                        width: imageSize.width
                    }

                    fileidx[hash_name] = bgObj
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

    configs.set('fileidx', fileidx)
    await configs.save('[fileManagerUI][checkCacheDirectory]')

    // raise warning to users
    if (notCorrectCacheImgs.length !== 0) {
        let msgInfo = `${window.bgCoverPlugin.i18n.cacheImgWrongName}<br>[${notCorrectCacheImgs}]<br>${window.bgCoverPlugin.i18n.doNotOperateCacheFolder}`
        showMessage(msgInfo, 7000, "info")
        info(msgInfo)
    }

    if (extraCacheImgs.length !== 0) {
        let msgInfo = `${window.bgCoverPlugin.i18n.cacheImgExtra}<br>[${extraCacheImgs}]<br>${window.bgCoverPlugin.i18n.doNotOperateCacheFolder}`
        showMessage(msgInfo, 7000, "info")
        info(msgInfo)
    }

    if (missingCacheImgs.length !== 0) {
        let msgInfo = `${window.bgCoverPlugin.i18n.cacheImgMissing}<br>[${missingCacheImgs}]<br>${window.bgCoverPlugin.i18n.doNotOperateCacheFolder}`
        showMessage(msgInfo, 7000, "info")
        info(msgInfo)
    }

    // check live 2d files
    // let live2dFiles = await os.listdir(cst.pluginLive2DataDir)
}

export async function clearCacheFolder(mode: cst.bgMode){
    // 图片模式
    if (mode == cst.bgMode.image) {
        // 这里应该获取fileidx里面的列表，而不是文件夹内的文件，不然图片缺失的话，删除不掉
        // todo
        let imgList = await os.listdir(cst.pluginImgDataDir);
        let fileidx = configs.get('fileidx')

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

        configs.set('fileidx', fileidx)

        // 清除缓存控制面板中的列表项和图片缓存
        let ulContainerElement = document.getElementById('cacheImgList');
        if (ulContainerElement) {
            ulContainerElement.innerHTML = null;
        }
        
        let displayDivElement = document.getElementById("displayCanvas");
        if (displayDivElement) {
            displayDivElement.innerHTML = null;
        }
        

    // live2d 模式
    } else if (mode == cst.bgMode.live2d) {
        // os.rmtree(cst.pluginLive2DataDir);
        // todo
    }

    const cacheImgNum = getCacheImgNum();
    if (cacheImgNum === 0) {
        // 没有缓存任何图片，使用默认的了了妹图片ULR来当作背景图
        bgRender.useDefaultLiaoLiaoBg();
    };

    await configs.save('[fileManagerUI][clearCacheFolder]');
}

export async function imgExistsInCache(file: File, notice: boolean = true): Promise<string> {
    let fileidx = configs.get('fileidx')

    const blobSlice = File.prototype.slice
    var chunk_blob = blobSlice.call(file, 0, Math.min(file.size, cst.hashLength)); // 2mb header blob

    let file_content = await chunk_blob.text()
    
    var md5 = MD5(`${file_content}${file.size}`).slice(0, 15);

    debug(`[fileManagerUI][imgExistsInCache] Blob content: [${file_content.slice(20,40)} ...] with length = ${file_content.length}file.size=${file.size}`);

    if (fileidx !== undefined && md5 in fileidx) {
        if (notice) {
            const dialog = new Dialog({
                title: `${window.bgCoverPlugin.i18n.inDevTitle}`,
                content: `<div class="b3-dialog__content">${window.bgCoverPlugin.i18n.imageFileExist}</div>`,
                width: window.bgCoverPlugin.isMobile ? "92vw" : "520px",
            });
        }else{
            debug(`[fileManagerUI][imgIsInCache] 当前图片${file.name}已存在`)
        }
        return 'exists'
    } else {
        return md5
    }
}

export async function uploadOneImage(file: File) {
    let fileSizeMB: number = (file.size / 1024 / 1024);

    let md5 = await imgExistsInCache(file);

    if (md5 !== 'exists') {
        showMessage(`${file.name}-${fileSizeMB.toFixed(2)}MB<br>${window.bgCoverPlugin.i18n.addSingleImageUploadNotice}`, 3000, "info");
    }

    let fileidx = configs.get('fileidx');
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

            configs.set('bgObj', bgObj);
            configs.set('fileidx', fileidx);

            debug(`[fileManagerUI][addSingleLocalImageFile]: fileidx ${fileidx}`);

            return bgObj
        } else {
            error(`fail to upload file ${file.name} with error code ${uploadResult}`)
            return null
        }
    }
}

export async function batchUploadImages(
    fileArray: Array<File>, 
    applySetting:boolean=false
    ) 
{
    let bgObj:cst.bgObj;

    debug('[fileManagerUI][batchUploadImages] fileArray', fileArray)

    if (fileArray.length === 0) {
        debug('[fileManagerUI][batchUploadImages] fileArray为空，不存在需要上传的图片')
    }else{
        for (let file of fileArray) {
            bgObj = await uploadOneImage(file);

            debug('[fileManagerUI][batchUploadImages] 在上传的循环内', bgObj)
        };

        await configs.save('[fileManagerUI][batchUploadImages]');

        if (applySetting){
            debug('[fileManagerUI][batchUploadImages] 在应用设置的判断内', bgObj)
            bgRender.changeBackgroundContent(bgObj.path, bgObj.mode);
            settingsUI.updateSettingPanelElementStatus();
        }
    }
}

/////////////////////
// Cache Manger UI //
/////////////////////

export async function selectPictureDialog() {
    const cacheManagerDialog = new Dialog({
        title: window.bgCoverPlugin.i18n.selectPictureManagerTitle,
        width: window.bgCoverPlugin.isMobile ? "92vw" : "520px",
        height: "92vh",
        content: `
        <div class="fn__flex-column" style="height: 100%">
            <div class="layout-tab-bar fn__flex">

                <!-- tab 1 title -->
                <div class="item item--full item--focus" data-type="remove">
                    <span class="fn__flex-1"></span>
                    <span class="item__text">${window.bgCoverPlugin.i18n.selectPictureManagerTab1}</span>
                    <span class="fn__flex-1"></span>
                </div>

                <!-- tab 2 title -->
                <!--div class="item item--full" data-type="missing">
                    <span class="fn__flex-1"></span>
                    <span class="item__text">${window.bgCoverPlugin.i18n.selectPictureManagerTab2}</span>
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
                            ${window.bgCoverPlugin.i18n.deleteAll}
                        </button>
                        <div class="fn__space"></div>
                    </label>

                    <div class="fn__hr"></div>

                    <ul id="cacheImgList" class="b3-list b3-list--background config-assets__list">

                        <li data-path="20230609230328-7vp057x.png" class="b3-list-item b3-list-item--hide-action">
                            <span class="b3-list-item__text">
                                20230609230328-7vp057x.png
                            </span>
                            <span data-type="open" class="b3-tooltips b3-tooltips__w b3-list-item__action" aria-label="${window.bgCoverPlugin.i18n.setAsBg}">
                                <svg><use xlink:href="#iconHideDock"></use></svg>
                            </span>
                            <span data-type="clear" class="b3-tooltips b3-tooltips__w b3-list-item__action" aria-label="${window.bgCoverPlugin.i18n.delete}">
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
    });

    // init the image list when open
    let listHtmlArray = generateCacheImgList();
    const cacheImgListElement = document.getElementById('cacheImgList');
    cacheImgListElement.innerHTML = '';
    for (const element of listHtmlArray) {
        cacheImgListElement.appendChild(element);
      }

    debug('[fileManagerUI][selectPictureByHand]', listHtmlArray, cacheImgListElement);

    let deleteAllImgBtn = document.getElementById('removeAllImgs');
    deleteAllImgBtn.addEventListener('click', async () => {
        await clearCacheFolder(cst.bgMode.image);
    });
}

export function generateCacheImgList(){
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

    let listHtml:Array<HTMLLIElement> = []
    let fileidx = configs.get('fileidx')
    for (const i in fileidx) {
        let bgObj = fileidx[i]

        let parser = new DOMParser();
        let ulElementHtml = parser.parseFromString(
        `
        <li data-hash="${bgObj.hash}" class="b3-list-item b3-list-item--hide-action">
            <span class="b3-list-item__text">
                ${bgObj.name}
            </span>
            <span data-type="open" class="b3-tooltips b3-tooltips__w b3-list-item__action" aria-label="${window.bgCoverPlugin.i18n.setAsBg}">
                <svg><use xlink:href="#iconHideDock"></use></svg>
            </span>
            <span data-type="clear" class="b3-tooltips b3-tooltips__w b3-list-item__action" aria-label="${window.bgCoverPlugin.i18n.delete}">
                <svg><use xlink:href="#iconTrashcan"></use></svg>
            </span>
        </li>
        `,
        'text/html'
        ).body.firstChild as HTMLLIElement

        let setBgBtn = ulElementHtml.querySelectorAll('span')[1]
        let delBtn = ulElementHtml.querySelectorAll('span')[2]
        
        /**
         * 绑定设定当前图片为背景图
         */
        setBgBtn.addEventListener('click', () => {
            bgRender.changeBackgroundContent(bgObj.path, bgObj.mode);
            configs.set('bgObj', bgObj);
        
            configs.save('[fileManagerUI][generateCacheImgList][setBgBtn.click]');
        });


        /**
         * 删除当前背景图
         */
        delBtn.addEventListener('click', () => {
            debug('Remove the background');
    
            // 移除管理面板中的项目
            let ulContainerElement = document.getElementById('cacheImgList');
            let rmLiEle = ulContainerElement.querySelectorAll(`[data-hash="${bgObj.hash}"]`)[0];
            rmLiEle.remove();
        
            // 清理管理面板下方的图片预览
            let displayDivElement = document.getElementById("displayCanvas");
            displayDivElement.innerHTML = null;
        
            // 移除fileidx中的项目
            topbarUI.selectPictureRandom();
            let fileidx = configs.get('fileidx');
            delete fileidx[bgObj.hash];
            configs.set('fileidx', fileidx);
        
            // 调用os来移除本地文件夹中的缓存文件
            debug(`[fileManagerUI][_rmBg] 移除下列路径的图片：${cst.pluginImgDataDir}/${bgObj.name}`);
            ka.removeFile(`data/${bgObj.path}`);
        
            // 检查当前文件数量是否为空，如果为空则设置为默认了了图
            const cacheImgNum = getCacheImgNum();
            if (cacheImgNum === 0) {
                // 没有缓存任何图片，使用默认的了了妹图片ULR来当作背景图
                bgRender.useDefaultLiaoLiaoBg();
            };
        
            configs.save('[fileManagerUI][generateCacheImgList][delBtn.click]');
        });

        /**
         * 鼠标悬停显示背景图
         */
        ulElementHtml.addEventListener('mouseenter', () => {
            let displayDivElement = document.getElementById("displayCanvas");

            displayDivElement.innerHTML = `<img style="max-height: 100%" src="${bgObj.path}">`;
        });

        listHtml.push(ulElementHtml);
    }

    return listHtml;
}