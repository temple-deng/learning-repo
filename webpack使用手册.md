# webpack使用手册

标签（空格分隔）： 未分类

---

### 分离核心代码和第三方库
```
    var webpack = require("webpack");  
    module.exports = {
      entry: {
        app: "./app.js",
        vendor: ["jquery", "underscore", ...],
      },
      output: {
        filename: "bundle.js"
      },
      plugins: [
        new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"vendor", /* filename= */"vendor.bundle.js")
      ]
    };
```

### 内嵌CSS
```
    module: {
        loaders: [
            { test: /\.css$/, loader: "style-loader!css-loader" }
            //也可以写成{ test: /\.css$/, loaders: ["style-loader","css-loader"] }注意是从右到左执行
        ]
    }
```

### 分离CSS文件
```
    npm install extract-text-webpack-plugin --save
    var ExtractTextPlugin = require("extract-text-webpack-plugin");
module.exports = {
    // The standard entry point and output config
    entry: {
        posts: "./posts",
        post: "./post",
        about: "./about"
    },
    output: {
        filename: "[name].js",
        chunkFilename: "[id].js"
    },
    module: {
        loaders: [
            // Extract css files
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader")
            },
            // Optionally extract less files
            // or any other compile-to-css language
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader")
            }
            // You could also use other loaders the same way. I. e. the autoprefixer-loader
        ]
    },
    // Use the plugin to specify the resulting filename (and add needed behavior to the compiler)
    plugins: [
        new ExtractTextPlugin("[name].css")
    ]
}
```


<br>
###  对于非法的模块格式的第三方插件，导入变量的方式
1. imports-loader  这个加载器可以把一些库或模块的变量导入文件
```
	require("imports?$=jquery!./file.js")
	require("imports?xConfig=>{value:123}!./file.js")
	require("imports?this=>window!./file.js") or require("imports?this=>global!./file.js")
```

2.plugin ProvidePlugin
这个插件能让模块变量在每个模块里可用
```
	new webpack.ProvidePlugin({
    $: "jquery",
    jQuery: "jquery",
    "window.jQuery": "jquery"
})
```
  
