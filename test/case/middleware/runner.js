const extOs = require('yyl-os')
const path = require('path')
const fs = require('fs')
const webpack = require('../../../node_modules/webpack')
const util = require('yyl-util')
const extFs = require('yyl-fs')
const { initMiddleWare, initYylBaseConfig } = require('../../../')
const yylConfig = require('./yyl.config')
const { start } = require('./app')

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
      {
        ...initYylBaseConfig({
          context: targetPath,
          env: {
            hmr: true
          },
          alias: {
            '~': path.join(targetPath, './src'),
            '~@': path.join(targetPath, './src/components/')
          },
          devServer: false,
          yylConfig
        }),
        watch: true
      }
    )
    compiler.watch({}, () => undefined)
    const app = start()
    app.listen(5000)
    initMiddleWare({
      app,
      compiler,
      env: {
        hmr: true
      },
      yylConfig,
      logger(...args) {
        console.log(...args)
      }
    })
  })
}

init()
