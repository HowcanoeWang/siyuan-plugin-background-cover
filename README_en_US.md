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

Add a `<div>` element in the `<body>` element, with a tiled and centered placement and positioned at the bottom to hold the background image. Then modify the opacity property of the top toolbar, left,right,bottom dock (`dockLeft`, `dockRight`, `dockBottom`), status bar, and editor layouts of the Source Note panel to achieve transparent foreground with the background image displayed. The user-defined opacity range is `[0.1, 1]`, but to ensure readability of the note content, a weighted logic of `f(x) = 0.99 - 0.25x` is used to limit the opacity value range to `[0.74, 0.99]`. However, identical opacity settings can yield different results across different themes due to varying color sets per theme.

Some themes encounter compatibility issues with the above solution, particularly:

1. Some themes set the background color of the `` element and set the color of the top toolbar, dock, and status bar to transparent to ensure color consistency.
   * `Compatibility issue`: The plugin adds a layer of image on top of the `` element, resulting in poor readability of the text and icons on top of these completely transparent menus.
   * `Fix`: The plugin manually sets the transparent background color to a fixed value.
   * `Adaptation suggestion`: Theme authors are recommended to follow the Source Theme Template and modify the color of each element to a specified background color instead of using the transparent option.
2. Some themes encounter issues where buttons cannot be clicked after activating the plugin.
   * `Compatibility issue`: Changing the opacity value also affects the z-index, causing stacking order issues and buttons being covered by other layers. The toolbar is mainly affected by the layouts layer.
   * `Fix`: Use the plugin's compatibility mode to read the panel's color and modify the alpha value to achieve a similar transparency effect instead of changing the opacity value. The drawback is that buttons with a set background color in the theme cannot be transparent, resulting in abrupt visual inconsistency (e.g., `Savor` and `Ram Craft` themes).
   * `Adaptation suggestion`: Theme authors are recommended to follow the Source Theme Template's layout and arrange the elements in a way that avoids overlapping.

## ChangeLogs

<details open>
<summary><b>June 2023</b></summary>

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

## Acknowledgement

This project is inspired and modified from

* [vscode-background-cover](https://github.com/AShujiao/vscode-background-cover)
* [siyuan-theme-dark+](https://github.com/Zuoqiu-Yingyi/siyuan-theme-dark-plus)
* [siyuan-plugin-importer](https://github.com/terwer/siyuan-plugin-importer/tree/main)
* [siyuan-dailynote-today](https://github.com/frostime/siyuan-dailynote-today)

Thanks to the members in the 'Siyuan developer' group for patiently answering my questions regarding this plugin development.
