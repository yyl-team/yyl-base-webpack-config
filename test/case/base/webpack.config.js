const merge = require('webpack-merge').default
const initBaseConfig = require('../../../')

module.exports = (env) => {
  return merge(
    initBaseConfig({
      context: __dirname,
      env
    })
  )
}
