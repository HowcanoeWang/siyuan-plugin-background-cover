# Phase 3：功能精简 — 执行计划

> 关联主计划：`.agents/plans/20260514_refactor_v1.md` §七 Phase 3
> 日期：2026-05-16
> 目标：移除所有废弃/未使用代码，精简项目，为主计划 Phase 4-6 铺路

---

## 一、目标

根据主计划 §2.2 的「移除功能」清单，删除以下七大类废弃代码：
Live2D 桩代码、Bug 报告弹窗、Android 限制提示、Demo 图片、旧版迁移逻辑、
`/api/storage/setLocalStorage` 调用、ts-md5 依赖，以及所有注释掉的死代码。

完成后应满足：
1. 项目编译无错（`tsc --noEmit`）
2. 无任何 `import` 引用已删除的符号
3. 无 `ts-md5`、`setLocalStorage` / `getLocalStorage` 调用残留
4. 文件数量减少（`notice.ts` 移除，`templates.ts` 合并入 `dialogs.ts`）

---

## 二、执行清单（按依赖顺序）

### 2.1 移除 ts-md5 依赖

**涉及文件**：

| 文件 | 行号 | 内容 |
|------|------|------|
| `package.json` | 37 | `"ts-md5": "^2.0.1"` 依赖声明 |
| `src/ui/fileManager.ts` | 16 | `import { Md5 } from 'ts-md5';` |
| `src/ui/fileManager.ts` | 215-241 | `imgExistsInCache()` 函数 — 使用 `Md5.hashStr()` 做分片哈希去重 |
| `src/ui/fileManager.ts` | 243-293 | `uploadOneImage()` 函数 — 调用 `imgExistsInCache()` |
| `src/ui/fileManager.ts` | 295-321 | `batchUploadImages()` 函数 — 调用 `uploadOneImage()` |
| `src/ui/topbar.ts` | 226-253 | `addSeveralLocalImagesFile()` — 调用 `uploadOneImage()` |
| `src/ui/topbar.ts` | 256-303 | `addDirectory()` — 调用 `imgExistsInCache()` |

**操作步骤**：

1. 从 `package.json` 删除 `"ts-md5"` 依赖行，运行 `pnpm install`
2. 在 `src/ui/fileManager.ts` 中：
   - 删除 `import { Md5 } from 'ts-md5';`
   - 删除 `imgExistsInCache()` 函数（行 215-241）— 该方法使用 `Md5.hashStr()` 做文件分片去重
   - 删除 `uploadOneImage()` 函数（行 243-293）— 依赖 `imgExistsInCache()` 和 `fileidx` 旧数据结构
   - 删除 `batchUploadImages()` 函数（行 295-321）— 依赖 `uploadOneImage()`
3. 在 `src/ui/topbar.ts` 中：
   - 删除 `addSeveralLocalImagesFile()`（行 226-253）— 依赖已删除的 `uploadOneImage()`
   - 删除 `addDirectory()`（行 256-303）— 依赖已删除的 `imgExistsInCache()`
   - 删除顶部菜单中引用这两个函数的菜单项（`initTopbar()` 行 80-102 中 `addSeveralLocalImagesFile` 和 `addDirectory` 对应的 `IMenuItemOption`）
4. 验证：`rg "ts-md5|Md5" src/` 无结果

> **注意**：Phase 4 会实现全新的 `sourceManager.ts` 和文件名去重方案（对应主计划 §四），
> 本次仅删除旧代码，不引入替换逻辑。

---

### 2.2 移除 `/api/storage/setLocalStorage` / `getLocalStorage` 调用

**涉及文件**：

| 文件 | 行号 | 内容 |
|------|------|------|
| `src/utils/api.ts` | 292-308 | `getLocalStorage()` 方法 — 调用 `/api/storage/getLocalStorage`（整文件获取） |
| `src/utils/api.ts` | 315-338 | `setLocalStorage()` 方法 — 调用 `/api/storage/setLocalStorage`（整文件覆写） |
| `src/utils/configs.ts` | 98 | `ka.getLocalStorage(cst.localStorageKey)` — 在 `_loadLocalCfg()` 中加载配置 |
| `src/utils/configs.ts` | 189 | `ka.setLocalStorage(cst.localStorageKey, json)` — 在 `_saveLocalCfg()` 中保存配置 |

**操作步骤**：

1. 在 `src/utils/api.ts` 中删除 `getLocalStorage()`（行 292-308）和 `setLocalStorage()`（行 315-338）
2. 在 `src/utils/configs.ts` 中：
   - 将 `_loadLocalCfg()`（行 96-123）改写为使用 `getLocalStorageVal` API（PR #17482 新增）
   - 将 `_saveLocalCfg()`（行 181-190）改写为使用 `setLocalStorageVal` API
   - 改写逻辑：不再获取完整 storage 对象再解析 key，直接通过指定 key 读写

   ```typescript
   // 旧：ka.getLocalStorage(key) → 获取全量 JSON → 提取 key
   // 新：直接调用 /api/storage/getLocalStorageVal { key }
   ```

3. 验证：`rg "setLocalStorage|getLocalStorage" src/utils/api.ts` 无除新 API 外的残留

> **注意**：主计划 Phase 2 会完整执行存储改造，这里的删除是 Phase 3 上下文的最小操作。
> 具体 API 签名和实现见 `.agents/plans/20260514_refactor_v1.md` §四。

---

### 2.3 移除 Live2D 桩代码

**涉及文件**：

| 文件 | 行号 | 内容 |
|------|------|------|
| `src/types.ts` | 18 | `live2d = 2` in `bgMode` 枚举 |
| `src/types.ts` | 22-26 | `bgObj` 接口中的 `mode: bgMode` 字段 — 保留，但枚举值只保留 `image` / `video` |
| `src/ui/fileManager.ts` | 163-164 | 注释掉的 live2d 文件扫描 |
| `src/services/bgRender.ts` | 82-83 | `showNotImplementDialog()` — 当 mode 为非 image 时弹出，Phase 5 会替换为 video 渲染 |

**操作步骤**：

1. `src/types.ts` 第 16-20 行：
   ```typescript
   // 修改前
   export enum bgMode {
       image = 0,
       video = 1,
       live2d = 2,
   }
   // 修改后
   export enum bgMode {
       image = 0,
       video = 1,
   }
   ```
2. `src/ui/fileManager.ts` 行 163-164：删除整个注释块
3. `src/services/bgRender.ts` 行 81-84：将 `showNotImplementDialog()` 改为 `error()` 日志（Phase 5 实现视频渲染后会正式替换）

---

### 2.4 移除 Bug 报告弹窗

**涉及文件**：

| 文件 | 行号 | 内容 |
|------|------|------|
| `src/ui/notice.ts` | 13-23 | `bugReportDialog()` 函数 |
| `src/ui/topbar.ts` | 133-138 | 顶部菜单中的「Bug 报告」菜单项，调用 `noticeUI.bugReportDialog()` |

**操作步骤**：

1. 删除 `src/ui/notice.ts` 中的 `bugReportDialog()` 函数（行 13-23）
2. 删除 `src/ui/topbar.ts` 中对应的菜单项（行 133-138）
3. 验证：`rg "bugReportDialog" src/` 无结果

---

### 2.5 移除 Android 限制提示

**涉及文件**：

| 文件 | 行号 | 内容 |
|------|------|------|
| `src/ui/topbar.ts` | 104-112 | `isAndroid` 条件判断，向子菜单插入只读提示项 |
| `src/index.ts` | 10 | `isAndroid?: boolean` in Window 声明（可选字段，保留接口兼容性） |
| `src/index.ts` | 24 | `isAndroidBackend: boolean` 类字段 |
| `src/index.ts` | 33 | `this.isAndroidBackend = backEnd === "android";` |
| `src/index.ts` | 39 | `isAndroid: this.isAndroidBackend` in window.bgCoverPlugin |

**操作步骤**：

1. 删除 `src/ui/topbar.ts` 行 104-112 的 Android 检查代码块
2. 在 `src/index.ts` 中：
   - 删除 `isAndroidBackend` 字段声明（行 24）
   - 删除 `this.isAndroidBackend = ...` 赋值（行 33）
   - 删除 window 全局对象中的 `isAndroid` 字段（行 39，保持 `isAndroidBackend` 被引用处不变，Phase 6 UI 重写时可在组件内判断）
3. `src/types.ts` 行 10：保留 `isAndroid?: boolean`（可选字段，不影响运行，可在 Phase 6 统一清理）

> **理由**（主计划 §2.2）：思源已统一各端 API，`isAndroidBackend` 不再有意义。

---

### 2.6 移除 Demo 图片

**涉及文件**：

| 文件 | 行号 | 内容 |
|------|------|------|
| `src/constants.ts` | 28 | `demoImgURL` 常量定义 |
| `src/services/bgRender.ts` | 69-73 | `useDefaultLiaoLiaoBg()` 函数 |
| `src/services/bgRender.ts` | 150 | 调用 `useDefaultLiaoLiaoBg()` |
| `src/ui/fileManager.ts` | 209 | 调用 `useDefaultLiaoLiaoBg()` in `clearCacheFolder()` |
| `src/ui/fileManager.ts` | 504 | 调用 `useDefaultLiaoLiaoBg()` in `generateCacheImgList()` |
| `src/ui/topbar.ts` | 180 | 调用 `useDefaultLiaoLiaoBg()` |
| `static/FyBE0bUakAELfeF.jpg` | — | demo 图片文件 |

**操作步骤**：

1. 删除 `src/constants.ts` 中 `demoImgURL` 常量（行 28）
2. 删除 `src/services/bgRender.ts` 中 `useDefaultLiaoLiaoBg()` 函数（行 69-73）
3. 修改 `src/services/bgRender.ts` 行 148-150 的调用：
   ```typescript
   // 修改前
   if (cacheImgNum === 0) {
       useDefaultLiaoLiaoBg();
   }
   // 修改后：当无缓存图片时，清空背景并跳过
   if (cacheImgNum === 0) {
       changeBackgroundContent('', tps.bgMode.image);
       confmngr.set('crtBgObj', undefined);
   }
   ```
4. 修改 `src/ui/fileManager.ts` 行 207-210：
   ```typescript
   // 修改前
   if (cacheImgNum === 0) {
       bgRender.useDefaultLiaoLiaoBg();
   };
   // 修改后：直接删除该 if 块（clearCacheFolder 不需要自动设置背景）
   ```
5. 修改 `src/ui/fileManager.ts` 行 501-505：同上处理
6. 修改 `src/ui/topbar.ts` 行 178-180：
   ```typescript
   // 修改前
   if (cacheImgNum === 0) {
       bgRender.useDefaultLiaoLiaoBg();
       showMessage(...)
   }
   // 修改后：仅显示提示信息，不做背景设置
   if (cacheImgNum === 0) {
       showMessage(`${window.bgCoverPlugin.i18n.noCachedImg4random}`, 3000, "info");
       return;  // 直接返回，不做任何背景操作
   }
   ```
7. 删除 `static/FyBE0bUakAELfeF.jpg`
8. 验证：`rg "demoImgURL|useDefaultLiaoLiaoBg|FyBE" src/` 无结果

---

### 2.7 移除旧版迁移逻辑

**涉及文件**：

| 文件 | 行号 | 内容 |
|------|------|------|
| `src/ui/fileManager.ts` | 39-81 | `checkAssetsDir()` 函数 — 检查 v0.x 旧路径并提示迁移 |
| `src/index.ts` | 119 | `await fileManagerUI.checkAssetsDir();` 调用 |
| `src/constants.ts` | 16 | `pluginAssetsDirOS` 变量 — 仅被 `checkAssetsDir()` 中一行引用 |

**操作步骤**：

1. 删除 `src/ui/fileManager.ts` 中 `checkAssetsDir()` 函数（行 39-81）
2. 删除 `src/index.ts` 行 119 的调用
3. 删除 `src/constants.ts` 中 `pluginAssetsDirOS` 的声明和计算（行 15-22）
   - 同时删除 `constants.ts` 中对 `pluginAssetsDir` 的依赖（行 11 保留，未来 Phase 4 仍需要）
4. 验证：`rg "checkAssetsDir|pluginAssetsDirOS" src/` 无结果

> **理由**（主计划 §2.2）：v0.x → v1.0 向前不兼容，用户需手动迁移。

---

### 2.8 清理注释掉的死代码

| 文件 | 行号 | 说明 |
|------|------|------|
| `src/services/bgRender.ts` | 46-66 | 注释掉的 `createBgLayer()` 视频版本 |
| `src/services/bgRender.ts` | 24-25 | 注释掉的 className 方式 |
| `src/ui/topbar.ts` | 95-101 | 注释掉的 `addNoteAssetsDirectory` 菜单项 |
| `src/ui/fileManager.ts` | 127 | 注释掉的 `ka.removeFile()` |
| `src/ui/fileManager.ts` | 343-348 | 注释掉的 tab 2 占位 UI |
| `src/ui/fileManager.ts` | 384-386 | 注释掉的 `rm_file` 删除说明 |
| `src/index.ts` | 105-106 | 注释掉的 `themeChangeObserver` 注册 |
| `src/index.ts` | 134-135 | 注释掉的 `configs.save()` 调用 |
| `src/ui/topbar.ts` | 379 | `showNotImplementDialog(); return;` dead code after |
| `src/utils/api.ts` | 193-214 | 注释掉的 `convertPandoc` 方法 |

**操作**：逐一删除上述行。对 `topbar.ts:379` 后的 `addNoteAssetsDirectory()`，若整个函数变为 dead code 则一并删除。

---

### 2.9 文件级操作

#### 2.9.1 删除文件 `src/ui/notice.ts`

**内容分析**：

| 函数 | 行号 | 状态 |
|------|------|------|
| `showNotImplementDialog()` | 6-11 | **删除** — Live2D/video 相关，仅 bgRender.ts:82 引用（Phase 5 `bgRender` 重写后不再需要） |
| `bugReportDialog()` | 13-23 | **删除** — 见 §2.4 |
| `themeRefreshDialog()` | 25-35 | **保留并迁移** 到 `src/utils/theme.ts`（与主题检测逻辑同属一个模块） |
| `removeThemeRefreshDialog()` | 37-52 | **保留并迁移** 到 `src/utils/theme.ts` |

**操作步骤**：

1. 将 `themeRefreshDialog()` 和 `removeThemeRefreshDialog()` 迁移到 `src/utils/theme.ts`
2. 更新 `src/index.ts` 中：
   - 删除 `import * as noticeUI from "./ui/notice";`（行 16）
   - 将 `noticeUI.removeThemeRefreshDialog()` 调用改为指向新位置
   - 删除 `noticeUI.themeRefreshDialog()` 调用（在 `themeOnChange()` 中，行 155）
3. 更新 `src/ui/topbar.ts` 中：
   - 删除 `import * as noticeUI from "./notice";`（行 21）
   - 将 `noticeUI.bugReportDialog()` 调用删除（随 §2.4 操作）
4. 删除 `src/ui/notice.ts` 文件
5. 验证：`rg "from.*notice|import.*notice" src/` 仅剩新路径引用

#### 2.9.2 合并 `templates.ts` 到 `dialogs.ts`

`src/ui/components/templates.ts`（31 行）仅被 `src/ui/components/dialogs.ts` 引用，
模板函数是 dialog 的实现细节，不需要独立文件。合并后删除 `templates.ts`。

**操作步骤**：

1. 将 `createNoticeDialogTemplate` 和 `createConfirmDialogTemplate` 移入 `dialogs.ts` 文件底部
2. 删除 `import { ... } from "./templates"` 行
3. 删除 `templates.ts` 文件
4. 验证：`rg "from.*templates" src/` 无结果

---

### 2.10 精简 `types.ts`

**当前内容**（80 行）→ **目标**（保留 Phase 4-6 需要的基础类型）：

| 保留 | 删除 |
|------|------|
| `Window` 全局声明（精简后） | `bgMode.live2d = 2`（§2.3） |
| `bgMode` 枚举（`image`, `video`） | `bgObj` 接口（旧数据结构，Phase 4 替换为 `ImageItem`） |
| — | `bgObjCfg` 接口（旧 per-image 偏移方案） |
| — | `fileIdx` 接口（旧 sync 数据） |
| — | `noteAssetsFolder`（旧接口） |
| — | `defaultLocalConfigs`（Phase 2 替换为 `AppConfig`） |
| — | `defaultSyncConfigs`（Phase 2 移除整层 sync） |
| — | `localConfigKey` / `syncConfigKey` / `configKey`（Phase 2 替换） |
| 精简后的 `Window.bgCoverPlugin` | `isAndroid` 字段（§2.5） |

**操作步骤**：

1. `bgMode` 枚举：删除 `live2d = 2`
2. 删除 `bgObj`、`bgObjCfg`、`fileIdx`、`noteAssetsFolder` 接口（行 22-42）
3. 删除 `defaultLocalConfigs`、`defaultSyncConfigs`（行 49-75）
4. 删除 `localConfigKey`、`syncConfigKey`、`configKey` 类型别名（行 77-80）
5. 删除 `window.bgCoverPlugin.isAndroid` 字段（行 10）
6. 删除未使用的 `import * as cst from './constants';`（行 2）
7. 验证：编译无错、无未使用导入

**精简后预期**（约 20 行）：
```typescript
import { IObject } from 'siyuan';

declare global {
    interface Window {
        bgCoverPlugin: {
            i18n: IObject;
            isMobileLayout: boolean;
            isBrowser: boolean;
            isDev?: boolean;
        }
    }
}

export enum bgMode {
    image = 0,
    video = 1,
}
```

---

### 2.11 精简 `constants.ts`

**当前内容**（36 行）→ **目标**（保留未来 Phase 4-7 需要的基础常量）：

| 保留 | 删除 |
|------|------|
| `packageName` | `hashLength`（与 ts-md5 关联） |
| `packageVersion` | `synConfigFile`（Phase 2 移除 sync 层） |
| `localStorageKey` | `pluginAssetsDirOS`（§2.7） |
| `pluginAssetsDir` | `cacheMaxNum`（Phase 4 不再限制数量） |
| `pluginAssetsId` | `demoImgURL`（§2.6） |
| `supportedImageSuffix`（扩展为支持视频后缀） | — |
| `diyIcon.iconLogo` | — |

**操作步骤**：

1. 删除 `hashLength`（行 8）
2. 删除 `synConfigFile`（行 10）
3. 删除 `pluginAssetsDirOS` 相关代码（行 15-22）
4. 删除 `cacheMaxNum`（行 24）
5. 删除 `demoImgURL`（行 28）
6. 扩展 `supportedImageSuffix` 为 `supportedMediaSuffix`，包含图片和视频扩展名：
   ```typescript
   export const supportedImageSuffix = [".png", ".jpeg", ".jpg", ".jiff", ".jfif",
       ".gif", ".webp", ".bmp", ".svg", ".avif"];
   export const supportedVideoSuffix = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"];
   ```
7. 验证：编译无错

---

### 2.12 精简 `src/index.ts`

**当前内容**（163 行）→ 清理导入、删除死代码、精简入口：

| 操作 | 说明 |
|------|------|
| 删除 `import * as noticeUI from "./ui/notice";`（行 16） | §2.9.1 删除文件 |
| 删除 `isAndroidBackend` 字段和赋值（行 24, 33, 39） | §2.5 |
| 删除 `window.bgCoverPlugin.isAndroid` 赋值（行 39） | §2.5 |
| 删除 `await fileManagerUI.checkAssetsDir();`（行 119） | §2.7 |
| 删除注释掉的 `themeChangeObserver`（行 105-106） | §2.8 |
| 删除注释掉的 `configs.save()`（行 134-135） | §2.8 |
| 删除 `confmngr.set('prevTheme', ...)` 行 123 | Phase 2 移除 prevTheme |
| 删除 `noticeUI.removeThemeRefreshDialog()` 行 130 | 迁移到 theme.ts |
| 删除 `noticeUI.themeRefreshDialog()` 行 155 | Phase 6 用 Svelte dialog 替代 |
| 删除 `themeOnChange()` 方法（行 145-158） | Phase 2 用 MutationObserver 取代 |

---

## 三、删除顺序（依赖拓扑）

```
§2.1 ts-md5
  └─ §2.2 setLocalStorage/getLocalStorage (独立)
       └─ §2.7 旧版迁移逻辑 (独立)
            └─ §2.6 Demo 图片 (独立)
                 └─ §2.3 Live2D 桩代码 (独立)
                      └─ §2.4 Bug 报告弹窗 (独立)
                           └─ §2.5 Android 限制提示 (独立)
                                └─ §2.8 注释死代码 (独立)
                                     └─ §2.9 文件级操作 (依赖以上所有)
                                          └─ §2.10-2.12 精简文件 (最后执行)
```

**实际执行**：大部分删除之间无相互依赖，可以一次批量提交。唯一约束是 §2.9（文件级操作）和 §2.10-2.12（精简文件）需要在内容删除完成后执行。

---

## 四、验证检查清单

执行完毕后逐项确认：

- [ ] `pnpm run build`（或 `tsc --noEmit`）编译通过，无错误
- [ ] `rg "ts-md5|Md5" src/` 无结果
- [ ] `rg "setLocalStorage|getLocalStorage" src/utils/api.ts` 无旧 API 残留
- [ ] `rg "live2d|live2D" src/` 无结果
- [ ] `rg "bugReportDialog|bugReport" src/` 无结果
- [ ] `rg "isAndroid" src/` 仅剩 `types.ts` 中可选字段（或其他安全位置）
- [ ] `rg "demoImgURL|useDefaultLiaoLiaoBg|LiaoLiao" src/` 无结果
- [ ] `rg "checkAssetsDir|pluginAssetsDirOS" src/` 无结果
- [ ] `rg "from.*notice|import.*notice" src/` 仅剩新路径引用
- [ ] `rg "from.*templates" src/` 无结果
- [ ] `src/ui/notice.ts` 文件已删除
- [ ] `src/ui/components/templates.ts` 文件已删除
- [ ] `static/FyBE0bUakAELfeF.jpg` 文件已删除
- [ ] 所有注释掉的代码块已清除
- [ ] `types.ts` / `constants.ts` / `index.ts` 行数显著减少

---

## 五、注意事项

1. **不引入新功能**：Phase 3 仅做删除/精简。如果需要新的函数（如 `setLocalStorageVal` 替代品），由 Phase 2 处理。
2. **保留 i18n key**：即使某些功能被删除，对应的 i18n 翻译键暂时保留，避免 Phase 6 UI 重写时丢失多语言数据。
3. **`isAndroid` 字段**：`types.ts` 中的 `Window.bgCoverPlugin.isAndroid?` 作为可选字段保留，Phase 6 在 Svelte 组件中统一做平台检测。
4. **`fileManager.ts` 剩余部分**：删除上述函数后，文件中还剩下 `getCacheImgNum()`、`selectPictureDialog()`、`generateCacheImgList()`、`openAssetsFolderPickerDialog()`、`clearCacheFolder()`。这些与旧 `fileidx` 数据结构耦合，会在 Phase 4（图片源管理）和 Phase 6（UI 重写）中被逐步替换。
5. **`bgRender.ts` 中的旧逻辑**：当前 `bgRender.ts` 大量依赖 `fileidx`、`crtBgObj` 等旧配置结构。Phase 3 仅做表面清理（删除 `useDefaultLiaoLiaoBg`、注释代码），Phase 5 会完整重写。
