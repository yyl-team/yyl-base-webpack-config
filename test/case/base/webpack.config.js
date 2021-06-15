const path = require('path')
const merge = require('webpack-merge').default
var vConsolePlugin = require('vconsole-webpack-plugin')
const { initYylBaseConfig } = require('../../../')

module.exports = (env) => {
  return merge(
    initYylBaseConfig({
      context: __dirname,
      env,
      alias: {
        '~': path.join(__dirname, './src'),
        '~@': path.join(__dirname, './src/components/')
      },
      yylConfig: {
        localserver: {
          proxies: ['https://9u9ntpb8xp.api.quickmocker.com/']
        },
        concat: {
          'dist/js/shim.js': [
            'src/js/lib/shim/es5-sham.min.js',
            'src/js/lib/shim/es5-shim.min.js',
            'src/js/lib/shim/es6-sham.min.js',
            'src/js/lib/shim/es6-shim.min.js',
            'src/js/lib/shim/json3.min.js'
          ]
        },
        commit: {
          hostname: '/',
          mainHost: 'http://www.testhost.com'
        }
      },
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
