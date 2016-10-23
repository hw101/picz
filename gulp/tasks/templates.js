const gulp = require('gulp')
const pug = require('gulp-pug')
const watch = require('gulp-watch')
const through2 = require('through2')

var envConfig;

if(process.env.NODE_ENV === 'staging')
  envConfig = require('../../config/staging.json');
else if(process.env.NODE_ENV === 'production')
  envConfig = require('../../config/production.json');
else
  envConfig = require('../../config/development.json');

gulp.task('watch', () => {
  return watch('./src/**/*.pug', {ignoreInitial: true}, () => {
    gulp.start('build')
  })
})

gulp.task('build', () => {
  gulp.src('./src/**/*.pug')
    .pipe(through2.obj((chunk, enc, cb) => {
      console.log(`Working on ${chunk.history[0]}, gimme a minute`)
      cb(null, chunk)
    }))
    .pipe(pug({
      pretty: true,
      doctype: 'html',
      locals: {
        env: envConfig
      }
    }))
    .pipe(gulp.dest('./src'))
})
