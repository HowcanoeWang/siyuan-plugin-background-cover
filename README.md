<h1 align="center">
  <br>
    <img src="./icon.png" alt="logo" width="200">
  <br>
  SiYuan - Background Cover
  <br>
</h1>

<p align="center">
添加一张你喜欢的图片铺满整个思源笔记
<br/>
<a href="./README.md">English</a>
</p>

## 预览

![](https://cdn.jsdelivr.net/gh/HowcanoeWang/siyuan-plugin-background-cover/preview.png)

<div align="center">
默认背景图美少女画师 ——   
<code>劉了了_Ale</code><br>
<a href="https://afdian.net/a/_LIAO">爱发电</a> | 
<a href="https://www.fanbox.cc/@ale">Fanbox</a> | 
<a href="https://space.bilibili.com/3883010">B站</a> | 
<a href="https://twitter.com/_LIAO">推特</a>
</div>

## 特性

**目前该插件还处于内测中，请勿使用本插件保存重要图片数据**

- [x] 目前仅支持**桌面端**以及**PC浏览器端**
- [x] 平铺一张图片作为思源笔记背景
- [x] 适配主题 
  - [x] `Daylight midnight` (默认)
  - [x] `写未 Savor` 
  - [x] `暗色+ Dark+`
  - [x] `Light/Dark-Blue`
  - [x] `瑞姆工艺 Rem Craft`
  - [x] `任我行 Odyssey`
- [x] 手动调整透明度
- [x] 手动调整背景虚化程度
- [ ] 背景图库缓存文件夹
  - [x] 上传单张本地图片
  - [ ] 上传单张网络图片
  - [ ] 上传本地文件夹中所有图片
- [ ] 选择与切换背景图片
  - [ ] 手动选择
  - [x] 手动触发随机选择
  - [ ] 每次启动时随机选择

## 实现思路

在`<body>`元素中添加一个`<div>`元素，平铺居中且处于笔记最底层，用来存放图片背景。随后修改思源笔记面板的工具条(`toolbar`)，左右底侧菜单栏(`dockLeft`, `dockRight`, `dockBottom`)， 编辑器(`layouts`), 状态栏(`status`)这几个主要笔记面板的透明度`opacity`属性让背景显示出来。其中，用户可设置的`opacity`定义域为`[0.1, 1]`。但为了笔记内容的可读性，使用加权逻辑`f(x) = 0.99 - 0.25x`，加权后`body`透明度值域为`[0.74, 0.99]`。

## 更新日志

<details open>
<summary><b>June 2023</b></summary>

**v23.06.23**

- 缩减图片哈希文件长度为15个字符
- 实现启动时缓存文件夹与索引校对与提示功能 
- 实现随机抽背景的功能 
- 优化启动时图片404情况的处理
- 双语文档的分离

**v23.06.22**

- 适配3个主题
- 去除设置中当前图片中的hash乱码
- 调整透明度加权逻辑
- 改用图层容器`<div id="bgLayer">`而不是`<body>`元素来存放背景
- 支持背景模糊功能
- 修改设置界面的UI布局
- 暂时移除尚未支持的功能按钮

**v23.06.21**

- 主题变化的监测适配的实现
- 实现单张图片本地上传到缓存文件夹中
- 清理缓存文件夹的所有图片
- 更改缓存图片记录的数据结构
- 增加开发者模式按钮

**v23.06.20**

- 实现图片上传的对话框
- 通过思源API实现了选取一张图片上传并保存到缓存路径下
- 实现开启关闭插件后，对特定主题的颜色优化(如Savor主题的`toolbar`颜色问题)
- 利用DOM监听，实现主题变化的监测(配合上面的优化还没实现)

**v23.06.18**

- 实现了用户设置的读写
- 修改Bug反馈和设置界面的UI布局

**v23.06.17**

- 通过修改`<body>`元素的`opaticy`来实现透明度，简化掉之前修改css样式中的`background-color`的alpha值的方法
- 支持设置中的开关和滑动条交互
- 支持插件打开的栏目开关
- Bug汇报弹出提示页

**v23.06.16**

- 思源笔记启动时加载测试
- 图片替换以及透明度实现

**v23.06.14**

- 初始化项目

</details>

## 致谢

此项目参考了以下项目部分公开的代码

* [vscode-background-cover](https://github.com/AShujiao/vscode-background-cover)
* [思源dark+主题](https://github.com/Zuoqiu-Yingyi/siyuan-theme-dark-plus)
* [思源导入插件](https://github.com/terwer/siyuan-plugin-importer/tree/main)
* [思源今日日记看板](https://github.com/frostime/siyuan-dailynote-today)

感谢`思源爱好者折腾群`中各类大佬耐心解答我关于此插件开发中遇到的各种问题
