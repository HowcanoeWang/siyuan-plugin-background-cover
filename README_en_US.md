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

- [X] The plugin backend supports all platforms (Considering the UI interaction, support for **narrow-screen mobile devices** is not available)
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


## Implementation

Add a `<canvas>` element within the `<HTML>` element, at the same level as `<head>` and `<body>`. The `<canvas>` element should be tiled and centered, and placed at the bottom layer of the notebook to serve as the background for images. Then, add the `style='opacity: xxx'` attribute to the `<body>` element to achieve transparency for the notebook panel. This replaces the previous CSS transparency mode to avoid compatibility issues with all themes.

The range of transparency that can be set by the user is `[0.1, 1]`. However, to ensure readability of the notebook content, a weighted logic `f(x) = 0.99 - 0.25x` is used. The weighted transparency range is `[0.74, 0.99]`. Since different themes have completely different color settings, the same transparency setting may not appear consistent across different themes.

## ChangeLogs

<details open>
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
* [sy-theme-change](https://github.com/frostime/sy-theme-change/tree/main)

Thanks to the members in the 'Siyuan developer' group for patiently answering my questions regarding this plugin development.
