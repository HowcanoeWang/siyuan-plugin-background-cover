import { configStore } from "../stores/config"

function isDev(): boolean {
    try { return configStore.get("inDev") } catch { return false }
}

export function devDebug(...args: any[]): void {
    if (isDev()) console.debug(...args)
}

export function devLog(...args: any[]): void {
    if (isDev()) console.log(...args)
}
