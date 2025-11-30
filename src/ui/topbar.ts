import {
    showMessage,
    confirm,
    Menu
} from "siyuan";

import { debug } from '../utils/logger';
import { OS } from '../utils/pythonic';

import BgCoverPlugin from "../index"
import { confmngr } from '../utils/configs';
import * as cst from '../utils/constants';

import * as bgRender from "../services/bgRender";

import * as topbarUI from "./topbar";
import * as noticeUI from "./notice";
import * as fileManagerUI from "./fileManager";
import * as settingsUI from "./settings";

import { showNotImplementDialog } from "./notice";

let os = new OS();

/**
 * 顶栏按钮UI
 */
export async function initTopbar(pluginInstance: BgCoverPlugin) {

    let i18n = pluginInstance.i18n;

    const topBarElement = pluginInstance.addTopBar({
        icon: "iconLogo",
        title: i18n.addTopBarIcon,
        position: "right",
        callback: () => {
            debug(`[topbarUI][initTopbar] click and open toolbar`);
        }
    });

    topBarElement.addEventListener("click", async () => {
        let rect = topBarElement.getBoundingClientRect();
        // 如果被隐藏，则使用更多按钮
        if (rect.width === 0) {
            rect = document.querySelector("#barMore").getBoundingClientRect();
        }
        if (rect.width === 0) {
            rect = document.querySelector("#barPlugins").getBoundingClientRect();
        }

        const menu = new Menu("topBarSample", () => { });
        menu.addItem({
            icon: "iconIndent",
            label: `${i18n.selectPictureLabel}`,
            type: "submenu",
            submenu: [
                {
                    icon: "iconHand",
                    label: `${i18n.selectPictureManualLabel}`,
                    accelerator: pluginInstance.commands[0].customHotkey,
                    click: () => {
                        selectPictureByHand();
                    }
                }, 
                {
                    icon: "iconMark",
                    label: `${i18n.selectPictureRandomLabel}`,
                    accelerator: pluginInstance.commands[1].customHotkey,
                    click: () => {
                        selectPictureRandom(true);
                    }
                },
            ]
        });
        
        menu.addItem({
            icon: "iconAdd",
            label: `${i18n.addImageLabel}`,
            type: "submenu",
            submenu: [
                {
                icon: "iconImage",
                label: `${i18n.addSeveralImagesLabel}`,
                click: () => {
                    addSeveralLocalImagesFile();
                }
                },
                {
                    icon: "iconFolder",
                    label: `${i18n.addDirectoryLabel}`,
                    click: () => {
                        addDirectory();
                    }
                },
                // {
                //     icon: "iconFilesRoot",
                //     label: `${i18n.addNoteAssetsDirectoryLabel}`,
                //     click: () => {
                //         addNoteAssetsDirectory();
                //     }
                // },
            ]
        });
        menu.addItem({
            id: 'pluginOnOffMenu',
            icon: `${confmngr.get('activate') ? 'iconClose' : 'iconSelect'}`,
            label: `${confmngr.get('activate') ? i18n.closeBackgroundLabel : i18n.openBackgroundLabel}`,
            accelerator: pluginInstance.commands[2].customHotkey,
            click: () => {
                topbarUI.pluginOnOff();
            }
        });

        menu.addSeparator();

        menu.addItem({
            icon: "iconGithub",
            label: `${i18n.bugReportLabel}`,
            click: () => {
                noticeUI.bugReportDialog();
            }
        });
        menu.addItem({
            icon: "iconSettings",
            label: `${i18n.settingLabel}`,
            click: () => {
                settingsUI.openSettingDialog(pluginInstance);
            }
        });

        if (pluginInstance.isMobile) {
            menu.fullscreen();
        } else {
            menu.open({
                x: rect.right,
                y: rect.bottom,
                isLeft: true,
            });
        };
    });
};

export async function pluginOnOff() {
    confmngr.set('activate', !confmngr.get('activate'))
    confmngr.save('[topbarUI][pluginOnOff]');
    bgRender.applySettings();
}

export async function selectPictureByHand() {
    await fileManagerUI.selectPictureDialog();
};

export async function selectPictureRandom(manualPress: boolean = false) {
    let i18n = BgCoverPlugin.i18n;

    const cacheImgNum = fileManagerUI.getCacheImgNum()
    if (cacheImgNum === 0) {
        // 没有缓存任何图片，使用默认的了了妹图片ULR来当作背景图
        bgRender.useDefaultLiaoLiaoBg();
        showMessage(`${i18n.noCachedImg4random}`, 3000, "info")
    } else if (cacheImgNum === 1) {
        // 只有一张图，无法进行随机抽选(无变化)
        if (manualPress) {
            showMessage(`${i18n.selectPictureRandomNotice}`, 3000, "info")
        }

        let belayerElement = document.getElementById('bglayer')
        // 如果当前背景不存在任何图片
        if (belayerElement.style.getPropertyValue('background-image') === '') {
            let bgObj = confmngr.get('fileidx')[0]
            bgRender.changeBackgroundContent(bgObj.path, bgObj.mode)
        }
    } else {
        // 随机选择一张图
        let fileidx = confmngr.get('fileidx')

        let crtBgObj = confmngr.get('crtBgObj');

        // 使用可选链 ?. 和空值合并 ?? 来安全地获取 crt_hash
        let crtHash = crtBgObj?.hash ?? '';
        if (crtHash === '') {
            crtHash = "emptyCrtObj"
        }

        let rndHash = ''

        while (true) {
            let r = Math.floor(Math.random() * cacheImgNum)
            rndHash = Object.keys(fileidx)[r]
            debug(`[topbarUI][selectPictureRandom] 随机抽一张，之前：${crtHash}，随机到：${rndHash}`)
            if (rndHash !== crtHash) {
                // 确保随机到另一张图而不是当前的图片
                debug(`[topbarUI][selectPictureRandom] 已抽到不同的背景图${rndHash}，进行替换`)
                break
            }
        }
        debug('[topbarUI][selectPictureRandom] 跳出抽卡死循环,前景图为：', fileidx[rndHash])
        bgRender.changeBackgroundContent(fileidx[rndHash].path, fileidx[rndHash].mode)
        confmngr.set('crtBgObj', fileidx[rndHash])
    }
    await confmngr.save('[topbarUI][selectPictureRandom]')
    settingsUI.updateSettingPanelElementStatus()
}

export async function addSeveralLocalImagesFile() {
    let i18n = BgCoverPlugin.i18n;

    const cacheImgNum = fileManagerUI.getCacheImgNum();

    if (cacheImgNum >= cst.cacheMaxNum) {
        showMessage(i18n.addSingleImageExceed1 + cst.cacheMaxNum + i18n.addSingleImageExceed2, 7000, 'error');
    }else{
        // return an Array
        const fileHandle = await os.openFilePicker(cst.supportedImageSuffix.toString(), true)
        let lastUploadedBgObj: any;

        for (const [index, file] of fileHandle.entries()) {
            const isLast = (index === fileHandle.length - 1);

            let bgObj = await fileManagerUI.uploadOneImage(file);

            // 文件不重复且上传成功
            if (bgObj !== undefined) {
                lastUploadedBgObj = bgObj; // 记录最后一次成功上传的对象
                // 只在最后一次循环时保存和更新UI，减少开销
                if (isLast) {
                    await confmngr.save('[topbarUI][addSeveralLocalImagesFile]');
                    settingsUI.updateSettingPanelElementStatus();
                    bgRender.changeBackgroundContent(lastUploadedBgObj.path, lastUploadedBgObj.mode);
                }
            };
        }
    };
};

export async function addDirectory() {
    const cacheImgNum = fileManagerUI.getCacheImgNum();

    const fileList = await os.openFolderPicker();

    let fileContainer:Array<File> = [];

    let i18n = BgCoverPlugin.i18n;

    // 遍历文件夹中的每个文件
    for await (const file of fileList) {
        // 检查文件类型是否为文件，排除文件夹
        const fileName = file.name;

        const [prefix, suffix] = os.splitext(fileName)
        // suffix = 'jpg'
        debug(`[topbarUI][addDirectory] 当前图片${fileName}后缀为${suffix}, 存在于允许的图片后缀(${cst.supportedImageSuffix})中：${cst.supportedImageSuffix.includes(`.${suffix}`)}`)
        if (cst.supportedImageSuffix.includes(`.${suffix}`)) {

            let md5 = await fileManagerUI.imgExistsInCache(file, false);

            if (md5 !== 'exists') {
                fileContainer.push(file)
            }else{
                debug(`[topbarUI][addDirectory] 当前图片${fileName}md5为${md5}, 存在于缓存中`)
            }
        }

        debug(`[topbarUI][addDirectory] fileContainer`, fileContainer)

        if (fileContainer.length >= cst.cacheMaxNum - cacheImgNum) {
            showMessage(i18n.addDirectoryLabelError1 + cst.cacheMaxNum + i18n.addDirectoryLabelError2, 7000, 'error')
            break
        }
    }

    if (fileContainer.length >= 30) {
        confirm(
            i18n.addDirectoryLabelConfirmTitle,
            `${i18n.addDirectoryLabelConfirm1} ${fileContainer.length} ${i18n.addDirectoryLabelConfirm2}`,
            async () => {
                // 同意上传，则开始批量上传
                await fileManagerUI.batchUploadImages(fileContainer, true);
            }
        )
    }else{
         // 要上传的数量比较少，直接开始批量上传
        await fileManagerUI.batchUploadImages(fileContainer, true);
    }
}

export async function addNoteAssetsDirectory() {
    showNotImplementDialog();
    return;

    const selectedPath = await fileManagerUI.openAssetsFolderPickerDialog();

    if (selectedPath) {
        debug(`[topbarUI][addNoteAssetsDirectory] User selected folder: ${selectedPath}`);
        // TODO: 在这里处理后续逻辑
        // 1. 计算路径的哈希作为ID
        // 2. 将 {id: path} 保存到配置中
        // 3. 触发文件索引同步
        showMessage(`已选择文件夹: ${selectedPath}`);
    } else {
        debug('[topbarUI][addNoteAssetsDirectory] User cancelled folder selection.');
    }
}