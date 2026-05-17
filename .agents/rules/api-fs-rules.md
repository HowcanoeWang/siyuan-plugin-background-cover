# 思源 API 与本地文件系统调用规则

## 三种源类型的核心差异

| 源类型 | 平台 | 目录枚举 | Canvas 渲染 URL |
|--------|------|---------|-----------------|
| `local` | **desktop only** | `require('fs/promises')`（`src/utils/fs.ts`） | `url("file:///absolute/path/img.jpg")` |
| `upload` | 全平台 | 思源 API `readDir` | `url("public/{packageName}/img.jpg")` |
| `assets` | 全平台 | 思源 API `readDir` | `url("assets/.../img.jpg")` |

---

## 一、源码模块职责

### `src/utils/fs.ts` — 本地文件系统（仅 `local` 源类型）

```
isDesktop()           → typeof window.require === 'function' && getFsp() !== null
readLocalDir(path)    → fsp.readdir + isFile() 过滤，仅返回 name[]
getFileUrl(path, type)→ 按 sourceType 构造渲染 URL
fileExists(path)      → fsp.access 检测
```

**原则**：仅用于 `localFolders` 配置项。禁止操作 `data/...` 工作空间路径。

### `src/utils/api.ts` — 思源内核 API（`upload` / `assets` 源类型）

```
readDir(path)    → /api/file/readDir   → 自动过滤 isDir，返回 name[]
putFile(path, blob) → /api/file/putFile → FormData + 原始 Blob
removeFile(path) → /api/file/removeFile
downloadUrl(url) → fetch + putFile 一站式
```

**原则**：全平台可用，统一用 `fetchSyncPost`（Promise-based）。

---

## 二、Canvas 渲染 URL 构造

canvas CSS 中引用背景图片时，URL 按源类型不同：

| sourceType | Canvas `url()` | 说明 |
|-----------|---------------|------|
| `local` | `url("file:///home/user/Pictures/img.jpg")` | 绝对路径，仅 desktop 可用 |
| `upload` | `url("public/{packageName}/img.jpg")` | 思源 webview 相对路径，全平台 |
| `assets` | `url("assets/.../img.jpg")` | 思源 webview 相对路径，全平台 |

> **`file:///` 仅用于 `local`**。`upload` 和 `assets` 在所有平台（含 desktop）都使用思源 webview 的相对路径，思源内核负责解析到正确位置。

### upload 路径: `data/` → `public/` 前缀转换

upload 文件存在 `/data/public/{plugin}/` 下，但 canvas CSS 中引用时去掉 `data` 前缀：

```typescript
let rel = apiPath
if (rel.startsWith('/data/')) rel = rel.slice(1)        // /data/public/... → data/public/...
if (rel.startsWith('data/')) rel = '/' + rel.slice(5)    // data/public/...  → /public/...
// 最终用于 canvas: url("public/{plugin}/img.jpg")
```

---

## 三、目录枚举 dispatch

```typescript
// sourceManager.scanSource 中
const filenames = type === 'local'
    ? await readLocalDir(path)       // fsp.readdir
    : await readDirKernel(path)      // fetchSyncPost → /api/file/readDir
```

### 判断路径是否属于 localFolders

```typescript
// ✅ 正确：查 localFolders 配置
function isLocalPath(path: string): boolean {
    return configStore.get("localFolders").some(f => path.startsWith(f))
}

// ❌ 错误：前缀匹配不可靠
path.startsWith('/')     // /data/public/... 也以 / 开头
path.startsWith('data/') // localFolders 可能是 /home/user/...
```

---

## 四、`/api/file/putFile` 上传规范

### 必须使用 FormData + 原始 File/Blob

```typescript
const fd = new FormData()
fd.append("path", "data/public/{plugin}/file.jpg")
fd.append("isDir", "false")
fd.append("modTime", Math.floor(Date.now() / 1000).toString())
fd.append("file", rawFile)  // 原始 File 或 Blob
fetchSyncPost("/api/file/putFile", fd)
```

> `putFile` 是 HTTP Multipart form 接口，后端从 `FormData.file` 读取二进制流。JSON body 会导致 `ERR_CONNECTION_RESET`。

---

## 五、禁止事项

| 禁止 | 原因 |
|------|------|
| 对 `data/...` 路径调用 `fsp.readdir` | 相对路径 → ENOENT |
| 用 `startsWith('/')` 判断本地路径 | `/data/public/...` 也以 `/` 开头 |
| `putFile` 用 JSON body | 后端只接受 FormData |
| `fs.ts` 中 import `api.ts` 的函数 | 职责分离 |
