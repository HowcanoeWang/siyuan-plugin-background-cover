export function info(...msg: any[]): void {
    console.log(`[BgCover Plugin][INFO] ${msg}`);
}

export function error(...msg: any[]): void {
    console.error(`[BgCover][ERROR] ${msg}`);
}

export function warn(...msg: any[]): void {
    console.warn(`[BgCover][WARN] ${msg}`);
}