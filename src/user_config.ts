/**
 * Copyright (c) 2023 frostime. All rights reserved.
 * https://github.com/frostime/siyuan-dailynote-today/blob/main/src/global-status.ts
 */

import { Plugin } from 'siyuan';
import { info, error } from './utils'

type SettingKey = (
    'autoRefresh' | 'imgPath' | 'opacity' |
    'imageFileType' | "imgDir" | 'activate'
);

// interface Item {
//     key: SettingKey,
//     value: any
// }

const SettingFile = 'bg-cover-setting.json';

const defaultSettings = {
    // 启动时随机更改图片
    autoRefresh: true as boolean,
    // 当前配置的背景图路径
    imgPath: 'https://cdn.jsdelivr.net/gh/HowcanoeWang/siyuan-plugin-background-cover/static/FyBE0bUakAELfeF.jpg' as string,
    // 当前配置的背景图透明度
    opacity: 0.2 as number,
    // 图片类型 1:本地文件，2：https
    imageFileType: 0 as number,
    // 图片路径
    imgDir: '' as string,
    activate: false as boolean
};

class SettingManager {
    plugin: Plugin;

    settings: any = structuredClone(defaultSettings);

    // constructor() {
    //     eventBus.subscribe(eventBus.EventSetting, (data: Item) => {
    //         this.set(data.key, data.value);
    //         this.save();
    //     });
    // }

    setPlugin(plugin: Plugin) {
        this.plugin = plugin;
    }

    get(key: SettingKey) {
        return this.settings?.[key];
    }

    set(key: any, value: any) {
        // info(`Setting update: ${key} = ${value}`)
        if (!(key in this.settings)) {
            error(`"${key}" is not a setting`);
            return;
        }

        this.settings[key] = value;
    }

    async reset() {
        this.settings = structuredClone(defaultSettings);
        this.save();
    }

    /**
     * 导入的时候，需要先加载设置；如果没有设置，则使用默认设置
     */
    async load() {
        let loaded = await this.plugin.loadData(SettingFile);
        if (loaded == null || loaded == undefined || loaded == '') {
            //如果没有配置文件，则使用默认配置，并保存
            info(`没有配置文件，使用默认配置`)
            this.save();
        } else {
            //如果有配置文件，则使用配置文件
            info(`读入配置文件: ${SettingFile}`)
            info(loaded);
            //Docker 和  Windows 不知为何行为不一致, 一个读入字符串，一个读入对象
            //为了兼容，这里做一下判断
            if (typeof loaded === 'string') {
                loaded = JSON.parse(loaded);
            }
            try {
                for (let key in loaded) {
                    this.set(key, loaded[key]);
                }
            } catch (error_msg) {
                error(`Setting load error: ${error_msg}`);
            }
            this.save();
        }
        // eventBus.publish(eventBus.EventSettingLoaded, {});
    }

    async save() {
        let json = JSON.stringify(this.settings);
        info(`写入配置文件: ${json}`);
        this.plugin.saveData(SettingFile, json);
    }
}

export const settings: SettingManager = new SettingManager();