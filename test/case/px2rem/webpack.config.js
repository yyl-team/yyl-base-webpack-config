const path = require('path')
const merge = require('webpack-merge').default
const { initYylBaseConfig } = require('../../../')
const yylConfig = require('./yyl.config')

module.exports = (env) => {
  return merge(
    initYylBaseConfig({
      context: __dirname,
      env,
      alias: {
        '~': path.join(__dirname, './src'),
        '~@': path.join(__dirname, './src/components/')
      },
      yylConfig,
      devServer: {
        noInfo: false,
        open: true,
        openPage: 'html/index.html'
      }
    })
  )
}
