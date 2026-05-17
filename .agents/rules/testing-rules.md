# 测试规则

> 整理自 Phase 1-6 实施期间 vitest + jsdom 测试中建立的约束

---

## 一、`vi.mock` 工厂函数限制

### 不能引用模块作用域变量（hoisting）

`vi.mock` 工厂函数被 JavaScript 引擎提升（hoist）到文件顶部执行，此时模块作用域变量尚未初始化。

```typescript
// ❌ 错误：mockFetchPost 尚未赋值
const mockFetchPost = vi.fn()
vi.mock("siyuan", () => ({ fetchPost: mockFetchPost }))
// → ReferenceError: Cannot access 'mockFetchPost' before initialization

// ✅ 正确：vi.fn() 直接写在工厂函数内
vi.mock("siyuan", () => ({
    fetchSyncPost: vi.fn(async () => ({ code: 0, msg: "", data: null, cmd: "", sid: "" })),
}))

// 获取类型化引用
import { fetchSyncPost } from "siyuan"
// 使用 vi.mocked(fetchSyncPost) 操作
```

---

## 二、`fetchSyncPost` Mock 必须包含 `IWebSocketData` 完整字段

```typescript
// fetchSyncPost 返回 Promise<IWebSocketData>
// IWebSocketData = { code, msg, data, cmd, sid }

// ✅ 正确
vi.mocked(fetchSyncPost).mockResolvedValue({
    code: 0, msg: "", data: [...], cmd: "", sid: ""
})

// ❌ 错误：缺少 cmd, sid
vi.mocked(fetchSyncPost).mockResolvedValue({ code: 0, msg: "", data: [...] })
// → TS2345: missing properties 'cmd', 'sid'
```

---

## 三、单例 Store 测试隔离

### 使用 `_resetForTest()` 方法

各 test case 间共享单例实例，需在 `beforeEach` 中重置。

```typescript
// stores/config.ts
class ConfigStore {
    _resetForTest(): void {
        this.cfg = { ...APP_CONFIG_DEFAULTS }
        this.dirty = false
        this.ready = false
    }
}

// tests/stores/config.test.ts
beforeEach(() => {
    configStore._resetForTest()
    ;(window as any).siyuan.storage = {}
})
```

---

## 四、jsdom 限制与 Workaround

### `HTMLMediaElement.play()` / `.pause()` 未实现

jsdom 不支持 media 元素交互，需在代码中保护：

```typescript
// 生产代码中的保护
const playPromise = videoEl.play()
if (playPromise) {
    playPromise.catch((e) => {
        if (e.name !== 'AbortError') console.warn('video play failed:', e)
    })
}

// pause() 同理
try { videoEl.pause() } catch { /* jsdom not implemented */ }
```

### 全局 Mock 在 `tests/vitest.setup.ts` 声明

```typescript
// tests/vitest.setup.ts
import '@testing-library/jest-dom/vitest'

;(window as any).siyuan = {
    config: { system: { id: 'test-device', workspaceDir: '/tmp/test-workspace' } },
    storage: {} as Record<string, any>,
    languages: { cancel: 'Cancel', confirm: 'Confirm' },
}
;(window as any).fetchPost = async () => ({ code: 0, data: null })
```

---

## 五、Svelte 5 组件测试

### 使用 `@testing-library/svelte`

```typescript
import { render, screen } from '@testing-library/svelte'
import Component from './component.svelte'

const { container } = render(Component, { props: { ... } })
```

### Svelte 5 模式

| 模式 | 说明 |
|------|------|
| `$state()` | 局部状态 |
| `$derived()` | 派生值 |
| `$props()` | 组件 Props（替代 `export let`） |
| callback props | 子→父通信（替代 `createEventDispatcher`） |
| `vi.mock` | 模拟 service/store 依赖 |

---

## 六、测试文件组织

### 目录结构镜像 `src/`

```
tests/
├── vitest.setup.ts
├── __mocks__/siyuan.ts          # 全局 siyuan 模块 mock
├── index.test.ts                # 入口冒烟测试
├── stores/config.test.ts        # 配置 CRUD、迁移
├── services/
│   ├── sourceManager.test.ts    # 扫描、过滤、随机
│   └── bgRender.test.ts         # DOM 渲染、样式
├── utils/
│   ├── api.test.ts              # 内核 API 调用
│   └── fs.test.ts               # 本地 fs 操作
└── ui/                          # Svelte 组件测试
    ├── settings.test.ts
    └── sources/source-list.test.ts
```

---

## 七、测试命令

| 命令 | 用途 |
|------|------|
| `pnpm test` | 全量测试 |
| `pnpm test -- --watch` | 监听模式 |
| `pnpm test -- tests/stores/` | 单个目录 |
| `pnpm test -- tests/utils/api.test.ts` | 单个文件 |
| `pnpm test:coverage` | 覆盖率报告 |

---

## 八、禁止事项

| 禁止 | 原因 |
|------|------|
| `vi.mock` 工厂引用外层变量 | hoisting 报错 |
| `fetchSyncPost` mock 缺失 `cmd`/`sid` | 类型不匹配 |
| 单例 store 测试间不重置 | 测试污染 |
| 在 jsdom 中直接调用 `videoEl.play()` | 抛 Not implemented 错误 |
| mock 中混淆 `fetchPost` 回调 / `fetchSyncPost` Promise | 签名不同 |
