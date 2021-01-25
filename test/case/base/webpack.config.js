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
