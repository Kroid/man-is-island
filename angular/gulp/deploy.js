var util  = require('util')
var gulp  = require('gulp')
  , zip   = require('gulp-zip')
  , shell = require('gulp-shell')
  , runSequence = require('run-sequence')

gulp.task('deploy', ['develop:clean', 'production:clean'], function(cb) {
  runSequence(
    'production',
    'deploy:create_zip',
    'deploy:upload',
    cb
  )
})

gulp.task('deploy:create_zip', ['production'], function() {
  return gulp.src('.dist/**/*')
  .pipe(zip('dist.zip'))
  .pipe(gulp.dest(''))
})

gulp.task('deploy:upload', function() {
  var archive = 'dist.zip'
    , address = 'user@server.address'
    , path    = '/var/www/man-is-island'

  return gulp.src('dist.zip', {read: false})
    .pipe(shell([
      util.format('ssh %s "rm -rf %s"',                  address, path),
      util.format('ssh %s "mkdir -p %s"',                address, path),
      util.format('scp %s %s:%s',                        archive, address, path),
      util.format('ssh %s "cd %s && unzip %s && rm %s"', address, path, archive, archive)
    ]));
});