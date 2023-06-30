<h1 align="center">
  <br>
    <img src="./icon.png" alt="logo" width="200">
  <br>
  SiYuan - Background Cover
  <br>
  <br>
</h1>

<p align="center">
Add a picture you like to cover the entire Siyuan Note
<br/>
<a href="./README.md">中文</a>
</p>

## Preview

![](https://cdn.jsdelivr.net/gh/HowcanoeWang/siyuan-plugin-background-cover/preview.png)

<div align="center">
Default background cover artist ——   
<code>劉了了_Ale</code><br>
<a href="https://afdian.net/a/_LIAO">AFDIAN</a> | 
<a href="https://www.fanbox.cc/@ale">Fanbox</a> | 
<a href="https://space.bilibili.com/3883010">Bilibili</a> | 
<a href="https://twitter.com/_LIAO">Twitter</a>
</div>

## Features

- [X] Only the **desktop** and **browser-desktop (PC)** are supported.
- [X] Tiling a picture as a background for SiYuan Notes
- [X] Compatible theme
- [X] Manually adjust the transparency
- [X] Manually adjust the blur effects of the background
- [X] Cached folder for background image library
  - [X] Upload single local image files
  - [X] Upload all images in a local folder
- [x] Choose and switch a background image
  - [x] Choosing by manual
  - [X] Random select by manual action
  - [X] Choosing randomly on launch

## Theme Compativity

| Theme name             | Compativity    | Versions | Descrip                                                                       |
| ---------------------- | -------------- | -------- | ----------------------------------------------------------------------------- |
| `Daylight midnight`  | ✅Naturally    | 2.9.2    | 思源默认主题                                                                  |
| `粉色小屋 pink-room` | ✅Naturally    | v0.7.9   |                                                                               |
| `知乎 Zhihu`         | ✅Naturally    | v0.0.6   |                                                                               |
| `VSCode Light`       | ✅Naturally    | v1.1.2   |                                                                               |
| `Z-Acrylic`          | ✅Naturally    | v0.2.2   |                                                                               |
| `紫夜 sy-darkpruple` | ✅Naturally    | v0.4.1   |                                                                               |
| `玩具toy`            | ✅Naturally    | v1.1.8   |                                                                               |
| `印刷品 P-Book`      | ✅Naturally    | v1.33    |                                                                               |
| `積読 Tsundoku`      | ✅Naturally    | v1.7.6   |                                                                               |
| `暗色+ Dark+`        | ✅Naturally    | v1.9.5   |                                                                               |
| `Light/Dark-Blue`    | ✅In CSS Mode  | v1.1.0   | Compatible through modifying transparency of some components.                |
| `任我行 Odyssey`     | ✅In CSS Mode  | v1.0.4   | Compatible through modifying transparency of some components.                |
| `星辰 StarDust`      | ✅In CSS Mode  | v0.6.1   | Compatible through modifying transparency of some components.                |
| `简化版 mini-vlook`  | ✅In CSS Mode  | v2.8.704 | Compatible through modifying transparency of some components.                |
| `写未 Savor`         | ❌Slightly not | v3.4.6   | The bottom bar and some of the skin's CSS styles are abnormally incompatible. |
| `瑞姆工艺 Rem Craft` | ❌Slightly not | v2.6.11  | The background style of the tool menu component is too complex to adapt.      |

## Implementation

### 1. Adding Background Element

Add a `<div>` element within the `<body>` element, tiled and centered, to serve as the container for the background image.

### 2. Transparency of Foreground Panel

The user-defined range for opacity is `[0.1, 1]`. However, to ensure the readability of the note content, a weighted logic `f(x) = 0.99 - 0.25x` is used, resulting in a weighted opacity range of `[0.74, 0.99]`. Since different themes have completely different color settings, the same opacity setting may not appear consistent across different themes.

There are two modes for implementing foreground transparency:

* Opacity Mode (default)

  Modify the `opacity` property of the parent elements of the panel's top toolbar (`toolbar`), editor, left and right sidebars (`layouts`, `dockLeft`, `dockRight`), bottom sidebar (`dockBottom`), and status bar (`status`) to achieve the transparency effect of the foreground.

  However, this approach may encounter compatibility issues with certain themes, primarily due to the following problems:

  1. Some themes set the background color of the `<body>` and make the color of the top toolbar, sidebars, and status bar transparent to ensure consistent appearance. However, when this plugin is enabled, the background pattern will be fully visible through these transparent menus, resulting in poor readability of the text and icons.
  2. After activating the plugin, some theme buttons may become unclickable. This is because modifying the overall opacity with `opacity` property will also affect the `z-index` ([refer to this article for an explanation](https://blog.csdn.net/weixin_51474815/article/details/121070612)), causing issues with the stacking order. Buttons may be obscured by other layers. Generally, there is no overlapping between the top bar, editor area, and bottom bar to avoid this problem. However, some themes have overlapping regions, such as placing tabs in the top bar, which can lead to this problem.
* CSS Mode

  In order to address the compatibility issues caused by the opacity mode, in this mode, opacity modification is abandoned, and the background color of rendered panel elements (with element IDs `toolbar`, `layouts`, `dockLeft`, `dockRight`, `dockBottom`, `status`) is read and the alpha value is modified to achieve a similar transparency effect.

  However, this approach may still encounter compatibility issues with certain themes. Some themes have specific background colors for buttons or button groups, but the plugin does not recursively modify all elements within the panel, resulting in the panel being transparent while the buttons inside the panel remain opaque, which can lead to poor aesthetics.

### 3. Compatibility Recommendations for Theme Developers

It is recommended for theme authors to follow the SourceNote theme template and avoid achieving color consistency by setting the foreground as `transparent` to reveal the background color. Additionally, try to adhere to the layout structure of the theme template and avoid overlapping between different sections

## ChangeLogs

<details open>
<summary><b>June 2023</b></summary>

**v23.06.30**

- Make popup dialog for cache manager
- Redesign the shortcut key mapping

**v23.06.28**

* For the 2.9.3 version of Joplin, modify the cache directory `/data/plugins/{name}/` to `/data/public/{name}/`.
* Support batch image upload mode (limited to 50 images).
* Support random non-repetitive image selection for the current image.
* Fix UI interaction bugs in the settings interface.

**v23.06.27**

- Fixing bugs related to UI interactions in the settings panel.
- Refactoring the logic of the opacity mode to modify the parent component of `dockLeft`, `dockRight`, and `layouts` instead of modifying them individually. The parent component is `<div class="fn__flex-1 fn__flex ...>` and it will be assigned a custom ID by the plugin: `dockPanel`.
- Adding all natively supported themes to the whitelist for compatibility purposes.

**v23.06.26**

- Add image offset settings
- Add theme adaptation whitelist, which not support theme adaptation switch

**v23.06.24**

- Change the transparency scheme to: toolbar, dockLeft, dockRight, dockBottom and status bar modifying alpha value of colors, and editor (layouts) modifying the opacity property.
- When changing the theme, force-reload the note interface.
- Modify the compatitivity on theme again
- Add a compatibility mode button that can switch between overall opacity mode and CSS opacity mode.
- Optimize file hash method to speed up calculation speed.

**v23.06.23**

- Reduce the length of the image hash file to 15 characters.
- Implement startup cache folders and index calibration and prompt function.
- Implement the function of randomly selecting backgrounds.
- Optimize handling of 404 errors for images during startup.
- Separate the bilingual documents.
- Implement the random selection function on launching
- Check the compatitivity on theme again

**v23.06.22**

- Adapt to 3 more themes
- remove the hash code of the current image in setting
- Adjust the logic for weighted opacity
- Use layer container `<div id="bgLayer">` instead of the `<body>` element to store the background.
- Support background blurring function
- Modify the layouts of the setting Panel UI
- Temporarily remove the buttons of unsupported functions

**v23.06.21**

- Implementation theme adaptation on theme change
- Support upload single local images into the cache folder
- Support clear all cached images
- Update the data structure for recording the cached images
- Add developer debug switch button

**v23.06.20**

- Implement the image upload dialog
- Implemented the selection of an image upload and saved it to the cache path using the Source API.
- After turning on and off the plugin, realize color optimization for specific themes (such as the `toolbar` of the Savor theme).
- By using DOM monitoring to detect theme changes (not yet implemented in conjunction with the above optimization).

**v23.06.18**

- Support user config IO
- Modify the layouts of Bug report and setting Panel UI

**v23.06.17**

- Achieve image transparency by modifying the `opacity` of `<body>` element, abandoning the modification of the alpha value of `background-color` in the CSS style.
- support the setting interactions of checkbox and slider
- support the plugin on button in menu
- Dialog for Bug report

**v23.06.16**

- Onload when starting SiYuan
- implement the image replacement and transparency

**v23.06.14**

- initialize the project

</details>

## Donation

<table>
<thead>
<tr>
<th style="text-align:center;">AliPay</th>
<th style="text-align:center;">WeChat</th>
<th style="text-align:center;">Afdian</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:center;"><img width="256" class="mb-4 rounded" alt="" src="https://cdn.jsdelivr.net/gh/HowcanoeWang/siyuan-plugin-background-cover@main/static/ali.jpg"></td>
<td style="text-align:center;"><img width="256" class="mb-4 rounded" alt="" src="https://cdn.jsdelivr.net/gh/HowcanoeWang/siyuan-plugin-background-cover@main/static/wechat.png"></td>
<td style="text-align:center;"><img width="256" class="mb-4 rounded" alt="" src="https://cdn.jsdelivr.net/gh/HowcanoeWang/siyuan-plugin-background-cover@main/static/afdian.jpg"></td>
</tr>
</tbody>
</table>

## Acknowledgement

This project is inspired and modified from

* [vscode-background-cover](https://github.com/AShujiao/vscode-background-cover)
* [siyuan-theme-dark+](https://github.com/Zuoqiu-Yingyi/siyuan-theme-dark-plus)
* [siyuan-plugin-importer](https://github.com/terwer/siyuan-plugin-importer/tree/main)
* [siyuan-dailynote-today](https://github.com/frostime/siyuan-dailynote-today)

Thanks to the members in the 'Siyuan developer' group for patiently answering my questions regarding this plugin development.
