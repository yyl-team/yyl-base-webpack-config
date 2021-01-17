const YylTsConfigWebpackPlugin = require('../../../')

// const d = new YylTsConfigWebpackPlugin({
//   context: __dirname
// })

module.exports = (env) => {
  return {
    plugins: [
      new YylTsConfigWebpackPlugin({
        context: __dirname
      })
    ]
  }
}
