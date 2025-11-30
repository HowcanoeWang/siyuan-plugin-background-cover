import { writable, get } from 'svelte/store';
import type BgCoverPlugin from '../index';

/**
 * 一个可写的 Svelte Store，用于在整个应用中持有和共享 BgCoverPlugin 的单例。
 * 初始值为 null，直到插件在 index.ts 中被实例化并设置它。
 */
export const pluginStore = writable<BgCoverPlugin | null>(null);

/**
 * 一个辅助函数，用于从任何地方安全地获取插件实例。
 * 它会检查实例是否已准备好，如果没有则抛出错误，防止在不当的时机调用。
 * @returns {BgCoverPlugin} 插件实例
 */
export function getPlugin(): BgCoverPlugin {
    const plugin = get(pluginStore);
    if (!plugin) {
        throw new Error(
            'BgCoverPlugin 实例尚未准备好。请确保相关方法在插件的 onload 方法被调用之后再执行。'
        );
    }
    return plugin;
}
