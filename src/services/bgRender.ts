
import * as tps from "../utils/types";
import * as cst from "../utils/constants";

import * as topbarUI from "../ui/topbar";

import { configStore } from "./configStore";
import { Unsubscriber } from "svelte/store";

import {showNotImplementDialog} from "../ui/notice";

import { error, debug } from "../utils/logger";
import { getCurrentThemeInfo } from "../utils/theme";

let bgLayer: HTMLElement | null = null;
let unsubscribeFromConfig: Unsubscriber | null = null; // [3] 用于保存取消订阅的函数
let autoRefreshTimer: NodeJS.Timeout | null = null;  // 顶视切换背景的计时器

/**
 * 初始化背景渲染服务
 * 创建图层并开始监听配置变化
 */
export function initBgRenderService() {
    if (bgLayer) {
        // 防止重复初始化
        return;
    }

    // 1. 创建背景图层
    createBgLayer();

    // 2. 订阅 configStore 的变化
    unsubscribeFromConfig = configStore.subscribe(config => {
        // 每当配置变化，这个函数就会被调用
        debug('[bgRender] Config changed, applying new settings:', config);
        // 第一步：判断服务是否应该激活
        const isActive = config.activate && !isdisabledTheme(config);
        debug(`[BeRender] current active status is ${isActive}`)

        // 第二步：根据激活状态，应用或清理视觉样式
        if (isActive) {
            debug(`[BeRender] -> applyAllVisuals()`)
            applyAllVisuals(config);
        } else {
            debug(`[BeRender] -> cleanupAllVisuals()`)
            cleanupAllVisuals();
        }

        // 第三步：管理非视觉的副作用，比如定时器
        debug(`[BeRender] -> manageSideEffects()`)
        manageSideEffects(config, isActive);
    });

    debug('Background Render Service Initialized.');
}

/**
 * 销毁背景渲染服务
 * 清理图层和监听器，防止内存泄漏
 */
export function destroyBgRenderService() {
    // 1. 取消订阅 store
    if (unsubscribeFromConfig) {
        unsubscribeFromConfig();
        unsubscribeFromConfig = null;
        debug('[bgRender] Unsubscribed from config store.');
    }

    // 2. 清除定时器
    removeAutoRefreshTimer();

    // 3. 从 DOM 中移除图层
    if (bgLayer) {
        bgLayer.remove();
        bgLayer = null;
        debug('[bgRender] Background layer removed from DOM.');
    }

    // 恢复 body 的不透明度
    document.body.style.removeProperty('opacity');

    console.log('Background Render Service Destroyed.');
}


export function createBgLayer() {
    bgLayer = document.createElement('canvas');
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


/**
 * 应用所有视觉相关的配置。
 * 这个函数假设服务是激活状态。
 */
function applyAllVisuals(config) {
    debug(`[bgRender][applyAllVisuals] start, config:`, config, 'bgLayer:', bgLayer)
    if (!bgLayer) return;

    // 1. 确保图层可见
    bgLayer.style.display = 'block';
    debug(`[bgRender][applyAllVisuals] set bgLayer.style.display = ${bgLayer.style.display}`)

    // 2. 计算并应用 Body 透明度
    const bodyOpacity = 0.99 - 0.25 * config.opacity;
    document.body.style.opacity = bodyOpacity.toString();
    debug(`[bgRender][applyAllVisuals] set document.body.style.opacity = ${document.body.style.opacity}`)

    // 3. 应用背景内容 (图片/视频)
    const bgPath = config.crtBgObj?.path ?? cst.demoImgURL; // 默认是了了背景图
    const bgMode = config.crtBgObj?.mode ?? tps.bgMode.image;  // 了了背景图模式为image
    changeBackgroundContent(bgPath, bgMode);

    // 4. 应用滤镜 (模糊)
    bgLayer.style.filter = `blur(${config.blur}px)`;

    // 5. 计算并应用背景位置
    const [offx, offy] = getBgPositionForCurrent(config.crtBgObj, config.bgObjCfg);
    bgLayer.style.backgroundPosition = `${offx}% ${offy}%`;
}

/**
 * 当服务停用时，清理所有视觉样式和副作用。
 */
function cleanupAllVisuals() {
    if (bgLayer) {
        bgLayer.style.display = 'none';
        // 清理可能残留的样式，确保完全干净
        bgLayer.style.backgroundImage = '';
        bgLayer.style.filter = '';
    }
    // 恢复 body 的默认状态
    document.body.style.removeProperty('opacity');
}

/**
 * 管理与视觉无关的副作用，如定时器。
 */
function manageSideEffects(config, isActive: boolean) {
    // 清除旧的定时器
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
    }

    // 如果服务激活且配置开启，则设置新的定时器
    if (isActive && config.autoRefresh && config.autoRefreshTime > 0) {
        const refreshInterval = config.autoRefreshTime * 60 * 1000;
        autoRefreshTimer = setInterval(() => {
            topbarUI.selectPictureRandom(false);
        }, refreshInterval);
        debug(`[bgRender] Auto-refresh timer set for ${config.autoRefreshTime} minutes.`);
    }
}


export function isdisabledTheme(config){
    var disabledTheme = config.disabledTheme
    const themeModeText = ['light', 'dark']
    const [themeMode, themeName] = getCurrentThemeInfo();

    var result = disabledTheme[themeModeText[themeMode]][themeName];
    debug(`[bgRender][isdisabledTheme] search mode='${themeModeText[themeMode]}', name='${themeName}' result is ${result}`)

    return result;
}

export function removeAutoRefreshTimer() {
    // 清除旧的定时器
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
        debug('[bgRender][applySettings] Cleared existing auto-refresh timer.');
    }
}

export function applyAutoRefreshTimer(autoRefresh, autoRefreshTime) {
    // 如果开启了自动刷新且时间不为0，则设置新的定时器
    debug(autoRefreshTime, `judgement result:`, autoRefreshTime > 0)
    if (autoRefresh && autoRefreshTime > 0) {
        const refreshTime = autoRefreshTime * 60 * 1000; // convert minutes to seconds to ms
        autoRefreshTimer = setInterval(() => {
            topbarUI.selectPictureRandom(false); // pass false to avoid notice on auto-refresh
        }, refreshTime);
        debug(`[bgRender][applySettings] Set up auto-refresh timer for every ${refreshTime / 1000} seconds.`);
    } else {
        removeAutoRefreshTimer();
    }
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

export function getBgPositionForCurrent(crtBgObj: tps.bgObj, bgObjCfg: tps.bgObjCfg) {
    // 0.5.0版本后数据结构重构，放弃直接修改crtBgObj的.offx offy
    // 因为需要考虑到不同的设备有不同的设置，而这个设置不应该同步
    // 所以使用存在local配置中的'bgObjCfg' -> [img.hash].offx offy来进行记录和控制
    let crtBgObjHash = crtBgObj?.hash ?? '';

    var offx: number = 50  // 默认居中
    var offy: number = 50
    if (crtBgObjHash in bgObjCfg) {
        offx = bgObjCfg[crtBgObjHash].offx
        offy = bgObjCfg[crtBgObjHash].offy
    }

    return [offx, offy]
}