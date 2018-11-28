var gulp = require('gulp');
var minify = require('gulp-minify');
var minifyCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var del = require('del');

gulp.task('clean_js', function() {
  return del(['ooyala_player/public/build/*.js']);
});

gulp.task('clean_css', function() {
  return del(['ooyala_player/public/build/*.css']);
});

gulp.task('compress_js', ['clean_js'], function() {
    gulp.src([
      'ooyala_player/public/js/vendor/ooyala/core.js',
      'ooyala_player/public/js/vendor/ooyala/main_html5.js',
      'ooyala_player/public/js/vendor/popcorn.js',
      'ooyala_player/public/skin/html5-skin.js'
    ])
    .pipe(concat('player_all.js'))
    .pipe(minify({
        ext: {
            min:'.min.js'
        },
        noSource: true
    }))
    .pipe(gulp.dest('ooyala_player/public/build'))
});

gulp.task('compress_css', ['clean_css'], function(){
   gulp.src([
       'ooyala_player/public/skin/html5-skin.css'
   ])
   .pipe(concat('player_all.min.css'))
   .pipe(minifyCSS())
   .pipe(gulp.dest('ooyala_player/public/build'));
});

gulp.task('assets', function () {
  gulp.src(['ooyala_player/public/skin/assets/**/*'])
    .pipe(gulp.dest('ooyala_player/public/build/assets'));
});

gulp.task('default', ['compress_js', 'compress_css', 'assets']);
