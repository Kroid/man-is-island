var gulp   = require('gulp')
  // scripts
  , concat = require('gulp-concat')
  , uglify = require('gulp-uglify')

  // styles
  , sass         = require('gulp-sass')
  , autoprefixer = require('gulp-autoprefixer')
  , sourcemaps   = require('gulp-sourcemaps')
  , minifyCss    = require('gulp-minify-css')

  // templates
  , jade    = require('gulp-jade')
  , templateCache = require('gulp-angular-templatecache')

  // serve
  , connect    = require('gulp-connect')
  , httpProxy  = require('http-proxy')
  , modRewrite = require('connect-modrewrite')

  // other
  , rev     = require('gulp-rev')
  , inject  = require('gulp-inject')
  , del     = require('del')
  , series  = require('stream-series')
  , replace = require('gulp-replace')
  , runSequence = require('run-sequence')


gulp.task('production', ['production:clean'], function(cb) {
  runSequence(
    [
      'production:styles',
      'production:scripts',
      'production:views'
    ],
    'production:layout',
    cb
  )
})

gulp.task('production:clean', function(cb) {
  del(['.dist'], cb)
})

gulp.task('production:layout', function() {
  var styles  = gulp.src('.dist/app-*.css', {read:false})
    , vendor  = gulp.src('.dist/vendor-*.js', {read:false})
    , scripts = gulp.src('.dist/app-*.js', {read:false})
    , views   = gulp.src('.dist/templates-*.js', {read:false})

  var counter = '<script type="text/javascript">(function (d, w, c) { (w[c] = w[c] || []).push(function() { try { w.yaCounter30739328 = new Ya.Metrika({id:30739328, webvisor:true, clickmap:true, trackLinks:true, accurateTrackBounce:true, trackHash:true}); } catch(e) { } }); var n = d.getElementsByTagName("script")[0], s = d.createElement("script"), f = function () { n.parentNode.insertBefore(s, n); }; s.type = "text/javascript"; s.async = true; s.src = (d.location.protocol == "https:" ? "https:" : "http:") + "//mc.yandex.ru/metrika/watch.js"; if (w.opera == "[object Opera]") { d.addEventListener("DOMContentLoaded", f, false); } else { f(); } })(document, window, "yandex_metrika_callbacks");</script><noscript><div><img src="//mc.yandex.ru/watch/30739328" style="position:absolute; left:-9999px;" alt="" /></div></noscript>'

  return gulp.src('app/index.jade')
  .pipe(inject(series(vendor, scripts, views), {ignorePath: '.dist'}))
  .pipe(inject(styles, {ignorePath: '.dist'}))
  .pipe(replace('//- Yandex.Metrika counter', counter))
  .pipe(jade())
  .pipe(gulp.dest('.dist'))
})

gulp.task('production:styles', function() {
  return gulp.src('app/app.scss')
  .pipe(sourcemaps.init())
  .pipe(sass())
  .pipe(autoprefixer('last 1 version'))
  .pipe(minifyCss())
  .pipe(sourcemaps.write())
  .pipe(rev())
  .pipe(gulp.dest('.dist'))
})

gulp.task('production:scripts', function(cb) {
  runSequence([
      'production:scripts:vendor',
      'production:scripts:app'
    ],
    cb
  )
})

gulp.task('production:scripts:vendor', function() {
  return gulp.src(['app/vendor/angular.js', 'app/vendor/*.js'])
  .pipe(concat('vendor.js'))
  .pipe(uglify())
  .pipe(rev())
  .pipe(gulp.dest('.dist'))
})

gulp.task('production:scripts:app', function() {
  return gulp.src(['app/**/*.js', '!app/vendor/**/**', '!app/styles/**/*', '!app/counter.js'])
  .pipe(concat('app.js'))
  .pipe(uglify())
  .pipe(rev())
  .pipe(gulp.dest('.dist'))
})

gulp.task('production:views', ['develop:views'], function() {
  return gulp.src(['.tmp/**/*.html', '!.tmp/index.html'])
    .pipe(templateCache({module: 'app', root: '/'}))
    .pipe(rev())
    .pipe(gulp.dest('.dist'))
})

gulp.task('production:serve', function() {
  var host = process.env.host || 'localhost'
    , port = process.env.port || '3000'
    , ssl  = process.env.ssl  || false
    , url  = (ssl ? 'https://' : 'http://') + host + ':' + port

  var proxy = httpProxy.createProxyServer({ target: url })

  proxy.on('error', function(err, req, res) {
    res.end();
  })

  connect.server({
    root: ['.dist'],
    port: 3001,
    livereload: false,
    middleware: function(connect, opt) {
      return [
        // redirect api requests
        function(req, res, next) {
          if (req.url.indexOf('/api/') === 0) {
            req.headers.host = host;
            proxy.web(req, res);
          } else {
            next();
          }
        },

        // render index page on any requests (without api & files)
        modRewrite([ '!\\.\\w+$ /index.html [L]' ])
      ]
    }
  })
})
