# 开发脚本说明

## 环境变量

插件安装脚本需要知道思源工作空间的位置。脚本会按以下优先级探测：

1. **HTTP API**（端口 6806）— 思源运行时自动检测
2. **`SIYUAN_PLUGIN_DIR`** — 直接指定 `data/plugins/` 目录
3. **`SIYUANDEV`** — 思源开发工作空间根目录，脚本自动拼接 `data/plugins/`

推荐在 `~/.bashrc` 或 `~/.zshrc` 中设置：

```bash
export SIYUANDEV="/home/user/SiyuanDev"   # 替换为实际路径
```

## 命令

| 命令 | 用途 | 输出目录 | 说明 |
|------|------|---------|------|
| `pnpm dev` | 开发构建（watch 模式） | `dev/` | 修改代码自动 rebuild，含 sourcemap |
| `pnpm build` | 生产构建 | `dist/` | 压缩 + 打包 `package.zip` |
| `pnpm make-link` | 符号链接到思源插件目录 | — | 需先运行 `pnpm dev`，创建后思源自动加载 dev 版 |
| `pnpm make-install` | 构建并复制到思源插件目录 | — | 一次性操作，对应旧版 `copy2dev.js` |
| `pnpm test` | 运行所有测试 | — | vitest 单次运行 |
| `pnpm test:watch` | 测试监听模式 | — | 文件变更自动重跑 |
| `pnpm test:coverage` | 测试覆盖率报告 | `coverage/` | 生成 HTML 报告 |

## 典型工作流

### 开发新功能

```bash
# 终端 1：启动 dev build 监听
pnpm dev

# 终端 2：创建符号链接（仅首次）
pnpm make-link

# 此后修改 src/ 中的代码，Vite 自动 rebuild 到 dev/
# 思源中点击刷新或重启即可看到变更
```

### 一次性安装测试

```bash
pnpm make-install
# 重启思源
```

### 运行测试

```bash
pnpm test                    # 全量
pnpm test -- --watch         # 监听模式
pnpm test -- tests/stores/   # 单个目录
```
