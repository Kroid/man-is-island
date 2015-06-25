var gulp = require('gulp')
var runSequence = require('run-sequence')


var print = require('gulp-print')

gulp.task('default', ['develop:clean'], function() {
  runSequence(
    ['develop:styles','develop:views'],
    'develop:layout',
    'develop:watch',
    'develop:serve'
  )
})