# Phase 4 执行计划：图片源管理

## 目标

实现 `utils/fs.ts`（`window.require('fs/promises')` 安全封装）和 `services/sourceManager.ts`（双路径图片源管理器），支持三种源类型（local / upload / assets）的统一扫描和随机选取。

---

## 一、核心约束回顾

引用自 master plan §1.1—§1.2。

### 1.1 平台能力矩阵

| 能力 | desktop (Electron) | fallback (mobile/browser/docker) |
|------|-------------------|----------------------------------|
| `require('fs/promises')` | 可用（Node.js `fs/promises` 异步模块） | `undefined` |
| `file:///` 渲染 | 可用 | 不可用 |
| `fs.readdirSync()` | 可用 | ❌ |
| `fs.existsSync()` | 可用 | ❌ |
| `fs.writeFileSync()` | 可用 | ❌ |
| 内核 `readDir` API | 可用 | 可用 |
| 内核 `putFile` API | 可用 | 可用 |

### 1.2 三种源类型特性

| 维度 | local | upload | assets |
|------|-------|--------|--------|
| 适用平台 | desktop only | 所有 | 所有 |
| 文件位置 | 用户指定绝对路径 | `data/public/{plugin}/` | `data/assets/<子文件夹>/` |
| 枚举方式 | `require('fs/promises').readdir()` | `readDir()` | `readDir()` |
| 渲染 URL | `file:///...` | `/public/...` 或 `file:///` | `/assets/...` |
| 存储开销 | 零 | 占用 data/ 空间 | 零 |
| 可否新增文件 | 只读 | 可（上传/URL下载） | 只读 |

### 1.3 URL 下载合并进 upload 源

URL 输入下载后的文件与 upload 源中的其他文件无差别对待。不需要独立的 `url` 源类型。

---

## 二、文件清单

本阶段创建 4 个文件：

| 文件 | 职责 |
|------|------|
| `src/utils/fs.ts` (新建) | `window.require('fs/promises')` 安全封装，平台检测 + 降级 shim |
| `src/services/sourceManager.ts` (新建) | 图片源扫描、合并、随机选取 |
| `src/types.ts` (修改) | 添加 `ImageItem` 类型定义 |
| `src/constants.ts` (修改) | 添加扩展名过滤列表常量 |

---

## 三、src/utils/fs.ts 详细设计

### 3.1 设计目标

提供一个统一的文件系统操作接口，在 desktop 和 fallback 端自动切换实现。对外只暴露 Promise-based API，内部处理同步/异步差异。

### 3.2 完整 API

```typescript
// src/utils/fs.ts

import { KernelApi } from './api';
import { info, debug, error } from './logger';

/**
 * window.require('fs/promises') 安全封装
 *
 * desktop 端 (Electron): window.require('fs/promises') → Node.js fs/promises 模块
 *   注意：window.fs 是 Lute GopherJS 暴露的非标准接口，行为可能变化，不推荐
 * fallback 端 (mobile/browser/docker): 使用思源内核 HTTP API 降级
 */

const ENGINE = 'fs.ts';

// 仅在 desktop Electron 环境可用，否则为 null
const fsp = (() => {
    try {
        return (window as any).require?.('fs/promises') ?? null;
    } catch {
        return null;
    }
})();

/**
 * 检测当前环境是否为 Electron desktop
 * window.require 是 Electron nodeIntegration 的标准注入
 */
export function isDesktop(): boolean {
    return typeof (window as any).require === 'function'
        && fsp !== null;
}

/**
 * 读取目录下的文件和子目录名列表
 *
 * desktop: fsp.readdir(path, { withFileTypes: true }) → 异步，分析 Dirent
 * fallback: KernelApi.readDir(path) → 异步，返回 { isDir: boolean, name: string }[]
 *   过滤 isDir=false，返回 name 数组
 */
export async function readDir(path: string): Promise<string[]> {
    if (isDesktop() && fsp) {
        try {
            const entries = await fsp.readdir(path, { withFileTypes: true });
            return entries
                .filter((e: any) => e.isFile())
                .map((e: any) => e.name);
        } catch (err: any) {
            debug(`${ENGINE} readDir desktop 失败: path=${path}, err=${err.message}`);
            return [];
        }
    }

    const ka = new KernelApi();
    try {
        const res = await ka.readDir(path);
        if (res && res.code === 0 && Array.isArray(res.data)) {
            return (res.data as { isDir: boolean; name: string }[])
                .filter(item => !item.isDir)
                .map(item => item.name);
        }
    } catch (err: any) {
        debug(`${ENGINE} readDir fallback 失败: path=${path}, err=${err.message}`);
    }
    return [];
}
```

### 3.3 设计要点

1. **每个函数开头 guard clause 检查 `isDesktop()`**，快速路径分支避免不必要的异步开销
2. **所有 fallback 分支 try/catch 包裹**，路径不可访问时返回空数组 / false，不抛异常
3. **`readDir` 返回纯文件名数组**（不含子目录名），上层 `sourceManager` 只需关注文件过滤
4. **`fileExists` 在 fallback 端通过 readDir 父目录实现**，因为内核没有独立的存在性检查 API
5. **`downloadUrl` desktop 端用 `Buffer.from()`**（Electron 内置 Node.js Buffer），fallback 端用 `File` + `putFile`

### 3.4 参考实现对照

| 新接口 | 旧代码参考 | 变更要点 |
|--------|-----------|---------|
| `isDesktop()` | 无，分散在代码中 `(window as any).require` 检查 | 统一封装 |
| `readDir()` | `OS.listdir()` (pythonic.ts:79) | 整合 desktop/fallback 双路径，返回纯文件名数组 |
| `getFileUrl()` | 散落在 `bgRender.ts` 中的 URL 构建 | 统一按 sourceType 构建 |
| `fileExists()` | `OS.folderExists()` (pythonic.ts:100) | 支持文件和目录，整合双路径 |
| `downloadUrl()` | 无旧实现，VSCode 中 `OnlineImageHelper` 参考 | 新建，双路径写入 |

---

## 四、src/services/sourceManager.ts 详细设计

### 4.1 设计目标

- 三种源类型统一扫描 → `ImageItem[]`
- 非 desktop 端自动跳过 `local` 源
- 统一的随机选取接口，支持 exclude
- 路径可用性验证

### 4.2 类型定义

需要在 `src/types.ts` 中新增：

```typescript
// src/types.ts（新增部分）

/** 图片/视频项（统一随机池条目） */
export interface ImageItem {
    /** 文件名（含扩展名），如 'sunset.jpg' */
    name: string;

    /** 
     * 浏览器可渲染的 URL
     * desktop local:  file:///home/user/Pictures/sunset.jpg
     * desktop upload:  file:///{workspace}/data/public/{plugin}/hash-abc.jpg
     * fallback upload: /public/{plugin}/hash-abc.jpg
     * assets:          /assets/wallpaper/sunset.jpg
     */
    url: string;

    /** 
     * 内核 API 用的路径（仅 upload 和 assets 源）：
     * data/public/{plugin}/hash-abc.jpg  或  data/assets/wallpaper/sunset.jpg
     * local 源此字段与 url 相同
     */
    apiPath: string;

    /** 资源类型：image 或 video */
    type: 'image' | 'video';

    /** 源分类 */
    sourceType: 'local' | 'upload' | 'assets';

    /** 所属源标签（用于 UI 分组展示） */
    sourceLabel: string;
}

/** 图片源配置（运行时构造，不持久化） */
export interface SourceConfig {
    /** 源分类 */
    type: 'local' | 'upload' | 'assets';
    /** 路径：local=绝对路径, upload=固定路径, assets=data/assets/xxx */
    path: string;
    /** 源显示标签 */
    label: string;
}

/** 扩展名过滤常量（§3.2 完整列表） */
export const IMAGE_EXTS = new Set([
    '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg', '.avif',
]);

export const VIDEO_EXTS = new Set([
    '.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv',
]);

/**
 * 根据文件名后缀判定资源类型
 * 返回 'image' | 'video' | null（无法判定时跳过）
 */
export function classifyFileType(filename: string): 'image' | 'video' | null {
    const ext = filename.includes('.')
        ? '.' + filename.split('.').pop()!.toLowerCase()
        : '';

    if (IMAGE_EXTS.has(ext)) return 'image';
    if (VIDEO_EXTS.has(ext)) return 'video';
    return null;
}
```

### 4.3 源配置构造

插件的 upload 源路径是固定的，不需要持久化。local/assetDirs 来自配置存储（`src/stores/config.ts`管理）。

```typescript
// src/services/sourceManager.ts

import { isDesktop, readDir } from '../utils/fs';
import { debug } from '../utils/logger';
import { IMAGE_EXTS, VIDEO_EXTS, classifyFileType } from '../types';
import type { ImageItem, SourceConfig } from '../types';
import * as cst from '../constants';

const ENGINE = 'sourceManager';

/**
 * 从配置构建完整的源列表
 *
 * 启动时调用一次：
 * 1. upload → 固定路径（始终存在，即使为空）
 * 2. assetDirs → 遍历配置中的所有子目录
 * 3. localFolders → 仅 desktop 端可用，遍历配置中的绝对路径
 *
 * Parameters
 * ----------
 * assetDirs : string[]
 *     配置中 assets 子目录列表，如 ['data/assets/wallpaper', 'data/assets/travel-photos']
 * localFolders : string[]
 *     配置中本地文件夹绝对路径列表，如 ['/home/user/Pictures/nature']
 *
 * Returns
 * -------
 * ImageItem[]
 *     三源合并后的统一列表
 */
export async function scanAll(
    assetDirs: string[] = [],
    localFolders: string[] = [],
): Promise<ImageItem[]> {
    const results: ImageItem[] = [];

    // 1. upload 源（固定路径 data/public/{pluginName}）
    const uploadPath = cst.pluginAssetsDir; // e.g. /data/public/siyuan-plugin-background-cover
    const uploadItems = await scanSource('upload', uploadPath);
    results.push(...uploadItems);
    debug(`${ENGINE} scanAll upload: ${uploadItems.length} 个文件`);

    // 2. assets 源
    for (const dir of assetDirs) {
        if (dir.length === 0) continue;
        const items = await scanSource('assets', dir);
        results.push(...items);
        debug(`${ENGINE} scanAll assets[${dir}]: ${items.length} 个文件`);
    }

    // 3. local 源（仅 desktop）
    if (isDesktop()) {
        for (const dir of localFolders) {
            if (dir.length === 0) continue;
            const ok = validatePath(dir);
            if (!ok) {
                debug(`${ENGINE} scanAll local[${dir}]: 路径不可访问，跳过`);
                continue;
            }
            const items = await scanSource('local', dir);
            results.push(...items);
            debug(`${ENGINE} scanAll local[${dir}]: ${items.length} 个文件`);
        }
    } else {
        debug(`${ENGINE} scanAll local: 非桌面端，跳过 ${localFolders.length} 个本地文件夹`);
    }

    debug(`${ENGINE} scanAll total: ${results.length} 个文件`);
    return results;
}

/**
 * 扫描单个源的目录，返回该目录下所有图片/视频项
 *
 * Parameters
 * ----------
 * type : 'local' | 'upload' | 'assets'
 *     源类型
 * path : string
 *     目录路径。local=绝对路径, others=data/... 格式
 *
 * Returns
 * -------
 * Promise<ImageItem[]>
 *     该目录下所有可识别的文件项
 *
 * Notes
 * -----
 * - 目录不可访问时返回空数组，不抛异常
 * - 无法判定类型的文件（扩展名不在列表中）跳过，并在 console.log 中记录
 */
export async function scanSource(
    type: 'local' | 'upload' | 'assets',
    path: string,
): Promise<ImageItem[]> {
    const filenames = await readDir(path);

    const items: ImageItem[] = [];
    const skipped: string[] = [];

    for (const name of filenames) {
        const fileType = classifyFileType(name);

        if (fileType === null) {
            skipped.push(name);
            continue;
        }

        const apiPath = `${path}/${name}`;
        const url = (await import('../utils/fs')).getFileUrl(apiPath, type);

        items.push({
            name,
            url,
            apiPath,
            type: fileType,
            sourceType: type,
            sourceLabel: getSourceLabel(type, path),
        });
    }

    if (skipped.length > 0) {
        debug(`${ENGINE} scanSource[${type}] 跳过不可识别的文件: [${skipped.join(', ')}]`);
    }

    return items;
}

/**
 * 从 ImageItem[] 中随机选取一个
 *
 * Parameters
 * ----------
 * items : ImageItem[]
 *     候选列表
 * excludeUrl : string | null
 *     要排除的当前 URL（避免随机到同一张图），null 则不排除
 *
 * Returns
 * -------
 * ImageItem | null
 *     随机选中的项，候选列表为空时返回 null
 *
 * Notes
 * -----
 * - 当候选列表 ≤ 1 且被排除时返回 null
 * - 图片和视频在同一池中无差别随机
 */
export function pickRandom(items: ImageItem[], excludeUrl?: string | null): ImageItem | null {
    if (items.length === 0) return null;

    if (excludeUrl) {
        const filtered = items.filter(item => item.url !== excludeUrl);
        if (filtered.length === 0) return null;
        const idx = Math.floor(Math.random() * filtered.length);
        return filtered[idx];
    }

    const idx = Math.floor(Math.random() * items.length);
    return items[idx];
}

/**
 * 验证路径是否可访问
 *
 * desktop: 使用 window.fs 检测存在性
 * fallback: 使用内核 readDir 检测（assets / upload 类型），local 类型不可用
 *
 * Parameters
 * ----------
 * path : string
 *     目录路径
 *
 * Returns
 * -------
 * Promise<boolean>
 *     路径可访问返回 true
 */
export async function validatePath(path: string): Promise<boolean> {
    if (path.length === 0) return false;

    if (isDesktop() && fsp) {
        try {
            await fsp.access(path);
            return true;
        } catch {
            return false;
        }
    }

    // fallback: 所有非 desktop 路径都是 data/... 格式，通过 readDir 验证
    try {
        await readDir(path);
        return true;
    } catch {
        return false;
    }
}

/**
 * 生成源显示标签
 *
 * Parameters
 * ----------
 * type : 'local' | 'upload' | 'assets'
 *     源类型
 * path : string
 *     目录路径
 *
 * Returns
 * -------
 * string
 *     e.g. 'upload', 'assets/wallpaper', '/home/user/Pictures/nature'
 */
function getSourceLabel(type: 'local' | 'upload' | 'assets', path: string): string {
    switch (type) {
        case 'upload':
            return 'upload';
        case 'assets': {
            const prefix = 'data/assets/';
            return path.startsWith(prefix) ? path.slice(prefix.length) : path;
        }
        case 'local':
            return path;
    }
}
```

### 4.4 完整扫描流程

```
scanAll(assetDirs, localFolders)
 │
 ├─ 1. upload 固定路径 → scanSource('upload', cst.pluginAssetsDir)
 │     └─ readDir("/data/public/siyuan-plugin-bgcover/")
 │         → ['hash-abc.jpg', 'hash-def.png']                      
 │         → 过滤扩展名 → 生成 ImageItem[] with sourceType='upload' 
 │
 ├─ 2. assetDirs 遍历 → scanSource('assets', "data/assets/wallpaper") ,
 │                     → scanSource('assets', "data/assets/travel")   , ...
 │     └─ readDir("data/assets/wallpaper/")
 │         → ['sunset.jpg', 'mountain.png', 'README.md']
 │         → README.md 扩展名不在列表中 → skipped, logged
 │         → 生成 ImageItem[] with sourceType='assets'
 │
 └─ 3. localFolders 遍历 (if isDesktop())
      │  └─ validatePath('/home/user/Pictures/nature') → 不可访问 → 跳过，logged
      │  └─ scanSource('local', '/home/user/Pictures/wallpaper')
      │      └─ readDir('/home/user/Pictures/wallpaper')
      │          → ['lake.jpg', 'timelapse.mp4']
      │          → 生成 ImageItem[] with sourceType='local'
      │
      └─ 非 desktop 端 → 跳过，单条 log 记录总数
               
 ```
           └─ []
```

### 4.5 pickRandom 排除机制

单图时不排除自身，但调用方 (`bgRender.ts`) 会在选中后传入当前 URL 作为 excludeUrl 以确保持续随机时不会选中同一张图：

```typescript
// bgRender.ts 中的调用：
const next = sourceManager.pickRandom(pool, currentUrl);
if (!next) {
    // 候选为空（如只有一张图且被排除），允许重复
    next = sourceManager.pickRandom(pool);
}
```

### 4.6 参考对照

| 新接口 | 旧代码参考 | 变更要点 |
|--------|-----------|---------|
| `scanAll()` | `checkAssetsDir()` + `generateCacheImgList()` (fileManager.ts) | 不再维护 fileidx hash 表，改为每次启动扫描目录 |
| `scanSource()` | `getFolderImgList()` + `checkFolder()` (PickList.ts:704-720) | 整合三种源类型，扩展过滤表增加 `.svg .avif .avi .mkv` |
| `pickRandom()` | `topbarUI.selectPictureRandom()` (topbar.ts) | 新增 excludeUrl 参数，逻辑内聚到 sourceManager |
| `validatePath()` | `checkFolder()` (PickList.ts:714-720) + `OS.folderExists()` (pythonic.ts:100) | 统一双路径，提升为独立函数 |

---

## 五、扩展名过滤列表

引用自 master plan §3.2：

```typescript
// 图片扩展名
const IMAGE_EXTS = new Set([
    '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg', '.avif',
]);

// 视频扩展名
const VIDEO_EXTS = new Set([
    '.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv',
]);
```

新增 `.avif` 和 `.mkv` 为未来作准备。

判断优先级：
1. 扩展名在 IMAGE_EXTS 中 → `type='image'`
2. 扩展名在 VIDEO_EXTS 中 → `type='video'`
3. 都不在 → 跳过，不加入随机池，`console.log` 记录被跳过的文件名

---

## 六、测试计划

### 6.1 测试文件：tests/utils/fs.test.ts

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isDesktop, readDir, getFileUrl, fileExists, downloadUrl } from '../../src/utils/fs';

describe('fs.ts - isDesktop', () => {
    it('window.require 存在且能加载 fs/promises 时返回 true', () => {
        (window as any).require = vi.fn((id: string) => {
            if (id === 'fs/promises') return { readdir: vi.fn(), access: vi.fn(), writeFile: vi.fn() };
            return undefined;
        });
        expect(isDesktop()).toBe(true);
    });

    it('window.require 不存在时返回 false', () => {
        delete (window as any).require;
        expect(isDesktop()).toBe(false);
    });
});

describe('fs.ts - readDir', () => {
    it('desktop: 返回纯文件列表', async () => {
        (window as any).require = vi.fn((id: string) => {
            if (id === 'fs/promises') return {
                readdir: vi.fn().mockResolvedValue([
                    { name: 'a.jpg', isFile: () => true },
                    { name: 'subdir', isFile: () => false },
                    { name: 'b.png', isFile: () => true },
                ]),
            };
        });

        const files = await readDir('/fake/path');
        expect(files).toEqual(['a.jpg', 'b.png']);
    });

    it('desktop: readdir 抛出时返回 []', async () => {
        (window as any).require = vi.fn((id: string) => {
            if (id === 'fs/promises') return {
                readdir: vi.fn().mockRejectedValue(new Error('ENOENT')),
            };
        });

        const files = await readDir('/nonexistent');
        expect(files).toEqual([]);
    });

    it('fallback: 从 KernelApi 过滤 isDir=false', async () => {
        delete (window as any).require;

        // mock KernelApi.readDir
        const mockReadDir = vi.fn().mockResolvedValue({
            code: 0,
            data: [
                { isDir: true, name: 'subfolder' },
                { isDir: false, name: 'img.jpg' },
                { isDir: false, name: 'vid.mp4' },
            ],
        });

        // 注入 mock（实际测试中通过 vi.mock 实现）
        const files = await readDir('data/public/plugin');
        expect(files).toEqual(['img.jpg', 'vid.mp4']);
    });
});

describe('fs.ts - getFileUrl', () => {
    beforeEach(() => {
        (window as any).siyuan = {
            config: { system: { workspaceDir: '/tmp/workspace' } },
        };
    });

    it('local: 返回 file:// 协议', () => {
        (window as any).require = vi.fn(() => ({}));
        expect(getFileUrl('/home/user/Pictures/img.jpg', 'local'))
            .toBe('file:///home/user/Pictures/img.jpg');
    });

    it('assets: 返回 /assets/... 路径', () => {
        expect(getFileUrl('data/assets/wallpaper/img.jpg', 'assets'))
            .toBe('/assets/wallpaper/img.jpg');
    });

    it('upload desktop: 返回 file:// 协议', () => {
        (window as any).require = vi.fn(() => ({}));
        expect(getFileUrl('data/public/plugin/img.jpg', 'upload'))
            .toBe('file:///tmp/workspace/data/public/plugin/img.jpg');
    });

    it('upload fallback: 返回 /public/... 路径', () => {
        delete (window as any).require;
        expect(getFileUrl('data/public/plugin/img.jpg', 'upload'))
            .toBe('/public/plugin/img.jpg');
    });
});

describe('fs.ts - fileExists', () => {
    it('desktop: 调用 fsp.access()', async () => {
        (window as any).require = vi.fn((id: string) => {
            if (id === 'fs/promises') return {
                access: vi.fn().mockResolvedValue(undefined),
            };
        });
        expect(await fileExists('/fake/path')).toBe(true);
    });

    it('fallback: 通过 readDir 父目录判断', async () => {
        delete (window as any).require;
        // readDir mock 返回包含 target 的列表
        // （实际测试中通过 vi.mock 实现）
    });
});

describe('fs.ts - downloadUrl', () => {
    it('success: fetch → blob → writeFile / putFile', async () => {
        // mock 完整的 fetch → blob → writeFile 链路
    });

    it('fetch 失败: 返回 false', async () => {
        globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
        expect(await downloadUrl('https://bad.url/img.jpg', '/dest/path'))
            .toBe(false);
    });
});
```

### 6.2 测试文件：tests/services/sourceManager.test.ts

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    scanAll, scanSource, pickRandom, validatePath,
} from '../../src/services/sourceManager';
import { classifyFileType } from '../../src/types';

describe('types.ts - classifyFileType', () => {
    it.each([
        ['sunset.png', 'image'],
        ['photo.jpg', 'image'],
        ['photo.jpeg', 'image'],
        ['anim.gif', 'image'],
        ['pic.webp', 'image'],
        ['pic.bmp', 'image'],
        ['icon.svg', 'image'],
        ['hdr.avif', 'image'],
        ['video.mp4', 'video'],
        ['video.webm', 'video'],
        ['video.ogg', 'video'],
        ['movie.mov', 'video'],
        ['movie.avi', 'video'],
        ['movie.mkv', 'video'],
        ['readme.md', null],
        ['script.js', null],
        ['noextension', null],
    ])('%s → %s', (filename, expected) => {
        expect(classifyFileType(filename)).toBe(expected);
    });
});

describe('sourceManager - pickRandom', () => {
    const items = [
        { name: 'a.jpg', url: 'file:///a.jpg', apiPath: '/a.jpg', type: 'image' as const, sourceType: 'local' as const, sourceLabel: '/pics' },
        { name: 'b.png', url: 'file:///b.png', apiPath: '/b.png', type: 'image' as const, sourceType: 'local' as const, sourceLabel: '/pics' },
        { name: 'c.mp4', url: 'file:///c.mp4', apiPath: '/c.mp4', type: 'video' as const, sourceType: 'local' as const, sourceLabel: '/pics' },
    ];

    it('空数组返回 null', () => {
        expect(pickRandom([])).toBeNull();
    });

    it('非空数组返回一个 item', () => {
        const result = pickRandom(items);
        expect(result).toBeDefined();
        expect(items).toContain(result);
    });

    it('excludeUrl 排除指定项', () => {
        const result = pickRandom(items, 'file:///a.jpg');
        expect(result!.url).not.toBe('file:///a.jpg');
    });

    it('excludeUrl 排除后只剩一项时返回该项', () => {
        const singleItem = [items[0]];
        const result = pickRandom(singleItem, 'file:///a.jpg');
        expect(result).toBeNull();
    });
});

describe('sourceManager - scanAll', () => {
    it('三种源合并后返回统一列表', async () => {
        // mock readDir 分别为 upload / assets / local 返回不同文件列表

        const result = await scanAll(
            ['data/assets/wallpaper'],
            ['/home/user/Pictures/nature'],
        );

        expect(result.length).toBeGreaterThan(0);
        // 验证所有 item 都有完整的 ImageItem 字段
    });

    it('空 source 列表返回空数组', async () => {
        const result = await scanAll([], []);
        // upload 固定路径可能也为空
        expect(Array.isArray(result)).toBe(true);
    });

    it('非 desktop 端跳过 localFolders', async () => {
        delete (window as any).require;

        const result = await scanAll([], ['/home/user/Pictures']);

        // local 源被跳过，结果不含 local 类型的 item
        expect(result.filter(i => i.sourceType === 'local').length).toBe(0);
    });

    it('路径不可访问的 source 被跳过不中断扫描', async () => {
        // mock readDir 对某个路径抛出异常

        const result = await scanAll(
            ['data/assets/nonexistent'],
            ['/nonexistent/path'],
        );

        // 应正常返回其他源的结果，不抛异常
        expect(Array.isArray(result)).toBe(true);
    });
});
```

### 6.3 测试运行命令

```bash
pnpm test -- tests/utils/fs.test.ts
pnpm test -- tests/services/sourceManager.test.ts
pnpm test  # 全量
```

---

## 七、实现步骤

按依赖顺序：

| # | 步骤 | 涉及文件 | 预估 |
|---|------|---------|------|
| 1 | 在 `src/types.ts` 添加 `ImageItem` 接口、`classifyFileType` 函数、`IMAGE_EXTS` / `VIDEO_EXTS` 常量 | `src/types.ts` | 20min |
| 2 | 在 `src/constants.ts` 引入扩展名列表（或删除旧的 `supportedImageSuffix`，引用 `types.ts` 的新常量） | `src/constants.ts` | 5min |
| 3 | 实现 `src/utils/fs.ts` | `src/utils/fs.ts`（新建） | 1h |
| 4 | 实现 `src/services/sourceManager.ts` | `src/services/sourceManager.ts`（新建） | 1h |
| 5 | 编写 `tests/utils/fs.test.ts` | `tests/utils/fs.test.ts`（新建） | 45min |
| 6 | 编写 `tests/services/sourceManager.test.ts` | `tests/services/sourceManager.test.ts`（新建） | 45min |
| 7 | 运行全量测试，修复失败用例 | — | 30min |
| 8 | 构建验证 (`pnpm build`) | — | 10min |

---

## 八、核心设计决策

1. **upload 源不持久化**：路径固定为 `data/public/{pluginName}`，不需要配置字段。启动时直接 `readDir` 扫描即可。

2. **每次启动全量扫描，不维护 hash 表**：旧代码维护 `fileidx` (hash→bgObj) 用于去重和跨设备同步。重构后：
   - 文件名去重：同名文件视为相同（upload 场景）
   - local/assets 源用户自行管理，不重复上传同一张图
   - 移除 `ts-md5` 依赖

3. **`getFileUrl` 统一处理跨平台 URL**：local 强制 `file:///`，assets 固定 `url(/assets/...)`，upload 按平台切换。所有 URL 构建集中在一处。

4. **`scanAll` 不抛异常**：单个源目录不可访问时跳过并 log，不影响其他源扫描。保证插件启动健壮性。

5. **图片/视频共享统一随机池**：`scanAll` 返回的 `ImageItem[]` 同时包含 image 和 video。随机选取不区分类别。Phase 5 的 `bgRender.ts` 根据 `item.type` 决定用 canvas 还是 video 渲染。

---

## 九、退出标准

- [ ] `utils/fs.ts` 所有函数实现完成，含 JSDoc 注释
- [ ] `services/sourceManager.ts` 所有函数实现完成，含 JSDoc 注释
- [ ] `types.ts` / `constants.ts` 新增类型和常量已添加
- [ ] `pnpm test` 全量通过（含 fs.test.ts 和 sourceManager.test.ts）
- [ ] `pnpm build` 构建成功
- [ ] desktop 端 mock 测试：`isDesktop()` 返回 true，`readDir` 走 `require('fs/promises')` 路径
- [ ] fallback 端 mock 测试：`isDesktop()` 返回 false，`readDir` 走 KernelApi 路径
- [ ] `scanAll` 返回的类型均为有效的 `ImageItem`，`type` 属性为 `'image' | 'video'`
- [ ] 扩展名列表中有 `.svg` / `.avif` / `.mkv`
- [ ] 旧代码中的 `supportedImageSuffix` (constants.ts:26) 已替换为新常量
