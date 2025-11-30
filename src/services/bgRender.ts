import { confmngr } from "../utils/configs";

import * as tps from "../utils/types";
import * as cst from "../utils/constants";

import * as fileManagerUI from "../ui/fileManager";
import * as settingsUI from "../ui/settings";
import * as topbarUI from "../ui/topbar";

import {showNotImplementDialog} from "../ui/notice";

import { error, debug } from "../utils/logger";
import { getCurrentThemeInfo } from "../utils/theme";

let autoRefreshTimer: NodeJS.Timeout | null = null;

export function createBgLayer() {
    var bgLayer = document.createElement('canvas');
    bgLayer.id = "bglayer";
    
    ///////////////////////////////////////////////
    // 载入scss修复思源笔记v3.1.26重载插件会丢失的bug //
    ///////////////////////////////////////////////
    // bgLayer.className = "bglayer";
    // 直接设置样式
    bgLayer.style.backgroundRepeat = 'no-repeat';
    bgLayer.style.backgroundAttachment = 'fixed';
    bgLayer.style.backgroundSize = 'cover';
    bgLayer.style.backgroundPosition = 'center center';
    bgLayer.style.width = '100%';
    bgLayer.style.height = '100%';
    bgLayer.style.position = 'absolute';
    bgLayer.style.zIndex = '-10000';

    var htmlElement = document.documentElement;
    htmlElement.insertBefore(bgLayer, document.head);

    debug('[bgRender][createBgLayer] bgLayer created')

    // <video id="v1" loop="true" autoplay="autoplay" muted="" class="bglayer" style="object-fit: cover; object-position: 50% 70%;">
    //     <source src="plugins/siyuan-plugin-background-cover/assets/videos/aaa.mp4" type="video/mp4">
    // </video>
}

// 添加视频背景
// export function createBgLayer() {
//     var bgLayer = document.createElement('video');
//     bgLayer.id = "bglayer";
//     bgLayer.className = "bglayer";
//     bgLayer.loop = true;
//     bgLayer.autoplay = true;
//     bgLayer.muted = true;
//     bgLayer.style.objectFit = "cover";
//     bgLayer.style.objectPosition = "50% 70%";
//     bgLayer.innerHTML = '<source src="plugins/siyuan-plugin-background-cover/static/output.mp4" type="video/mp4">';


//     var htmlElement = document.documentElement;
//     htmlElement.insertBefore(bgLayer, document.head);

//     debug('[bgRender][createBgLayer] bgLayer created')

//     // <video id="v1" loop="true" autoplay="autoplay" muted="" class="bglayer" style="object-fit: cover; object-position: 50% 70%;">
//     //     <source src="plugins/siyuan-plugin-background-cover/assets/videos/aaa.mp4" type="video/mp4">
//     // </video>
// }


export function useDefaultLiaoLiaoBg() {
    debug(`[bgRender][applySettings] 没有缓存任何图片，使用默认的了了妹图片ULR来当作背景图`)
    changeBackgroundContent(cst.demoImgURL, tps.bgMode.image)
    confmngr.set('crtBgObj', undefined);
}

export function changeBackgroundContent(background: string, mode: tps.bgMode) {
    var bgLayer = document.getElementById('bglayer');

    if (mode === tps.bgMode.image) {
        debug(`[bgRender][changeBackgroundContent] 替换当前背景图片为${background}`)
        bgLayer.style.setProperty('background-image', `url('${background}')`);
    } else if (mode == tps.bgMode.video) {
        showNotImplementDialog();
    } else {
        error(`[SwitchBgCover Plugin][Error] Background type [${mode}] is not supported, `, 7000, "error");
    }
};

export function isdisabledTheme(){
    var disabledTheme = confmngr.get('disabledTheme')
    const themeModeText = ['light', 'dark']
    const [themeMode, themeName] = getCurrentThemeInfo();

    var result = disabledTheme[themeModeText[themeMode]][themeName];
    debug(`[bgRender][isdisabledTheme] search mode='${themeModeText[themeMode]}', name='${themeName}' result is ${result}`)

    return result;
}

export function changeOpacity(alpha: number) {
    let opacity = 0.99 - 0.25 * alpha;

    if (confmngr.get('activate') && !isdisabledTheme() && alpha !== 0) {
        document.body.style.setProperty('opacity', opacity.toString());
    } else {
        document.body.style.removeProperty('opacity');
    }
}

export function changeBlur(blur: number) {
    var bgLayer = document.getElementById('bglayer');
    bgLayer.style.setProperty('filter', `blur(${blur}px)`)
}

export function changeBgPosition(x: string, y: string) {
    var bgLayer = document.getElementById('bglayer');

    if (x == null || x == undefined) {
        debug(`[bgRender][changeBgPosition] xy未定义，不进行改变`)
        bgLayer.style.setProperty('background-position', `center`);
    } else {
        debug(`[bgRender][changeBgPosition] 修改background-position为${x}% ${y}%`)
        bgLayer.style.setProperty('background-position', `${x}% ${y}%`);
    }
}

export async function applySettings() {
   
    var bgLayer = document.getElementById('bglayer');
    debug(bgLayer);

    if (confmngr.get('activate') && !isdisabledTheme() ) {
        bgLayer.style.removeProperty('display');
    } else {
        bgLayer.style.setProperty('display', 'none');
    }

    // 清除旧的定时器
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
        debug('[bgRender][applySettings] Cleared existing auto-refresh timer.');
    }

    // 缓存文件夹中没有图片 | 用户刚刚使用这个插件 | 用户刚刚重置了插件数据 | 当前文件404找不到
    const cacheImgNum = fileManagerUI.getCacheImgNum()
    debug(`[bgRender][applySettings] cacheImgNum= ${cacheImgNum}`)
    if (cacheImgNum === 0) {
        // 没有缓存任何图片，使用默认的了了妹图片ULR来当作背景图
        useDefaultLiaoLiaoBg();
    } else if (confmngr.get('crtBgObj') === undefined) {
        // 缓存中有1张以上的图片，但是设置的bjObj却是undefined，随机抽一张
        debug(`[bgRender][applySettings] 缓存中有1张以上的图片，但是设置的bjObj却是undefined，随机抽一张`)
        await topbarUI.selectPictureRandom();
    } else {
        // 缓存中有1张以上的图片，bjObj也有内容且图片存在
        debug(`[bgRender][applySettings] 缓存中有1张以上的图片，bjObj也有内容且图片存在`)
        let crtBgObj = confmngr.get('crtBgObj')
        let crtHash = crtBgObj?.hash ?? '';
        if (crtHash === '') {
            crtHash = "emptyCrtObj"
        }

        let fileidx = confmngr.get('fileidx')
        // 如果当前背景图有效，并且没有开启自动刷新功能，则加载config中记录的crtBgObj
        if (crtBgObj && crtHash in fileidx) {
            debug(`[bgRender][applySettings] 当前背景图有效，加载当前图片`)
            changeBackgroundContent(crtBgObj.path, crtBgObj.mode)
        } else {
            // 当bjObj找不到404或不存在时，则随机选一张替换作为bjObj
            debug(`[bgRender][applySettings] 当前背景图无效或丢失，随机选择一张替换`)
            await topbarUI.selectPictureRandom();
        }

        // 如果开启了自动刷新且时间不为0，则设置新的定时器
        debug(confmngr.get('autoRefreshTime'), `judgement result:`, confmngr.get('autoRefreshTime') > 0)
        if (confmngr.get('autoRefresh') && confmngr.get('autoRefreshTime') > 0) {
            const refreshTime = confmngr.get('autoRefreshTime') * 60 * 1000; // convert minutes to seconds to ms
            autoRefreshTimer = setInterval(() => {
                topbarUI.selectPictureRandom(false); // pass false to avoid notice on auto-refresh
            }, refreshTime);
            debug(`[bgRender][applySettings] Set up auto-refresh timer for every ${refreshTime / 1000} seconds.`);
        }
    }

    changeOpacity(confmngr.get('opacity'))
    changeBlur(confmngr.get('blur'))
    if (confmngr.get('crtBgObj') === undefined){
        changeBgPosition(null, null)
    }else{
        // 0.5.0版本后数据结构重构，放弃直接修改crtBgObj的.offx offy
        // 因为需要考虑到不同的设备有不同的设置，而这个设置不应该同步
        // 所以使用存在local配置中的'bgObjCfg' -> [img.hash].offx offy来进行记录和控制
        let bgObjCfg = confmngr.get('bgObjCfg')

        let crtBgObj = confmngr.get('crtBgObj');
        let crtBgObjHash = crtBgObj?.hash ?? '';

        var offx: string = '50'  // 默认居中
        var offy: string = '50'
        if (crtBgObjHash in bgObjCfg) {
            offx = bgObjCfg[crtBgObjHash].offx
            offy = bgObjCfg[crtBgObjHash].offy
        }

        changeBgPosition(offx, offy)
    }
    
    settingsUI.updateSettingPanelElementStatus()
}