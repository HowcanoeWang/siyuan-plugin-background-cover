# Phase 2：存储改造 执行计划

## 1. 目标

将全部配置迁移到 `local.json` 单层键值存储，使用 PR #17482 新增的 `setLocalStorageVal` / `removeLocalStorageVals` API，废弃旧版 `setLocalStorage`（整文件覆写）、`plugin.saveData()` / `plugin.loadData()`，移除 `syncCfg` 双轨存储架构。

## 2. 变更文件清单

### 2.1 新建文件

| 文件 | 说明 |
|------|------|
| `src/stores/config.ts` | ConfigStore 单例，全部配置的 CRUD、复位、迁移 |

### 2.2 修改文件

| 文件 | 变更内容 |
|------|---------|
| `src/index.ts` | `onload()` 中移除 `confmngr.setParent(this)` / `confmngr.load()` 等旧初始化代码，改为 `ConfigStore.load()` |
| `src/index.ts` | `onunload()` / `onLayoutReady()` 中所有 `confmngr` 引用替换为 `configStore` |
| `src/utils/api.ts` | 移除 `getLocalStorage()` / `setLocalStorage()` 两个废弃 API 方法（第 292-338 行）；保留 `readDir` / `putFile` / `removeFile` 等文件操作 |
| `src/utils/configs.ts` | **删除整个文件**，功能已由 `stores/config.ts` 替代 |
| `src/constants.ts` | 移除 `synConfigFile`、`pluginAssetsId` 等旧常量；保留 `packageName`、`pluginAssetsDir` |

### 2.3 删除文件

| 文件 | 原因 |
|------|------|
| `src/utils/configs.ts` | 功能迁入 `stores/config.ts` |
| `src/types.ts` 中 `defaultLocalConfigs` 等旧类型（如无其他引用） | 类型定义迁入 `stores/config.ts` 附近的类型文件 |

## 3. ConfigStore API 设计

### 3.1 数据流

```
写入: set(key, val) → appConfig[key] = val → 标记 dirty
      save()         → fetchPost("/api/storage/setLocalStorageVal", { key: PLUGIN_KEY, val: appConfig })
      setAndSave(k,v) → 写内存 + 立即保存

读取: load()         → window.siyuan.storage[PLUGIN_KEY] ?? fetchPost(...getLocalStorage)
                     → merge with defaults (补缺) → 检测旧格式 → 迁移

删除: reset()        → removeLocalStorageVals({ keys: [PLUGIN_KEY, ...oldKeys] })
                     → 删除 data/public/{plugin}/ 下文件
                     → 删除 data/storage/petal/{plugin}/configs.json
```

### 3.2 类型定义

```typescript
// src/stores/config.ts

/** 主题禁用配置 */
interface DisabledThemes {
    dark: string[];
    light: string[];
}

/** 单图片偏移覆盖 */
interface ImageOverride {
    positionX?: number;
    positionY?: number;
}

/** 插件完整配置 */
interface AppConfig {
    activate: boolean;
    opacity: number;           // 0.0 - 1.0
    blur: number;              // 0 - 10 (px)
    positionX: number;         // 0 - 100 (%)
    positionY: number;

    localFolders: string[];    // desktop: 外部文件夹绝对路径
    assetDirs: string[];       // data/assets/ 下用户勾选的子目录路径

    autoRefresh: boolean;
    autoRefreshTime: number;   // 分钟

    disabledThemes: DisabledThemes;

    imageOverrides: Record<string, ImageOverride>;

    currentFile: string | null;
}
```

### 3.3 默认值

```typescript
const APP_CONFIG_DEFAULTS: AppConfig = {
    activate: true,
    opacity: 0.5,
    blur: 5,
    positionX: 50,
    positionY: 50,
    localFolders: [],
    assetDirs: [],
    autoRefresh: true,
    autoRefreshTime: 30,
    disabledThemes: { dark: [], light: [] },
    imageOverrides: {},
    currentFile: null,
};
```

### 3.4 公开方法签名

```typescript
class ConfigStore {
    private cfg: AppConfig;
    private dirty: boolean;
    private ready: boolean;

    /** 从 local.json 加载，合并默认值补缺，触发迁移（如需要） */
    async load(): Promise<void>;

    /** 将当前配置持久化写入 local.json */
    async save(): Promise<void>;

    /** 读取单个键值 */
    get<K extends keyof AppConfig>(key: K): AppConfig[K];

    /** 设置单个键值（仅内存，需手动 save） */
    set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void;

    /** 设置单个键值并立即持久化 */
    async setAndSave<K extends keyof AppConfig>(key: K, value: AppConfig[K]): Promise<void>;

    /** 读取全量配置快照（只读） */
    snapshot(): Readonly<AppConfig>;

    /** 复位：恢复默认值 → 持久化 → 清除旧文件 → 清除旧 localStorage 键 */
    async reset(): Promise<void>;
}
```

### 3.5 写入实现要点

```typescript
import { fetchPost } from "siyuan";
import { packageName } from "../constants";

const STORAGE_KEY = packageName;  // "siyuan-plugin-background-cover"

async save(): Promise<void> {
    if (!this.dirty || !this.ready) return;

    await new Promise<void>((resolve, reject) => {
        fetchPost("/api/storage/setLocalStorageVal", {
            key: STORAGE_KEY,
            val: this.cfg,
        }, (response: any) => {
            if (response.code === 0) {
                this.dirty = false;
                resolve();
            } else {
                reject(new Error(response.msg));
            }
        });
    });
}
```

### 3.6 读取实现要点

```typescript
async load(): Promise<void> {
    // 1. 读取 localStorage 中已有数据
    let stored: any = (window as any).siyuan?.storage?.[STORAGE_KEY];
    
    // 2. 如果 window.siyuan.storage 未加载，直接用 HTTP 获取
    if (stored === undefined || stored === null) {
        stored = await this._fetchAllStorage();
    }

    // 3. 合并默认值（补缺）
    this.cfg = { ...APP_CONFIG_DEFAULTS, ...stored };
    
    // 4. 检测是否需要从旧格式迁移
    if (stored && this._needsMigration(stored)) {
        await this._migrate(stored);
    }

    this.ready = true;
}

private async _fetchAllStorage(): Promise<any> {
    return new Promise((resolve) => {
        fetchPost("/api/storage/getLocalStorage", {}, (response: any) => {
            resolve(response.data?.[STORAGE_KEY] ?? {});
        });
    });
}
```

## 4. 迁移逻辑

### 4.1 旧格式检测

```typescript
private _needsMigration(stored: any): boolean {
    // 旧版 config 有 'crtBgObj'、'bgObjCfg'、'fileidx' 等字段
    return (
        stored.crtBgObj !== undefined ||
        stored.bgObjCfg !== undefined ||
        stored.fileidx !== undefined ||
        stored.prevTheme !== undefined ||
        stored.inDev !== undefined
    );
}
```

### 4.2 键值映射表

| 旧键 (old) | 新键 (AppConfig) | 转换逻辑 |
|------------|-----------------|---------|
| `activate` | `activate` | 直接映射 |
| `opacity` | `opacity` | 直接映射 |
| `blur` | `blur` | 直接映射 |
| `autoRefresh` | `autoRefresh` | 直接映射 |
| `autoRefreshTime` | `autoRefreshTime` | 直接映射 |
| `crtBgObj` | `currentFile` | 提取 `crtBgObj.path`（如有） |
| `bgObjCfg` | `imageOverrides` | `{[hash]: { offx→positionX, offy→positionY }}` 转新结构 |
| `disabledTheme` | `disabledThemes` | `{ dark: {...}, light: {...} }` 转 `{ dark: string[], light: string[] }`，只保留值为 `true` 的键 |
| `noteAssetsFolder` | `assetDirs` | 取 `Object.values()` 转为字符串数组 |
| `localFolders` | （旧版无） | 设为 `[]` |
| `positionX/Y` | （旧版无） | 使用默认值 `50` |
| `version` | — | 丢弃（新版本保存自身） |
| `prevTheme` | — | 丢弃（改用 MutationObserver） |
| `inDev` | — | 丢弃（开发模式通过环境变量/URL 判断） |
| `fileidx` | — | 丢弃（不再需要跨设备同步文件索引） |

### 4.3 迁移函数

```typescript
private async _migrate(old: any): Promise<void> {
    console.log("[bgCover] 检测到旧版配置格式，执行一次性迁移...");

    // 映射简单字段
    this.cfg.activate = old.activate ?? APP_CONFIG_DEFAULTS.activate;
    this.cfg.opacity = old.opacity ?? APP_CONFIG_DEFAULTS.opacity;
    this.cfg.blur = old.blur ?? APP_CONFIG_DEFAULTS.blur;
    this.cfg.autoRefresh = old.autoRefresh ?? APP_CONFIG_DEFAULTS.autoRefresh;
    this.cfg.autoRefreshTime = old.autoRefreshTime ?? APP_CONFIG_DEFAULTS.autoRefreshTime;
    this.cfg.currentFile = old.crtBgObj?.path ?? null;

    // 映射 disabledTheme
    if (old.disabledTheme) {
        this.cfg.disabledThemes = {
            dark: this._trueKeys(old.disabledTheme.dark),
            light: this._trueKeys(old.disabledTheme.light),
        };
    }

    // 映射 bgObjCfg → imageOverrides
    if (old.bgObjCfg) {
        const overrides: Record<string, ImageOverride> = {};
        for (const [hash, off] of Object.entries(old.bgObjCfg) as [string, any][]) {
            overrides[hash] = {
                positionX: off.offx,
                positionY: off.offy,
            };
        }
        this.cfg.imageOverrides = overrides;
    }

    // 映射 noteAssetsFolder → assetDirs
    if (old.noteAssetsFolder && typeof old.noteAssetsFolder === 'object') {
        this.cfg.assetDirs = Object.values(old.noteAssetsFolder) as string[];
    }

    // 持久化迁移结果
    await this.save();
    console.log("[bgCover] 迁移完成");

    // 清理旧文件（异步，不阻塞）
    this._cleanOldFiles();
}
```

### 4.4 旧文件清理

```typescript
private async _cleanOldFiles(): Promise<void> {
    // 1. 清除旧的 configs.json（sync storage）
    try {
        await new Promise((resolve) => {
            fetchPost("/api/file/removeFile", {
                path: `/data/storage/petal/${STORAGE_KEY}/configs.json`,
            }, resolve);
        });
    } catch (_) { /* 文件不存在则忽略 */ }

    // 2. 清除旧的 localStorage 键中非标准字段
    //    旧版 setLocalStorage 是整文件覆写，迁移后只剩新键，无需额外清理
}
```

## 5. 要在 `reset()` 中清理的内容

```typescript
async reset(): Promise<void> {
    // 1. 恢复默认值
    this.cfg = { ...APP_CONFIG_DEFAULTS };
    this.dirty = true;

    // 2. 持久化默认值
    await this.save();

    // 3. 删除所有与该插件相关的旧 localStorage 键
    //    （理论上只有 STORAGE_KEY 一个，但如果旧版遗留多个键则一并清除）
    await new Promise<void>((resolve) => {
        fetchPost("/api/storage/removeLocalStorageVals", {
            keys: [STORAGE_KEY],
        }, resolve);
    });

    // 4. 清除 data/storage/petal/{plugin}/ 下的旧配置文件
    await new Promise((resolve) => {
        fetchPost("/api/file/removeFile", {
            path: `/data/storage/petal/${STORAGE_KEY}/configs.json`,
        }, resolve);
    });

    // 5. 清除 data/public/{plugin}/ 下的用户上传文件
    //    先递归列出目录，再逐个删除（或直接用 removeFile 删整个目录）
    const files = await this._listPublicDir();
    for (const file of files) {
        await new Promise((resolve) => {
            fetchPost("/api/file/removeFile", { path: file }, resolve);
        });
    }
}
```

## 6. `src/index.ts` 中需要修改的入口逻辑

```typescript
import { configStore } from "./stores/config";

export default class BgCoverPlugin extends Plugin {
    async onload(): Promise<void> {
        // 旧代码：
        //   confmngr.setParent(this);
        //   await confmngr.load();
        //
        // 新代码：
        await configStore.load();

        // ... 其余逻辑
    }
}
```

全局搜索 `confmngr.`、`configManager` 引用并替换为 `configStore.`。

## 7. 测试策略

### 7.1 测试文件

| 文件 | 测试目标 |
|------|---------|
| `tests/stores/config.test.ts` | ConfigStore 完整功能测试 |

### 7.2 Mock 策略

```typescript
// tests/vitest.setup.ts 中补充

// Mock siyuan 的 fetchPost
import { vi } from "vitest";

vi.mock("siyuan", () => ({
    fetchPost: vi.fn(),
}));

// Mock window.siyuan.storage
(window as any).siyuan = {
    ...(window as any).siyuan,
    storage: {} as Record<string, any>,
};
```

### 7.3 测试用例清单

| 用例 | 描述 |
|------|------|
| `load with empty storage` | `window.siyuan.storage[KEY]` 为空 → load() 返回默认值 |
| `load with existing config` | storage 有数据 → load() 合并默认值补缺 |
| `load triggers migration` | 存储含 `crtBgObj` / `bgObjCfg` 等旧字段 → 自动迁移到 AppConfig |
| `load does NOT re-migrate` | 已迁移过的配置（只有 AppConfig 字段）→ 不再触发迁移 |
| `get(key)` | 返回正确的单个配置值 |
| `set(key, val)` | 内存值改变，dirty=true，不自动保存 |
| `setAndSave(key, val)` | 内存值改变 → `fetchPost` 被调用 → `{ key, val }` 参数正确 |
| `save` | 只保存 dirty=true 时 → fetchPost 参数正确 |
| `save when not dirty` | 直接返回，不调用 fetchPost |
| `snapshot` | 返回只读副本，修改副本不影响 store |
| `reset` | 恢复默认值 → 调用 save → 调用 removeLocalStorageVals → 调用清理旧文件 |
| `save stores correct APP_ID` | fetchPost 调用 `/api/storage/setLocalStorageVal` 且 body 格式正确 |
| `desktop fs check in reset` | desktop 端清理 public 目录时使用 `require('fs/promises')` |
| `concurrent set + save` | 短时间内多次 set → 一次 save 包含所有修改 |

### 7.4 示例测试代码骨架

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetchPost
const mockFetchPost = vi.fn();
vi.doMock("siyuan", () => ({ fetchPost: mockFetchPost }));

// 需要在 mock 完成后动态 import，确保 mock 先生效
const { configStore } = await import("../src/stores/config");

describe("ConfigStore", () => {
    beforeEach(() => {
        // 重置 store 状态 (需要 store 导出 resetInternal 或在每个 test 前重新 new)
        (window as any).siyuan.storage = {};
        mockFetchPost.mockClear();
    });

    describe("load()", () => {
        it("应该从空存储中读取默认值", async () => {
            await configStore.load();
            expect(configStore.get("activate")).toBe(true);
            expect(configStore.get("opacity")).toBe(0.5);
            expect(configStore.get("localFolders")).toEqual([]);
        });

        it("应该合并已有配置并补缺", async () => {
            (window as any).siyuan.storage["siyuan-plugin-background-cover"] = {
                activate: false,
                opacity: 0.8,
            };
            await configStore.load();
            expect(configStore.get("activate")).toBe(false);
            expect(configStore.get("opacity")).toBe(0.8);
            expect(configStore.get("blur")).toBe(5);  // 默认值补缺
        });

        it("应该从旧格式迁移", async () => {
            (window as any).siyuan.storage["siyuan-plugin-background-cover"] = {
                activate: true,
                bgObjCfg: { "abc123": { offx: 30, offy: 70 } },
                disabledTheme: { dark: { "theme1": true, "theme2": false } },
            };
            await configStore.load();

            const overrides = configStore.get("imageOverrides");
            expect(overrides["abc123"]).toEqual({ positionX: 30, positionY: 70 });

            const dt = configStore.get("disabledThemes");
            expect(dt.dark).toEqual(["theme1"]);
        });
    });

    describe("setAndSave()", () => {
        it("应该立即持久化", async () => {
            await configStore.load();
            await configStore.setAndSave("opacity", 0.3);

            expect(mockFetchPost).toHaveBeenCalledWith(
                "/api/storage/setLocalStorageVal",
                expect.objectContaining({
                    key: "siyuan-plugin-background-cover",
                    val: expect.objectContaining({ opacity: 0.3 }),
                }),
                expect.any(Function),
            );
        });
    });

    describe("reset()", () => {
        it("应该恢复默认值并清理", async () => {
            await configStore.load();
            await configStore.setAndSave("activate", false);
            await configStore.reset();

            expect(configStore.get("activate")).toBe(true);
            // removeLocalStorageVals 被调用
            expect(mockFetchPost).toHaveBeenCalledWith(
                "/api/storage/removeLocalStorageVals",
                { keys: ["siyuan-plugin-background-cover"] },
                expect.any(Function),
            );
        });
    });
});
```

### 7.5 手动测试步骤

1. **迁移测试**：在旧版插件（v0.x）启用后升级至此版本 → 打开思源 → 检查设置面板配置是否保留
2. **复位测试**：点击 reset → 检查所有配置恢复默认 → 检查 `data/storage/local.json` 中该键消失 → 检查 `data/public/siyuan-plugin-background-cover/` 被清空
3. **读写测试**：修改任意设置（透明度/模糊度等）→ 退出并重新打开思源 → 检查设置持久化
4. **桌面端 vs 移动端**：mobile 端 `window.require` 不存在时，reset 不会尝试调用 fs API，检查无报错

## 8. 参考代码路径

### 8.1 旧 ConfigManager 可适配的设计模式

| 模式 | 来源 (`src/utils/configs.ts`) | 新用法 |
|------|------|--------|
| `structuredClone()` 创建深拷贝 | 第 22、80 行 | 用于 `snapshot()` / `reset()` |
| 合并默认值补缺 | 第 113-117 行 | `load()` 中 `{ ...defaults, ...stored }` |
| `changedKeys: Set` 脏标记 | 第 18 行 | 简化为 `dirty: boolean` |

### 8.2 SettingUtils 可参考的模式

| 模式 | 来源 (`libs/setting-utils.ts`) | 新用法 |
|------|------|--------|
| `get(key)` / `set(key, val)` / `setAndSave(key, val)` | 第 143-174 行 | ConfigStore 同名 API |

### 8.3 新 API 参考

| API | 路由 | 请求体 | 来源 |
|-----|------|--------|------|
| `setLocalStorageVal` | `POST /api/storage/setLocalStorageVal` | `{ key, val }` | `storage.go:140` |
| `removeLocalStorageVals` | `POST /api/storage/removeLocalStorageVals` | `{ keys: string[] }` | `storage.go:111` |
| `getLocalStorage` | `POST /api/storage/getLocalStorage` | `{}` (可选 `{ key }`) | `storage.go:183` |

**读取捷径**：思源启动后 `window.siyuan.storage` 已加载完整 `local.json` 内容，插件可直接 `window.siyuan.storage[STORAGE_KEY]` 读取，性能最优。仅当该对象未初始化时降级为 HTTP `fetchPost`。

## 9. 需要注意的边缘情况

1. **`local.json` 被破坏**：思源内核在读取 `local.json` 解析失败时会返回空对象（`storage.go:693`），ConfigStore `load()` 会退化到全默认值，不会崩溃。
2. **并发保存**：`setAndSave()` 在保存完成前又有新 set → 使用 `dirty` 标志位 + 防抖，避免重复发送。可在 Phase 2 先不做防抖，依赖思源内核 `localStorageLock` 写锁。
3. **重复 load 调用**：`load()` 仅在 `onload()` 中调用一次，设置 `ready` 标记，第二次调用直接返回。
4. **`fetchPost` 的回调模式**：思源 `fetchPost` 是回调风格而非 Promise，需要用 `new Promise` 包装。注意 `fetchPost` 的回调会在成功和失败时都调用（通过 `response.code` 判断）。
5. **`app` 参数**：在新 API 中 `app` 参数用于多窗口事件广播，插件调用时设为 `undefined` 或省略。后端 Go 代码中 `arg["app"]` 不存在时会 panic —— 实际上需要仔细验证。建议参考 `compatibility.ts:572` 中 `setStorageVal` 的实现传入插件标识 `app: packageName`。

## 10. 文件依赖关系图

```
                    src/index.ts
                    /    |     \
                   /     |      \
        stores/config.ts  |   utils/api.ts (移除 setLocalStorage/getLocalStorage)
                  |        |
          constants.ts   siyuan (fetchPost)
          types.d.ts
```

`src/stores/config.ts` 仅依赖：
- `siyuan` package 的 `fetchPost`
- `src/constants.ts` 的 `packageName`
- 无其他业务依赖（纯数据层）

## 11. 检查清单

- [ ] 创建 `src/stores/config.ts`，实现 ConfigStore 类
- [ ] 从 `src/utils/api.ts` 中删除 `getLocalStorage()` 和 `setLocalStorage()` 方法（第 292-338 行）
- [ ] 删除 `src/utils/configs.ts` 文件
- [ ] 修改 `src/index.ts`：移除 `confmngr.setParent()` / `confmngr.load()`，改为 `configStore.load()`
- [ ] 全局搜索并替换 `confmngr` → `configStore`
- [ ] 清理 `src/constants.ts` 中不再需要的旧常量
- [ ] 清理 `src/types.ts` 中旧类型定义
- [ ] 创建 `tests/stores/config.test.ts`，覆盖全部测试用例（§7.3）
- [ ] 运行 `pnpm test` 确认所有测试通过
- [ ] 在思源开发环境手动测试：迁移 → 读写 → 复位
