var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');
var gulp = require('gulp');
var gutil = require('gulp-util');

gulp.task('typeScript', function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist"));
});

gulp.task('movePug', function() {
  return gulp.src(['./views/**/*.pug'], { base: './' })
  .pipe(gulp.dest('dist'));
});

gulp.task('default', ['typeScript','movePug'], function() {

});