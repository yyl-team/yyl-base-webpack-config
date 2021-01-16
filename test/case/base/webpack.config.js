const YylTsConfigWebpackPlugin = require('../../../')

// const d = new YylTsConfigWebpackPlugin({
//   context: __dirname
// })

module.exports = env => {
  console.log('111')
  return {
    plugins: [
      new YylTsConfigWebpackPlugin({
        context: __dirname
      })
    ]
  }
}
