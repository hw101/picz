var nodeResolve = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');
var globals = require('rollup-plugin-node-globals');
var builtins = require('rollup-plugin-node-builtins');
var json = require('rollup-plugin-json');
var babel = require('rollup-plugin-babel')


// var envConfig = require('./config/env')
// Object.assign(process.env, envConfig);
// var replaceObj = {};
// Object.keys(envConfig).forEach(k => {
//   replaceObj[`process.env.${k}`] = JSON.stringify(envConfig[k])
// })

var rollupConfig = {
  entry: 'src/app/main.dev.ts',
  sourceMap: true,
  format: 'iife',
  dest: 'main.js',
  plugins: [
    builtins(),
    commonjs(),
    globals(),
    babel({
      include: ['src/lib/models/**', 'src/lib/base/**'],
      babelrc: false,
      plugins: [
        'angular2-annotations',
        'transform-decorators-legacy',
        'transform-flow-strip-types',
        'class-name'
      ]
    }),
    nodeResolve({
      module: true,
      jsnext: true,
      main: true,
      browser: true,
      extensions: ['.js']
    }),
    json()
  ]
};

if (process.env.IONIC_ENV == 'prod') {
  rollupConfig.entry = '{{TMP}}/app/main.prod.ts';
  rollupConfig.sourceMap = false;
}

module.exports = rollupConfig;
