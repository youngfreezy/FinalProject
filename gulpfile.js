var gulp = require('gulp');
var mocha = require('gulp-mocha');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var angularProof = require('gulp-ng-annotate');
var autoPrefixCss = require('gulp-autoprefixer');
var gulpif = require('gulp-if');
var cssmin = require('gulp-cssmin');

// todo: add concatentation

var production = process.env.NODE_ENV === 'production';


gulp.task('sass', function () {
  gulp.src('public/stylesheets/style.scss')
    .pipe(plumber())
    .pipe(sass())
    // .pipe(autoPrefixCss())
    .pipe(gulpif(production, cssmin()))
    .pipe(gulp.dest('public/stylesheets'));
});

gulp.task('jshint', function () {
  return gulp.src('public/javascripts/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('compress', function () {
  gulp.src([
    'public/vendor/angular.js',
    'public/vendor/*.js',
    'public/app.js',
    'public/services/*.js',
    'public/controllers/*.js',
    'public/filters/*.js',
    'public/directives/*.js'
  ])
    .pipe(concat('app.min.js'))
    .pipe(angularProof())
    .pipe(gulpif(production, uglify()))
    .pipe(gulp.dest('public'));
});

gulp.task('test', function() {
  return gulp.src('Server/test/test.js', {read: false})
  .pipe(mocha({reporter: 'spec'}));
});

gulp.task('watch', function () {
  gulp.watch('public/stylesheets/*.scss', ['sass']);
  gulp.watch([
    'public/controllers/*.js',
    'public/services/*.js',
    'public/app.js'
  ], ['jshint', 'compress']);
});
//todo: add test back.
gulp.task('default', ['sass', 'watch', 'jshint', 'compress']);
gulp.task('build', ['sass', 'compress']);