const path = require('path')
const merge = require('webpack-merge').default
var vConsolePlugin = require('vconsole-webpack-plugin')
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
        open: true
      }
    }),
    {
      plugins: [
        new vConsolePlugin({
          filter: [],  // 需要过滤的入口文件
          enable: true // 发布代码前记得改回 false
        })
      ]
    }
  )
}
