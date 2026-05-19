<h1 align="center">
  <br>
    <img src="./icon.png" alt="logo" width="200">
  <br>
  SiYuan - Background Cover
  <br>
  <br>
</h1>

<p align="center">
Add a background you like to cover the entire Siyuan Note
<br/>
<a href="./README.md">中文</a>
</p>

## Preview

![](https://cdn.jsdelivr.net/gh/HowcanoeWang/siyuan-plugin-background-cover/preview.png)

<div align="center">
Default background cover artist ——   
<code>劉了了_Ale</code><br>
<a href="https://www.fanbox.cc/@ale">Fanbox</a> | 
<a href="https://space.bilibili.com/3883010">Bilibili</a> | 
<a href="https://m.weibo.cn/u/2309170351">Weibo</a> 
</div>

## Features

- [X] Full platform support (desktop / mobile / browser)
- [X] Images and videos as SiYuan Note background (auto-detect extension, canvas / video dual-mode rendering)
- [X] Three background source types, unified management
  - [X] Local folder direct reading (desktop only, zero upload)
  - [X] SiYuan assets sub-folder referencing (all platforms)
  - [X] Upload files to plugin cache (all platforms, supports network URL download)
  - [X] Dynamic web wallpaper feeds (preset + custom URLs, different image each time)
- [X] Background resource management
  - [X] Multi-file / entire directory upload
  - [X] File deletion, folder location, cache clearing
  - [X] Mouse hover file thumbnail preview
- [X] Background selection and switching
  - [X] Manual selection
  - [X] Manual random selection
  - [X] Scheduled auto-random switching
  - [X] Random selection on startup
- [X] Manually adjust transparency (weighted algorithm for readability)
- [X] Manually adjust background blur
- [X] Background image X/Y offset control
- [X] Theme blocking (disable plugin on specific themes)
- [X] Shortcut key support


## Implementation

Add `<canvas>` and `<video>` elements within the `<HTML>` element, at the same level as `<head>` and `<body>`. These elements are tiled and centered, placed at the bottom layer to serve as the background. Based on file extension, the engine automatically selects canvas (for images) or video (for videos) for rendering. Add `style='opacity: xxx'` to the `<body>` element to achieve transparency for the notebook panel.

Background resources are managed through three source types: `local` (desktop-only local folders, using `window.require('fs/promises')` for direct reading and `file:///` for rendering, zero upload), `upload` (plugin cache directory, supports file upload and URL download), and `assets` (SiYuan note resource sub-folder referencing, zero additional storage).

The range of transparency that can be set by the user is `[0.1, 1]`. However, to ensure readability of the notebook content, a weighted logic `f(x) = 0.99 - 0.25x` is used. The weighted transparency range is `[0.74, 0.99]`. Since different themes have completely different color settings, the same transparency setting may not appear consistent across different themes.

## ChangeLogs

<details open>
<summary><b>May 2026 — v1.0.0 Refactoring Edition</b></summary>

**26.05.19**

* <b>Dynamic Web Wallpaper Feeds</b>: Support preset random image APIs (Bing Daily Wallpaper, Unsplash, imgapi, etc.), returns different background each time.
* <b>Custom Dynamic URLs</b>: Users can add their own random image APIs with enable/disable toggle.
* <b>JS Preload Rendering</b>: Dynamic URLs preloaded via `new Image()` before canvas application, eliminating CSS double-layer fallback flash.
* <b>Preset Name i18n</b>: Preset source names support Chinese/English i18n switching.
* <b>Video Source Recommendations</b>: "Recommended Video Sites" section in source management panel with Pexels, Pixabay, Coverr, Videezy links.
* <b>Video Preview</b>: Hovering video files in source list now auto-plays in preview area.
* <b>About Tab Improvements</b>: Plugin icon + version centered, GitHub/author pinned to bottom, debug info moved to About tab.
* <b>Code Quality</b>: Eliminated all hardcoded Chinese fallback strings, unified file upload to `utils/api.ts`, parallelized directory scanning, standardized naming conventions.

**26.05.18**

* <b style='color:red'>Breaking Change</b>: Full refactoring. Old v0.x configurations are incompatible and require reconfiguration.
* <b>Build Upgrade</b>: Webpack → Vite 5, pure TS template strings → Svelte 5 components, added Vitest testing framework.
* <b>Background Source Refactoring</b>: Added local folder direct reading (desktop), assets sub-folder referencing, URL download, three source types unified random pool management.
* <b>Video Background</b>: Support .mp4, .webm, .ogg, .mov videos as background, automatic rendering mode switching.
* <b>UI Rewrite</b>: Brand new 5-tab settings panel, topbar dropdown menu, file tree preview, thumbnail hover preview.
* <b>Storage Migration</b>: All configs migrated to local.json single-layer storage, removed ts-md5 and other legacy dependencies.
* <b>Removed Features</b>: CSS transparency mode, Live2D stub code, Bug report dialog, Android limitation notice, Demo images, sizeMode switching.
* <b>Full Platform Support</b>: Available on desktop / mobile / browser-desktop / browser-mobile (non-desktop platforms auto-hide local folder features).

</details>

<details>
<summary><b>Nov 2025</b></summary>

**25.11.24**

* <b style='color:red'>Destructive Update</b>: Changes the configuration storage data structure to resolve note conflicts caused by abnormal cross-device synchronization.
* Update plugin icon (powered by Gemini).
* Updated settings panel.
* Supports independent settings for different devices.
* Supports setting a random background change time.
* Code structure and logic refactoring (still under construction).

</details>

<details>
<summary><b>April 2025</b></summary>

**25.04.11**

* Temporarily fixing plugin reload may cause CSS style loss and abnormal plugin background display.

</details>

<details>
<summary><b>Jan 2025</b></summary>

**25.01.29**

* Move CDN image to local folder
* Fix theme name display issue in settings
* Support change background opacty and blur using shortcut keys
* Support mobile devices

</details>

<details>
<summary><b>Augest 2023</b></summary>

**23.08.28**

* Provide an option to disable the transparency of the `<body>` element (setting the foreground opacity to 0) to accommodate transparent themes such as `Cliff-Dark` and `Dark+`.

**23.08.20**

* Add file upload notice for Android App

**23.08.19**

* Use the `themes.json` file from GitHub to replace the time-consuming `api/bazaar/getInstalledTheme` function.
* For users in mainland China who have difficulties accessing GitHub directly, the plugin will provide temporary cached information about the latest themes within the plugin itself.

**23.08.15**

* Add theme blocking functionality to support disabling the plugin on specific themes.
* The plugin backend supports all platforms, while the frontend UI is only available for desktop wide screens.

**23.08.13**

* Fix the issue with the reset button throwing an error.
* Deprecated the use of the CSS mode and switched to using the global opacity mode to address theme compatibility issues.

</details>

<details>
<summary><b>July 2023</b></summary>

**23.07.31**

* Solve stucking in an infinite loop of theme change and refresh

**23.07.26**

* Optimize file hash logic
* Fix the issue of the invisible setting button in the marketplace
* Use global variables to simplify function parameters (remove some PluginInstance parameters)

**23.07.25**

* Change from deleting images to adding them to configs.json when redundant images are found in the cache but meet the hash criteria, in order to handle cross-device synchronization.
* Fix the bug where the UI settings for transparent mode and compatibility mode are not effective.
* Modify the prefix prompt in the output logs of developer mode.

**23.07.22**

- Refactor project structure.

**23.07.16**

- Add scroll bar adaptation for UI exceeding parts

**23.07.07**

- Change the settings UI, add a Transparent Mode toggle and compatibility theme.
- Initialize compatibility settings UI.

</details>

<details>
<summary><b>June 2023</b></summary>

**23.06.30**

- Make popup dialog for cache manager
- Redesign the shortcut key mapping

**23.06.28**

* For the 2.9.3 version of Joplin, modify the cache directory `/data/plugins/{name}/` to `/data/public/{name}/`.
* Support batch image upload mode (limited to 50 images).
* Support random non-repetitive image selection for the current image.
* Fix UI interaction bugs in the settings interface.

**23.06.27**

- Fixing bugs related to UI interactions in the settings panel.
- Refactoring the logic of the opacity mode to modify the parent component of `dockLeft`, `dockRight`, and `layouts` instead of modifying them individually. The parent component is `<div class="fn__flex-1 fn__flex ...>` and it will be assigned a custom ID by the plugin: `dockPanel`.
- Adding all natively supported themes to the whitelist for compatibility purposes.

**23.06.26**

- Add image offset settings
- Add theme adaptation whitelist, which not support theme adaptation switch

**23.06.24**

- Change the transparency scheme to: toolbar, dockLeft, dockRight, dockBottom and status bar modifying alpha value of colors, and editor (layouts) modifying the opacity property.
- When changing the theme, force-reload the note interface.
- Modify the compatitivity on theme again
- Add a compatibility mode button that can switch between overall opacity mode and CSS opacity mode.
- Optimize file hash method to speed up calculation speed.

**23.06.23**

- Reduce the length of the image hash file to 15 characters.
- Implement startup cache folders and index calibration and prompt function.
- Implement the function of randomly selecting backgrounds.
- Optimize handling of 404 errors for images during startup.
- Separate the bilingual documents.
- Implement the random selection function on launching
- Check the compatitivity on theme again

**23.06.22**

- Adapt to 3 more themes
- remove the hash code of the current image in setting
- Adjust the logic for weighted opacity
- Use layer container `<div id="bgLayer">` instead of the `<body>` element to store the background.
- Support background blurring function
- Modify the layouts of the setting Panel UI
- Temporarily remove the buttons of unsupported functions

**23.06.21**

- Implementation theme adaptation on theme change
- Support upload single local images into the cache folder
- Support clear all cached images
- Update the data structure for recording the cached images
- Add developer debug switch button

**23.06.20**

- Implement the image upload dialog
- Implemented the selection of an image upload and saved it to the cache path using the Source API.
- After turning on and off the plugin, realize color optimization for specific themes (such as the `toolbar` of the Savor theme).
- By using DOM monitoring to detect theme changes (not yet implemented in conjunction with the above optimization).

**23.06.18**

- Support user config IO
- Modify the layouts of Bug report and setting Panel UI

**23.06.17**

- Achieve image transparency by modifying the `opacity` of `<body>` element, abandoning the modification of the alpha value of `background-color` in the CSS style.
- support the setting interactions of checkbox and slider
- support the plugin on button in menu
- Dialog for Bug report

**23.06.16**

- Onload when starting SiYuan
- implement the image replacement and transparency

**23.06.14**

- initialize the project

</details>

## Acknowledgement

This project is inspired and modified from

* [vscode-background-cover](https://github.com/AShujiao/vscode-background-cover)
* [siyuan-theme-dark+](https://github.com/Zuoqiu-Yingyi/siyuan-theme-dark-plus)
* [siyuan-plugin-importer](https://github.com/terwer/siyuan-plugin-importer/tree/main)
* [siyuan-dailynote-today](https://github.com/frostime/siyuan-dailynote-today)
* [sy-theme-change](https://github.com/frostime/sy-theme-change/tree/main)

Thanks to the members in the 'Siyuan developer' group for patiently answering my questions regarding this plugin development.
