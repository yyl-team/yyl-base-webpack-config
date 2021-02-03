const path = require('path')
const merge = require('webpack-merge').default
const initBaseConfig = require('../../../')

module.exports = (env) => {
  return merge(
    initBaseConfig({
      context: __dirname,
      env,
      alias: {
        '~': path.join(__dirname, './src'),
        '~@': path.join(__dirname, './src/components/')
      },
      yylConfig: {
        concat: {
          'dist/js/shim.js': [
            'src/js/lib/shim/es5-sham.min.js',
            'src/js/lib/shim/es5-shim.min.js',
            'src/js/lib/shim/es6-sham.min.js',
            'src/js/lib/shim/es6-shim.min.js',
            'src/js/lib/shim/json3.min.js'
          ]
        }
      }
    }),
    {
      devServer: {
        contentBase: path.join(__dirname, 'dist'),
        disableHostCheck: true,
        port: 5000,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
        }
      }
    }
  )
}
