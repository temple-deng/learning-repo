# week38 9.13-9.19

# webpack

## Environment Variables

在使用 webpack 命令行的时候，`--env` 选项可以让我们设置任意多的环境变量，这些设置的环境变量
可以再 webpack.config.js 文件中拿到，例如 ``-env.production`, `--env.NODE_ENV=local`    

```
webpack --env.NODE_ENV=local --env.production --progress
```    

不过要使用这些变量的话，要对配置文件做一些变动，`module.exports` 要返回一个函数：   

```js
const path = require('path');

module.exports = env => {
  // Use env.<YOUR VARIABLE> here:
  console.log('NODE_ENV: ', env.NODE_ENV); // 'local'
  console.log('Production: ', env.production); // true

  return {
    entry: './src/index.js',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
  };
};
```   

## Build Performance

- 仅对所必须的文件应用 loaders
- 每个 loader/plugin 都有一个额外的启动时间
- 下面的步骤可能会增加 resolve 时间
    + 尽量少写 `resolve.modules`, `resolve.extensions`, `resolve.mainFiles`,
    `resolve.descriptionFiles`，这些配置增加文件系统调用的数量
    + 如果没使用符号链接的话讲 `resolve.symlinks` 配置为 `false`
- 使用 `DllPlugin` 插件
- 使用 `cache-loader` 开启持久化缓存

开发模式的性能优化：   

- 避免使用一些 product 模式才需要的工具：
  + `TerserPlugin`
  + `ExtractTextPlugin`
  + `[hash] / [chunkhash]`
  + `AggressiveSplittingPlugin`
  + `AggressiveMergingPlugin`
  + `ModuleConcatenationPlugin`
- 避免额外的优化步骤：   

```js
module.exports = {
  // ...
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  },
};
```     
