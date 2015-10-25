var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var jshint = require('gulp-jshint');
// todo: add concatentation

gulp.task('sass', function () {
  gulp.src('public/stylesheets/style.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest('public/stylesheets'));
});

gulp.task('jshint', function(){
	return gulp.src('public/javascripts/*.js')
	.pipe(jshint())
	.pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('watch', function () {
  gulp.watch('public/stylesheets/*.scss', ['sass']);
  gulp.watch('public/javascripts/**/*.js', ['jshint']);
});

gulp.task('default', ['sass', 'watch', 'jshint']);