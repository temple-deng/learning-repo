# 各种构建工具依赖的配置文件的寻址以及优先级等

## Yeoman generator

运行 generator 时候，Yeoman 会从当前 cwd 开搜索目录树（应该是向上搜索），搜索 `.yo-rc.json` 文件，
如果找到了，Yeoman 就会将这个文件所处的目录当做是项目根目录（根据测验，应该是将先找到的位置视作根目录）。

## Babel  

可以在 `package.json` 中声明配置：   

```json
{
  "name": "my-package",
  "version": "1.0.0",
  "babel": {
    // my babel config here
  }
}
```   

#### env option

使用 `env` 字段来指定运行环境：   

```json
{
  "env": {
    "production": {
      "plugins": ["transform-react-constant-elements"]
    }
  }
}
```   

指定了环境的配置和与未指定环境的配置合并，必要时还会覆盖。   

`env` 的值会从 `process.env.BABEL_ENV` 中获取，如果这个值不可用就使用 `process.env.NODE_ENV`，
如果这个也不可用，默认就是 `"development"`。   

### 寻址方面

首先肯定是当前目录下的 `.babelrc`。之后沿着目录树向上寻找这个文件或者是定义 `"babel:{}"` 字段的 `package.json` 文件。    


## Browserlist

注意这个工具其实 babel-preset-env 及其他的一些库也用。   

所以的这些工具都会在 package.json 文件中寻找配置：    

```json
{
  "browserslist": [
    "> 1%",
    "last 2 versions"
  ]
}
```   

或者使用独立的配置文件 .browserslistrc:   

```
# Browsers that we support

> 1%
Last 2 versions
IE 10 # sorry
```    

准确来说，Browserlist 会从下面的东西中寻找浏览器的查询条件：   

1. 工具的配置。例如 Autoprefixer 的 `browsers` 选项
2. `BROWSERSLIST` 环境变量
3. 当前目录或父级目录的 `browserslist` 配置文件
4. 当前目录或父级目录的 `.browserslistrc` 配置文件
5. 当前目录或父级目录 package.json 文件的 `browserslist` 字段
6. 如果上面的没提供一个有效的列表，就使用默认的 `> 1%, last 2 versions, Firefox ESR`

## ESLint   

配置文件为 `.eslintrc.*` 或者 `package.json` 的 `eslintConfig` 字段。ESLint 会从待检测的代码的目录
开始查找这些文件，直到文件系统的根目录。   

配置文件的格式有: `.eslintrc.js`, `.eslintrc.yaml` or `.eslintrc.yml`, `.eslintrc.json`, `package.json` 的 `eslintConfig` 字段。    

如果当前目录存在多个配置文件，优先级也是上面的顺序。   

注意 ESLint 的配置有级联效果，可能最终的配置是一层一层目录中的配置文件的结合后的级联结果。
不过最近的配置文件的的优先级最高。而且每层目录中也就取一份配置。    

如果想禁止这种默认的级联行为的话，可以在配置中声明 `"root": true`，则 ESLint 发现这个配置
后就不会再向上层目录寻找了。   

### Ignoring Files  

在项目根目录中使用 `.eslintignore` 声明忽略的文件及目录。寻找这个文件的时候从当前工作目录开始，
直到找到一个文件为止，不同于配置文件，这个文件最终只使用先找到的那个。     
