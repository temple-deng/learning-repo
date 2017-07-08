# PostCSS

## PostCSS 的特征

PostCSS 是一个使用 JS 插件来转换样式的工具。这些插件可以检查 CSS 的语法，支持变量及混合，
编译未来的 CSS 语法，内联图片等等。   

PostCSS 是一个 Node.js 模块，将 CSS 解析未一个抽象语法树(AST)；这个抽象语法树可以传递
给任意数量的插件函数；之后将这个抽象语法树转换回字符串，这时我们可以将其保存的一个文件中。   

写这份文档的时候，gulp-postcss 是 7.0.0，postcss 是6.0.0。   

### 增加代码可读性

使用 Can I Use 上的数据为 CSS 规则添加前缀。<a href="https://github.com/postcss/autoprefixer">Autoprefixer</a>
会基于当前浏览器的流行度及对CSS 的支持来自动添加前缀。   

```CSS
/* CSS Input */
:fullscreen {
}
```

```CSS
/* CSS Output */
:-webkit-:full-screen {
}
:-moz-:full-screen {
}
:full-screen {
}
```   

### 现在就可以使用将来的 CSS 语法  

使用 <a href="http://cssnext.io/">cssnext</a> 就可以直接使用最新的 CSS 语法。    

```CSS
/* CSS Input */
:root {
  --red: #d33;
}
a {
  &:hover {
    color: color(var(--red) a(54%));
  }
}
```   

```CSS  
/* CSS Output */
a:hover {
  color: #dd3333;
  color: rgba(221, 51, 51, 0.54);
}
```    

### CSS 模块：全局 CSS 的末日

<a href="https://github.com/css-modules/css-modules">CSS Modules</a> 意味着我们不用再
担心名字被污染了。   

```CSS
/* CSS Input */
.name {
  color: gray;
}
```   

```CSS
/* CSS Output */
.Logo__name__SVK0g {
  color: gray;
}
```    

### 减少 CSS 中的错误

使用 <a href="https://stylelint.io/">stylelint</a> 来强制符合一致的规范及减少样式文件中
的错误。这个工具支持最新的 CSS 语法，也支持类 CSS 语法，例如 SCSS。   

### 强大的网格系统

<a href="https://github.com/peterramsing/lost">LostGrid</a>使用 `calc()`
来创建基于您定义的分数的令人惊叹的网格，而不必传递大量选项。    

```CSS
/* CSS Input */
div {
  lost-column: 1/3
}
```   

```CSS
/* CSS Output */
div {
  width: calc(99.9% * 1/3 -  
  (30px - 30px * 1/3));
}
div:nth-child(1n) {
  float: left;
  margin-right: 30px;
  clear: none;
}
div:last-child {
  margin-right: 0;
}
div:nth-child(3n) {
  margin-right: 0;
  float: right;
}
div:nth-child(3n + 1) {
  clear: both;
}
```   

## 用法

在使用 PostCSS 时可以分为两步：  

1. 为我们使用的构建工具寻找并添加 PostCSS 扩展
2. 选择我们使用的插件并将其添加到 PostCSS 处理流程中   

### Webpack  

在 `webpack.config.js` 中使用 `postcss-loader`:   

```javascript
module.exports = {
    module: {
        rules: [
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                        }
                    },
                    {
                        loader: 'postcss-loader'
                    }
                ]
            }
        ]
    }
}
```   

然后创建 `postcs.config.js` 文件：   

```javascript
module.exports = {
    plugins: [
        require('precss'),
        require('autoprefixer')
    ]
}
```    

### Gulp

使用 `gulp-postcss` 和 `gulp-sourcemaps`:   

```javascript
gulp.task('css', function () {
    var postcss    = require('gulp-postcss');
    var sourcemaps = require('gulp-sourcemaps');
    var autoprefixer = require('autoprefixer');

    return gulp.src('src/**/*.css')
        .pipe( sourcemaps.init() )
      //  .pipe( postcss([ require('precss'), require('autoprefixer') ]) ) 注意这是文档的写法，但是好像有问题
        .pipe(postcss([ autoprefixer() ]))   // 这应该才是正确的写法
        .pipe( sourcemaps.write('.') )
        .pipe( gulp.dest('build/') );
});
```    

### npm run / CLI  

如果想在命令行中或者 npm scripts 中使用 PostCSS，使用 `postcss-cli`:   

`postcss --use autoprefixer -c options.json -o main.css css/*.css`   

### Options

大部分的 PostCSS 运行器都接受两个参数：   

+ 一个插件的数组
+ 一个选项的对象   

通用选项：    

+ `syntax`: 一个提供语法解析器和序列化器的对象
+ `parser`: 一个特殊的语法解析器，例如 SCSS
+ `stringifier`: 一个特殊的语法输出生成器
+ `map`: source map 选项
+ `from`: 输入文件的名字
+ `to`: 输出文件的名字    

## 注意点

貌似很多 PostCSS 的插件本身就有专用的 gulp 或者 grunt 构建版本，所以有时候可以直接
使用那个版本。而且貌似是这样的规则，如果是 PostCSS 插件的话通常直接安装插件名，然后通过 PostCSS
执行器的插件数组传入，或者在 PostCSS 的 JS API 中使用。但是如果是专用的构建工具版本，例如
`gulp-autoprefixer`, `gulp-stylelint`，那么就是可以和 PostCSS 分离使用的。   

## postcss-load-config

貌似 gulp-postcss 是用这个包来查找配置文件的。      

### package.json

在 `package.json`  中创建 postcss 字段。   

```json
{
  "postcss": {
    "parser": "sugarss",
    "map": false,
    "from": "/path/to/src.sss",
    "to": "/path/to/dest.css",
    "plugins": {
      "postcss-plugin": {}
    }
  }
}
```    

### .postcssrc

创建一个 JSPN 或者 YAML 格式的 `.postcssrc` 文件。   

可以附加文件扩展名（例如`.postcssrc.json` or `.postcssrc.yaml`）。    

### postcss.congfig.js or .postcssrc.js  

可以导出一个配置对象：   

```javascript
module.exports = {
  parser: 'sugarss',
  map: false,
  from: '/path/to/src.sss',
  to: '/path/to/dest.css',
  plugins: {
    'postcss-plugin': {}
  }
}
```   

或者导出一个 `{Function}`，这个函数返回配置对象：   

```javascript
module.exports = (ctx) => ({
  parser: ctx.parser ? 'sugarss' : false,
  map: ctx.env === 'development' ? ctx.map : false,
  from: ctx.from,
  to: ctx.to,
  plugins: {
    'postcss-plugin': ctx.plugin
  }
})
```    
