# 思源 API 与本地文件系统调用规则

何时使用 思源 API/FS 层约束

| 源类型 | desktop | mobile / browser / docker | 枚举方式 | 渲染方式 |
|--------|---------|--------------------------|---------|---------|
| `local` | **可用** | 不可用 | `require('fs/promises')` | `url("file:///...")` |
| `upload` | **可用** | **可用** | `api.readDir("data/public/...")` | `url("/data/public/...")` |
| `assets` | **可用** | **可用** | `api.readDir("data/assets/...")` | `url("/data/assets/...")` |
| `url` | **可用** | **可用** | HTTP 下载 | `url(...)` |

---

## 一、模块职责

### `src/utils/api.ts` — 思源内核 API 封装

```typescript
import { fetchSyncPost } from "siyuan"

interface IResponse { code: number; msg: string; data: any }
interface IDirItem { isDir: boolean; name: string }

request(url, data)      → fetchSyncPost → { code: 0 ? data : null }
readDir(path)           → /api/file/readDir   → 自动过滤 isDir 返回 name[]
putFile(path, blob)     → /api/file/putFile   → FormData + 原始 Blob
removeFile(path)        → /api/file/removeFile
downloadUrl(url, dest)  → fetch + putFile 一站式
```

**原则**：全平台可用，不区分 desktop/fallback。用 `fetchSyncPost`（Promise-based，非回调）。

### `src/utils/fs.ts` — 本地文件系统封装

```typescript
import { configStore } from "../stores/config"

isDesktop()             → typeof window.require === 'function' && getFsp() !== null
readLocalDir(path)      → fsp.readdir + isFile() 过滤，仅返回 name[]
getFileUrl(path, type)  → 按 sourceType 构造渲染 URL
fileExists(path, type)  → local → fsp.access，其余 → api.readDir 检测

// 内部辅助
getFsp()                → window.require('fs/promises') ?? null，惰性求值
isLocalPath(path)       → configStore.get("localFolders").some(f => path.startsWith(f))
```

**原则**：仅用于用户配置的 `localFolders` 路径。禁止用于 `data/...` 工作空间路径。

---

## 二、路径判断规则

### 核心原则：查 `localFolders`，不猜前缀

```typescript
// ✅ 正确
function isLocalPath(path: string): boolean {
    return configStore.get("localFolders").some(f => path.startsWith(f))
}

// ❌ 错误：前缀匹配不可靠
path.startsWith('/')           // /data/public/... 也以 / 开头
path.startsWith('data/')       // localFolders 可能是 /home/user/...
```

### `readLocalDir` vs `api.readDir` 调用决策

| 路径来源 | 调用 | 原因 |
|---------|------|------|
| `localFolders` 配置项 | `readLocalDir(path)` | 用户指定绝对路径，走 fsp |
| `data/assets/...` | `api.readDir(path)` | 工作空间路径，走内核 |
| `data/public/...` | `api.readDir(path)` | 工作空间路径，走内核 |
| upload 固定路径 | `api.readDir(path)` | 工作空间路径，走内核 |

### `sourceManager.scanSource` 中的 dispatch

```typescript
const filenames = type === 'local'
    ? await readLocalDir(path)       // fsp
    : await readDirKernel(path)      // fetchSyncPost → /api/file/readDir
```

---

## 三、`/api/file/putFile` 调用规范

### 必须使用 FormData + 原始 File/Blob

```typescript
// ✅ 正确
const fd = new FormData()
fd.append("path", "data/public/{plugin}/file.jpg")
fd.append("isDir", "false")
fd.append("modTime", Math.floor(Date.now() / 1000).toString())
fd.append("file", rawFile)  // 原始 File 或 Blob 对象
fetchSyncPost("/api/file/putFile", fd)

// ❌ 错误：JSON body + data URL
fetchPost("/api/file/putFile", { path, file: dataUrl }, cb)
// → ERR_CONNECTION_RESET
```

**根因**：`putFile` 是 HTTP Multipart form 接口。后端从 `FormData.file` 读取二进制流。

### `isDir` 参数

| 操作 | isDir | file |
|------|-------|------|
| 上传文件 | `"false"` | File/Blob |
| 创建目录 | `"true"` | 忽略 |

本插件仅涉及文件上传，`isDir` 固定 `"false"`。

### `modTime` 参数

```typescript
Math.floor(Date.now() / 1000).toString()  // Unix 时间戳（秒）
```

后端用此字段校验文件最后修改时间。

---

## 四、`getFileUrl` 路径构造

### 按 sourceType 分支

| sourceType | Desktop | Fallback |
|-----------|---------|---------|
| `local` | `file:///home/user/Pictures/img.jpg` | `file://{path}`（不可用，仅 desktop） |
| `upload` | `file://{wsDir}/data/public/{plugin}/img.jpg` | `/public/{plugin}/img.jpg` |
| `assets` | `file://{wsDir}/data/assets/wallpaper/img.jpg` | `/assets/wallpaper/img.jpg` |

### Desktop 路径拼接

```typescript
const wsDir = siyuan.config.system.workspaceDir     // /home/user/SiyuanDev
const cleanPath = apiPath.startsWith('/') ? apiPath.slice(1) : apiPath  // 去前导 /
return `file://${wsDir}/${cleanPath}`  // file:///home/user/SiyuanDev/data/public/plugin/img.jpg
```

禁止直接 `wsDir + apiPath`（会 `//` 双斜杠）。

### 规范化 data 前缀

```typescript
let rel = apiPath
if (rel.startsWith('/data/')) rel = rel.slice(1)      // /data/public/... → data/public/...
if (rel.startsWith('data/')) rel = '/' + rel.slice(5)  // data/public/...  → /public/...
return rel
```

同时处理 `data/` 和 `/data/` 两种输入。

---

## 五、`fetchSyncPost` vs `fetchPost` 使用场景

| 场景 | 使用 | 原因 |
|------|------|------|
| JSON API（读/写配置、读目录、删文件） | `fetchSyncPost` | Promise-based，代码简洁 |
| FormData 上传（putFile） | `fetchSyncPost` | 支持 FormData |
| 获取文件原始内容（getFile） | `fetchPost` | 返回非 JSON 内容 |

**本插件代码中**：`api.ts` 全部用 `fetchSyncPost`，`topbar-menu.ts` 多文件上传用 `fetchPost`（现已有 `putFile` 封装替代）。

---

## 六、禁止事项

| 禁止 | 原因 |
|------|------|
| 对 `data/...` 路径调用 `fsp.readdir` | 相对路径，fsp 解析为文件系统根 → ENOENT |
| 用 `startsWith('/')` 判断是否本地路径 | `/data/public/...` 也以 `/` 开头 |
| `putFile` 用 JSON body | 后端只接受 FormData |
| 在 `fs.ts` 中 import `api.ts` 的函数 | 职责分离（`fileExists` 用 dynamic import 例外） |
| `pluginAssetsDir` 以 `/` 开头传给 fsp | 须保持为 `/data/public/{plugin}/` 格式 |
