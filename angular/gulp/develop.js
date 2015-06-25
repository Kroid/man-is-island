var gulp    = require('gulp')
  , connect = require('gulp-connect')
  , inject  = require('gulp-inject')
  , jade    = require('gulp-jade')
  , plumber = require('gulp-plumber')
  , sass    = require('gulp-sass')
  , autoprefixer = require('gulp-autoprefixer')
  , sourcemaps   = require('gulp-sourcemaps')

var del = require('del')
  , series = require('stream-series')
  , httpProxy  = require('http-proxy')
  , modRewrite = require('connect-modrewrite')


gulp.task('develop:clean', function(cb) {
  del(['.tmp'], cb)
})

gulp.task('develop:layout', function() {
  var angular = gulp.src('app/vendor/angular.js', {read: false})
  var vendor  = gulp.src(['app/vendor/*.js', '!app/vendor/angular.js'], {read: false})
  var scripts = gulp.src(['app/**/*.js', '!app/vendor/**/**', '!app/styles/**/*', '!app/counter.js'], {read: false})
  var style   = gulp.src('.tmp/app.css', {read: false})

  return gulp.src('app/index.jade')
  .pipe(inject(series(angular, vendor, scripts), {ignorePath: 'app'}))
  .pipe(inject(style, {ignorePath: '.tmp'}))
  .pipe(jade({pretty: true}))
  .pipe(gulp.dest('.tmp'))
})

gulp.task('develop:views', function() {
  return gulp.src(['app/**/*.jade', '!app/index.jade'])
  .pipe(jade({pretty: true}))
  .pipe(gulp.dest('.tmp'))
})

gulp.task('develop:styles', function() {
  return gulp.src('app/app.scss')
  .pipe(plumber())
  .pipe(sourcemaps.init())
  .pipe(sass())
  .pipe(autoprefixer('last 1 version'))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('.tmp'))
  .pipe(connect.reload())
})

gulp.task('develop:serve', function() {
  var host = process.env.host || 'localhost'
    , port = process.env.port || '3000'
    , ssl  = process.env.ssl  || false
    , url  = (ssl ? 'https://' : 'http://') + host + ':' + port

  var proxy = httpProxy.createProxyServer({ target: url })

  proxy.on('error', function(err, req, res) {
    res.end();
  })

  connect.server({
    root: ['app', '.tmp'],
    port: 3001,
    livereload: true,
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

gulp.task('develop:watch', function() {
  gulp.watch(['app/index.jade'], ['develop:layout'])
  gulp.watch(['app/app.scss'], ['develop:styles'])
  gulp.watch(['app/**/*.jade', '!app/index.jade'], ['develop:views'])
  gulp.watch(['app/**/*.js'], ['develop:layout'])
})