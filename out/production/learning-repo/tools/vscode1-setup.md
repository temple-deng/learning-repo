# VSCode Setup and Get Started

# 1. Setup

## 1.1 VSCode 中的网络连接

VSCode 是用 Electron 构建的，因此其网络能力依赖于 Chromium 的网络栈。    

### 1.1.1 Common hostnames

如果我们位于一个网络受限的防火墙后，那么需要为 VS Code 配置以下的域名以便网络功能可以正常使用：   

- `update.code.visualstudio.com`
- `code.visualstudio.com`
- `go.microsoft.com`
- `vscode.blob.core.windows.net`
- `marketplace.visualstudio.com`
- `*.gallerycdn.vsassets.io`
- `rink.hockeyapp.net`
- `vscode.search.windows.net`
- `raw.githubusercontent.com`
- `vsmarketplacebadge.apphb.com`
- `az764295.vo.msecnd.net`    

### 1.1.2 Proxy server support

Chromium 网络使用了系统的网络配置项以便让用户能方便地控制所有应用的网络配置。这些网络配置包括：   

- 代理配置
- SSL/TLS 配置
- 证书回收检查配置
- 证书和私钥的存储

这就意味着我们的代理配置是从系统中自动挑选的。  

# 2. GetStarted

## 2.1 Tips 和 Tricks

### 2.1.1 Basics

**命令板**    

快捷键：`shift + cmd + p`    

**默认的快捷键设置**    

命令板里面的所有命令一般都有一个绑定的快捷键设置，如果我们忘了对应的快捷键，可以使用命令板查看。   

快捷键的引用表：[快捷键](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf)

**快速打开**    

快捷键：`cmd + p`。    

### 2.1.2 状态栏

**错误和警告**    

快捷键：`shift + cmd + m`。  

查看当前项目的错误和警告。   

**切换语言模式**    

快捷键：`cmd + k, m`    

### 2.1.3 定制

VS Code 中我们可以定制以下的东西：    

- 主题
- 快捷键设置
- 调整设置
- 添加 JSON 校验
- 创建代码片段
- 安装扩展     

**切换主题**    

快捷键：`cmd + k, cmd + t`。    

**定制快捷键**    

快捷键：`cmd + k, cmd + s`。    

打开快捷键设置。  

**调整设置**     

快捷键：`cmd + ,`   

打开配置设置。   

**扩展**    

快捷键：`shift + cmd + x`。   

打开扩展。   

### 2.1.3 文件和文件夹

**集成终端**    

快捷键：`ctrl + \``。    

打开终端。    

**切换边栏**   

快捷键：`cmd + b`。    

**zen mode**   

快捷键：`cmd + k, z`    

**侧栏编辑**    

快捷键：`cmd + \`。    

**编辑器之间切换**   

`cmd + 1, cmd + 2, cmd + 3`。   

**关闭当前打开的文件夹**    

`cmd + w`。    

**历史导航**    

查看整个历史：`ctrl + tab`。   

### 2.1.4 Editing hacks

**多光标选择**    

`Alt/Option + Click`。   

如果是上下行的选择：`alt/option + cmd + ↑, alt/option + cmd + ↓`。   

如果是为当前选择的东西在所有文件内的出现添加光标 `shift + cmd + l`。    

如果不希望为所有的出现都选中，使用 `cmd + d`。    

**Column (box) selection**    

`shift + alt/option` 然后用鼠标拖拽。   

**快速滚动**    

按住 `alt/option` 快速滚动。    

**Copy line up / down**    

`shfit + alt/option + ↑/↓`    

**Move line up / down**    

`alt + ↑ / ↓`    

**Shrink / expand selection**    

`shift + ctrl + cmd + ← / →`    

**跳到指定行**    

`ctrl + g`    

**格式化代码**    

选中要格式化的代码 `cmd + k, cmd + f`   

格式件整个文件 `shift + alt/option + f`

**代码展开和折叠**    

`cmd + alt/option + [ / ]`    

**跳到文件开始或结尾**    

`cmd + ↑ / ↓`    

### 2.1.5 IntelliSense

`ctrl + space` 触发建议。    

# 3. 配置

## 3.1 语言特定的配置

执行 `Prefenence: Configure Language Specific Settings` 命令打开语言特定的配置。    

```json
{
  "[typescript]": {
    "editor.formatOnSave": true,
    "editor.formatOnPaste": true
  },
  "[markdown]": {
    "editor.formatOnSave": true,
    "editor.wordWrap": "on",
    "editor.renderWhitespace": "all",
    "editor.acceptSuggestionOnEnter": "off"
  }
}
```    
