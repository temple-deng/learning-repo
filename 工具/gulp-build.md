# gulp 构建

目录：   

1. [gulp](#gulp)
2. [gulp-sass](#gulp-sass)
3. [gulp-autoprefixer](#gulp-autoprefixer)
4. [gulp-clean-css](#gulp-clean-css)
5. [gulp-rename](#gulp-rename)
6. [gulp-rev](#gulp-rev)
7. [browser-sync](#bs)

<a name="gulp"></a>
## gulp(3.9.1)

先装 gulp:   

```shell
npm install -g gulp
npm install -D gulp
```   
<a name="gulp-sass"></a>

## gulp-sass(3.1.0)

`npm install -D gulp-sass`  

### 基本用法

```javascript
'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('sass', function () {
  return gulp.src('./sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./css'));
});

gulp.task('sass:watch', function () {
  gulp.watch('./sass/**/*.scss', ['sass']);
});
```  

### Options

options 只是简单的传给 node-sass。除了 gulp-sass 内部使用的 data。`file` 选项不支持。   

### Source Maps

gulp-sass 使用 gulp-sourcemaps 生成 source map。   

```javascript
var sourcemaps = require('gulp-sourcemaps');

gulp.task('sass', function () {
 return gulp.src('./sass/**/*.scss')
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('./css'));
});
```   

默认情况下，gulp-sourcemaps 将 source map 内联进编译的CSS文件中，如果想要将其分离到单独的
文件，在 `sourcemaps.write()` 中指定一个相对于 `gulp.dest()` 的路径：   

```javascript
var sourcemaps = require('gulp-sourcemaps');
gulp.task('sass', function () {
 return gulp.src('./sass/**/*.scss')
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(sourcemaps.write('./maps'))
  .pipe(gulp.dest('./css'));
});
```   

### node-sass option

这里选了几个主要的参数:   

+ `outputStyle` - `nested`, `expanded`, `compact`, `compressed`  

<a name="gulp-autoprefixer"></a>

## gulp-autoprefixer

`npm install -D gulp-autoprefixer`  

### 用法

```javascript
const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');

gulp.task('default', () =>
    gulp.src('src/app.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('dist'))
);
```    

注意也可以通过 gulp-postcss 使用，这样就不详细说了。  

<a name="gulp-clean-css"></a>

## gulp-clean-css(3.4.2)

`npm install -D gulp-clean-css`

### API  

#### cleanCSS([options], [callback])

```javascript
var gulp = require('gulp');
var cleanCSS = require('gulp-clean-css');

gulp.task('minify-css', function() {
  return gulp.src('styles/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('dist'));
});
```    

<a name="gulp-rename"></a>

## gulp-rename(1.2.2)

### 用法

```javascript
var rename = require("gulp-rename");

// rename via string
gulp.src("./src/main/text/hello.txt")
  .pipe(rename("main/text/ciao/goodbye.md"))
  .pipe(gulp.dest("./dist")); // ./dist/main/text/ciao/goodbye.md

// rename via function
gulp.src("./src/**/hello.txt")
  .pipe(rename(function (path) {
    path.dirname += "/ciao";
    path.basename += "-goodbye";
    path.extname = ".md"
  }))
  .pipe(gulp.dest("./dist")); // ./dist/main/text/ciao/hello-goodbye.md

// rename via hash
gulp.src("./src/main/text/hello.txt", { base: process.cwd() })
  .pipe(rename({
    dirname: "main/text/ciao",
    basename: "aloha",
    prefix: "bonjour-",
    suffix: "-hola",
    extname: ".md"
  }))
  .pipe(gulp.dest("./dist"));
  // ./dist/main/text/ciao/bonjour-aloha-hola.md
```   

注意这个可能也会修改 sourcr map 文件的名字。下面的 rev 也是。       

<a name="gule=rev"></a>

## gulp-rev   

在文件名后缀文件内容的hash。    

### 用法

```javascript
var gulp = require('gulp');
var rev = require('gulp-rev');

gulp.task('default', function () {
    return gulp.src('src/*.css')
        .pipe(rev())
        .pipe(gulp.dest('dist'));
});
```   

### API

#### rev()

#### rev.manifest([path], [options])

貌似这个函数是生成一个 JSON 文件，包含原来的名字及加了 hash 名字的对应。  

**path**: Type: `String` Default: `rev=manifest.json`   

manifest 文件的路径。   

**options**   

**options.base**:   Type: `String` Default: `process.cwd()`   

覆盖 manifest 文件的 `base` 部分。   

**options.cwd**: Type: `String` Default: `process.cwd()`  

覆盖 manifest 文件的 `cwd`。   

**options.merge** Type: `Boolean` Default: false   

与已存在的 manifest 文件合并。   

**options.transformer** Type: `Object` Default: `JSON`    

应该是用来生成 manifest 文件的东西。   

#### Original path  

文件的原始路径是存储在 `file.revOrigPath`。   

#### Asset hash  

每个文件的 hash 是存储在 `file.revHash`。  

```javascript
var gulp = require('gulp');
var rev = require('gulp-rev');

gulp.task('default', function () {
    // by default, gulp would pick `assets/css` as the base,
    // so we need to set it explicitly:
    return gulp.src(['assets/css/*.css', 'assets/js/*.js'], {base: 'assets'})
        .pipe(gulp.dest('build/assets'))  // copy original assets to build dir
        .pipe(rev())
        .pipe(gulp.dest('build/assets'))  // write rev'd assets to build dir
        .pipe(rev.manifest())
        .pipe(gulp.dest('build/assets')); // write manifest to build dir
});
```   

<a name="bs"></a>

## browser-sync

这里主要说一下sass+css 注入的问题：   

```javascript
var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var sass        = require('gulp-sass');

// Static Server + watching scss/html files
gulp.task('serve', ['sass'], function() {

    browserSync.init({
        server: "./app"
    });

    gulp.watch("app/scss/*.scss", ['sass']);
    gulp.watch("app/*.html").on('change', browserSync.reload);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
    return gulp.src("app/scss/*.scss")
        .pipe(sass())
        .pipe(gulp.dest("app/css"))
        .pipe(browserSync.stream());
});

gulp.task('default', ['serve']);
```    
