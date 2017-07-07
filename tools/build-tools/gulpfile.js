const gulp = require("gulp");
const sass = require("gulp-sass");
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const rev = require('gulp-rev');
const bs = require('browser-sync').create();

gulp.task("sass", function() {

  return gulp.src("./src/sass/*.scss")
    .pipe(sass({outputStyle: "expanded"}))
    .pipe(gulp.dest("./src/css"))
});


gulp.task('cssmin', ['sass'], function() {
  return gulp.src('./src/css/*.css')
    .pipe(sourcemaps.init())
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(rename(function(path) {
      let nameArr = path.basename.split('.');
      let len = nameArr.length;
      nameArr.splice(len, 0, 'min');
      path.basename = nameArr.join('.');
    }))
    // .pipe(rev())
    .pipe(sourcemaps.write("../maps"))
    .pipe(gulp.dest("./dest/css"))
    .pipe(bs.stream());
})

gulp.task("server", function() {
  bs.init({
    server: '.'
  });

  gulp.watch('./src/sass/*.scss', ['cssmin']);
})
