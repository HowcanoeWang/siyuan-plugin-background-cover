/**
 * Copyright (c) 2023 frostime. All rights reserved.
 * https://github.com/frostime/siyuan-dailynote-today/blob/main/src/global-status.ts
 */

import { Plugin } from 'siyuan';
import { info, debug, error} from '../utils/logger'
import * as tps from './types'
import * as cst from './constants'
import { KernelApi } from '../utils/api';

let ka = new KernelApi();

class configManager {
    plugin: Plugin;

    // 缓存被修改的key，用于按需保存
    changedKeys: Set<tps.configKey> = new Set();

    // saved locally to /data/storage/local.json by localStorage API
    // 支持不同设备之间的不同配置
    localCfg: any = structuredClone(tps.defaultLocalConfigs);

    // saved publically to /data/publish/{plugin-name}/{cst.pluginFileIdx}
    // 存储用户上传的public中的数据库文件
    // 用于数据重建和索引
    syncCfg: any = structuredClone(tps.defaultSyncConfigs);

    // 虽然这边分成了LocalConfig和SyncConfig，存储到不同的图片路径下
    // 但是希望这个configManger的api, 能提供一个良好且无感的读写体验
    // 直接设置config['key']的值，自动处理保存为local还是sync

    setParent(plugin: Plugin) {
        this.plugin = plugin;
    }

    get(key?: tps.configKey) {

        // 没有指定Key的值ID，如简单的 .get() 则返回全部数据
        // if (key === undefined) {
        //     return this.localCfg
        // }

        if (key in this.localCfg) {
            return this.localCfg?.[key];
        } else if (key in this.syncCfg) {
            return this.syncCfg?.[key];
        } else {
            info(`存储键 "${key}" 不存在`);
            return null;
        }
    }

    set(key: any, value: any) {
        if (key in this.localCfg) {
            this.localCfg[key] = value;
            this.changedKeys.add(key);
        } else if (key in this.syncCfg) {
            this.syncCfg[key] = value;
            this.changedKeys.add(key);
        } else {
            info(`存储键 "${key}" 不存在于默认配置中`);
        }
    }

    // 移除键值对
    remove(key: any) {
        if (key in this.localCfg) {
            delete this.localCfg[key];
            this.changedKeys.add(key);
        } else if (key in this.syncCfg) {
            delete this.syncCfg[key];
            this.changedKeys.add(key);
        } else {
            info(`存储键 "${key}" 不存在于默认配置中`);
        }   
    }

    async reset() {
        this.localCfg = structuredClone(tps.defaultLocalConfigs);
        this.syncCfg = structuredClone(tps.defaultSyncConfigs);
        // 重置后，所有key都视为已更改，需要全部保存
        Object.keys(tps.defaultLocalConfigs).forEach(k => this.changedKeys.add(k as tps.configKey));
        Object.keys(tps.defaultSyncConfigs).forEach(k => this.changedKeys.add(k as tps.configKey));
        await this.save('[configs][reset]');
    }

    /**
     * 导入的时候，需要先加载设置；如果没有设置，则使用默认设置
     */
    async load() {
        await this._loadLocalCfg();
        await this._loadSyncCfg();
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
                debug(`   localStorage配置 读取成功: `, loaded)
            } catch (error_msg) {
                error(`   localStorage配置 读取失败: ${error_msg}`);
            }
        }
    }

    async _loadSyncCfg() {
        debug(`[configs][_loadFileIdx] 读取 /data/publish/插件目录/ 中的背景文件索引信息`)
        let loaded = await this.plugin.loadData(cst.synConfigFile)
        debug(` synconfig.json 原始读取数据：`, loaded)

        if (loaded == null || loaded == undefined || loaded == '') {
            //如果没有配置文件，则使用默认配置，并保存
            debug(`/data/publish/插件目录/ 中没有 synconfig.json 配置文件，使用默认配置`)
            this._saveSyncCfg('[configs][synconfig.json init to default]');
        } else {
            //如果有配置文件，则使用配置文件
            debug(`读入 ${cst.synConfigFile} 配置文件`)
            //Docker 和  Windows 不知为何行为不一致, 一个读入字符串，一个读入对象
            //为了兼容，这里做一下判断
            if (typeof loaded === 'string') {
                loaded = JSON.parse(loaded);
            }

            try {
                for (let key in loaded) {
                    if (key in tps.defaultSyncConfigs) {
                        this.set(key, loaded[key]);
                    }
                }
                debug(`   synconfig.json 配置文件读取成功: `, loaded)
            } catch (error_msg) {
                error(`   synconfig.json 配置文件读取失败: ${error_msg}`);
            }
        }
    }

    async save(logHeader?: string) {
        if (this.changedKeys.size === 0) {
            debug(`${logHeader} No configuration changes, skipping save.`);
            return;
        }

        let needsLocalSave = false;
        let needsSyncSave = false;

        for (const key of this.changedKeys) {
            if (key in tps.defaultLocalConfigs) needsLocalSave = true;
            if (key in tps.defaultSyncConfigs) needsSyncSave = true;
        }

        if (needsLocalSave) {
            await this._saveLocalCfg(logHeader);
        }
        if (needsSyncSave) {
            await this._saveSyncCfg(logHeader);
        }

        // 保存完成后，清空变更记录
        this.changedKeys.clear();
    }

    async _saveLocalCfg(logHeader?:String) {
        let json = this.localCfg;
        if (logHeader) {
            debug(`${logHeader}写入Local配置文件:`, json);
        } else {
            debug(`写入Local配置文件:`, json);
        }
        
        await ka.setLocalStorage(cst.localStorageKey, json);
    }

    async _saveSyncCfg(logHeader?:String) {
        let json = this.syncCfg;
        if (logHeader) {
            debug(`${logHeader}写入Sync配置文件${cst.synConfigFile}:`, json);
        } else {
            debug(`写入Sync配置文件${cst.synConfigFile}:`, json);
        }
        
        this.plugin.saveData(cst.synConfigFile, json);

    }
}

export const confmngr: configManager = new configManager();