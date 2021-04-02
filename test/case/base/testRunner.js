const extOs = require('yyl-os')
const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const util = require('yyl-util')
const extFs = require('yyl-fs')
const { initYylBaseConfig } = require('../../../')
const yylConfig = require('./yyl.config')

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
    webpack(
      initYylBaseConfig({
        context: targetPath,
        env: {},
        alias: {
          '~': path.join(targetPath, './src'),
          '~@': path.join(targetPath, './src/components/')
        },
        yylConfig
      }),
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
  })
}

init()
