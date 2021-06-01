const extOs = require('yyl-os')
const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const util = require('yyl-util')
const extFs = require('yyl-fs')
const { initYylBaseConfig } = require('../../../')
const yylConfig = require('./yyl.config')
const WebpackDevServer = require('webpack-dev-server')

async function init() {
  const targetPath = __dirname
  const distPath = path.join(targetPath, 'dist')

  await extFs.removeFiles(distPath)
  await extFs.mkdirSync(distPath)

  if (!fs.existsSync(path.join(targetPath, 'node_modules'))) {
    await extOs.runSpawn('yarn install', targetPath)
  }

  // process.chdir(targetPath)
  // await extOs.runSpawn('npm run o', targetPath)
  await util.makeAwait((done) => {
    const compiler = webpack(
      initYylBaseConfig({
        context: targetPath,
        env: {},
        alias: {
          '~': path.join(targetPath, './src'),
          '~@': path.join(targetPath, './src/components/')
        },
        yylConfig
      })
    )

    const devServer = new WebpackDevServer(compiler, {
      port: 5000,
      contentBase: path.join(__dirname, 'dist')
    })
    devServer.listen(5000)
  })
}

init()
