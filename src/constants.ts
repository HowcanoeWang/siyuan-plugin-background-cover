import packageInfo from '../plugin.json'

export enum bgMode {
    image = 0,
    live2d = 1,
}

export var bgObj: {name:string, path:string, hash:string, mode: bgMode}

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
interface toAdaptThemes {
    [key: string]: {
        [key: string]: string[]
    }
}

export const toAdaptThemes: toAdaptThemes = {
    "Savor": {
        // element id : [LightMode color, Darkmode Color]
        // ${opacity} is the weighted transparency
        // ${alpha} is not weighted transparency
        // This varalbes will automatically adjust to transparency settings later
        "toolbar":    ['rgba(237, 236, 233, ${opacity})', 'rgba(65, 70, 72, ${opacity})'],
        "dockBottom": ['rgba(255, 255, 255, 0)',          'rgba(255, 255, 255, 0)'],
        "status":     ['rgba(255, 255, 255, 0)',          'rgba(255, 255, 255, 0)']
    },
    "Rem Craft": {
        "layouts":    ['rgb(247, 248, 250)',    'rgb(30, 34, 39)'],
        "toolbar":    ['rgb(247, 248, 250)',    'rgb(30, 34, 39)'],
        "dockLeft":   ['rgb(247, 248, 250)',    'rgb(30, 34, 39)'],
        "dockRight":  ['rgb(247, 248, 250)',    'rgb(30, 34, 39)'],
        "dockBottom": ['rgb(247, 248, 250)',    'rgb(30, 34, 39)'],
        "status":     ['rgba(255, 255, 255, 0)','rgba(255, 255, 255, 0)'],
    },
    "mini-vlook": {
        "status":     ['rgba(255, 255, 255, 0)','rgba(255, 255, 255, 0)']
    },
    "Dark+": {
        "layouts":    ['rgba(238, 238, 238, ${0.3/opacity})', 'rgba(17, 17, 17, ${0.3/opacity})'],
    },
    "Light-Blue": {
        // Only light theme
        "layouts":    ['rgba(255, 255, 255, ${0.7/opacity})', ''],
        "toolbar":    ['rgba(255, 255, 255, ${0.7})',           ''],
        "dockLeft":   ['rgba(255, 255, 255, ${0.7})',           ''],
        "dockRight":  ['rgba(255, 255, 255, ${0.7})',           ''],
        "dockBottom": ['rgba(255, 255, 255, ${0.7})',           ''],
        "status":     ['rgba(255, 255, 255, ${0.7})',           '']
    },
    "Dark-Blue": {
        // only dark theme
        "layouts":    ['', 'rgba(30, 34, 39, ${0.7/opacity})'],
        "toolbar":    ['', 'rgba(30, 34, 39, ${0.7})'],
        "dockLeft":   ['', 'rgba(30, 34, 39, ${0.7})'],
        "dockRight":  ['', 'rgba(30, 34, 39, ${0.7})'],
        "dockBottom": ['', 'rgba(30, 34, 39, ${0.7})'],
        "status":     ['', 'rgba(30, 34, 39, ${0.7})']
    },
    "Odyssey": {
        // only light theme
        "layouts":    ['rgba(220, 228, 220, ${0.7/opacity})', ''],
        "toolbar":    ['rgba(220, 228, 220, ${0.7})', ''],
        "dockLeft":   ['rgba(220, 228, 220, ${0.7})', ''],
        "dockRight":  ['rgba(220, 228, 220, ${0.7})', ''],
        "dockBottom": ['rgba(220, 228, 220, ${0.7})', ''],
        "status":     ['rgba(220, 228, 220, ${0.7})', '']
    },
    "StarDust": {
        // only dark theme
        "toolbar":    ['', 'rgb(29, 70, 94)'],
        "dockLeft":   ['', 'rgb(29, 70, 94)'],
        "dockRight":  ['', 'rgb(29, 70, 94)'],
        "dockBottom": ['', 'rgb(29, 70, 94)'],
        "layouts":    ['', 'rgb(29, 70, 94)'],
        "status":     ['', 'rgb(29, 70, 94)']
    }
}

export const SettingFile = 'bg-cover-setting.json';

export type SettingKey = (
    'autoRefresh' |'opacity' | 'blur' | 'activate' | 'bgObj' |
    'version' | 'prevTheme' | 'fileidx' | 'inDev'
);

export const demoImgURL = 'https://cdn.jsdelivr.net/gh/HowcanoeWang/siyuan-plugin-background-cover/static/FyBE0bUakAELfeF.jpg'

export const defaultSettings = {
    // 启动时随机更改图片
    'autoRefresh': true as boolean,
    // 当前配置的背景图路径
    'bgObj': undefined as any,
    // 当前配置的背景图透明度
    'opacity': 0.5 as number,
    'blur': 0 as number,
    // 图片类型 1:本地文件，2：https
    'activate': true as boolean,
    'prevTheme': '' as string,
    'fileidx': {} as object,
    'version': packageInfo.version as string,
    'inDev': false as boolean
};

export const diyIcon = {
    iconLogo: `<symbol id="iconLogo" viewBox="0 0 32 32">
    <path d="M26 28h-20v-4l6-10 8.219 10 5.781-4v8z"></path>
    <path d="M26 15c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3c1.657 0 3 1.343 3 3z"></path>
    <path d="M28.681 7.159c-0.694-0.947-1.662-2.053-2.724-3.116s-2.169-2.030-3.116-2.724c-1.612-1.182-2.393-1.319-2.841-1.319h-15.5c-1.378 0-2.5 1.121-2.5 2.5v27c0 1.378 1.122 2.5 2.5 2.5h23c1.378 0 2.5-1.122 2.5-2.5v-19.5c0-0.448-0.137-1.23-1.319-2.841zM24.543 5.457c0.959 0.959 1.712 1.825 2.268 2.543h-4.811v-4.811c0.718 0.556 1.584 1.309 2.543 2.268zM28 29.5c0 0.271-0.229 0.5-0.5 0.5h-23c-0.271 0-0.5-0.229-0.5-0.5v-27c0-0.271 0.229-0.5 0.5-0.5 0 0 15.499-0 15.5 0v7c0 0.552 0.448 1 1 1h7v19.5z"></path>
    </symbol>`
}