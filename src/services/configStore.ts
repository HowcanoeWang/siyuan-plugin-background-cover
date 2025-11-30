// src/services/configStore.ts

import { writable } from 'svelte/store';
import { confmngr } from '@/utils/configs';
import * as tps from '@/utils/types';

import BgCoverPlugin from '../index';

function createConfigStore( ) {
    // 1. 初始化：合并 local 和 sync 的默认配置作为初始状态
    const initialState = {
        ...tps.defaultLocalConfigs,
        ...tps.defaultSyncConfigs
    };

    // 2. 创建一个 Svelte 5 的可写 store ($state 在 .svelte 文件外等价于 writable)
    const store = writable(initialState);
    let loaded = false; // 加载状态标志，防止初始化时触发保存

    // 3. 封装加载逻辑
    async function load() {
        await confmngr.load(); // 复用现有的加载逻辑
        const newConfig = { ...confmngr.localCfg, ...confmngr.syncCfg };
        store.set(newConfig);
        loaded = true;
        console.log('Configuration loaded and store initialized.');
    }

    // 4. 订阅变化并自动保存
    store.subscribe(currentConfig => {
        // 仅在配置加载完毕后才响应变化，避免初始写入时就保存
        if (!loaded) {
            return;
        }

        // 遍历当前配置的每个 key
        for (const key in currentConfig) {
            // 使用 confmngr.set 来更新内部状态并记录变更
            // confmngr.set 内部会判断 key 属于 local 还是 sync
            // 这一步是为了利用 confmngr 中已有的 changedKeys 逻辑
            confmngr.set(key, currentConfig[key]);
        }

        // 触发保存，confmngr.save 会根据 changedKeys 按需保存
        confmngr.save('[Svelte Store Auto-Save]');
    });

    // 5. 返回 Store 接口
    return {
        subscribe: store.subscribe,
        // 如果需要，可以暴露 set 和 update 方法
        // set: store.set,
        // update: store.update,
        // 暴露 load 方法，在应用启动时调用
        load
    };
}

// 6. 创建并导出 store 实例
export const configStore = createConfigStore();
