/**
 * Copyright (c) 2023 frostime. All rights reserved.
 * https://github.com/frostime/siyuan-dailynote-today/blob/main/src/global-status.ts
 */

import { Plugin } from 'siyuan';
import { info, error } from './utils'
import * as v from './constants'
import packageInfo from '../plugin.json'

class SettingManager {
    plugin: Plugin;

    settings: any = structuredClone(v.defaultSettings);

    setPlugin(plugin: Plugin) {
        this.plugin = plugin;
    }

    get(key: v.SettingKey) {
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
        this.settings = structuredClone(v.defaultSettings);
        this.save();
    }

    /**
     * 导入的时候，需要先加载设置；如果没有设置，则使用默认设置
     */
    async load() {
        let loaded = await this.plugin.loadData(v.SettingFile);
        if (loaded == null || loaded == undefined || loaded == '') {
            //如果没有配置文件，则使用默认配置，并保存
            info(`没有配置文件，使用默认配置`)
            this.save();
        } else {
            //如果有配置文件，则使用配置文件
            info(`读入配置文件: ${v.SettingFile}`)
            info(loaded);
            //Docker 和  Windows 不知为何行为不一致, 一个读入字符串，一个读入对象
            //为了兼容，这里做一下判断
            if (typeof loaded === 'string') {
                loaded = JSON.parse(loaded);
            }
            // 如果读取的配置文件版本比默认的版本低 或者 版本号不存在
            // const cfg_version = this.get('version')
            // let need_update = false
            // if (cfg_version == null || cfg_version == undefined || cfg_version == '' || cfg_version < defaultSettings.version) {
            //     need_update = true
            // }
            try {
                for (let key in loaded) {
                    if (key === 'version'){
                        continue
                    }

                    if (key in v.defaultSettings && typeof v.defaultSettings[key] === typeof loaded[key]) {
                        this.set(key, loaded[key]);
                    }
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
        this.plugin.saveData(v.SettingFile, json);
    }
}

export const settings: SettingManager = new SettingManager();