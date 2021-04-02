const extOs = require('yyl-os')
const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const util = require('yyl-util')
const extFs = require('yyl-fs')
const initBaseConfig = require('../../../')
const { initMiddleWare } = require('../../../')
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
    console.log('targetPath', targetPath)
    const compiler = webpack(
      {
        ...initBaseConfig({
          context: targetPath,
          env: {},
          alias: {
            '~': path.join(targetPath, './src'),
            '~@': path.join(targetPath, './src/components/')
          },
          yylConfig
        }),
        watch: true
      },
      (err, stats) => {
        if (err) {
          throw err
        }

        const info = stats.toJson()

        if (info.errors.length) {
          console.log(info.errors[0].message)
        } else {
          console.log('done')
        }
        done()
      }
    )
    const app = start()
    app.listen(5000)
    initMiddleWare({
      app,
      compiler,
      env: {},
      yylConfig,
      logger(...args) {
        console.log(...args)
      }
    })
  })
}

init()
