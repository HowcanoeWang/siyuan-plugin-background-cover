import packageInfo from '../plugin.json'

export enum bgMode {
    image = 0,
    live2d = 1,
}

export var bgObj: {name:string, path:string, hash:string, mode: v.bgMode}

export const pluginAssetsDir = `/data/plugins/${packageInfo.name}/assets`
export const pluginImgDataDir = `${pluginAssetsDir}/images`.toString()
export const pluginLive2DataDir = `${pluginAssetsDir}/live2d`.toString()

export let pluginAssetsDirOS = ''
let dataDir = (window as any).siyuan.config.system.workspaceDir
if ((window as any).siyuan.config.system.os === 'windows'){
    dataDir = dataDir.replaceAll('\\', '/')
    pluginAssetsDirOS = `${dataDir}${pluginAssetsDir}`
}else{
    pluginAssetsDirOS = `${dataDir}${pluginAssetsDir}`
}

// 需要针对下面的主题进行适配
export const toAdaptThemes = {
    "Savor": {
        // element id : [LightMode color, Darkmode Color]
        "toolbar": [`rgb(247, 246, 243)`, `rgb(55, 60, 63)`]
    }
}

export const SettingFile = 'bg-cover-setting.json';

export type SettingKey = (
    'autoRefresh' |'opacity' | 'activate' | 'bgObj' |
    'version' | 'prevTheme' | 'fileidx'
);

export const demoImgURL = 'https://cdn.jsdelivr.net/gh/HowcanoeWang/siyuan-plugin-background-cover/static/FyBE0bUakAELfeF.jpg'

export const defaultSettings = {
    // 启动时随机更改图片
    'autoRefresh': true as boolean,
    // 当前配置的背景图路径
    'bgObj': bgObj,
    // 当前配置的背景图透明度
    'opacity': 0.2 as number,
    // 图片类型 1:本地文件，2：https
    'activate': false as boolean,
    'prevTheme': '' as string,
    'fileidx': {} as object,
    'version': packageInfo.version as string
};