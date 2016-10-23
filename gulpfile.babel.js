var gulp = require('gulp');
var requireTree = require('require-tree');

requireTree('./gulp/tasks');
gulp.task('default', ['watch']);
