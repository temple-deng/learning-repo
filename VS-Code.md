# User Interface

<!-- TOC -->

- [User Interface](#user-interface)
  - [Side by Side Editing](#side-by-side-editing)
  - [配置编辑器](#配置编辑器)
  - [Window Management](#window-management)
- [User Guide](#user-guide)
  - [Basic Editing](#basic-editing)
  - [格式化](#格式化)

<!-- /TOC -->

## Side by Side Editing

最多可以有3个编辑器并排放。有多种方式可以在已打开编辑器的旁边打开额外的编辑器：  

+ 在 Explorer 里按住 `Ctrl` 点击文件
+ `Ctrl + \` 将当前活动的编辑器分成两个
+ 在 Explorer 里选中文件然后右键菜单中选择 打开到侧边。
+ 点击编辑器右上角的拆分编辑器
+ 把文件拖到编辑器的另一边
+ 在快速打开（`Ctrl + P`）文件列表中 `Ctrl + Enter`    

如果我们打开了多个编辑器，可以通过 `Ctrl + 1,2,3` 来实现切换。    

## 配置编辑器

通过 **查看** -> **切换菜单栏** 隐藏菜单栏。隐藏后可以通过 `Alt` 继续访问。通过 `window.menuBarVisibility ` 配置。   

可以通过用户配置来全局性的设置配置，或者通过工作区配置来针对每个项目 / 文件夹配置。配置的值是保存在一个 `setting.json` 文件中。   

+ 选择 **文件** -> **首选项** -> **设置** 来编辑用户的 `setting.json` 文件。（或者调出面板，输入 `user` 敲击回车，不过得注意选择）
+ 如果要编辑工作区配置，选择**文件** -> **首选项** -> **设置**然后选择工作区配置栏（或者在面板里输入 `worksp`）来编辑工作区的 `setting.json` 文件。   

配置栏左边都是编辑器的默认配置。还可以点击左边某个配置左边的编辑按钮然后选择复制到右边。工作区的配置会覆盖用户配置。    

## Window Management

`window.openFolderInNewWindow` 及 `window.openFileInNewWindow` 配置打开文件及文件夹在新的窗口还是当前活动的窗口。可选值是 `default`,`on`,`off`。    


# User Guide

## Basic Editing

`Shift + Alt + Left` and `Shift + Alt + Right` 快速收缩或者扩展当前选择区域。   

按住 `Shift` 和 `Alt` 拖动列的选择。   

`Ctrl + Shift + F` 跨文件搜索。支持正则表达式。`Ctrl + Shift + J` 添加匹配的高级选项。在高级匹配的那个输入框中支持 glob 模式语法：   

+ `*` 匹配一个路径片段中的一个或多个字符
+ `?` 匹配一个路径片段中的一个字符
+ `**` 匹配任意数量的路径片段
+ `{}` 条件组合，例如 `{**/*.html, **/*.txt} 匹配所有的 HTML 和 text 文件。
+ `[]` 声明匹配字符的范围。    

还可以在 Explorer 中右键一个文件夹选择只在文件夹中搜索。    

## 格式化

支持两种明确的格式化操作：  

+ 文档格式化 `Shift + Alt + F` - 格式化整个文件
+ 选择部分格式化 `Ctrl + K Ctrl +F` 格式化选择的文本    




