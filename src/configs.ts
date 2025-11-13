/**
 * Copyright (c) 2023 frostime. All rights reserved.
 * https://github.com/frostime/siyuan-dailynote-today/blob/main/src/global-status.ts
 */

import { Plugin } from 'siyuan';
import { info, debug, error} from './utils'
import * as tps from './types'
import * as cst from './constants'
import { KernelApi } from './siyuanAPI';

let ka = new KernelApi();

class configManager {
    plugin: Plugin;

    // saved locally to /data/storage/local.json by localStorage API
    localCfg: any = structuredClone(tps.defaultLocalConfigs);

    // saved publically to /data/publish/{plugin-name}/{cst.pluginFileIdx}
    // need cloud sync cross devices
    fileIdx: tps.fileIdx = {};

    setParent(plugin: Plugin) {
        this.plugin = plugin;
    }

    bgFileNum() {
        return Object.keys(this.fileIdx).length
    }

    bgFileHashKeys() {
        return Object.keys(this.fileIdx)
    }

    get(key?: tps.localConfigKey) {

        if (key === undefined) {
            // 返回全部数据
            return this.localCfg
        }
        if (!(key in this.localCfg)) {
            info(`存储键 "${key}" 不存在`);
            return null;
        }

        // 返回指定键值
        return this.localCfg?.[key];
    }

    getBgObj(hash_code: string) {
        if (!(hash_code in this.fileIdx)) {
            info(`存储键 "${hash_code}" 不存在`);
            return null;
        }

        // 返回指定键值
        return this.fileIdx?.[hash_code];
    }

    set(key: any, value: any) {
        // info(`Setting update: ${key} = ${value}`)
        if (!(key in this.localCfg)) {
            error(`"${key}" is not a setting`);
            return;
        }

        this.localCfg[key] = value;
    }

    setBgObj(hash_code: string, value: tps.bgObj) {
        // free to add to file_idx
        this.fileIdx[hash_code] = value;
    }

    // 移除键值对
    remove(key: any) {
        if (!(key in this.localCfg)) {
            error(`"${key}" is not a setting`);
            return;
        }

        delete this.localCfg[key];
    }

    removeBgObj(hash_code: string) {

        if (!(hash_code in this.fileIdx)) {
            error(`"${hash_code}" not exists`);
            return;
        }

        delete this.fileIdx[hash_code];
    }

    async reset() {
        this.localCfg = structuredClone(tps.defaultLocalConfigs);
        this.fileIdx = {};
        this.save();
    }

    /**
     * 导入的时候，需要先加载设置；如果没有设置，则使用默认设置
     */
    async load() {
        this._loadFileIdx();
        this._loadLocalCfg();
    }

    async _loadLocalCfg() {
        debug(`[configs][_loadLocalCfg] 读取localStorage中的插件配置信息`)
        let loaded = await ka.getLocalStorage(cst.localStorageKey);

        if (loaded == null || loaded == undefined || loaded == '') {
            debug(`localStorage中没有插件配置信息，使用默认配置并保存`)
            this._saveLocalCfg('[configs][localStorage init config]');
        } else {
            //如果有配置文件，则使用配置文件
            debug(`读入localStorage配置 siyuan.storage[${cst.localStorageKey}]`)
            // Docker 和  Windows 不知为何行为不一致, 一个读入字符串，一个读入对象
            // 为了兼容，这里做一下判断
            if (typeof loaded === 'string') {
                loaded = JSON.parse(loaded);
            }

            try {
                for (let key in loaded) {
                    if (key in tps.defaultLocalConfigs) {
                        this.set(key, loaded[key]);
                    }
                }
                debug(`   localStorage配置 读取成功`)
            } catch (error_msg) {
                error(`   localStorage配置 读取失败: ${error_msg}`);
            }
        }
    }

    async _loadFileIdx() {
        debug(`[configs][_loadFileIdx] 读取 /data/publish/插件目录/ 中的背景文件索引信息`)
        let loaded = await ka.getFile(cst.pluginFileIdxFile, "json" )

        if (loaded == null || loaded == undefined || loaded == '') {
            //如果没有配置文件，则使用默认配置，并保存
            debug(`/data/publish/插件目录/ 中没有fileidx.json 配置文件，使用默认配置`)
            this._saveFileIdx('[configs][fileidx.json init config]');
        } else {
            //如果有配置文件，则使用配置文件
            debug(`读入 ${cst.pluginFileIdxFile} 配置文件`)
            //Docker 和  Windows 不知为何行为不一致, 一个读入字符串，一个读入对象
            //为了兼容，这里做一下判断
            if (typeof loaded === 'string') {
                loaded = JSON.parse(loaded);
            }

            try {
                for (let key in loaded) {
                    if (key in tps.defaultLocalConfigs) {
                        this.setBgObj(key, loaded[key]);
                    }
                }
                debug(`   fileidx.json 配置文件读取成功`)
            } catch (error_msg) {
                error(`   fileidx.json 配置文件读取失败: ${error_msg}`);
            }
        }
    }

    async save(logHeader?:String) {
        this._saveLocalCfg(logHeader);
        this._saveFileIdx(logHeader);
    }

    async _saveLocalCfg(logHeader?:String) {
        let json = this.localCfg;
        if (logHeader) {
            debug(`${logHeader}写入配置文件:`, json);
        } else {
            debug(`写入配置文件:`, json);
        }
        
        // this.plugin.saveData(cst.configFile, json);
        await ka.setLocalStorage(cst.localStorageKey, json);
    }

    async _saveFileIdx(logHeader?:String) {
        let json = this.fileIdx;
        if (logHeader) {
            debug(`${logHeader}写入配置文件:`, json);
        } else {
            debug(`写入配置文件:`, json);
        }
        
        await ka.putFile(cst.pluginFileIdxFile, json);
    }
}

export const configs: configManager = new configManager();