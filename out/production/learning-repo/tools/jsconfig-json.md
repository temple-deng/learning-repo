# jsconfig.json

目录中的 jsconfig.json 文件表示这个目录是一个 JS 项目的根目录。jsconfig.json 文件配置了
项目的根目录，以及那些 JS 语言服务所提供的功能的配置项。    

VS Code 对 JS 的支持可以运行在两种环境中：   

- File Scope - 没有 jsconfig.json 文件：在这种模式下，VS Code 打开的 JS 文件都是作为一个
个独立的单元。如果 a.js 没有明确地引用文件 b.js，这两个文件就没有共同的项目上下文。
- Explicit Project - 包含有 jsconfig.json：一个 JS 项目使用 jsconfig.json 文件定义。这个
文件可以选择性地列出属于这个项目的文件，以及排除那些不属于这个项目的文件，以及一些编译器配置项

## 配置选项

- `noLib`: 不包括默认的库文件 lib.d.ts
- `target`: 指定使用哪个默认库 lib.d.ts，值可以是 "es3", "es5", "es6", "es2015", "es2016",
"es2017", "es2018", "es2019", "es2020", "esnext"
- `module`: 指定生成模块代码时使用的模块系统
- `moduleResolution`: 导入的模块如何解析位置，值可以是 "node", "classic"
- `checkJs`: 允许 JS 文件的类型检查
- `experimentalDecorators`
- `allowSyntheticDefaultImports`
- `baseUrl`: 非相对模块名的解析基础目录
- `paths`: 指定要相对于baseUrl选项计算的路径映射