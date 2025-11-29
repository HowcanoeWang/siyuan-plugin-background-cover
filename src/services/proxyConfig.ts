// 需要一个简单的机制，让 UI 组件可以“订阅”某个配置项的变化。当该配置项变化时，所有订阅者都会被通知
// 不使用任何框架，纯vallinea实现

import * as tps from "../types";

import { confmngr } from '../utils/configs';

// 用来存储每个配置项的回调函数列表
const listeners = new Map<string, Set<() => void>>();

/**
 * 订阅一个配置项的变化
 * @param key 配置项的名称 (e.g., 'opacity')
 * @param callback 当值变化时要执行的回调函数
 */
export function onConfigChange(key: string, callback: () => void) {
    if (!listeners.has(key)) {
        listeners.set(key, new Set());
    }
    listeners.get(key)!.add(callback);
}

/**
 * 通知所有订阅者某个配置项已发生变化
 * @param key 发生变化的配置项名称
 */
function notify(key: string) {
    listeners.get(key)?.forEach(callback => callback());
}

// 处理器（Handler）是一个对象，它的方法定义了代理在执行操作时的自定义行为。我们主要关心 get 和 set。
const configProxyHandler: ProxyHandler<any> = {
    /**
     * 拦截读取属性的操作
     * 例如: reactiveConfig.opacity
     */
    get(target, key: tps.configKey) {
        // 从原始的 confmngr 获取值
        return confmngr.get(key);
    },

    /**
     * 拦截设置属性的操作
     * 例如: reactiveConfig.opacity = 0.5
     */
    set(target, key: tps.configKey, value: any) {
        // 1. 调用原始的 confmngr.set 来更新内部状态和准备保存
        confmngr.set(key, value);

        // 2. 触发通知，告诉所有订阅者这个值变了
        notify(key);

        // 3. （可选）可以触发一个异步的保存操作
        // confmngr.save(...) 可以在这里被调用，或者在一个更集中的地方处理
        confmngr.save(`[Proxy Set] ${key}`);

        return true; // 表示设置成功
    }
};

// 创建一个代理实例
// 目标对象 {} 是空的，因为所有逻辑都在 handler 和原始的 confmngr 中
export const reactiveConfig = new Proxy({}, configProxyHandler);