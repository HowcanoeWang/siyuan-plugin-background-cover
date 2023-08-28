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

- [X] 插件后端全平台支持 (考虑UI交互，**窄距手机端**不提供支持)
- [X] 平铺一张图片作为思源笔记背景
- [X] 手动调整透明度
- [X] 手动调整背景虚化程度
- [X] 背景图库缓存文件夹
  - [X] 上传单张本地图片
  - [X] 上传本地文件夹中所有图片
- [x] 选择与切换背景图片
  - [x] 手动选择
  - [X] 手动触发随机选择
  - [X] 每次启动时随机选择

## 实现思路

在 `<HTML>`中元素中添加一个和 `<head>` 与 `<body>` 平级的`<canvas>`元素，平铺居中且处于笔记最底层，用来存放图片背景。随后通过给 `<body>` 整体添加 `style='opacity: xxx'` 属性来实现笔记面板的透明。弃用之前的`CSS透明模式`，以兼容所有主题。

用户可设置的透明度定义域为 `[0.1, 1]`。但为了笔记内容的可读性，使用加权逻辑 `f(x) = 0.99 - 0.25x`，加权后透明度值域为 `[0.74, 0.99]`。由于不同主题本身就有完全不同的颜色设定，所以同样的透明度设置在不同的主题上表现不完全一致。

## 更新日志

<details open>
<summary><b>Augest 2023</b></summary>

**23.08.28**

* 提供关闭`<body>`透明度选项(前景透明度调为0)，适配部分透明主题(`Cliff-Dark`, `Dark+`)

**23.08.20**

* 为安卓App端增加图片上传提示

**23.08.19**

* 使用github上的`themes.json`来替代耗时的`api/bazaar/getInstalledTheme`
* 针对直连Github有困难的大陆用户，插件内提供临时的最新主题缓存信息

**23.08.15**

* 增加主题屏蔽功能，支持在指定主题上不启用插件
* 插件后端支持全平台，前端UI仅限桌面宽屏

**23.08.13**

* 修复重置按钮报错的问题
* 弃用`CSS模式`，改用全局`opacity模式`来解决主题适配问题

</details>

<details>
<summary><b>July 2023</b></summary>

**23.07.31**

* 解决伺服时陷入主题更改刷新的死循环

**23.07.26**

* 优化文件哈希逻辑
* 修复集市中，设置按钮不可见的问题
* 使用全局变量来简化函数参数(移除部分PluginInstance参数)

**23.07.25**

- 修改当缓存中发现多余图片但符合hash标准时，由删除图片改为添加到configs.json，以应对跨设备同步
- 修复透明模式和兼容模式设置的UI不起效bug
- 开发者模式的输出日志中，前置提示词修改

**23.07.22**

- 重构项目结构


**23.07.16**

- 添加超出部分UI的滚动条适配

**23.07.07**

- 更改设置UI，添加Transparent Mode切换和兼容性主题
- 初始化兼容性设置UI

</details>

<details >
<summary><b>June 2023</b></summary>

**23.06.30**

- 制作缓存管理弹出菜单
- 重新设定快捷键映射

**23.06.28**

- 对思源笔记2.9.3版本，修改缓存目录 `/data/plugins/{name}/`为 `/data/public/{name}/`
- 支持批量图片上传模式(限定50张为上限)
- 支持随机抽图不重复到当前图
- 修复设置界面UI交互bug

**23.06.27**

- 修复设置面板部分UI交互bug
- 重构opacity模式的逻辑，由分别修改dockLeft、dockRight、layouts三个组件，变为修改三者的父组件 `<div class="fn__flex-1 fn__flex ...>`并附上插件自定义id：`dockPanel`
- 增加所有原生支持的主题到适配白名单内

**23.06.26**

- 支持修改图片偏移位置
- 增加主题白名单，白名单内的主题不支持开启兼容模式

**23.06.24**

- 修改透明度方案为：工具条(`toolbar`)，左右底侧菜单栏(`dockLeft`, `dockRight`, `dockBottom`)， 状态栏(`status`)修改颜色的alpha值，编辑器(`layouts`)修改 `opacity`属性
- 更换主题时，强制重载笔记界面
- 重新适配主题兼容情况
- 增加兼容模式按钮，可以切换整体opacity模式和css透明度模式
- 优化文件hash方法，加快计算速度

**23.06.23**

- 缩减图片哈希文件长度为15个字符
- 实现启动时缓存文件夹与索引校对与提示功能
- 实现随机抽背景的功能
- 优化启动时图片404情况的处理
- 双语文档的分离
- 实现启动时随机抽选功能
- 重新检查主题兼容情况

**23.06.22**

- 适配3个主题
- 去除设置中当前图片中的hash乱码
- 调整透明度加权逻辑
- 改用图层容器 `<div id="bgLayer">`而不是 `<body>`元素来存放背景
- 支持背景模糊功能
- 修改设置界面的UI布局
- 暂时移除尚未支持的功能按钮

**23.06.21**

- 主题变化的监测适配的实现
- 实现单张图片本地上传到缓存文件夹中
- 清理缓存文件夹的所有图片
- 更改缓存图片记录的数据结构
- 增加开发者模式按钮

**23.06.20**

- 实现图片上传的对话框
- 通过思源API实现了选取一张图片上传并保存到缓存路径下
- 实现开启关闭插件后，对特定主题的颜色优化(如Savor主题的 `toolbar`颜色问题)
- 利用DOM监听，实现主题变化的监测(配合上面的优化还没实现)

**23.06.18**

- 实现了用户设置的读写
- 修改Bug反馈和设置界面的UI布局

**23.06.17**

- 通过修改 `<body>`元素的 `opaticy`来实现透明度，简化掉之前修改css样式中的 `background-color`的alpha值的方法
- 支持设置中的开关和滑动条交互
- 支持插件打开的栏目开关
- Bug汇报弹出提示页

**23.06.16**

- 思源笔记启动时加载测试
- 图片替换以及透明度实现

**23.06.14**

- 初始化项目

</details>

## 捐赠

<table>
<thead>
<tr>
<th style="text-align:center;">支付宝</th>
<th style="text-align:center;">微信支付</th>
<th style="text-align:center;">爱发电</th>
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

## 致谢

此项目参考了以下项目部分公开的代码

* [vscode-background-cover](https://github.com/AShujiao/vscode-background-cover)
* [思源dark+主题](https://github.com/Zuoqiu-Yingyi/siyuan-theme-dark-plus)
* [思源导入插件](https://github.com/terwer/siyuan-plugin-importer/tree/main)
* [思源今日日记看板](https://github.com/frostime/siyuan-dailynote-today)
* [切换主题](https://github.com/frostime/sy-theme-change/tree/main)

感谢 `思源爱好者折腾群`中各类大佬耐心解答我关于此插件开发中遇到的各种问题
