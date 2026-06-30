# Opacity Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split foreground UI opacity from background canvas/video opacity after SiYuan 3.7.0 UI changes.

**Architecture:** Rename persisted `opacity` to `foregroundOpacity` with migration. Add `backgroundOpacity` for plugin-owned canvas/video layers. Keep opacity application inside `bgRender.ts` and call both foreground/background setters from lifecycle entry points.

**Tech Stack:** TypeScript, Svelte 5, Vitest, SiYuan plugin APIs.

---

### Task 1: Config Schema And Migration

**Files:**
- Modify: `src/types.ts`
- Modify: `src/stores/config.ts`
- Test: `tests/stores/config.test.ts`

- [x] Add failing tests for `foregroundOpacity`, `backgroundOpacity`, and old `opacity` migration.
- [x] Add `foregroundOpacity` and `backgroundOpacity` to `AppConfig` defaults and type.
- [x] In `ConfigStore.load()`, migrate legacy `opacity` to `foregroundOpacity`, delete `opacity`, and mark dirty.
- [x] Run `pnpm test -- tests/stores/config.test.ts`.

### Task 2: Render Layer Opacity Functions

**Files:**
- Modify: `src/services/bgRender.ts`
- Test: `tests/services/bgRender.test.ts`

- [x] Add failing tests for `changeForegroundOpacity(0|1)` producing body opacity `1|0.75`.
- [x] Add failing tests for `changeBackgroundOpacity(0|1)` setting canvas/video opacity `0|0.3`.
- [x] Update `changeForegroundOpacity()` clamp range to `0-1` and formula to `1 - 0.25 * raw`.
- [x] Add `changeBackgroundOpacity()` that clamps `0-1` and applies `raw * 0.3` to both background elements.
- [x] Run `pnpm test -- tests/services/bgRender.test.ts`.

### Task 3: UI And Lifecycle Wiring

**Files:**
- Modify: `src/ui/settings/ConfigTab.svelte`
- Modify: `src/index.ts`
- Modify: `src/ui/topbarMenu.ts`
- Modify: `public/i18n/zh_CN.json`
- Modify: `public/i18n/en_US.json`
- Test: `tests/ui/settings.test.ts`

- [x] Add settings test coverage for the new background opacity label.
- [x] Update `ConfigTab.svelte` to use `foregroundOpacity`, add `backgroundOpacity` state and slider, and apply/save both values.
- [x] Update startup, random selection, theme restore, and upload apply paths to call both opacity setters.
- [x] Update shortcuts: `Shift+Cmd+5/6` for foreground, `Shift+Cmd+7/8` for background.
- [x] Add i18n strings and update foreground description range to `0-1`.
- [x] Run `pnpm test -- tests/ui/settings.test.ts tests/index.test.ts tests/ui/topbar.test.ts`.

### Task 4: Full Verification

**Files:**
- No code changes expected.

- [x] Run `pnpm test`.
- [x] Run `pnpm build`.
- [x] Review `git diff` and ensure unrelated existing changes in `package.json` / `plugin.json` are not touched.

### Self-Review

- Spec coverage: Covers rename/migration, foreground formula, background layer opacity, settings UI, shortcut mapping, tests, and verification.
- Placeholder scan: No TBD/TODO placeholders.
- Type consistency: Uses `foregroundOpacity`, `backgroundOpacity`, `changeForegroundOpacity`, and `changeBackgroundOpacity` consistently.
