import { Dialog, showMessage } from "siyuan";
import { KernelApi } from "../siyuanAPI";
import { confmngr } from "../configs";
import * as tps from "../types";
import * as cst from "../constants";
import * as bgRender from "../bgRender";

import * as settingsUI from "./settings";
import * as topbarUI from "./topbar";

import {
    error, info, debug,
    CloseCV, OS,
} from '../utils';
import { Md5 } from 'ts-md5';

// pythonic style
let os = new OS();
let cv2 = new CloseCV();
let ka = new KernelApi();

//////////////////////
// File System Core //
//////////////////////

export function getCacheImgNum() {
    let cacheImgNum: number
    let fileidx = confmngr.get('fileidx')
    if (fileidx === null || fileidx == undefined) {
        cacheImgNum = 0
    } else {
        cacheImgNum = Object.keys(confmngr.get('fileidx')).length
    }

    return cacheImgNum
}

export async function checkAssetsDir() {

    // check if folder exists or not
    if (!(await os.folderExists(cst.pluginAssetsDir))) {
        debug(`[fileManagerUI][checkAssetsDir] 插件数据根目录不存在，创建根目录${cst.pluginAssetsDir}`)
        await os.mkdir(cst.pluginAssetsDir);
    }

    // check image files
    let imgFiles = await os.listdir(cst.pluginAssetsDir)

    let fileidx: tps.fileIdx = {}
    let fileidx_db: tps.fileIdx = confmngr.get('fileidx')
    let notCorrectCacheImgs = []
    let extraCacheImgs = []
    let missingCacheImgs = []

    if (fileidx_db === undefined || fileidx_db === null) {
        debug(`The settings.fileidx is empty {}`)
    }

    for (let i in imgFiles) {
        let item = imgFiles[i]

        // 背景图片
        debug(`[fileManagerUI][checkImgAssets] Check ${item.name} in cached dir`)
        if (item.name.slice(0, 5) === 'hash-') {
            const [hash_name, suffix] = os.splitext(item.name.split('-')[1])

            debug(`[fileManagerUI][checkImgAssets] hash_name: `, hash_name, fileidx_db, extraCacheImgs)

            if (hash_name in fileidx_db) {
                let bgObj_old = fileidx_db[hash_name]

                fileidx[hash_name] = bgObj_old

            } else {
                // 在缓存文件夹中，但图片并不在fileidx中（图片多余了）
                // 更新版本：把多余的图片添加到缓存中而不是删除
                extraCacheImgs.push(item.name)
                // ka.removeFile(`${cst.pluginImgDataDir}/${item.name}`)
                // slice(5) to remove '/data' prefix
                const imgPath = `${cst.pluginAssetsDir.slice(5)}/${item.name}`
                const imageSize = await cv2.getImageSize(imgPath)

                debug(`[fileManagerUI][checkImgAssets] the cached local file ${item.name} has md5: ${hash_name}`)

                let bgObj: tps.bgObj = {
                    name: item.name,
                    path: imgPath,
                    hash: hash_name,
                    mode: tps.bgMode.image,
                    height: imageSize.height,
                    width: imageSize.width,
                    parent: cst.pluginAssetsId
                }

                fileidx[hash_name] = bgObj
            }
        } else {
            // 非法缓存图片
            notCorrectCacheImgs.push(item.name)
            ka.removeFile(`${cst.pluginAssetsDir}/${item.name}`)
        }
    }

    // 在缓存文件夹中不存在，更新缓存文件夹
    for (let k in fileidx_db) {
        if (!(k in fileidx)) {
            missingCacheImgs.push(fileidx_db[k].name)
        }
    }

    confmngr.set('fileidx', fileidx)
    await confmngr.save('[fileManagerUI][checkCacheImgDir]')

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

    // check video files

    // check live 2d files
    // let live2dFiles = await os.listdir(cst.pluginLive2DataDir)
}

export async function clearCacheFolder(mode: tps.bgMode){
    // 图片模式
    if (mode == tps.bgMode.image) {
        // 这里应该获取fileidx里面的列表，而不是文件夹内的文件，不然图片缺失的话，删除不掉
        // todo
        let imgList = await os.listdir(cst.pluginAssetsDir);
        let fileidx = confmngr.get('fileidx')

        // 此部分魔改os.rmtree，因为要考虑到未来的可拓展性，有可能存在live2d的种类，因此不能直接简单的fileidx={}来解决
        for (let i in imgList) {
            let item = imgList[i]

            if (item.isDir) {
                // 如果是文件夹，则递归删除，由于这个已经是根目录了，里面的任何文件夹直接无脑删除
                os.rmtree(`${cst.pluginAssetsDir}/${item.name}/`)
            }else{
                let full_path = `${cst.pluginAssetsDir}/${item.name}`
                await ka.removeFile(full_path)

                const [hash_name, suffix] = os.splitext(item.name.split('-')[1])

                delete fileidx[hash_name]
            }
        }

        confmngr.set('fileidx', fileidx)

        // 清除缓存控制面板中的列表项和图片缓存
        let ulContainerElement = document.getElementById('cacheImgList');
        if (ulContainerElement) {
            ulContainerElement.innerHTML = null;
        }
        
        let displayDivElement = document.getElementById("displayCanvas");
        if (displayDivElement) {
            displayDivElement.innerHTML = null;
        }
    }    

    const cacheImgNum = getCacheImgNum();
    if (cacheImgNum === 0) {
        // 没有缓存任何图片，使用默认的了了妹图片ULR来当作背景图
        bgRender.useDefaultLiaoLiaoBg();
    };

    await confmngr.save('[fileManagerUI][clearCacheFolder]');
}

export async function imgExistsInCache(file: File, notice: boolean = true): Promise<string> {
    let fileidx = confmngr.get('fileidx')

    const blobSlice = File.prototype.slice
    var chunk_blob = blobSlice.call(file, 0, Math.min(file.size, cst.hashLength)); // 2mb header blob

    let file_content = await chunk_blob.text()
    
    var md5_slice = Md5.hashStr(`${file_content}${file.size}`).slice(0, 15);

    debug(`[fileManagerUI][imgExistsInCache] Blob content: [${file_content.slice(20,40)} ...] with length = ${file_content.length}file.size=${file.size}`);

    if (fileidx !== undefined && md5_slice in fileidx) {
        if (notice) {
            const dialog = new Dialog({
                title: `${window.bgCoverPlugin.i18n.inDevTitle}`,
                content: `<div class="b3-dialog__content">${window.bgCoverPlugin.i18n.imageFileExist}</div>`,
                width: window.bgCoverPlugin.isMobileLayout ? "92vw" : "520px",
            });
        }else{
            debug(`[fileManagerUI][imgIsInCache] 当前图片${file.name}已存在`)
        }
        return 'exists'
    } else {
        return md5_slice
    }
}

export async function uploadOneImage(file: File) {
    let fileSizeMB: number = (file.size / 1024 / 1024);

    let md5_slice = await imgExistsInCache(file);

    if (md5_slice !== 'exists') {
        showMessage(`${file.name}-${fileSizeMB.toFixed(2)}MB<br>${window.bgCoverPlugin.i18n.addSingleImageUploadNotice}`, 3000, "info");
    }

    let fileidx = confmngr.get('fileidx');
    if (fileidx === undefined || fileidx === null) {
        fileidx = {};
    };

    // 检查是否已经在缓存目录中存在了该图片
    if (md5_slice !== 'exists') {
        const [prefix, suffix] = os.splitext(file.name)
        const hashedName = `hash-${md5_slice}.${suffix}`

        const uploadResult = await ka.putFile(`${cst.pluginAssetsDir}/${hashedName}`, file);

        if (uploadResult.code === 0) {
            // slice(5) to remove '/data' prefix
            const imgPath = `${cst.pluginAssetsDir.slice(5)}/${hashedName}`

            const imageSize = await cv2.getImageSize(imgPath)

            let bgObj: tps.bgObj = {
                name: file.name,
                hash: md5_slice,
                mode: tps.bgMode.image,
                path: imgPath,
                width: imageSize.width,
                height: imageSize.height,
                parent: cst.pluginAssetsId
            }

            fileidx[bgObj.hash] = bgObj;

            confmngr.set('crtBgObj', bgObj);
            confmngr.set('fileidx', fileidx);

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
    let bgObj:tps.bgObj;

    debug('[fileManagerUI][batchUploadImages] fileArray', fileArray)

    if (fileArray.length === 0) {
        debug('[fileManagerUI][batchUploadImages] fileArray为空，不存在需要上传的图片')
    }else{
        for (let file of fileArray) {
            bgObj = await uploadOneImage(file);

            debug('[fileManagerUI][batchUploadImages] 在上传的循环内', bgObj)
        };

        await confmngr.save('[fileManagerUI][batchUploadImages]');

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
        width: window.bgCoverPlugin.isMobileLayout ? "92vw" : "520px",
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
        await clearCacheFolder(tps.bgMode.image);
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
    let fileidx = confmngr.get('fileidx')
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
            confmngr.set('crtBgObj', bgObj);
        
            confmngr.save('[fileManagerUI][generateCacheImgList][setBgBtn.click]');
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
            let fileidx = confmngr.get('fileidx');
            delete fileidx[bgObj.hash];
            confmngr.set('fileidx', fileidx);
        
            // 调用os来移除本地文件夹中的缓存文件
            debug(`[fileManagerUI][_rmBg] 移除下列路径的图片：${cst.pluginAssetsDir}/${bgObj.name}`);
            ka.removeFile(`data/${bgObj.path}`);
        
            // 检查当前文件数量是否为空，如果为空则设置为默认了了图
            const cacheImgNum = getCacheImgNum();
            if (cacheImgNum === 0) {
                // 没有缓存任何图片，使用默认的了了妹图片ULR来当作背景图
                bgRender.useDefaultLiaoLiaoBg();
            };
        
            confmngr.save('[fileManagerUI][generateCacheImgList][delBtn.click]');
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


//////////////////////
// Asset UI Manager //
//////////////////////

 export function openAssetsFolderPickerDialog(): Promise<string[] | null> {
    const rootPath = 'data/assets';
    const selectedPaths: Set<string> = new Set();
    
    // siyuan file tree:
    //
    // <div class="b3-list b3-list--border b3-list--background">
    //     <div class="b3-list-item b3-list-item--narrow toggle">
    //         <span class="b3-list-item__toggle b3-list-item__toggle--hl">
    //             <svg class="b3-list-item__arrow b3-list-item__arrow--open">
    //                 <use xlink:href="#iconRight"></use>
    //             </svg>
    //         </span>
    //         <span class="b3-list-item__text ft__on-surface">插件</span>
    //     </div>
    //     <div class="b3-list__panel">
    //         <!-- repeat -->
    //         <div class="b3-list-item b3-list-item--narrow toggle">

    return new Promise((resolve) => {
        const dialog = new Dialog({
            title: window.bgCoverPlugin.i18n.addNoteAssetsDirectoryLabel,
            width: window.bgCoverPlugin.isMobileLayout ? "92vw" : "600px",
            height: "70vh",
            content: `
            <div class="b3-dialog__content" style="height: calc(100% - 62px);">
                <div id="folderTreeContainer" class="b3-label file-tree" style="height: 100%;">
                    <!-- Tree will be rendered here -->
                </div>
            </div>
            <div class="b3-dialog__action">
                <button class="b3-button b3-button--cancel">${window.bgCoverPlugin.i18n.cancel}</button>
                <div class="fn__space"></div>
                <button class="b3-button b3-button--text" id="folderPickerSelect">${window.bgCoverPlugin.i18n.confirm}</button>
            </div>
            `,
            destroyCallback: () => {
                resolve(null);
            }
        });

        const renderSubfolderNode = async (path: string, parentElement: HTMLElement, level: number = 0) => {
            // 预先读取目录内容以确定是否有子文件夹
            let subDirs: { isDir: boolean; name: string }[] = [];
            let imageCount = 0;
            let hasSubDirs = false;
            try {
                const res = await ka.readDir(path);
                if (res.code === 0 && res.data) {
                    const items = res.data as { isDir: boolean; name: string }[];
                    debug(`ka.readDir -> items:`, items);

                    subDirs = items.filter(item => item.isDir);
                    debug(`读取文件夹${path}的子文件夹内容:`, subDirs)

                    // 计算图片数量
                    // let fileext = os.splitext('ea95f7576f32674cd.jfif')[1].toLowerCase()
                    // fileext => 'jfif' 缺少前面的'.'
                    // debug(`计算图片后缀是否符合`, fileext, cst.supportedImageSuffix.includes(fileext) )
                    imageCount = items.filter(item => 
                        !item.isDir && cst.supportedImageSuffix.includes(`.${os.splitext(item.name)[1].toLowerCase()}`)
                    ).length;
                    hasSubDirs = subDirs.length > 0;
                }
            } catch (err) {
                console.error(`[fileManagerUI] 读取路径失败 ${path}:`, err);
            }

            const nodeElement = document.createElement('div');
            const folderName = path.split('/').pop() || path;

            // 根据是否存在子文件夹，条件性地渲染展开/折叠的箭头
            const arrowHTML = hasSubDirs
                // 如果有子文件夹：
                ? `<span class="b3-list-item__toggle b3-list-item__toggle--hl">
                       <svg class="b3-list-item__arrow"><use xlink:href="#iconRight"></use></svg>
                   </span>`
                // 如果没有子文件夹
                : `<span class="b3-list-item__toggle"></span>`; // 使用一个空的span来保持对齐
            
            const badgeHTML = `
            <span class="counter counter--bg fn__flex-center b3-tooltips b3-tooltips__w" 
                aria-label="${window.bgCoverPlugin.i18n.folderBgCountLabel}">
                ${imageCount}
            </span>`

            nodeElement.innerHTML = `
            <div class="b3-list-item b3-list-item--narrow toggle">
                ${arrowHTML}
                <span class="b3-list-item__text ft__on-surface" >${folderName}</span>
                <span class="fn__space"></span>
                <input class="b3-switch fn__flex-center" type="checkbox" data-path="${path}" ${imageCount === 0 ? 'disabled' : ''}>
                ${badgeHTML}
            </div>
            <div class="b3-list__panel" style="display: none;"></div>
            `;
            parentElement.appendChild(nodeElement);

            const panel = nodeElement.querySelector('.b3-list__panel') as HTMLElement;
            const checkbox = nodeElement.querySelector('.b3-switch') as HTMLInputElement;

            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    selectedPaths.add(path);
                } else {
                    selectedPaths.delete(path);
                }
            });

            // 仅当存在子文件夹时，才添加展开/折叠功能
            if (hasSubDirs) {
                const toggle = nodeElement.querySelector('.b3-list-item__toggle') as HTMLElement;
                const arrow = nodeElement.querySelector('.b3-list-item__arrow') as SVGElement;

                toggle.addEventListener('click', async () => {
                    const isOpen = arrow.classList.toggle('b3-list-item__arrow--open');
                    panel.style.display = isOpen ? '' : 'none';

                    // 仅在第一次展开时加载内容
                    if (isOpen && panel.childElementCount === 0) {
                        // 我们已经预加载了subDirs，现在直接使用它们来渲染
                        for (const item of subDirs) {
                            await renderSubfolderNode(`${path}/${item.name}`, panel, level + 1);
                        }
                    }
                });
            }
        };

        const treeContainer = dialog.element.querySelector('#folderTreeContainer') as HTMLDivElement;
        
        // Main function to initialize the tree view
        const initTree = async () => {
            treeContainer.innerHTML = `<div class="fn__loading" style="text-align: center; padding: 20px;"><img src="/stage/loading-pure.svg"></div>`;
            try {
                const res = await ka.readDir(rootPath);
                treeContainer.innerHTML = ''; // Clear loading
                if (res.code === 0 && res.data) {
                    const rootDirs = (res.data as { isDir: boolean; name: string }[]).filter(item => item.isDir);
                    if (rootDirs.length > 0) {
                        for (const dir of rootDirs) {
                            const listContainer = document.createElement('div');
                            listContainer.className = 'b3-list b3-list--border b3-list--background';
                            treeContainer.appendChild(listContainer);
                            await renderSubfolderNode(`${rootPath}/${dir.name}`, listContainer, 0);
                        }
                    } else {
                        treeContainer.innerHTML = `<div class="b3-list-item b3-list-item--narrow"><span class="b3-list-item__text ft__on-surface ft__smaller">${window.bgCoverPlugin.i18n.emptyFolder}</span></div>`;
                    }
                }
            } catch (err) {
                console.error("Failed to read root assets directory:", err);
                treeContainer.innerHTML = `<div class="b3-list-item"><span class="b3-list-item__text" style="color: var(--b3-theme-error);">Failed to load assets directory.</span></div>`;
            }
        };

        initTree();

        // 确认选择按钮
        const confirmButton = dialog.element.querySelector('#folderPickerSelect') as HTMLButtonElement;
        confirmButton.addEventListener('click', () => {
            resolve(Array.from(selectedPaths));
            dialog.destroy();
        });
        
        // 取消按钮
        const cancelButton = dialog.element.querySelector('.b3-button--cancel') as HTMLButtonElement;
        cancelButton.addEventListener('click', () => {
            dialog.destroy();
        });
 
    });
}