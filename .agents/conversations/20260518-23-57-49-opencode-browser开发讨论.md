# Session: opencode-browser 用于思源插件开发：Electron CDP 端点设置

**Created:** 2026-05-18 23:57:49

---

## Conversation

### 🤖 Assistant
*2026-05-19 00:01:02*

https://github.com/different-ai/opencode-browser

这个插件，是否有助于这个思源笔记的插件项目开发？我应该如何 “For Electron apps, pass the app's exposed CDP endpoint as browser_url.“

### 🤖 Assistant
*2026-05-19 00:01:02*

*[step-start part]*

💭 **Reasoning:**

<details>
<summary>Click to expand reasoning</summary>

The user is asking about the `opencode-browser` extension/plugin and whether it can help with their Siyuan (思源笔记) plugin development. They're specifically asking about the Electron CDP endpoint configuration.

Let me first understand what opencode-browser is, and then analyze whether it would be helpful for their Siyuan plugin development.

Siyuan is an Electron-based note-taking app. The background-cover plugin is a plugin for Siyuan that runs inside Siyuan's webview. For testing such a plugin, one typically needs to interact with the Siyuan app's webview/browser context.

The opencode-browser extension allows opencode to interact with a browser through CDP (Chrome DevTools Protocol). Since Siyuan is an Electron app, it has a built-in Chromium browser engine that can expose CDP endpoints.

Let me first look at what opencode-browser does, and then check the current project structure to understand if it would be useful.

Let me fetch info about opencode-browser from the GitHub URL, and also look at the current project.

</details>

#### 🔧 Tool: webfetch
**Status:** completed
**Title:** https://github.com/different-ai/opencode-browser (text/html; charset=utf-8)

**Input:**
```json
{
  "url": "https://github.com/different-ai/opencode-browser",
  "format": "markdown"
}
```

**Output:**
```
                     GitHub - different-ai/opencode-browser: OpenCode plugin to automate Chrome. Inspired by Claude in Chrome. · GitHub                                             

[Skip to content](#start-of-content)   

## Navigation Menu

Toggle navigation

[](/)

[Sign in](/login?return_to=https%3A%2F%2Fgithub.com%2Fdifferent-ai%2Fopencode-browser)

Appearance settings

  

-   Platform
    
    -   AI CODE CREATION
        
        -   [
            
            GitHub CopilotWrite better code with AI
            
            ](https://github.com/features/copilot)
        -   [
            
            GitHub SparkBuild and deploy intelligent apps
            
            ](https://github.com/features/spark)
        -   [
            
            GitHub ModelsManage and compare prompts
            
            ](https://github.com/features/models)
        -   [
            
            MCP RegistryNewIntegrate external tools
            
            ](https://github.com/mcp)
        
    -   DEVELOPER WORKFLOWS
        
        -   [
            
            ActionsAutomate any workflow
            
            ](https://github.com/features/actions)
        -   [
            
            CodespacesInstant dev environments
            
            ](https://github.com/features/codespaces)
        -   [
            
            IssuesPlan and track work
            
            ](https://github.com/features/issues)
        -   [
            
            Code ReviewManage code changes
            
            ](https://github.com/features/code-review)
        
    -   APPLICATION SECURITY
        
        -   [
            
            GitHub Advanced SecurityFind and fix vulnerabilities
            
            ](https://github.com/security/advanced-security)
        -   [
            
            Code securitySecure your code as you build
            
            ](https://github.com/security/advanced-security/code-security)
        -   [
            
            Secret protectionStop leaks before they start
            
            ](https://github.com/security/advanced-security/secret-protection)
        
    -   EXPLORE
        
        -   [Why GitHub](https://github.com/why-github)
        -   [Documentation](https://docs.github.com)
        -   [Blog](https://github.blog)
        -   [Changelog](https://github.blog/changelog)
        -   [Marketplace](https://github.com/marketplace)
        
    
    [View all features](https://github.com/features)
    
-   Solutions
    
    -   BY COMPANY SIZE
        
        -   [Enterprises](https://github.com/enterprise)
        -   [Small and medium teams](https://github.com/team)
        -   [Startups](https://github.com/enterprise/startups)
        -   [Nonprofits](https://github.com/solutions/industry/nonprofits)
        
    -   BY USE CASE
        
        -   [App Modernization](https://github.com/solutions/use-case/app-modernization)
        -   [DevSecOps](https://github.com/solutions/use-case/devsecops)
        -   [DevOps](https://github.com/solutions/use-case/devops)
        -   [CI/CD](https://github.com/solutions/use-case/ci-cd)
        -   [View all use cases](https://github.com/solutions/use-case)
        
    -   BY INDUSTRY
        
        -   [Healthcare](https://github.com/solutions/industry/healthcare)
        -   [Financial services](https://github.com/solutions/industry/financial-services)
        -   [Manufacturing](https://github.com/solutions/industry/manufacturing)
        -   [Government](https://github.com/solutions/industry/government)
        -   [View all industries](https://github.com/solutions/industry)
        
    
    [View all solutions](https://github.com/solutions)
    
-   Resources
    
    -   EXPLORE BY TOPIC
        
        -   [AI](https://github.com/resources/articles?topic=ai)
        -   [Software Development](https://github.com/resources/articles?topic=software-development)
        -   [DevOps](https://github.com/resources/articles?topic=devops)
        -   [Security](https://github.com/resources/articles?topic=security)
        -   [View all topics](https://github.com/resources/articles)
        
    -   EXPLORE BY TYPE
        
        -   [Customer stories](https://github.com/customer-stories)
        -   [Events & webinars](https://github.com/resources/events)
        -   [Ebooks & reports](https://github.com/resources/whitepapers)
        -   [Business insights](https://github.com/solutions/executive-insights)
        -   [GitHub Skills](https://skills.github.com)
        
    -   SUPPORT & SERVICES
        
        -   [Documentation](https://docs.github.com)
        -   [Customer support](https://support.github.com)
        -   [Community forum](https://github.com/orgs/community/discussions)
        -   [Trust center](https://github.com/trust-center)
        -   [Partners](https://github.com/partners)
        
    
    [View all resources](https://github.com/resources)
    
-   Open Source
    
    -   COMMUNITY
        
        -   [
            
            GitHub SponsorsFund open source developers
            
            ](https://github.com/sponsors)
        
    -   PROGRAMS
        
        -   [Security Lab](https://securitylab.github.com)
        -   [Maintainer Community](https://maintainers.github.com)
        -   [Accelerator](https://github.com/accelerator)
        -   [GitHub Stars](https://stars.github.com)
        -   [Archive Program](https://archiveprogram.github.com)
        
    -   REPOSITORIES
        
        -   [Topics](https://github.com/topics)
        -   [Trending](https://github.com/trending)
        -   [Collections](https://github.com/collections)
        
    
-   Enterprise
    
    -   ENTERPRISE SOLUTIONS
        
        -   [
            
            Enterprise platformAI-powered developer platform
            
            ](https://github.com/enterprise)
        
    -   AVAILABLE ADD-ONS
        
        -   [
            
            GitHub Advanced SecurityEnterprise-grade security features
            
            ](https://github.com/security/advanced-security)
        -   [
            
            Copilot for BusinessEnterprise-grade AI features
            
            ](https://github.com/features/copilot/copilot-business)
        -   [
            
            Premium SupportEnterprise-grade 24/7 support
            
            ](https://github.com/premium-support)
        
    
-   [Pricing](https://github.com/pricing)

Search or jump to...

# Search code, repositories, users, issues, pull requests...

Search

Clear

[Search syntax tips](https://docs.github.com/search-github/github-code-search/understanding-github-code-search-syntax)

# Provide feedback

We read every piece of feedback, and take your input very seriously.

 Include my email address so I can be contacted

Cancel Submit feedback

# Saved searches

## Use saved searches to filter your results more quickly

Name  

Query 

To see all available qualifiers, see our [documentation](https://docs.github.com/search-github/github-code-search/understanding-github-code-search-syntax).

Cancel Create saved search

[Sign in](/login?return_to=https%3A%2F%2Fgithub.com%2Fdifferent-ai%2Fopencode-browser)

[Sign up](/signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=different-ai%2Fopencode-browser)

Appearance settings

Resetting focus

You signed in with another tab or window. Reload to refresh your session. You signed out in another tab or window. Reload to refresh your session. You switched accounts on another tab or window. Reload to refresh your session. Dismiss alert

[different-ai](/different-ai) / **[opencode-browser](/different-ai/opencode-browser)** Public

-   [Notifications](/login?return_to=%2Fdifferent-ai%2Fopencode-browser) You must be signed in to change notification settings
-   [Fork 30](/login?return_to=%2Fdifferent-ai%2Fopencode-browser)
-   [Star 415](/login?return_to=%2Fdifferent-ai%2Fopencode-browser)
    

-   [Code](/different-ai/opencode-browser)
-   [Issues 12](/different-ai/opencode-browser/issues)
-   [Pull requests 2](/different-ai/opencode-browser/pulls)
-   [Actions](/different-ai/opencode-browser/actions)
-   [Projects](/different-ai/opencode-browser/projects)
-   [Security and quality 0](/different-ai/opencode-browser/security)
-   [Insights](/different-ai/opencode-browser/pulse)

Additional navigation options

-   [Code](/different-ai/opencode-browser)
-   [Issues](/different-ai/opencode-browser/issues)
-   [Pull requests](/different-ai/opencode-browser/pulls)
-   [Actions](/different-ai/opencode-browser/actions)
-   [Projects](/different-ai/opencode-browser/projects)
-   [Security and quality](/different-ai/opencode-browser/security)
-   [Insights](/different-ai/opencode-browser/pulse)

 [](/different-ai/opencode-browser)

# different-ai/opencode-browser

 main

[Branches](/different-ai/opencode-browser/branches)[Tags](/different-ai/opencode-browser/tags)

[](/different-ai/opencode-browser/branches)[](/different-ai/opencode-browser/tags)

Go to file

Code

Open more actions menu

## Folders and files

Name

Name

Last commit message

Last commit date

## Latest commit

## History

[70 Commits](/different-ai/opencode-browser/commits/main/)

[](/different-ai/opencode-browser/commits/main/)70 Commits

[.opencode/skill/browser-automation](/different-ai/opencode-browser/tree/main/.opencode/skill/browser-automation "This path skips through empty directories")

[.opencode/skill/browser-automation](/different-ai/opencode-browser/tree/main/.opencode/skill/browser-automation "This path skips through empty directories")

[bin](/different-ai/opencode-browser/tree/main/bin "bin")

[bin](/different-ai/opencode-browser/tree/main/bin "bin")

[dist](/different-ai/opencode-browser/tree/main/dist "dist")

[dist](/different-ai/opencode-browser/tree/main/dist "dist")

[src](/different-ai/opencode-browser/tree/main/src "src")

[src](/different-ai/opencode-browser/tree/main/src "src")

[.gitignore](/different-ai/opencode-browser/blob/main/.gitignore ".gitignore")

[.gitignore](/different-ai/opencode-browser/blob/main/.gitignore ".gitignore")

[AGENTS.md](/different-ai/opencode-browser/blob/main/AGENTS.md "AGENTS.md")

[AGENTS.md](/different-ai/opencode-browser/blob/main/AGENTS.md "AGENTS.md")

[GOAL.md](/different-ai/opencode-browser/blob/main/GOAL.md "GOAL.md")

[GOAL.md](/different-ai/opencode-browser/blob/main/GOAL.md "GOAL.md")

[PRD.md](/different-ai/opencode-browser/blob/main/PRD.md "PRD.md")

[PRD.md](/different-ai/opencode-browser/blob/main/PRD.md "PRD.md")

[README.md](/different-ai/opencode-browser/blob/main/README.md "README.md")

[README.md](/different-ai/opencode-browser/blob/main/README.md "README.md")

[bun.lock](/different-ai/opencode-browser/blob/main/bun.lock "bun.lock")

[bun.lock](/different-ai/opencode-browser/blob/main/bun.lock "bun.lock")

[opencode.json](/different-ai/opencode-browser/blob/main/opencode.json "opencode.json")

[opencode.json](/different-ai/opencode-browser/blob/main/opencode.json "opencode.json")

[package-lock.json](/different-ai/opencode-browser/blob/main/package-lock.json "package-lock.json")

[package-lock.json](/different-ai/opencode-browser/blob/main/package-lock.json "package-lock.json")

[package.json](/different-ai/opencode-browser/blob/main/package.json "package.json")

[package.json](/different-ai/opencode-browser/blob/main/package.json "package.json")

[pnpm-lock.yaml](/different-ai/opencode-browser/blob/main/pnpm-lock.yaml "pnpm-lock.yaml")

[pnpm-lock.yaml](/different-ai/opencode-browser/blob/main/pnpm-lock.yaml "pnpm-lock.yaml")

View all files

## Repository files navigation

-   [README](#)

# OpenCode Chrome DevTools

[](#opencode-chrome-devtools)

Browser automation plugin for [OpenCode](https://opencode.ai) using direct Chrome DevTools Protocol (CDP) connections.

This package now mirrors the browser tool example from OpenWork: no Chrome extension, no native messaging host, no local broker, and no hidden singleton browser state. Each tool call explicitly receives a `browser_url`, and tools can target a specific tab/window with `target_id`.

## Why this architecture

[](#why-this-architecture)

-   Direct CDP keeps the package small and predictable.
-   `browser_url` makes the browser endpoint explicit and portable.
-   `target_id` supports multiple tabs/windows without per-session ownership state.
-   The same tools work with Chrome, Chromium, Electron, and remote/proxied CDP endpoints.

## Configure OpenCode

[](#configure-opencode)

Install or link the package, then add it to `opencode.json` or `opencode.jsonc`:

{
  "$schema": "https://opencode.ai/config.json",
  "plugin": \["opencode-chrome-devtools"\]
}

## Start A Browser

[](#start-a-browser)

Start Chrome or Chromium with remote debugging enabled:

/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222

Then use `http://127.0.0.1:9222` as `browser_url`.

For Electron apps, pass the app's exposed CDP endpoint as `browser_url`.

## CLI Debugging

[](#cli-debugging)

The CLI can list tools and run a tool directly after `bun run build`:

npx opencode-chrome-devtools tools
npx opencode-chrome-devtools tool browser\_list --args '{"browser\_url":"http://127.0.0.1:9222"}'
npx opencode-chrome-devtools tool browser\_snapshot --args '{"browser\_url":"http://127.0.0.1:9222"}'

If you omit `browser_url` in CLI calls, `OPENCODE_BROWSER_URL` is used, then `http://127.0.0.1:9222`.

## Available Tools

[](#available-tools)

-   `browser_list`: list page targets on a CDP endpoint.
-   `browser_navigate`: navigate a target to a URL.
-   `browser_snapshot`: get an accessibility tree snapshot with `[uid]` markers.
-   `browser_click`: click an element by snapshot UID.
-   `browser_fill`: fill an input by snapshot UID.
-   `browser_eval`: evaluate JavaScript in the page.
-   `browser_screenshot`: capture a PNG screenshot and return its saved path.

## Typical Flow

[](#typical-flow)

1.  Run `browser_list` with a `browser_url`.
2.  Choose a `target_id`, or omit it to use the first page target.
3.  Run `browser_navigate` if needed.
4.  Run `browser_snapshot` to get UIDs.
5.  Use `browser_click` or `browser_fill` with a UID from the latest snapshot.
6.  Confirm results with `browser_snapshot` or `browser_eval`.

## Troubleshooting

[](#troubleshooting)

-   If `browser_list` fails, confirm the browser was started with `--remote-debugging-port` and that `/json/list` is reachable.
-   If `browser_click` or `browser_fill` says no snapshot is cached, call `browser_snapshot` first with the same `browser_url` and `target_id`.
-   If a proxied CDP endpoint returns localhost WebSocket URLs, the plugin rewrites them to the proxy host.

## About

OpenCode plugin to automate Chrome. Inspired by Claude in Chrome.

### Resources

[Readme](#readme-ov-file)

### Uh oh!

There was an error while loading. Please reload this page.

[Activity](/different-ai/opencode-browser/activity)

[Custom properties](/different-ai/opencode-browser/custom-properties)

### Stars

[**415** stars](/different-ai/opencode-browser/stargazers)

### Watchers

[**3** watching](/different-ai/opencode-browser/watchers)

### Forks

[**30** forks](/different-ai/opencode-browser/forks)

[Report repository](/contact/report-content?content_url=https%3A%2F%2Fgithub.com%2Fdifferent-ai%2Fopencode-browser&report=different-ai+%28user%29)

## [Releases 1](/different-ai/opencode-browser/releases)

[

v4.5.1 Latest

Jan 13, 2026



](/different-ai/opencode-browser/releases/tag/v4.5.1)

## [Packages 0](/orgs/different-ai/packages?repo_name=opencode-browser)

### Uh oh!

There was an error while loading. Please reload this page.

## [Contributors](/different-ai/opencode-browser/graphs/contributors)

### Uh oh!

There was an error while loading. Please reload this page.

## Languages

-   [TypeScript 85.7%](/different-ai/opencode-browser/search?l=typescript)
-   [JavaScript 14.3%](/different-ai/opencode-browser/search?l=javascript)

## Footer

[](https://github.com)© 2026 GitHub, Inc.

### Footer navigation

-   [Terms](https://docs.github.com/site-policy/github-terms/github-terms-of-service)
-   [Privacy](https://docs.github.com/site-policy/privacy-policies/github-privacy-statement)
-   [Security](https://github.com/security)
-   [Status](https://www.githubstatus.com/)
-   [Community](https://github.community/)
-   [Docs](https://docs.github.com/)
-   [Contact](https://support.github.com?tags=dotcom-footer)
-   Manage cookies
-   Do not share my personal information

You can’t perform that action at this time.
```

#### 🔧 Tool: read
**Status:** completed

**Input:**
```json
{
  "filePath": "/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover"
}
```

**Output:**
```
<path>/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover</path>
<type>directory</type>
<entries>
.agents/
.git/
.gitignore
.pytest_cache/
.vscode/
dev/
dist/
icon.png
LICENSE
node_modules/
package.json
package.zip
plugin.json
pnpm-lock.yaml
preview.png
public/
README_en_US.md
README.md
scripts/
src/
svelte.config.js
tests/
tsconfig.json
tsconfig.node.json
vite.config.ts
vitest.config.ts

(26 entries)
</entries>
```

*[step-finish part]*

### 🤖 Assistant
*2026-05-19 00:01:02*

*[step-start part]*

💭 **Reasoning:**

<details>
<summary>Click to expand reasoning</summary>

Let me analyze the opencode-browser plugin and how it could help with Siyuan plugin development.

Key observations about opencode-browser:
1. It provides CDP (Chrome DevTools Protocol) tools to interact with browsers/Electron apps
2. Tools include: browser_list, browser_navigate, browser_snapshot, browser_click

</details>

### 🤖 Assistant
*2026-05-19 00:01:02*

continue

### 🤖 Assistant
*2026-05-19 00:01:02*

*[step-start part]*

💭 **Reasoning:**

<details>
<summary>Click to expand reasoning</summary>

The user is asking about whether `opencode-browser` could be useful for their Siyuan plugin development project. Let me analyze this:

**What opencode-browser does:**
- It's a browser automation plugin for OpenCode using Chrome DevTools Protocol (CDP)
- It can interact with Chrome/Chromium/Electron apps via their CDP endpoint
- Tools include: browser_list, browser_navigate, browser_snapshot, browser_click, browser_fill, browser_eval, browser_screenshot

**What the Siyuan plugin project is:**
- A Siyuan note app plugin that adds background images/videos
- Siyuan is an Electron-based note-taking app
- The plugin runs inside Siyuan's webview
- It has Svelte UI components, services for background rendering, etc.

**How opencode-browser could help:**
Since Siyuan is an Electron app, it can expose a CDP endpoint. With opencode-browser, you could:
1. Start Siyuan with `--remote-debugging-port=9222`
2. Use `browser_url` pointing to Siyuan's CDP endpoint
3. Take screenshots of the plugin UI to visually verify changes
4. Execute JavaScript in the Siyuan webview to test plugin behavior
5. Snapshot the accessibility tree to verify UI elements are rendered correctly

This is particularly useful for a Siyuan plugin because:
- The plugin runs inside Siyuan's webview, not in a standalone browser
- You can't easily run unit/integration tests that require the Siyuan environment
- Visual verification is important for a background cover plugin
- opencode-browser could automate loading the plugin in Siyuan and taking screenshots to verify the background renders correctly

However, there are limitations to consider. Let me think about whether this is practical...

The user is asking specifically about the Electron CDP endpoint configuration. Let me check if there's already a testing setup or references to CDP in this project.

Actually, I should also check the `webapp-testing` skill since it might be relevant for browser automation of the plugin.

Let me first check if the project has any existing browser testing setup or references to CDP, then provide my analysis.

Actually, the user asked a straightforward question. Let me just provide a concise analysis based on what I've read about opencode-browser and my understanding of the project. I don't need to load additional skills for this analysis. But I should check if there are existing test configurations that might be relevant.

Let me quickly check the test setup and scripts to see how testing is currently done.

</details>

#### 🔧 Tool: task
**Status:** completed
**Title:** Check test/dev setup

**Input:**
```json
{
  "description": "Check test/dev setup",
  "prompt": "Quickly check the following files in the project and summarize the testing approach and dev workflow:\n1. package.json - look for test scripts, dev scripts\n2. scripts/ directory - what scripts exist for dev workflow\n3. tests/ directory structure - what tests exist\n4. vitest.config.ts - test configuration\n5. .agents/rules/testing-rules.md if it exists\n\nReturn a concise summary of: how testing works, how dev/debug workflow is set up, and whether there's any browser automation or CDP usage already.",
  "subagent_type": "explore"
}
```

**Output:**
```
task_id: ses_1c466aabeffetCLiXTKiGWcXpf (for resuming to continue this task if needed)

<task_result>
## 总结：测试方式与开发工作流

---

### 一、测试方式

| 维度 | 详情 |
|------|------|
| **框架** | `vitest` (运行器) + `@testing-library/svelte` (Svelte 5 组件测试) + `jsdom` (浏览器 DOM 模拟) |
| **配置** | `vitest.config.ts` — `jsdom` 环境，`@testing-library/jest-dom/vitest` setup 文件，路径别名 `"siyuan"` 指向 mock |

**Mock 策略（两层）：**

1. **`tests/__mocks__/siyuan.ts`** — vitest 的 `resolve.alias` 将 `import "siyuan"` 重定向到此文件。Mock 了 `Plugin`, `getFrontend`, `getBackend`, `showMessage`, `Menu`, `Dialog`, `Setting`, `fetchPost`, `fetchSyncPost`。
2. **`tests/vitest.setup.ts`** — 全局 mock，注入 `window.siyuan`（含 `config.system`、`storage`、`languages`）和 `window.fetchPost`。

**测试文件（11 个）：**

```
tests/index.test.ts                    → 入口冒烟
tests/stores/config.test.ts           → 配置 store 单测
tests/services/bgRender.test.ts       → 背景渲染引擎
tests/services/sourceManager.test.ts  → 图片源管理
tests/utils/api.test.ts               → 思源 API 封装
tests/utils/fs.test.ts                → 本地文件系统封装
tests/utils/theme.test.ts             → 主题检测
tests/libs/dialog.test.ts             → Dialog 通用封装
tests/ui/topbar.test.ts               → 顶栏菜单组件
tests/ui/settings.test.ts             → 设置面板组件
tests/ui/sources/source-list.test.ts  → 图片源列表组件
```

**关键约束：**
- `vi.mock` 工厂内不能引用外层变量（hoisting 导致 ReferenceError）
- `fetchSyncPost` mock 必须返回完整的 `IWebSocketData`：`{ code, msg, data, cmd, sid }`
- jsdom 不支持 `videoEl.play()/pause()`，生产代码须 try/catch 保护
- 单例 store 测试间需手动重置（防污染）

---

### 二、开发/调试工作流

**3 条脚本路径：**

| 脚本 | 用途 |
|------|------|
| `scripts/make_dev_link.js` | 将 `dev/` 目录 **符号链接** 到思源插件目录，配合 `pnpm dev` 实现热更新开发 |
| `scripts/make_install.js` | 将 `dist/` **复制** 到思源插件目录（一次性安装） |
| `scripts/utils.js` | 公共工具：自动探测思源目录（HTTP API / `SIYUAN_PLUGIN_DIR` / `SIYUANDEV` 环境变量） |

**典型开发工作流：**
```
终端 1: pnpm dev          → Vite build --watch 输出到 dev/，含 inline sourcemap
终端 2: pnpm make-link    → 符号链接到思源插件目录（首次）
        修改代码 → Vite 自动 rebuild → 思源刷新即生效
```

**测试命令：**
```
pnpm test                   → 全量单次
pnpm test -- --watch        → 监听模式
pnpm test -- tests/stores/  → 单目录
pnpm test:coverage          → 覆盖率（HTML 报告到 coverage/）
```

---

### 三、浏览器自动化 / CDP

**项目本身没有浏览器自动化或 CDP（Chrome DevTools Protocol）。**

`package.json` 中不存在 `playwright`, `puppeteer`, `selenium` 等依赖。grep 命中仅在 `.agents/conversations/` 历史对话日志中（提到了 `opencode-chrome-devtools` 工具），并非项目实际使用。当前测试完全依赖 `jsdom` 模拟 DOM 环境，不涉及真实浏览器启动。

---

简而言之：这是一个 **纯 jsdom + vitest** 的单元/组件测试体系，开发阶段通过 Vite watch + 符号链接到思源插件目录实现快速迭代，无浏览器自动化。Nya~♡
</task_result>
```

*[step-finish part]*

### 🤖 Assistant
*2026-05-19 00:01:02*

*[step-start part]*

💭 **Reasoning:**

<details>
<summary>Click to expand reasoning</summary>

Now I have a clear picture. Let me provide a concise, helpful answer to the user.

**Key findings:**
1. The project currently uses jsdom + vitest for testing - no browser automation at all
2. Siyuan is an Electron app
3. opencode-browser connects to CDP endpoints to automate browsers/Electron apps

**How opencode-browser could help:**
- Since Siyuan is an Electron app, you could launch it with `--remote-debugging-port=9222` and use opencode-browser to interact with it
- This would allow:
  - Visual verification of background rendering (screenshot the Siyuan window)
  - Testing the plugin UI in the actual Siyuan environment (not jsdom)
  - Automating interactions like opening settings, adding backgrounds, etc.
  - Capturing screenshots to verify the canvas background renders correctly

**For Electron apps, how to configure `browser_url`:**
1. Start Siyuan with: `siyuan --remote-debugging-port=9222`
2. Then `browser_url` would be `http://127.0.0.1:9222`

But there are practical considerations:
- The plugin needs to be installed in Siyuan first
- The current jsdom tests already cover a lot
- The main benefit would be visual/end-to-end testing that jsdom can't do

Let me give a concise answer.

</details>

**有帮助，但收益有限。**

### 能做什么

思源是 Electron 应用，可启动 CDP：

```
siyuan --remote-debugging-port=9222
```

然后在 opencode.json 配置 `opencode-chrome-devtools` 插件，`browser_url` 填 `http://127.0.0.1:9222`。之后 opencode 可以直接：

- **截图** (`browser_screenshot`) — 验证 canvas 背景渲染效果，这是 jsdom 做不到的
- **快照** (`browser_snapshot`) — 检查 UI 元素的 accessibility tree
- **执行 JS** (`browser_eval`) — 在思源 webview 里动态调用插件 API

### 实际价值

| 能做的 | jsdom 测试已覆盖的有 |
|--------|---------------------|
| 视觉验证（背景渲染） | 单位逻辑、组件结构、API mock |
| 端到端交互测试 | store、service、dialog |

你项目已有的 `jsdom + vitest + @testing-library/svelte` 覆盖了大部分逻辑。opencode-browser 的核心增量是**视觉回归测试**（背景图片/视频在 canvas 上实际渲染效果），这对一个背景插件来说确实有意义，但不是必需品。

### 建议

如果经常遇到"jsdom 测试通过但真实环境渲染有问题"的情况，值得接入。否则当前流程够用。Nya~♡

*[step-finish part]*

*[patch part]*

---

## Child Sessions

### 📦 Subagent: Check test/dev setup (@explore subagent)
*Started: 2026-05-18 23:59:25*

#### 🤖 Assistant
*2026-05-19 00:01:02*

Quickly check the following files in the project and summarize the testing approach and dev workflow:
1. package.json - look for test scripts, dev scripts
2. scripts/ directory - what scripts exist for dev workflow
3. tests/ directory structure - what tests exist
4. vitest.config.ts - test configuration
5. .agents/rules/testing-rules.md if it exists

Return a concise summary of: how testing works, how dev/debug workflow is set up, and whether there's any browser automation or CDP usage already.

#### 🤖 Assistant
*2026-05-19 00:01:02*

*[step-start part]*

💭 **Reasoning:**

<details>
<summary>Click to expand reasoning</summary>

The user wants me to quickly check several files and summarize the testing approach and dev workflow. Let me read all the requested files in parallel.

</details>

#### 🔧 Tool: read
**Status:** completed
**Title:** package.json

**Input:**
```json
{
  "filePath": "/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/package.json"
}
```

**Output:**
```
<path>/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/package.json</path>
<type>file</type>
<content>
1: {
2:   "name": "siyuan-plugin-background-cover",
3:   "version": "1.0.0",
4:   "type": "module",
5:   "description": "Add a background you like to cover the entire Siyuan Note",
6:   "repository": "https://github.com/HowcanoeWang/siyuan-plugin-background-cover",
7:   "author": "HowcanoeWang",
8:   "license": "MIT",
9:   "scripts": {
10:     "dev": "cross-env NODE_ENV=development VITE_SOURCEMAP=inline vite build --watch",
11:     "build": "cross-env NODE_ENV=production vite build",
12:     "make-link": "node --no-warnings ./scripts/make_dev_link.js",
13:     "make-link-win": "powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/elevate.ps1 -scriptPath ./scripts/make_dev_link.js",
14:     "make-install": "vite build && node --no-warnings ./scripts/make_install.js",
15:     "test": "vitest run",
16:     "test:watch": "vitest",
17:     "test:coverage": "vitest run --coverage"
18:   },
19:   "devDependencies": {
20:     "@sveltejs/vite-plugin-svelte": "^4.0.0",
21:     "@testing-library/jest-dom": "^6.0.0",
22:     "@testing-library/svelte": "^5.0.0",
23:     "@tsconfig/svelte": "^4.0.1",
24:     "@types/node": "^20.3.0",
25:     "cross-env": "^7.0.3",
26:     "fast-glob": "^3.2.12",
27:     "glob": "^10.0.0",
28:     "jsdom": "^25.0.0",
29:     "minimist": "^1.2.8",
30:     "rollup-plugin-livereload": "^2.0.5",
31:     "siyuan": "^1.1.2",
32:     "svelte": "^5.0.0",
33:     "typescript": "^5.5.0",
34:     "vite": "^5.4.4",
35:     "vite-plugin-static-copy": "^1.0.2",
36:     "vite-plugin-zip-pack": "^1.0.5",
37:     "vitest": "^2.0.0"
38:   }
39: }

(End of file - total 39 lines)
</content>
```

#### 🔧 Tool: read
**Status:** completed
**Title:** scripts

**Input:**
```json
{
  "filePath": "/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/scripts"
}
```

**Output:**
```
<path>/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/scripts</path>
<type>directory</type>
<entries>
make_dev_link.js
make_install.js
README.md
utils.js

(4 entries)
</entries>
```

#### 🔧 Tool: read
**Status:** completed
**Title:** tests

**Input:**
```json
{
  "filePath": "/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/tests"
}
```

**Output:**
```
<path>/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/tests</path>
<type>directory</type>
<entries>
__mocks__/
index.test.ts
libs/
services/
stores/
ui/
utils/
vitest.setup.ts

(8 entries)
</entries>
```

#### 🔧 Tool: glob
**Status:** completed

**Input:**
```json
{
  "pattern": "vitest.config.*"
}
```

**Output:**
```
/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/vitest.config.ts
```

#### 🔧 Tool: read
**Status:** completed
**Title:** .agents/rules/testing-rules.md

**Input:**
```json
{
  "filePath": "/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/.agents/rules/testing-rules.md"
}
```

**Output:**
```
<path>/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/.agents/rules/testing-rules.md</path>
<type>file</type>
<content>
1: # 测试规则
2: 
3: ## 目录结构（镜像 `src/`）
4: 
5: tests/vitest.setup.ts 声明全局 mock，各模块一一对应：
6: 
7: ```
8: tests/
9: ├── vitest.setup.ts                   # window.siyuan / require / fetchPost
10: ├── stores/config.test.ts
11: ├── services/{sourceManager,bgRender}.test.ts
12: ├── utils/{api,fs,theme}.test.ts
13: └── ui/{topbar,settings}.test.ts + sources/source-list.test.ts
14: ```
15: 
16: **框架**: `vitest` (运行器) + `@testing-library/svelte` (组件) + `jsdom` (DOM 环境)
17: 
18: ## Mock 策略
19: 
20: ### 全局 Mock（`vitest.setup.ts`）
21: 
22: ```typescript
23: import '@testing-library/jest-dom/vitest'
24: ;(window as any).siyuan = {
25:     config: { system: { id: 'test-device', workspaceDir: '/tmp/test-workspace' } },
26:     storage: {} as Record<string, any>,
27:     languages: { cancel: 'Cancel', confirm: 'Confirm' },
28: }
29: ;(window as any).fetchPost = async () => ({ code: 0, data: null })
30: ```
31: 
32: ### `vi.mock` 工厂不能引用外层变量（hoisting）
33: 
34: ```typescript
35: // ❌ mockFetchPost 尚未赋值 → ReferenceError
36: const mockFetchPost = vi.fn()
37: vi.mock("siyuan", () => ({ fetchPost: mockFetchPost }))
38: 
39: // ✅ fn() 写在工厂内
40: vi.mock("siyuan", () => ({
41:     fetchSyncPost: vi.fn(async () => ({ code: 0, msg: "", data: null, cmd: "", sid: "" })),
42: }))
43: import { fetchSyncPost } from "siyuan"   // vi.mocked(fetchSyncPost) 操作
44: ```
45: 
46: ### `fetchSyncPost` mock 必须包含 `IWebSocketData` 全部字段
47: 
48: ```typescript
49: // ✅ { code, msg, data, cmd, sid } 缺一不可
50: // ❌ 缺少 cmd/sid → TS2345
51: ```
52: 
53: ## jsdom 限制
54: 
55: `videoEl.play()` / `videoEl.pause()` 未实现，生产代码中须 try/catch 保护：
56: 
57: ```typescript
58: const playPromise = videoEl.play()
59: if (playPromise) playPromise.catch(e => { if (e.name !== 'AbortError') console.warn(e) })
60: try { videoEl.pause() } catch { /* ignored */ }
61: ```
62: 
63: ## Svelte 5 组件测试
64: 
65: ```typescript
66: import { render, screen } from '@testing-library/svelte'
67: const { container } = render(Component, { props: { ... } })
68: ```
69: 
70: | 模式 | 说明 |
71: |------|------|
72: | `$state()` / `$derived()` / `$props()` | 组件状态与 Props |
73: | callback props | 替代 `createEventDispatcher` |
74: | `vi.mock` | 模拟 service/store 依赖 |
75: 
76: ## 测试命令
77: 
78: | 命令 | 用途 |
79: |------|------|
80: | `pnpm test` | 全量测试 |
81: | `pnpm test -- --watch` | 监听模式 |
82: | `pnpm test -- tests/stores/` | 单个目录 |
83: | `pnpm test -- tests/utils/api.test.ts` | 单个文件 |
84: | `pnpm test:coverage` | 覆盖率报告 |
85: 
86: ## 禁止事项
87: 
88: | 禁止 | 原因 |
89: |------|------|
90: | `vi.mock` 工厂引用外层变量 | hoisting → ReferenceError |
91: | `fetchSyncPost` mock 缺 `cmd`/`sid` | 类型不匹配 |
92: | 单例 store 测试间不重置 | 测试污染 |
93: | jsdom 中直接 `videoEl.play()` | Not implemented |
94: | 混淆 `fetchPost` 回调与 `fetchSyncPost` Promise | 签名不同 |

(End of file - total 94 lines)
</content>
```

*[step-finish part]*

#### 🤖 Assistant
*2026-05-19 00:01:02*

*[step-start part]*

💭 **Reasoning:**

<details>
<summary>Click to expand reasoning</summary>

Now let me read the remaining files: vitest.config.ts, some scripts, and the tests directory structure more deeply.

</details>

#### 🔧 Tool: read
**Status:** completed
**Title:** vitest.config.ts

**Input:**
```json
{
  "filePath": "/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/vitest.config.ts"
}
```

**Output:**
```
<path>/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/vitest.config.ts</path>
<type>file</type>
<content>
1: import { defineConfig } from 'vitest/config'
2: import { svelte } from '@sveltejs/vite-plugin-svelte'
3: 
4: export default defineConfig({
5:     plugins: [svelte()],
6:     resolve: {
7:         alias: {
8:             "@": new URL('./src', import.meta.url).pathname,
9:             "siyuan": new URL('./tests/__mocks__/siyuan.ts', import.meta.url).pathname,
10:         }
11:     },
12:     test: {
13:         environment: 'jsdom',
14:         setupFiles: ['./tests/vitest.setup.ts'],
15:         include: ['tests/**/*.test.ts'],
16:     },
17: })

(End of file - total 17 lines)
</content>
```

#### 🔧 Tool: read
**Status:** completed
**Title:** scripts/README.md

**Input:**
```json
{
  "filePath": "/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/scripts/README.md"
}
```

**Output:**
```
<path>/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/scripts/README.md</path>
<type>file</type>
<content>
1: # 开发脚本说明
2: 
3: ## 环境变量
4: 
5: 插件安装脚本需要知道思源工作空间的位置。脚本会按以下优先级探测：
6: 
7: 1. **HTTP API**（端口 6806）— 思源运行时自动检测
8: 2. **`SIYUAN_PLUGIN_DIR`** — 直接指定 `data/plugins/` 目录
9: 3. **`SIYUANDEV`** — 思源开发工作空间根目录，脚本自动拼接 `data/plugins/`
10: 
11: 推荐在 `~/.bashrc` 或 `~/.zshrc` 中设置：
12: 
13: ```bash
14: export SIYUANDEV="/home/user/SiyuanDev"   # 替换为实际路径
15: ```
16: 
17: ## 命令
18: 
19: | 命令 | 用途 | 输出目录 | 说明 |
20: |------|------|---------|------|
21: | `pnpm dev` | 开发构建（watch 模式） | `dev/` | 修改代码自动 rebuild，含 sourcemap |
22: | `pnpm build` | 生产构建 | `dist/` | 压缩 + 打包 `package.zip` |
23: | `pnpm make-link` | 符号链接到思源插件目录 | — | 需先运行 `pnpm dev`，创建后思源自动加载 dev 版 |
24: | `pnpm make-install` | 构建并复制到思源插件目录 | — | 一次性操作，对应旧版 `copy2dev.js` |
25: | `pnpm test` | 运行所有测试 | — | vitest 单次运行 |
26: | `pnpm test:watch` | 测试监听模式 | — | 文件变更自动重跑 |
27: | `pnpm test:coverage` | 测试覆盖率报告 | `coverage/` | 生成 HTML 报告 |
28: 
29: ## 典型工作流
30: 
31: ### 开发新功能
32: 
33: ```bash
34: # 终端 1：启动 dev build 监听
35: pnpm dev
36: 
37: # 终端 2：创建符号链接（仅首次）
38: pnpm make-link
39: 
40: # 此后修改 src/ 中的代码，Vite 自动 rebuild 到 dev/
41: # 思源中点击刷新或重启即可看到变更
42: ```
43: 
44: ### 一次性安装测试
45: 
46: ```bash
47: pnpm make-install
48: # 重启思源
49: ```
50: 
51: ### 运行测试
52: 
53: ```bash
54: pnpm test                    # 全量
55: pnpm test -- --watch         # 监听模式
56: pnpm test -- tests/stores/   # 单个目录
57: ```

(End of file - total 57 lines)
</content>
```

#### 🔧 Tool: read
**Status:** completed
**Title:** scripts/make_dev_link.js

**Input:**
```json
{
  "filePath": "/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/scripts/make_dev_link.js"
}
```

**Output:**
```
<path>/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/scripts/make_dev_link.js</path>
<type>file</type>
<content>
1: /*
2:  * Copyright (c) 2024 by frostime. All Rights Reserved.
3:  * @Author       : frostime
4:  * @Date         : 2023-07-15 15:31:31
5:  * @FilePath     : /scripts/make_dev_link.js
6:  * @LastEditTime : 2024-09-06 18:13:53
7:  * @Description  : 
8:  */
9: // make_dev_link.js
10: import fs from 'fs';
11: import { log, error, getSiYuanDir, chooseTarget, getThisPluginName, makeSymbolicLink } from './utils.js';
12: 
13: let targetDir = '';
14: 
15: /**
16:  * 1. Get the parent directory to install the plugin
17:  */
18: log('>>> Try to visit constant "targetDir" in make_dev_link.js...');
19: if (targetDir === '') {
20:     log('>>> Constant "targetDir" is empty, try to get SiYuan directory automatically....');
21:     let res = await getSiYuanDir();
22: 
23:     if (!res || res.length === 0) {
24:         log('>>> Can not get SiYuan directory automatically, try to visit environment variable "SIYUAN_PLUGIN_DIR"....');
25:         let env = process.env?.SIYUAN_PLUGIN_DIR;
26:         if (env) {
27:             targetDir = env;
28:             log(`\tGot target directory from environment variable "SIYUAN_PLUGIN_DIR": ${targetDir}`);
29:         } else {
30:             log('>>> Try to visit environment variable "SIYUANDEV"....');
31:             let devEnv = process.env?.SIYUANDEV;
32:             if (devEnv) {
33:                 targetDir = `${devEnv}/data/plugins`;
34:                 log(`\tGot target directory from environment variable "SIYUANDEV": ${targetDir}`);
35:             } else {
36:                 error('\tCan not get SiYuan directory from environment variable, failed!');
37:                 process.exit(1);
38:             }
39:         }
40:     } else {
41:         targetDir = await chooseTarget(res);
42:     }
43: 
44:     log(`>>> Successfully got target directory: ${targetDir}`);
45: }
46: if (!fs.existsSync(targetDir)) {
47:     error(`Failed! Plugin directory not exists: "${targetDir}"`);
48:     error('Please set the plugin directory in scripts/make_dev_link.js');
49:     process.exit(1);
50: }
51: 
52: /**
53:  * 2. The dev directory, which contains the compiled plugin code
54:  */
55: const devDir = `${process.cwd()}/dev`;
56: if (!fs.existsSync(devDir)) {
57:     fs.mkdirSync(devDir);
58: }
59: 
60: 
61: /**
62:  * 3. The target directory to make symbolic link to dev directory
63:  */
64: const name = getThisPluginName();
65: if (name === null) {
66:     process.exit(1);
67: }
68: const targetPath = `${targetDir}/${name}`;
69: 
70: /**
71:  * 4. Make symbolic link
72:  */
73: makeSymbolicLink(devDir, targetPath);

(End of file - total 73 lines)
</content>
```

#### 🔧 Tool: read
**Status:** completed
**Title:** scripts/make_install.js

**Input:**
```json
{
  "filePath": "/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/scripts/make_install.js"
}
```

**Output:**
```
<path>/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/scripts/make_install.js</path>
<type>file</type>
<content>
1: /*
2:  * Copyright (c) 2024 by frostime. All Rights Reserved.
3:  * @Author       : frostime
4:  * @Date         : 2024-03-28 20:03:59
5:  * @FilePath     : /scripts/make_install.js
6:  * @LastEditTime : 2024-09-06 18:08:19
7:  * @Description  : 
8:  */
9: // make_install.js
10: import fs from 'fs';
11: import { log, error, getSiYuanDir, chooseTarget, copyDirectory, getThisPluginName } from './utils.js';
12: 
13: let targetDir = '';
14: 
15: /**
16:  * 1. Get the parent directory to install the plugin
17:  */
18: log('>>> Try to visit constant "targetDir" in make_install.js...');
19: if (targetDir === '') {
20:     log('>>> Constant "targetDir" is empty, try to get SiYuan directory automatically....');
21:     let res = await getSiYuanDir();
22: 
23:     if (res === null || res === undefined || res.length === 0) {
24:         log('>>> Try to visit environment variable "SIYUANDEV"....');
25:         let devEnv = process.env?.SIYUANDEV;
26:         if (devEnv) {
27:             targetDir = `${devEnv}/data/plugins`;
28:             log(`\tGot target directory from environment variable "SIYUANDEV": ${targetDir}`);
29:         } else {
30:             error('>>> Can not get SiYuan directory automatically');
31:             process.exit(1);
32:         }
33:     } else {
34:         targetDir = await chooseTarget(res);
35:     }
36:     log(`>>> Successfully got target directory: ${targetDir}`);
37: }
38: if (!fs.existsSync(targetDir)) {
39:     error(`Failed! Plugin directory not exists: "${targetDir}"`);
40:     error('Please set the plugin directory in scripts/make_install.js');
41:     process.exit(1);
42: }
43: 
44: /**
45:  * 2. The dist directory, which contains the compiled plugin code
46:  */
47: const distDir = `${process.cwd()}/dist`;
48: if (!fs.existsSync(distDir)) {
49:     fs.mkdirSync(distDir);
50: }
51: 
52: /**
53:  * 3. The target directory to install the plugin
54:  */
55: const name = getThisPluginName();
56: if (name === null) {
57:     process.exit(1);
58: }
59: const targetPath = `${targetDir}/${name}`;
60: 
61: /**
62:  * 4. Copy the compiled plugin code to the target directory
63:  */
64: copyDirectory(distDir, targetPath);

(End of file - total 64 lines)
</content>
```

#### 🔧 Tool: read
**Status:** completed
**Title:** tests/vitest.setup.ts

**Input:**
```json
{
  "filePath": "/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/tests/vitest.setup.ts"
}
```

**Output:**
```
<path>/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/tests/vitest.setup.ts</path>
<type>file</type>
<content>
1: import '@testing-library/jest-dom/vitest'
2: 
3: ;(window as any).siyuan = {
4:     config: {
5:         system: { id: 'test-device', workspaceDir: '/tmp/test-workspace' },
6:     },
7:     storage: {} as Record<string, any>,
8:     languages: { cancel: 'Cancel', confirm: 'Confirm' },
9: }
10: if (!(window as any).fetchPost) {
11:     ;(window as any).fetchPost = () => {}
12: }

(End of file - total 12 lines)
</content>
```

#### 🔧 Tool: glob
**Status:** completed

**Input:**
```json
{
  "pattern": "tests/**/*.test.ts"
}
```

**Output:**
```
/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/tests/index.test.ts
/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/tests/ui/sources/source-list.test.ts
/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/tests/ui/topbar.test.ts
/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/tests/ui/settings.test.ts
/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/tests/libs/dialog.test.ts
/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/tests/services/bgRender.test.ts
/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/tests/services/sourceManager.test.ts
/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/tests/stores/config.test.ts
/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/tests/utils/fs.test.ts
/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/tests/utils/api.test.ts
/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/tests/utils/theme.test.ts
```

*[step-finish part]*

#### 🤖 Assistant
*2026-05-19 00:01:02*

*[step-start part]*

💭 **Reasoning:**

<details>
<summary>Click to expand reasoning</summary>

Now let me also check the mock file and scripts/utils.js for completeness.

</details>

#### 🔧 Tool: read
**Status:** completed
**Title:** tests/__mocks__/siyuan.ts

**Input:**
```json
{
  "filePath": "/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/tests/__mocks__/siyuan.ts"
}
```

**Output:**
```
<path>/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/tests/__mocks__/siyuan.ts</path>
<type>file</type>
<content>
1: import { vi } from 'vitest'
2: 
3: export const Plugin = class {
4:     data: Record<string, any> = {}
5:     i18n: Record<string, string> = {}
6:     app: any = {}
7:     addIcons() {}
8:     addCommand() {}
9:     addTopBar() { return document.createElement('div') }
10:     onLayoutReady() {}
11: }
12: 
13: export const getFrontend = vi.fn(() => 'desktop')
14: export const getBackend = vi.fn(() => 'linux')
15: export const showMessage = vi.fn()
16: 
17: export const Menu = vi.fn(() => ({
18:     addItem: vi.fn(),
19:     addSeparator: vi.fn(),
20:     open: vi.fn(),
21:     fullscreen: vi.fn(),
22: }))
23: 
24: export const Dialog = vi.fn()
25: export const Setting = vi.fn()
26: 
27: export const fetchPost = vi.fn((_url: string, _data: any, callback: (response: any) => void) => {
28:     callback({ code: 0, data: null })
29: })
30: 
31: export const fetchSyncPost = vi.fn(async (_url: string, _data: any) => ({ code: 0, msg: "", data: null, cmd: "", sid: "" }))

(End of file - total 31 lines)
</content>
```

#### 🔧 Tool: grep
**Status:** completed
**Title:** playwright|puppeteer|selenium|cdp|chrome-devtools|browser.*automation

**Input:**
```json
{
  "pattern": "playwright|puppeteer|selenium|cdp|chrome-devtools|browser.*automation"
}
```

**Output:**
```
Found 7 matches
/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/.agents/conversations/20260518-23-57-49-New-session-2026-05-18T14-57-4.md:
  Line 359: [.opencode/skill/browser-automation](/different-ai/opencode-browser/tree/main/.opencode/skill/browser-automation "This path skips through empty directories")

  Line 361: [.opencode/skill/browser-automation](/different-ai/opencode-browser/tree/main/.opencode/skill/browser-automation "This path skips through empty directories")

  Line 423: [](#opencode-chrome-devtools)

  Line 446:   "plugin": \["opencode-chrome-devtools"\]

  Line 467: npx opencode-chrome-devtools tools

  Line 468: npx opencode-chrome-devtools tool browser\_list --args '{"browser\_url":"http://127.0.0.1:9222"}'

  Line 469: npx opencode-chrome-devtools tool browser\_snapshot --args '{"browser\_url":"http://127.0.0.1:9222"}'

```

*[step-finish part]*

#### 🤖 Assistant
*2026-05-19 00:01:02*

*[step-start part]*

💭 **Reasoning:**

<details>
<summary>Click to expand reasoning</summary>

The grep results show matches in a conversation log file in `.agents/conversations/`, not in any actual project code or configuration. The project itself does not use browser automation. Let me provide a concise summary based on all the information gathered.

</details>

#### 🔧 Tool: read
**Status:** completed
**Title:** tests/__mocks__

**Input:**
```json
{
  "filePath": "/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/tests/__mocks__"
}
```

**Output:**
```
<path>/home/hwang/Documents/Github/HowcanoeWang/siyuan-plugin-background-cover/tests/__mocks__</path>
<type>directory</type>
<entries>
siyuan.ts

(1 entries)
</entries>
```

*[step-finish part]*

#### 🤖 Assistant
*2026-05-19 00:01:02*

*[step-start part]*

💭 **Reasoning:**

<details>
<summary>Click to expand reasoning</summary>

Now I have all the information needed. Let me compose a clear summary.

</details>

## 总结：测试方式与开发工作流

---

### 一、测试方式

| 维度 | 详情 |
|------|------|
| **框架** | `vitest` (运行器) + `@testing-library/svelte` (Svelte 5 组件测试) + `jsdom` (浏览器 DOM 模拟) |
| **配置** | `vitest.config.ts` — `jsdom` 环境，`@testing-library/jest-dom/vitest` setup 文件，路径别名 `"siyuan"` 指向 mock |

**Mock 策略（两层）：**

1. **`tests/__mocks__/siyuan.ts`** — vitest 的 `resolve.alias` 将 `import "siyuan"` 重定向到此文件。Mock 了 `Plugin`, `getFrontend`, `getBackend`, `showMessage`, `Menu`, `Dialog`, `Setting`, `fetchPost`, `fetchSyncPost`。
2. **`tests/vitest.setup.ts`** — 全局 mock，注入 `window.siyuan`（含 `config.system`、`storage`、`languages`）和 `window.fetchPost`。

**测试文件（11 个）：**

```
tests/index.test.ts                    → 入口冒烟
tests/stores/config.test.ts           → 配置 store 单测
tests/services/bgRender.test.ts       → 背景渲染引擎
tests/services/sourceManager.test.ts  → 图片源管理
tests/utils/api.test.ts               → 思源 API 封装
tests/utils/fs.test.ts                → 本地文件系统封装
tests/utils/theme.test.ts             → 主题检测
tests/libs/dialog.test.ts             → Dialog 通用封装
tests/ui/topbar.test.ts               → 顶栏菜单组件
tests/ui/settings.test.ts             → 设置面板组件
tests/ui/sources/source-list.test.ts  → 图片源列表组件
```

**关键约束：**
- `vi.mock` 工厂内不能引用外层变量（hoisting 导致 ReferenceError）
- `fetchSyncPost` mock 必须返回完整的 `IWebSocketData`：`{ code, msg, data, cmd, sid }`
- jsdom 不支持 `videoEl.play()/pause()`，生产代码须 try/catch 保护
- 单例 store 测试间需手动重置（防污染）

---

### 二、开发/调试工作流

**3 条脚本路径：**

| 脚本 | 用途 |
|------|------|
| `scripts/make_dev_link.js` | 将 `dev/` 目录 **符号链接** 到思源插件目录，配合 `pnpm dev` 实现热更新开发 |
| `scripts/make_install.js` | 将 `dist/` **复制** 到思源插件目录（一次性安装） |
| `scripts/utils.js` | 公共工具：自动探测思源目录（HTTP API / `SIYUAN_PLUGIN_DIR` / `SIYUANDEV` 环境变量） |

**典型开发工作流：**
```
终端 1: pnpm dev          → Vite build --watch 输出到 dev/，含 inline sourcemap
终端 2: pnpm make-link    → 符号链接到思源插件目录（首次）
        修改代码 → Vite 自动 rebuild → 思源刷新即生效
```

**测试命令：**
```
pnpm test                   → 全量单次
pnpm test -- --watch        → 监听模式
pnpm test -- tests/stores/  → 单目录
pnpm test:coverage          → 覆盖率（HTML 报告到 coverage/）
```

---

### 三、浏览器自动化 / CDP

**项目本身没有浏览器自动化或 CDP（Chrome DevTools Protocol）。**

`package.json` 中不存在 `playwright`, `puppeteer`, `selenium` 等依赖。grep 命中仅在 `.agents/conversations/` 历史对话日志中（提到了 `opencode-chrome-devtools` 工具），并非项目实际使用。当前测试完全依赖 `jsdom` 模拟 DOM 环境，不涉及真实浏览器启动。

---

简而言之：这是一个 **纯 jsdom + vitest** 的单元/组件测试体系，开发阶段通过 Vite watch + 符号链接到思源插件目录实现快速迭代，无浏览器自动化。Nya~♡

*[step-finish part]*
