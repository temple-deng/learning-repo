# Font Icon

## font + html 和 font + css 的形式

```html
<div class="container">
    <span class="icon-home3"></span>Home3
    <span class="icon-pacman"></span>Pacman
    <span class="icon-clubs"></span>Clubs
    <span class="icon-clock2"></span>Clock2
    <span class="icon-database"></span>Database
    <span class="icon-enlarge"></span>Enlarge

    <div>
        <span class="icon-">&#xe902;</span>Home3
        <span class="icon-">&#xe916;</span>Pacman
        <span class="icon-">&#xe918;</span>Clubs
        <span class="icon-">&#xe94f;</span>Clock2
        <span class="icon-">&#xe964;</span>Database
        <span class="icon-">&#xe989;</span>Enlarge
    </div>
</div>
```   

```css
@font-face {
    font-family: 'icomoon';
    src: url('./icomoon-v1.0/fonts/icomoon.eot');
    src: url('./icomoon-v1.0/fonts/icomoon.eot#iefix') format('embedded-opentype'),
        url('./icomoon-v1.0/fonts/icomoon.ttf') format('truetype'),
        url('./icomoon-v1.0/fonts/icomoon.woff') format('woff'),
        url('./icomoon-v1.0/fonts/icomoon.svg#icomoon') format('svg');
    font-weight: normal;
    font-style: normal;
    font-display: block;
}

[class^="icon-"], [class*=" icon-"] {
    font-family: 'icomoon';
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.icon-home3:before {
    content: "\e902";
  }
  .icon-pacman:before {
    content: "\e916";
  }
  .icon-clubs:before {
    content: "\e918";
  }
  .icon-clock2:before {
    content: "\e94f";
  }
  .icon-database:before {
    content: "\e964";
  }
  .icon-enlarge:before {
    content: "\e989";
  }
```      

对应的实体编码可以在 svg 的字体文件中找到。    

## Gulp

先说点新的 gulp 的用法，应该是 4+ 版本。    

```js
function defaultTask(cb) {
    console.log('yaho');
    cb();
}

module.exports = {
    default: defaultTask
};
```   

`gulp` 执行即可。   

每个 task 都是一个异步函数，这个异步函数或者接受一个以 error 为参数的函数做参数，或者返回一个
stream, promise, event emitter, child process。    

task 可以分为 public 和 private 的。public 是从 gulpfile 文件导出的 task，可以直接由
`gulp` 命令执行。private 是内部使用的，通常作为 `series()` 或 `parallel()` 的一部分。    

```js
const { series } = require('gulp');

function clean(cb) {
  // body omitted
  cb();
}

function build(cb) {
  // body omitted
  cb();
}

exports.build = build;
exports.default = series(clean, build);
```    

gulp 提供了两种组合方案，`series()` 和 `parallel()`，可以将独立的 task 组合成一个大的操作。
顾名思义，`series()` 是用来组合需要按序执行的 tasks，`parallel()` 用来并发执行 tasks。   

当 task 返回 stream, promise, event emitter, child process 时，success 还是 error
会告知 gulp 是否要立刻终止，如果一个 task 报错了，gulp 会立刻停止。     

当 `series()` 中的 task 报错时，组合会立刻停止，后面的 task 也不会再执行。`parallel()` 的
task 报错时，组合会立刻停止，但是其他的并行 task 可能会也可能不会已完成。     

```js
const { src, dest } = require('gulp');
const { EventEmitter } = require('events');

// 返回 stream
function streamTask() {
  return src('*.js')
    .pipe(dest('output'));
}

// 返回 promise
function promiseTask() {
  return Promise.resolve('the value is ignored');
}

// 返回 event emitter
function eventEmitterTask() {
  const emitter = new EventEmitter();
  setTimeout(() => emitter.emit('finish'), 250);
  return emitter;
}
```    

## glup-iconfont

```js
var iconfont = require('gulp-iconfont');
var {src, dest} = require('gulp');
var consolidate = require('gulp-consolidate');

function webfont() {
    return src(['./icons/*.svg'])
        .pipe(iconfont({
            fontName: 'my-font', // required
            prependUnicode: true, // recommended option
            formats: ['ttf', 'eot', 'woff', 'woff2', 'svg']
        }))
        .on('glyphs', function(glyphs, options) {
            console.log(glyphs)
            src('./template.css')
                .pipe(consolidate('lodash', {
                    fontName: 'my-font',
                    fontPath: 'www/fonts/',
                    cacheBusterQueryString: '?a=b',
                    cacheBuster: 'a=b',
                    cssClass: 'my-font',
                    glyphs: glyphs
            }))
            .pipe(dest('template/icons.css'));
        })
        .pipe(dest('www/fonts/'));
}

module.exports = {
    default: webfont
}
```    

css 模板：   

```css
@font-face {
	font-family: "<%= fontName %>";
	src: url('<%= fontPath %><%= fontName %>.eot<%= cacheBusterQueryString %>');
	src: url('<%= fontPath %><%= fontName %>.eot?<%= cacheBuster %>#iefix') format('eot'),
		url('<%= fontPath %><%= fontName %>.woff2<%= cacheBusterQueryString %>') format('woff2'),
		url('<%= fontPath %><%= fontName %>.woff<%= cacheBusterQueryString %>') format('woff'),
		url('<%= fontPath %><%= fontName %>.ttf<%= cacheBusterQueryString %>') format('truetype'),
		url('<%= fontPath %><%= fontName %>.svg<%= cacheBusterQueryString %>#<%= fontName %>') format('svg');
}

.<%= cssClass %>:before {
	font-family: "<%= fontName %>";
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	font-style: normal;
	font-variant: normal;
	font-weight: normal;
	/* speak: none; only necessary if not using the private unicode range (firstGlyph option) */
	text-decoration: none;
	text-transform: none;
}

<% _.each(glyphs, function(glyph) { %>
.<%= cssClass %>-<%= glyph.name %>:before {
	content: "\<%= glyph.unicode[0].charCodeAt(0).toString(16).toUpperCase() %>";
}
<% }); %>
```   