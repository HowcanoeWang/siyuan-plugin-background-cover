import { packageName } from "../constants"
import { devDebug, devLog } from "../utils/logger"
import { getLocalStorage, setLocalStorageVal, removeLocalStorageVals, readDirItems, removeFile } from "../utils/api"
import type { AppConfig } from "../types"

const STORAGE_KEY = packageName

const APP_CONFIG_DEFAULTS: AppConfig = {
    activate: true,
    opacity: 0.5,
    blur: 5,
    localFolders: [],
    assetDirs: [],
    dynamicBgUrls: [],
    customDynamicUrls: [],
    changeBgOnStart: true,
    autoRefreshTime: 30,
    disabledThemes: { dark: [], light: [] },
    imageOverrides: {},
    currentFile: null,
    inDev: false,
}

class ConfigStore {
    private cfg: AppConfig = { ...APP_CONFIG_DEFAULTS }
    private dirty = false
    private ready = false

    async load(): Promise<void> {
        if (this.ready) return

        let stored: any = (window as any).siyuan?.storage?.[STORAGE_KEY]

        if (stored === undefined || stored === null) {
            const all = await getLocalStorage()
            stored = all?.[STORAGE_KEY] ?? {}
        }

        this.cfg = { ...APP_CONFIG_DEFAULTS, ...stored }

        const raw = this.cfg as any
        if (raw.positionX !== undefined || raw.positionY !== undefined) {
            const currentFile = raw.currentFile
            if (currentFile && !raw.imageOverrides[currentFile]) {
                raw.imageOverrides[currentFile] = {
                    positionX: raw.positionX ?? 50,
                    positionY: raw.positionY ?? 50,
                }
            }
            delete raw.positionX
            delete raw.positionY
            this.dirty = true
        }

        devLog("[bgCover] config loaded, keys:", Object.keys(this.cfg))
        this.ready = true
    }

    async save(): Promise<void> {
        if (!this.dirty || !this.ready) return
        devLog("[bgCover] config save")
        await setLocalStorageVal(STORAGE_KEY, this.cfg)
        this.dirty = false
    }

    get<K extends keyof AppConfig>(key: K): AppConfig[K] {
        return this.cfg[key]
    }

    set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
        this.cfg[key] = value
        this.dirty = true
    }

    async setAndSave<K extends keyof AppConfig>(key: K, value: AppConfig[K]): Promise<void> {
        this.set(key, value)
        await this.save()
    }

    snapshot(): Readonly<AppConfig> {
        return { ...this.cfg }
    }

    isLocalPath(path: string): boolean {
        return this.cfg.localFolders.some(f => path.startsWith(f))
    }

    async reset(): Promise<void> {
        console.log("[bgCover] config reset to defaults")
        this.cfg = { ...APP_CONFIG_DEFAULTS }
        this.dirty = true
        await this.save()

        try {
            await removeLocalStorageVals([STORAGE_KEY])
        } catch { /* ignore */ }

        try {
            await removeFile(`/data/storage/petal/${STORAGE_KEY}/configs.json`)
        } catch { /* ignore */ }

        await this.cleanPublicDir()
    }

    async cleanOldConfigIfNeeded(): Promise<void> {
        const stored = (window as any).siyuan?.storage?.[STORAGE_KEY]
        if (stored?.crtBgObj !== undefined || stored?.bgObjCfg !== undefined) {
            console.log("[bgCover] 检测到旧版配置 (siyuan.storage)，自动重置为默认")
            await removeLocalStorageVals([STORAGE_KEY])
            this.cfg = { ...APP_CONFIG_DEFAULTS }
            return
        }

        try {
            const files = await readDirItems(`/data/storage/petal/${STORAGE_KEY}/`)
            if (Array.isArray(files) && files.length > 0) {
                console.log("[bgCover] 检测到旧版 petal 数据，自动清理")
                await removeFile(`/data/storage/petal/${STORAGE_KEY}/`)
            }
        } catch {
            devDebug("[bgCover] cleanOldConfigIfNeeded: petal dir not found")
        }
    }

    private async cleanPublicDir(): Promise<void> {
        try {
            const files = await readDirItems(`/data/public/${STORAGE_KEY}/`)
            if (!Array.isArray(files)) return
            for (const file of files) {
                if (file.isDir) continue
                await removeFile(`/data/public/${STORAGE_KEY}/${file.name}`).catch(() => {})
            }
        } catch { /* ignore */ }
    }

    _resetForTest(): void {
        this.cfg = { ...APP_CONFIG_DEFAULTS }
        this.dirty = false
        this.ready = false
    }
}

export const configStore = new ConfigStore()
