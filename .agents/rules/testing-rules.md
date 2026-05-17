# 测试规则

## 目录结构（镜像 `src/`）

tests/vitest.setup.ts 声明全局 mock，各模块一一对应：

```
tests/
├── vitest.setup.ts                   # window.siyuan / require / fetchPost
├── stores/config.test.ts
├── services/{sourceManager,bgRender}.test.ts
├── utils/{api,fs,theme}.test.ts
└── ui/{topbar,settings}.test.ts + sources/source-list.test.ts
```

**框架**: `vitest` (运行器) + `@testing-library/svelte` (组件) + `jsdom` (DOM 环境)

## Mock 策略

### 全局 Mock（`vitest.setup.ts`）

```typescript
import '@testing-library/jest-dom/vitest'
;(window as any).siyuan = {
    config: { system: { id: 'test-device', workspaceDir: '/tmp/test-workspace' } },
    storage: {} as Record<string, any>,
    languages: { cancel: 'Cancel', confirm: 'Confirm' },
}
;(window as any).fetchPost = async () => ({ code: 0, data: null })
```

### `vi.mock` 工厂不能引用外层变量（hoisting）

```typescript
// ❌ mockFetchPost 尚未赋值 → ReferenceError
const mockFetchPost = vi.fn()
vi.mock("siyuan", () => ({ fetchPost: mockFetchPost }))

// ✅ fn() 写在工厂内
vi.mock("siyuan", () => ({
    fetchSyncPost: vi.fn(async () => ({ code: 0, msg: "", data: null, cmd: "", sid: "" })),
}))
import { fetchSyncPost } from "siyuan"   // vi.mocked(fetchSyncPost) 操作
```

### `fetchSyncPost` mock 必须包含 `IWebSocketData` 全部字段

```typescript
// ✅ { code, msg, data, cmd, sid } 缺一不可
// ❌ 缺少 cmd/sid → TS2345
```

## jsdom 限制

`videoEl.play()` / `videoEl.pause()` 未实现，生产代码中须 try/catch 保护：

```typescript
const playPromise = videoEl.play()
if (playPromise) playPromise.catch(e => { if (e.name !== 'AbortError') console.warn(e) })
try { videoEl.pause() } catch { /* ignored */ }
```

## Svelte 5 组件测试

```typescript
import { render, screen } from '@testing-library/svelte'
const { container } = render(Component, { props: { ... } })
```

| 模式 | 说明 |
|------|------|
| `$state()` / `$derived()` / `$props()` | 组件状态与 Props |
| callback props | 替代 `createEventDispatcher` |
| `vi.mock` | 模拟 service/store 依赖 |

## 测试命令

| 命令 | 用途 |
|------|------|
| `pnpm test` | 全量测试 |
| `pnpm test -- --watch` | 监听模式 |
| `pnpm test -- tests/stores/` | 单个目录 |
| `pnpm test -- tests/utils/api.test.ts` | 单个文件 |
| `pnpm test:coverage` | 覆盖率报告 |

## 禁止事项

| 禁止 | 原因 |
|------|------|
| `vi.mock` 工厂引用外层变量 | hoisting → ReferenceError |
| `fetchSyncPost` mock 缺 `cmd`/`sid` | 类型不匹配 |
| 单例 store 测试间不重置 | 测试污染 |
| jsdom 中直接 `videoEl.play()` | Not implemented |
| 混淆 `fetchPost` 回调与 `fetchSyncPost` Promise | 签名不同 |
