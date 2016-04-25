# gulp
---
	1. browser-sync
	
---
### 1.browser-sync
实时重载的模块。
首先需要通过create方法获取一个browser-sync实例。
```javascript
	let gulp = require('gulp');
	let browserSync = require('browser-sync');
	let bs = browserSync.create();
	
	gulp.task('browserSync', function(){

		//  init方法启动一个静态服务器，server的baseDir选项应该是提供静态资源的目录， files选项时需要监听变动的文件
		bs.init({
			files: ['app/*.html',
					'app/styles/**/*.css',
					'app/scripts/**/*.js'
					],
			server: {
				baseDir: 'app'
			}
		});
	});
	
```

###  2. gulp-ruby-sass
用法:  
**sass(source, options)** 使用gulp-ruby-sass而不是gulp.src来编译sass文件  
```javascript
var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
 
gulp.task('sass', function () {
  return sass('source/file.scss')
    .on('error', sass.logError)
    .pipe(gulp.dest('result'));
});
```
**source**: 字符串或者数组。对应的是一个文件或者glob模式指定的文件。下划线开头的文件会被忽视。不支持目录。  

**options**  
+ **sourcemap**: 布尔值，默认为false.  
+ **tempDir**: 字符串，默认是系统的临时目录，临时文件存放的地方。  
+ **emitCompileError**: 布尔值，默认是fasle,当sass编译出错的时候触发一个gulp错误。  
+ **Sass options**: 任何其他的选项会直接传给sass执行，选项均为驼峰式语法。

返回的流可以触发错误，可以使用sass.logError(err)记录编译错误。

结合browser-sync和gulp-ruby-sass完成css实时注入
```javascript
	var gulp = require('gulp');
	var browserSync = require('browser-sync').create();
	var sass = require('gulp-ruby-sass');
	
	gulp.task('default', function(){
	    console.log("Hello Gulp!");
	});
	
	gulp.task('serve', ['sass'], function(){
	    browserSync.init({
	        files:
	            ['app/*.html', 'app/styles/**/*.css','app/scripts/**/*.js'],
	        server: {
	            baseDir: "./app"
	        }
	    });
	    gulp.watch('app/styles/**/*.scss', ['sass']);
	});
	
	gulp.task('sass', function(){
	    return sass('app/styles/index.scss', {
	        style: 'expanded'
	    }).on('error', sass.logError)
	        .pipe(gulp.dest('app/styles'))
	        .pipe(browserSync.reload({stream:true}));
	});
```  

###  3. gulp-autoprefixer
**用法**  
```javascript
var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
 
gulp.task('default', function () {
	return gulp.src('src/app.css')
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(gulp.dest('dist'));
});
```
**支持的选项**  
+ browsers (array): 项目需要支持的浏览器列表。  
+ cascade (boolean): 默认是true,如果css没有压缩的话，是否使用级联。  
+ add (boolean):是否应该添加前缀。。。默认是true。  
+ remove (boolean): 是否应该移除过期的前缀，默认是true。
+ supports (boolean): 是否为 @supports 参数添加前缀，默认是true。  
+ flexbox (boolean|string): 是否该为flexbox属性添加前缀。默认是true，如果传入 `no-2009`的话只会添加最终的版本和指定了的ie的版本  
+ grid (boolean): 是否为ie的栅格布局添加前缀，默认是true。  


###  4. gulp-util
**用法**  
```javascript
var gutil = require('gulp-util');
 
gutil.log('stuff happened', 'Really it did', gutil.colors.magenta('123'));
gutil.beep();
 
gutil.replaceExtension('file.coffee', '.js'); // file.js 
 
var opt = {
  name: 'todd',
  file: someGulpFile
};
gutil.template('test <%= name %> <%= file.path %>', opt) // test todd /js/hi.js 
```  