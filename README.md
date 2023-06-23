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
<a href="./README_en_US.md">English</a>
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

- [X] 目前仅支持**桌面端**以及**PC浏览器端**
- [X] 平铺一张图片作为思源笔记背景
- [X] 适配主题
- [X] 手动调整透明度
- [X] 手动调整背景虚化程度
- [ ] 背景图库缓存文件夹
  - [X] 上传单张本地图片
  - [ ] 上传单张网络图片
  - [ ] 上传本地文件夹中所有图片
- [ ] 选择与切换背景图片
  - [ ] 手动选择
  - [X] 手动触发随机选择
  - [X] 每次启动时随机选择

## 主题适配情况

| 主题名                 | 兼容情况     | 版本号   | 说明                                 |
| ---------------------- | ------------ | -------- | ------------------------------------ |
| `Daylight midnight`  | ✅原生兼容   | 2.9.2    | 思源默认主题                         |
| `積読 Tsundoku`      | ✅原生兼容   | v1.7.6   |                                      |
| `知乎 Zhihu`         | ✅原生兼容   | v0.0.6   |                                      |
| `VSCode Light`       | ✅原生兼容   | v1.1.2   |                                      |
| `Z-Acrylic`          | ✅原生兼容   | v0.2.2   |                                      |
| `紫夜 sy-darkpruple` | ✅原生兼容   | v0.2.1   |                                      |
| `暗色+ Dark+`        | ✅适配后兼容 | v1.9.4   | 通过修改组件颜色透明度兼容               |
| `Light/Dark-Blue`    | ✅适配后兼容 | v1.1.0   | 通过修改组件颜色透明度兼容               |
| `任我行 Odyssey`     | ✅适配后兼容 | v1.0.4   | 通过修改组件颜色透明度兼容               |
| `星辰 StarDust`      | ✅适配后兼容 | v0.6.1   | 通过修改组件颜色透明度兼容               |
| `简化版 mini-vlook`  | ✅适配后兼容 | v2.8.704 | 通过修改组件颜色透明度兼容               |
| `写未 Savor`         | ❌轻微不兼容 | v3.4.6   | 底栏和部分皮肤css样式异常无法适配    |
| `瑞姆工艺 Rem Craft` | ❌轻微不兼容 | v2.6.11  | 工具菜单组件背景样式过于复杂难以适配 |
| `粉色小屋 pink-room` | ❌重度不兼容 | v0.7.6   | 添加opacity和修改颜色透明度均无效    |

## 实现思路

在 `<body>`元素中添加一个 `<div>`元素，平铺居中且处于笔记最底层，用来存放图片背景。随后修改思源笔记面板的工具条(`toolbar`)，左右底侧菜单栏(`dockLeft`, `dockRight`, `dockBottom`)， 状态栏(`status`)这几个面板的颜色alpha值；对编辑器(`layouts`)修改 `opacity`属性，来实现前景的透明一显示背景图。其中，用户可设置的 `opacity`定义域为 `[0.1, 1]`。但为了笔记内容的可读性，使用加权逻辑 `f(x) = 0.99 - 0.25x`，加权后透明度值域为 `[0.74, 0.99]`。由于不同主题本身就有完全不同的颜色设定，所以同样的透明度设置在不同的主题上表现不完全一致。

## 更新日志

<details open>
<summary><b>June 2023</b></summary>

**v23.06.24**

- 修改透明度方案为：工具条(`toolbar`)，左右底侧菜单栏(`dockLeft`, `dockRight`, `dockBottom`)， 状态栏(`status`)修改颜色的alpha值，编辑器(`layouts`)修改 `opacity`属性
- 更换主题时，强制重载笔记界面
- 重新适配主题兼容情况

**v23.06.23**

- 缩减图片哈希文件长度为15个字符
- 实现启动时缓存文件夹与索引校对与提示功能
- 实现随机抽背景的功能
- 优化启动时图片404情况的处理
- 双语文档的分离
- 实现启动时随机抽选功能
- 重新检查主题兼容情况

**v23.06.22**

- 适配3个主题
- 去除设置中当前图片中的hash乱码
- 调整透明度加权逻辑
- 改用图层容器 `<div id="bgLayer">`而不是 `<body>`元素来存放背景
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
- 实现开启关闭插件后，对特定主题的颜色优化(如Savor主题的 `toolbar`颜色问题)
- 利用DOM监听，实现主题变化的监测(配合上面的优化还没实现)

**v23.06.18**

- 实现了用户设置的读写
- 修改Bug反馈和设置界面的UI布局

**v23.06.17**

- 通过修改 `<body>`元素的 `opaticy`来实现透明度，简化掉之前修改css样式中的 `background-color`的alpha值的方法
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

感谢 `思源爱好者折腾群`中各类大佬耐心解答我关于此插件开发中遇到的各种问题
