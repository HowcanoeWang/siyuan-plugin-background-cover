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

## 特性 | Features

- [x] 目前仅支持**桌面端**以及**浏览器端** / Only the **desktop** and **browser-desktop** are supported.
- [x] 平铺一张图片作为思源笔记背景 / Tiling a picture as a background for SiYuan Notes
- [ ] 手动设置图库的文件夹 / Manually specify the folder as image library
- [ ] 每次启动时随机选择图片 / Launching by choosing a random image

## 实现思路 | Implementation

获取`<body>`元素，在其`style`属性中添加`background-image`和`opacity`值。其中，用户可设置的`opacity`定义域为`[0.1, 1]`。但为了笔记内容的可读性，使用[vscode-background-cover](https://github.com/AShujiao/vscode-background-cover)中的加权逻辑`f(O) = 0.59 + [0.4 - (O ⨉ 0.4)]`，加权后`body`透明度值域为`[0.59, 0.99]`。

Add `background-image` and `opacity` to `<body>` element's style. The user-defined domain for opacity is `[0.1, 1]`. However, for the readability of note content, use the weighted opacity `f(O) = 0.59 + [0.4 - (O ⨉ 0.4)]` from [vscode-background-cover](https://github.com/AShujiao/vscode-background-cover). After weighting, the `body` opacity range is `[0.59, 0.99]`.


## 更新日志 | ChangeLogs

<details open>
<summary><b>June 2023</b></summary>

**v23.06.20**

- 实现图片上传的对话框 / Implement the image upload dialog
- 通过思源API实现了选取一张图片上传并保存到缓存路径下 / Implemented the selection of an image upload and saved it to the cache path using the Source API.

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

封面背景图画师 / Background cover artist：    

`劉了了_Ale`  [爱发电AFDIAN](https://afdian.net/a/_LIAO) | [Fanbox](https://www.fanbox.cc/@ale) | [Bilibili](https://space.bilibili.com/3883010) | [Twitter](https://twitter.com/_LIAO)