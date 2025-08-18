import {
    showMessage,
    confirm,
    Menu,
    getFrontend,
    getBackend,
    IMenuItemOption
} from "siyuan";

import { debug, OS } from './utils';

import BgCoverPlugin from "./index"
import { configs } from './configs';
import * as cst from './constants';
import * as noticeUI from "./noticeUI";
import * as settingsUI from "./settingsUI";
import * as fileManagerUI from "./fileManagerUI";
import * as bgRender from "./bgRender";
import * as topbarUI from "./topbarUI";

let os = new OS();


/**
 * 顶栏按钮UI
 */
export async function initTopbar(pluginInstance: BgCoverPlugin) {

    const topBarElement = pluginInstance.addTopBar({
        icon: "iconLogo",
        title: window.bgCoverPlugin.i18n.addTopBarIcon,
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
            label: `${window.bgCoverPlugin.i18n.selectPictureLabel}`,
            type: "submenu",
            submenu: [
                {
                    icon: "iconHand",
                    label: `${window.bgCoverPlugin.i18n.selectPictureManualLabel}`,
                    accelerator: pluginInstance.commands[0].customHotkey,
                    click: () => {
                        selectPictureByHand();
                    }
                }, 
                {
                    icon: "iconMark",
                    label: `${window.bgCoverPlugin.i18n.selectPictureRandomLabel}`,
                    accelerator: pluginInstance.commands[1].customHotkey,
                    click: () => {
                        selectPictureRandom(true);
                    }
                },
            ]
        });

        let submenu: IMenuItemOption[] = [
            {
                icon: "iconImage",
                label: `${window.bgCoverPlugin.i18n.addSingleImageLabel}`,
                click: () => {
                    addSingleLocalImageFile();
                }
            },
            {
                icon: "iconFolder",
                label: `${window.bgCoverPlugin.i18n.addDirectoryLabel}`,
                click: () => {
                    addDirectory();
                }
            },
        ];

        if (window.bgCoverPlugin.isAndroid && !window.bgCoverPlugin.isBrowser) {
            submenu.unshift(
                {
                    icon: "iconSparkles",
                    label: `${window.bgCoverPlugin.i18n.androidLimitNotice}`,
                    type: "readonly",
                }
            )
        }
        
        menu.addItem({
            icon: "iconAdd",
            label: `${window.bgCoverPlugin.i18n.addImageLabel}`,
            type: "submenu",
            submenu: submenu,
        });
        menu.addItem({
            id: 'pluginOnOffMenu',
            icon: `${configs.get('activate') ? 'iconClose' : 'iconSelect'}`,
            label: `${configs.get('activate') ? window.bgCoverPlugin.i18n.closeBackgroundLabel : window.bgCoverPlugin.i18n.openBackgroundLabel}`,
            accelerator: pluginInstance.commands[2].customHotkey,
            click: () => {
                topbarUI.pluginOnOff();
            }
        });

        menu.addSeparator();

        menu.addItem({
            icon: "iconGithub",
            label: `${window.bgCoverPlugin.i18n.bugReportLabel}`,
            click: () => {
                noticeUI.bugReportDialog();
            }
        });
        menu.addItem({
            icon: "iconSettings",
            label: `${window.bgCoverPlugin.i18n.settingLabel}`,
            click: () => {
                settingsUI.openSettingDialog(pluginInstance);
            }
        });

        if (window.bgCoverPlugin.isMobileLayout) {
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
    configs.set('activate', !configs.get('activate'))
    configs.save('[topbarUI][pluginOnOff]');
    bgRender.applySettings();
}

export async function selectPictureByHand() {
    await fileManagerUI.selectPictureDialog();
};

export async function selectPictureRandom(manualPress: boolean = false) {
    const cacheImgNum = fileManagerUI.getCacheImgNum()
    if (cacheImgNum === 0) {
        // 没有缓存任何图片，使用默认的了了妹图片ULR来当作背景图
        bgRender.useDefaultLiaoLiaoBg();
        showMessage(`${window.bgCoverPlugin.i18n.noCachedImg4random}`, 3000, "info")
    } else if (cacheImgNum === 1) {
        // 只有一张图，无法进行随机抽选(无变化)
        if (manualPress) {
            showMessage(`${window.bgCoverPlugin.i18n.selectPictureRandomNotice}`, 3000, "info")
        }
        let belayerElement = document.getElementById('bglayer')
        if (belayerElement.style.getPropertyValue('background-image') === '') {
            // 如果当前背景不存在任何图片
            let bgObj = configs.get('crtBgObj')
            bgRender.changeBackgroundContent(bgObj.path, bgObj.mode)
        }
    } else {
        // 随机选择一张图
        let fileidx = configs.get('fileidx')
        let crt_hash = configs.get('crtBgObj').hash
        let r_hash = ''
        while (true) {
            let r = Math.floor(Math.random() * cacheImgNum)
            r_hash = Object.keys(fileidx)[r]
            debug(`[topbarUI][selectPictureRandom] 随机抽一张，之前：${crt_hash}，随机到：${r_hash}`)
            if (r_hash !== crt_hash) {
                // 确保随机到另一张图而不是当前的图片
                debug(`[topbarUI][selectPictureRandom] 已抽到不同的背景图${r_hash}，进行替换`)
                break
            }
        }
        debug('[topbarUI][selectPictureRandom] 跳出抽卡死循环,前景图为：', fileidx[r_hash])
        bgRender.changeBackgroundContent(fileidx[r_hash].path, fileidx[r_hash].mode)
        configs.set('bgObj', fileidx[r_hash])
    }
    await configs.save('[topbarUI][selectPictureRandom]')
    settingsUI.updateSettingPanelElementStatus()
}

export async function addSingleLocalImageFile() {

    const cacheImgNum = fileManagerUI.getCacheImgNum();

    if (cacheImgNum >= cst.cacheMaxNum) {
        showMessage(window.bgCoverPlugin.i18n.addSingleImageExceed1 + cst.cacheMaxNum + window.bgCoverPlugin.i18n.addSingleImageExceed2, 7000, 'error');
    }else{
        // return an Array
        const fileHandle = await os.openFilePicker(cst.supportedImageSuffix.toString())

        let file = fileHandle[0];

        let bgObj = await fileManagerUI.uploadOneImage(file);

        // 文件不重复且上传成功
        if (bgObj !== undefined) {
            await configs.save('[topbarUI][addSinglelocalImageFile]');
            bgRender.changeBackgroundContent(bgObj.path, bgObj.mode);
            settingsUI.updateSettingPanelElementStatus();
        };
    };
};

export async function addDirectory() {
    const cacheImgNum = fileManagerUI.getCacheImgNum();

    const fileList = await os.openFolderPicker();

    let fileContainer:Array<File> = [];

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
            showMessage(window.bgCoverPlugin.i18n.addDirectoryLabelError1 + cst.cacheMaxNum + window.bgCoverPlugin.i18n.addDirectoryLabelError2, 7000, 'error')
            break
        }
    }

    if (fileContainer.length >= 30) {
        confirm(
            window.bgCoverPlugin.i18n.addDirectoryLabelConfirmTitle,
            `${window.bgCoverPlugin.i18n.addDirectoryLabelConfirm1} ${fileContainer.length} ${window.bgCoverPlugin.i18n.addDirectoryLabelConfirm2}`,
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