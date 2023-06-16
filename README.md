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

TODO - Preview GIF

## 特性 | Features

- [x] 目前仅支持**桌面端**以及**浏览器端** / Only the **desktop** and **browser-desktop** are supported.
- [ ] 平铺一张图片作为思源笔记背景 / Tiling a picture as a background for SiYuan Notes
- [ ] 手动设置图库的文件夹 / Manually specify the folder as image library
- [ ] 每次启动时随机选择图片 / Launching by choosing a random image

## 实现思路 | Implementation

* 添加背景图片的实现

  获取`<body>`标签，在其`style`属性中添加`background-image`值，但此时背景会被笔记的各个面板挡住，需要改变透明度来让图片透出来。

* 改变透明度的实现

  直接设置`<body>`标签的`opacity`属性并不可行，因为这样会把文字也加上透明度(整体透明)，不方便阅读，仅需要背景的透明度发生变化。

  为了保证不会大幅改变当前主题的原始配色表现，此插件仅在原本RGB色值基础上，添加alpha值。当主题的元素配色存在alpha值时，不对其进行修改。

  按照上述原则，修改主题CSS样式中的变量`--b3-theme-background`和`--b3-theme-surface`，为其加上透明度。

  为了防止部分主题使用了自己的css颜色值，为了尽量适配，在此修改元素ID为`toolbar`， `dockLeft`, `layouts`, `dockRight`, `dockBottom`, `status`的这几个主要笔记面板的`style`属性，在其中添加`background-color`(rgba)和`background-blend-mode:lighten`来实现透明化


## 更新日志 | ChangeLogs

**v230614**

- 初始化项目 / initialize the project

## 致谢 | Acknowledgement

此项目参考了 [vscode-background-cover](https://github.com/AShujiao/vscode-background-cover) 和 [思源dark+主题](https://github.com/Zuoqiu-Yingyi/siyuan-theme-dark-plus) 部分公开的代码    
This project is inspired and modified from [vscode-background-cover](https://github.com/AShujiao/vscode-background-cover) and [siyuan-theme-dark+](https://github.com/Zuoqiu-Yingyi/siyuan-theme-dark-plus)
