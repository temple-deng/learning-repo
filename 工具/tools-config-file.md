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
