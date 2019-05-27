const { series, parallel, src, dest, pipe} = require('gulp');
const minify = require('gulp-minify');
const minifyCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const del = require('del');

function cleanJs(cb) {
  return del(['ooyala_player/public/build/*.js']);
  cb();
}

function cleanCSS(cb){
  return del(['ooyala_player/public/build/*.css']);
  cb();
}

const compressJS = series(cleanJs, function minifyJS(cb) {
  src([
    'ooyala_player/public/js/vendor/ooyala/core.js',
    'ooyala_player/public/js/vendor/ooyala/main_html5.js',
    'ooyala_player/public/js/vendor/popcorn.js',
    'ooyala_player/public/skin/html5-skin.js',
    'ooyala_player/public/js/vendor/ooyala/bit_wrapper.js',
    'ooyala_player/public/js/ooyala_player.js'  
  ])
  .pipe(concat('player_all.js'))
  .pipe(minify({
      ext: {
          min:'.min.js'
      },
      noSource: true
  }))
  .pipe(dest('ooyala_player/public/build'));
  cb();
});

const compressCSS = series(cleanCSS, function minifyCss(cb) {
  src([
      'ooyala_player/public/skin/html5-skin.css',
      'ooyala_player/public/css/ooyala_player.css'
  ])
  .pipe(concat('player_all.min.css'))
  .pipe(minifyCSS())
  .pipe(dest('ooyala_player/public/build'));
  cb();
});


exports.default = parallel(compressJS, compressCSS);
