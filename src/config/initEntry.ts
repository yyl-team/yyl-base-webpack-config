import { WebpackOptionsNormalized } from 'webpack'
import path from 'path'
import extFs from 'yyl-fs'
import fs from 'fs'
import { InitBaseOption } from '../types'
import HtmlWebpackPlugin, { Options as HtmlWebpackPluginOption } from 'html-webpack-plugin'

const OUTPUT_HTML_REG = /(\.jade|\.pug|\.html)$/
const ENTRY_ERG = /\.(js|tsx?)$/

function ignoreExtName(iPath: string) {
  return iPath.replace(/(\.jade|.pug|\.html|\.js|\.css|\.ts|\.tsx|\.jsx)$/, '')
}

/** 初始化入口和输出html-返回结果 */
export type InitEntryResult = Pick<WebpackOptionsNormalized, 'entry' | 'plugins'>
export interface OutputMap {
  [key: string]: string
}

/** 初始化入口和输出html */
export function initEntry(option: InitBaseOption) {
  const { env, alias, resolveRoot } = option
  const wConfig: InitEntryResult = {
    entry: (() => {
      const { srcRoot } = alias
      const r: WebpackOptionsNormalized['entry'] = {}

      const entryPath = path.join(srcRoot, 'entry')
      if (fs.existsSync(entryPath)) {
        const fileList = extFs.readFilesSync(entryPath, ENTRY_ERG)
        fileList.forEach((filePath) => {
          const key = ignoreExtName(path.basename(filePath))
          if (key) {
            r[key] = {
              import: [filePath]
            }
            if (env.useHotPlugin) {
              // TODO:
            }
          }
        })
      }
      return r
    })(),
    plugins: []
  }

  wConfig.plugins = wConfig.plugins.concat(
    (() => {
      const { srcRoot } = alias
      const bootPath = path.join(srcRoot, 'boot')
      const entryPath = path.join(srcRoot, 'entry')
      let outputPath: string[] = []

      if (fs.existsSync(bootPath)) {
        outputPath = outputPath.concat(extFs.readFilesSync(bootPath, OUTPUT_HTML_REG))
      }

      if (fs.existsSync(entryPath)) {
        outputPath = outputPath.concat(extFs.readFilesSync(entryPath, OUTPUT_HTML_REG))
      }

      const outputMap: OutputMap = {}
      outputPath.forEach((iPath) => {
        outputMap[ignoreExtName(path.basename(iPath))] = iPath
      })

      const commonChunks: string[] = []
      const pageChunkMap: OutputMap = {}

      Object.keys(wConfig.entry).forEach((key) => {
        if (key in outputMap) {
          // page chunk
          pageChunkMap[key] = key
        } else {
          // common chunk
          commonChunks.push(key)
        }
      })

      return outputPath.map((iPath) => {
        const filename = ignoreExtName(path.basename(iPath))
        let iChunks: string[] = []
        iChunks = iChunks.concat(commonChunks)
        if (filename in wConfig.entry) {
          iChunks.push(filename)
        }
        const opts: HtmlWebpackPluginOption = {
          template: iPath,
          filename: path.relative(resolveRoot, path.join(alias.htmlDest, `${filename}.html`)),
          chunks: iChunks,
          chunksSortMode(a, b) {
            return iChunks.indexOf(a) - iChunks.indexOf(b)
          },
          inlineSource: '.(js|css|ts|tsx|jsx)\\?__inline$',
          minify: false,
          inject: 'body',
          process: {
            env: env
          }
        }

        return new HtmlWebpackPlugin(opts)
      })
    })()
  )

  return wConfig
}
