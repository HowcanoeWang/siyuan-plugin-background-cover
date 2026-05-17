import { fetchPost } from "siyuan"
import { packageName } from "../constants"
import type { AppConfig } from "../types"

const STORAGE_KEY = packageName

const APP_CONFIG_DEFAULTS: AppConfig = {
    activate: true,
    opacity: 0.5,
    blur: 5,
    positionX: 50,
    positionY: 50,
    localFolders: [],
    assetDirs: [],
    changeBgOnStart: true,
    autoRefreshTime: 30,
    disabledThemes: { dark: [], light: [] },
    imageOverrides: {},
    currentFile: null,
    inDev: false,
}

function post<T = any>(url: string, data?: any): Promise<T> {
    return new Promise((resolve, reject) => {
        fetchPost(url, data ?? {}, (response: any) => {
            if (response.code === 0) {
                resolve(response.data)
            } else {
                reject(new Error(response.msg ?? "fetchPost failed"))
            }
        })
    })
}

class ConfigStore {
    private cfg: AppConfig = { ...APP_CONFIG_DEFAULTS }
    private dirty = false
    private ready = false

    async load(): Promise<void> {
        if (this.ready) return

        let stored: any = (window as any).siyuan?.storage?.[STORAGE_KEY]

        if (stored === undefined || stored === null) {
            try {
                const all = await post<Record<string, any>>("/api/storage/getLocalStorage")
                stored = all?.[STORAGE_KEY] ?? {}
            } catch {
                stored = {}
            }
        }

        this.cfg = { ...APP_CONFIG_DEFAULTS, ...stored }
        this.ready = true
    }

    async save(): Promise<void> {
        if (!this.dirty || !this.ready) return

        await post("/api/storage/setLocalStorageVal", {
            key: STORAGE_KEY,
            val: this.cfg,
        })
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

    async reset(): Promise<void> {
        this.cfg = { ...APP_CONFIG_DEFAULTS }
        this.dirty = true
        await this.save()

        try {
            await post("/api/storage/removeLocalStorageVals", {
                keys: [STORAGE_KEY],
            })
        } catch { /* ignore */ }

        try {
            await post("/api/file/removeFile", {
                path: `/data/storage/petal/${STORAGE_KEY}/configs.json`,
            })
        } catch { /* ignore */ }

        await this._cleanPublicDir()
    }

    checkOldConfig(): { hasOld: boolean; path: string } {
        const stored = (window as any).siyuan?.storage?.[STORAGE_KEY] ?? {}
        const hasOld = stored.crtBgObj !== undefined
                    || stored.bgObjCfg !== undefined
                    || stored.fileidx !== undefined
                    || stored.prevTheme !== undefined
        const wsDir = (window as any).siyuan?.config?.system?.workspaceDir ?? ''
        return {
            hasOld,
            path: `${wsDir}/data/storage/petal/${STORAGE_KEY}/`,
        }
    }

    private async _cleanPublicDir(): Promise<void> {
        try {
            const files = await post<any[]>("/api/file/readDir", {
                path: `/data/public/${STORAGE_KEY}/`,
            })
            if (!Array.isArray(files)) return
            for (const file of files) {
                if (file.isDir) continue
                try {
                    await post("/api/file/removeFile", {
                        path: `/data/public/${STORAGE_KEY}/${file.name}`,
                    })
                } catch { /* ignore */ }
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
