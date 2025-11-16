import { IObject } from 'siyuan';
import packageInfo from '../plugin.json'

declare global {
    interface Window {
        bgCoverPlugin: {
            i18n: IObject,
            isMobileLayout: boolean,
            isBrowser: boolean,
            isAndroid?: boolean,
        }
    }
}

export enum bgMode {
    image = 0,
    video = 1,
    live2d = 2,
}

export interface bgObj {
    name: string, path: string, hash: string,
    mode: bgMode, height: number, width: number,
}

export interface bgObjCfg {
    // key: bgObj.hash
    [key: string]: { offx: number, offy: number }
}

// fileidx, 用于跨设备间的同步记录图片库的信息
export interface fileIdx {
    // key: bgObj.hash
    [key: string]: bgObj;
}

export interface disabledThemeConfig {
    dark: { [key: string]: boolean },
    light: { [key:string]: boolean }
}

// 不进行云同步，当前设备的独有配置
export var defaultLocalConfigs = {
    'version': packageInfo.version as string,
    // 当前配置的背景图路径
    'crtBgObj': undefined as any,
    // 设置当前图片在当前设备下的独有配置，如位置xy等
    'bgObjCfg': {} as bgObjCfg,
    // 用于判断是否进行了背景更改
    'prevTheme': '' as string,
    // 启动时随机更改图片
    'autoRefresh': true as boolean,
    // 全局背景图透明度
    'opacity': 0.5 as number,
    // 全局背景图模糊度
    'blur': 5 as number,
    // 是否启用背景
    'activate': true as boolean,
    // 屏蔽背景
    'disabledTheme': {light:{}, dark:{}} as disabledThemeConfig,
    // 开发者模式
    'inDev': false as boolean,
}

export var defaultSyncConfigs = {
    'fileidx': {} as fileIdx,
}

export type localConfigKey = keyof typeof defaultLocalConfigs;
export type syncConfigKey = keyof typeof defaultSyncConfigs;

export type configKey = localConfigKey | syncConfigKey;