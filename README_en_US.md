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

**Currently, the plugin is still in beta testing. Please do not use this plugin to save important image data.**

- [X] Only the **desktop** and **browser-desktop (PC)** are supported.
- [X] Tiling a picture as a background for SiYuan Notes
- [X] Compatible theme：
- [X] Manually adjust the transparency
- [X] Manually adjust the blur effects of the background
- [ ] Cached folder for background image library
  - [X] Upload single local image files
  - [ ] Upload single network image files
  - [ ] Upload all images in a local folder
- [ ] Choose and switch a background image
  - [ ] Choosing by manual
  - [X] Random select by manual action
  - [X] Choosing randomly on launch

## Theme Compativity

| Theme name            | Compativity        | Versions | Descrip                                                                       |
| --------------------- | ------------------ | -------- | ----------------------------------------------------------------------------- |
| `Daylight midnight` | ✅Naturally        | 2.9.2    | Siyuan default theme                                                          |
| `Tsundoku`          | ✅Naturally        | v1.7.6   |                                                                               |
| `Zhihu`             | ✅Naturally        | v0.0.6   |                                                                               |
| `VSCode Light`      | ✅Naturally        | v1.1.2   |                                                                               |
| `Z-Acrylic`         | ✅Naturally        | v0.2.2   |                                                                               |
| `sy-darkpruple`     | ✅Naturally        | v0.2.1   |                                                                               |
| `Dark+`             | ✅After adaptation | v1.9.4   | Compatible through transparency of components.                               |
| `Light/Dark-Blue`   | ✅After adaptation | v1.1.0   | Compatible through transparency of components.                               |
| `Odyssey`           | ✅After adaptation | v1.0.4   | Compatible through transparency of components.                               |
| `StarDust`          | ✅After adaptation | v0.6.1   | Compatible through transparency of components.                               |
| `mini-vlook`        | ✅After adaptation | v2.8.704 | Compatible through transparency of components.                               |
| `Savor`             | ❌Slightly not     | v3.4.6   | The bottom bar and some of the skin's CSS styles are abnormally incompatible. |
| `Rem Craft`         | ❌Slightly not     | v2.6.11  | The background style of the tool menu component is too complex to adapt.      |
| `pink-room`         | ❌Serverly not     | v0.7.6   | Adding opacity and modifying color transparency are both ineffective.         |

## Implementation

Add a `<div>` element to the `<body>` element, as the container of the background which is centered and placed at the bottom of the note. Then, adjust the opacity property of the main note panels, including the toolbar, dock menus (`dockLeft`, `dockRight`, `dockBottom`), layouts, and status bar to achieve transparency of the foreground. The user-defined domain for opacity is `[0.1, 1]`. However, for the readability of note content, use the weighted opacity `f(x) = 0.99 - 0.25x`. After weighting, the `body` opacity range is `[0.74, 0.99]`.

## ChangeLogs

<details open>
<summary><b>June 2023</b></summary>

**v23.06.24**

- Change the transparency scheme to: toolbar, dockLeft, dockRight, dockBottom and status bar modifying alpha value of colors, and editor (layouts) modifying the opacity property.
- When changing the theme, force-reload the note interface.
- Modify the compatitivity on theme again

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

## Acknowledgement

This project is inspired and modified from

* [vscode-background-cover](https://github.com/AShujiao/vscode-background-cover)
* [siyuan-theme-dark+](https://github.com/Zuoqiu-Yingyi/siyuan-theme-dark-plus)
* [siyuan-plugin-importer](https://github.com/terwer/siyuan-plugin-importer/tree/main)
* [siyuan-dailynote-today](https://github.com/frostime/siyuan-dailynote-today)

Thanks to the members in the 'Siyuan developer' group for patiently answering my questions regarding this plugin development.
