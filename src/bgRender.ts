import { configs } from "./configs";

import * as cst from "./constants";
import * as fileManagerUI from "./fileManagerUI";
import * as noticeUI from "./noticeUI";
import * as settingsUI from "./settingsUI";
import * as topbarUI from "./topbarUI";

import {
    error, debug,
    getCurrentThemeInfo
} from './utils';

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
    changeBackgroundContent(cst.demoImgURL, cst.bgMode.image)
    configs.set('crtBgObj', undefined);
}

export function changeBackgroundContent(background: string, mode: cst.bgMode) {
    var bgLayer = document.getElementById('bglayer');

    if (mode === cst.bgMode.image) {
        debug(`[bgRender][changeBackgroundContent] 替换当前背景图片为${background}`)
        bgLayer.style.setProperty('background-image', `url('${background}')`);
    } else if (mode == cst.bgMode.video) {
        noticeUI.showIndev();
    } else if (mode == cst.bgMode.live2d) {
        noticeUI.showIndev();
    } else {
        error(`[SwitchBgCover Plugin][Error] Background type [${mode}] is not supported, `, 7000, "error");
    }
};

export function isBlockTheme(){
    var blockTheme = configs.get('blockTheme')
    const themeModeText = ['light', 'dark']
    const [themeMode, themeName] = getCurrentThemeInfo();

    var result = blockTheme[themeModeText[themeMode]][themeName];
    debug(`[bgRender][isBlockTheme] search mode='${themeModeText[themeMode]}', name='${themeName}' result is ${result}`)

    return result;
}

export function changeOpacity(alpha: number) {
    let opacity = 0.99 - 0.25 * alpha;

    if (configs.get('activate') && !isBlockTheme() && alpha !== 0) {
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

    if (configs.get('activate') && !isBlockTheme() ) {
        bgLayer.style.removeProperty('display');
    } else {
        bgLayer.style.setProperty('display', 'none');
    }

    // 缓存文件夹中没有图片 | 用户刚刚使用这个插件 | 用户刚刚重置了插件数据 | 当前文件404找不到
    const cacheImgNum = fileManagerUI.getCacheImgNum()
    debug(`[bgRender][applySettings] cacheImgNum= ${cacheImgNum}`)
    if (cacheImgNum === 0) {
        // 没有缓存任何图片，使用默认的了了妹图片ULR来当作背景图
        useDefaultLiaoLiaoBg();
    } else if (configs.get('crtBgObj') === undefined) {
        // 缓存中有1张以上的图片，但是设置的bjObj却是undefined，随机抽一张
        debug(`[bgRender][applySettings] 缓存中有1张以上的图片，但是设置的bjObj却是undefined，随机抽一张`)
        await topbarUI.selectPictureRandom();
    } else {
        // 缓存中有1张以上的图片，bjObj也有内容且图片存在
        debug(`[bgRender][applySettings] 缓存中有1张以上的图片，bjObj也有内容且图片存在`)
        let crtBgObj = configs.get('crtBgObj')
        let fileidx = configs.get('fileidx')
        // 没有开启启动自动更换图片，则直接显示该图片
        if (crtBgObj.hash in fileidx && !configs.get('autoRefresh')) {
            debug(`[bgRender][applySettings] 没有开启启动自动更换图片，则直接显示当前图片`)
            changeBackgroundContent(crtBgObj.path, crtBgObj.mode)
        } else {
            // 当bjObj找不到404 | 用户选择随机图片，则随机调一张作为bjObj
            debug(`[bgRender][applySettings] 用户选择随机图片，则随机调一张作为bjObj`)
            await topbarUI.selectPictureRandom();
        }
    }

    changeOpacity(configs.get('opacity'))
    changeBlur(configs.get('blur'))
    if (configs.get('crtBgObj') === undefined){
        changeBgPosition(null, null)
    }else{
        changeBgPosition(configs.get('crtBgObj').offx, configs.get('crtBgObj').offy)
    }
    
    settingsUI.updateSettingPanelElementStatus()
}