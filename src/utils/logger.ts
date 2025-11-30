import { get } from 'svelte/store';
import { configStore } from '@/services/configStore';

function getTimestamp(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    return `[${hours}:${minutes}:${seconds}.${milliseconds}]`;
}

// simple logging functions
export function info(...msg: any[]): void {
    console.log(`[BgCover Plugin]${getTimestamp()} [INFO]`, ...msg);
}

export function debug(...msg: any[]): void {
    const currentConfig = get(configStore);

    if (currentConfig.inDev)  {
        console.log(`[BgCover Plugin]${getTimestamp()}[DEBUG]`, ...msg);
    }
}

export function error(...msg: any[]): void {
    console.error(`[BgCover Plugin]${getTimestamp()}[ERROR]`, ...msg);
}

export function warn(...msg: any[]): void {
    console.warn(`[BgCover Plugin]${getTimestamp()} [WARN]`, ...msg);
}