import { configStore } from "../stores/config"

function isDev(): boolean {
    try { return configStore.get("inDev") } catch { return false }
}

export function debug(...args: any[]): void {
    if (isDev()) console.debug(...args)
}

export function log(...args: any[]): void {
    if (isDev()) console.log(...args)
}
