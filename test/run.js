const extOs = require('yyl-os')
const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const util = require('yyl-util')
const extFs = require('yyl-fs')
const initBaseConfig = require('../')

async function init() {
  const targetPath = path.join(__dirname, './case/base')
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
      initBaseConfig({
        context: targetPath,
        env: {},
        alias: {
          '~': path.join(targetPath, './src'),
          '~@': path.join(targetPath, './src/components/')
        },
        yylConfig: {
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
            hostname: '//web.yystatic.com',
            mainHost: 'http://www.yy.com'
          }
        }
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
