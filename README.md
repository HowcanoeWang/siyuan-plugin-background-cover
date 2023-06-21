<h1 align="center">
  <br>
    <img src="./icon.png" alt="logo" width="200">
  <br>
  SiYuan - Background Cover
  <br>
  <br>
</h1>

<p align="center">
添加一张你喜欢的图片铺满整个思源笔记
<br/>
Add a picture you like to cover the entire Siyuan Note
<br/>
</p>

## 预览 | Preview

![](https://cdn.jsdelivr.net/gh/HowcanoeWang/siyuan-plugin-background-cover/preview.png)

<div align="center">
默认背景图美少女画师 / Default background cover artist ——   
<code>劉了了_Ale</code><br>
<a href="https://afdian.net/a/_LIAO">爱发电AFDIAN</a> | 
<a href="https://www.fanbox.cc/@ale">Fanbox</a> | 
<a href="https://space.bilibili.com/3883010">Bilibili</a> | 
<a href="https://twitter.com/_LIAO">Twitter</a>
</div>

## 特性 | Features

**目前该插件还处于内测中，请勿使用本插件保存重要图片数据**

- [x] 目前仅支持**桌面端**以及**PC浏览器端** / Only the **desktop** and **browser-desktop (PC)** are supported.
- [x] 平铺一张图片作为思源笔记背景 / Tiling a picture as a background for SiYuan Notes
- [x] 适配主题 / Compatible theme：    
  - [x] `Daylight midnight` (默认 / default)
  - [x] `写未 Savor` 
  - [x] `暗色+ Dark+`
- [x] 手动调整透明度 / Manually adjust the transparency
- [ ] 背景图库缓存文件夹 / Cached folder for background image library 
  - [x] 上传单张本地图片 / Upload single local image files
  - [ ] 上传单张网络图片 / Upload single network image files
  - [ ] 上传本地文件夹中所有图片 / Upload all images in a local folder
- [ ] 选择与切换背景图片 / Choose and switch a background image
  - [ ] 手动选择 / Choosing by manual
  - [ ] 手动触发随机选择 / Random select by manual action
  - [ ] 每次启动时随机选择 / Choosing on launch

## 实现思路 | Implementation

获取`<body>`元素，在其`style`属性中添加`background-image`和`opacity`值。其中，用户可设置的`opacity`定义域为`[0.1, 1]`。但为了笔记内容的可读性，使用[vscode-background-cover](https://github.com/AShujiao/vscode-background-cover)中的加权逻辑`f(O) = 0.59 + [0.4 - (O ⨉ 0.4)]`，加权后`body`透明度值域为`[0.59, 0.99]`。

Add `background-image` and `opacity` to `<body>` element's style. The user-defined domain for opacity is `[0.1, 1]`. However, for the readability of note content, use the weighted opacity `f(O) = 0.59 + [0.4 - (O ⨉ 0.4)]` from [vscode-background-cover](https://github.com/AShujiao/vscode-background-cover). After weighting, the `body` opacity range is `[0.59, 0.99]`.

## 更新日志 | ChangeLogs

<details open>
<summary><b>June 2023</b></summary>

**v23.06.21**

- 主题变化的监测适配的实现 / Implementation theme adaptation on theme change
- 实现单张图片本地上传到缓存文件夹中 / Support upload single local images into the cache folder
- 清理缓存文件夹的所有图片 / Support clear all cached images
- 更改缓存图片记录的数据结构 / Update the data structure for recording the cached images
- 增加开发者模式按钮 / Add developer debug switch button

**v23.06.20**

- 实现图片上传的对话框 / Implement the image upload dialog
- 通过思源API实现了选取一张图片上传并保存到缓存路径下 / Implemented the selection of an image upload and saved it to the cache path using the Source API.
- 实现开启关闭插件后，对特定主题的颜色优化(如Savor主题的`toolbar`颜色问题) / After turning on and off the plugin, realize color optimization for specific themes (such as the `toolbar` of the Savor theme).
- 利用DOM监听，实现主题变化的监测(配合上面的优化还没实现) / By using DOM monitoring to detect theme changes (not yet implemented in conjunction with the above optimization).

**v23.06.18**

- 实现了用户设置的读写 / Support user config IO
- 修改Bug反馈和设置界面的UI布局 / Modify the layouts of Bug report and setting Panel UI

**v23.06.17**

- 通过修改`<body>`元素的`opaticy`来实现透明度，简化掉之前修改css样式中的`background-color`的alpha值的方法 / Achieve image transparency by modifying the `opacity` of `<body>` element, abandoning the modification of the alpha value of `background-color` in the CSS style.
- 支持设置中的开关和滑动条交互 / support the setting interactions of checkbox and slider
- 支持插件打开的栏目开关 / support the plugin on button in menu
- Bug汇报弹出提示页 / Dialog for Bug report

**v23.06.16**

- 思源笔记启动时加载测试 / Onload when starting SiYuan
- 图片替换以及透明度实现 / implement the image replacement and transparency 

**v23.06.14**

- 初始化项目 / initialize the project

</details>

## 致谢 | Acknowledgement

此项目参考了以下项目部分公开的代码 / This project is inspired and modified from 

* [vscode-background-cover](https://github.com/AShujiao/vscode-background-cover)
* [思源dark+主题 / siyuan-theme-dark+](https://github.com/Zuoqiu-Yingyi/siyuan-theme-dark-plus)
* [思源导入插件 / siyuan-plugin-importer](https://github.com/terwer/siyuan-plugin-importer/tree/main)
* [思源今日日记看板 / siyuan-dailynote-today](https://github.com/frostime/siyuan-dailynote-today)

感谢`思源爱好者折腾群`中各类大佬耐心解答我关于此插件开发中遇到的各种问题 / Thanks to the members in the 'Siyuan developer' group for patiently answering my questions regarding this plugin development.