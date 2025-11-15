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
    offx: number, offy: number,
}

export interface bgCfg {
    // key: bgObj.hash
    [key: string]: { offx: number, offy: number }
}

// previous fileidx
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
    // 当前配置的背景图路径
    'crtBgObj': undefined as any,
    'prevTheme': '' as string,
    
};

export var defaultSyncConfigs = {
    'version': packageInfo.version as string,
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

export type localConfigKey = keyof typeof defaultLocalConfigs;
