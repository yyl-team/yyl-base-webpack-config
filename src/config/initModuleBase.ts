import type { Configuration } from 'webpack'
import { InitBaseOption } from '../types'
import { resolveModule } from '../formatter'
import util, { path } from 'yyl-util'

/** 初始化 wConfig module 部分 - 返回值 */
export type InitModuleResult = Required<Pick<Configuration, 'module' | 'plugins'>>

/** 初始化 wConfig module 部分 */
export function initModuleBase(op: InitBaseOption) {
  const { yylConfig, alias, resolveRoot, env } = op

  const urlLoaderOptions = {
    limit: yylConfig?.base64Limit ? 3000 : Number(yylConfig?.base64Limit || 0),
    esModule: false,
    name: '[name]-[hash:8].[ext]',
    chunkFilename: 'async_component/[name]-[chunkhash:8].[ext]',
    outputPath: path.relative(resolveRoot, alias.imagesDest),
    publicPath: (function () {
      let r = util.path.join(alias.basePath, path.relative(resolveRoot, alias.imagesDest), '/')
      if (env.proxy || env.remote || env.isCommit) {
        r = util.path.join(alias.publicPath, r)
      }
      return r
    })()
  }
  const wConfig: InitModuleResult = {
    module: {
      rules: [
        // pug
        {
          test: /\.(pug|jade)$/,
          oneOf: [
            {
              resourceQuery: /^\?vue/,
              loader: resolveModule('pug-plain-loader'),
              options: {
                self: true
              }
            },
            {
              loader: resolveModule('pug-loader'),
              options: {
                self: true
              }
            }
          ]
        },
        {
          test: /\.svg$/,
          use: resolveModule('svg-inline-loader')
        },
        // images
        {
          test: /\.(png|jpg|gif|webp|ico)$/,
          use: [
            {
              loader: resolveModule('url-loader'),
              options: urlLoaderOptions
            }
          ]
        }
      ]
    },
    plugins: []
  }

  // url loader 补充
  if (yylConfig?.urlLoaderMatch && wConfig.module.rules) {
    wConfig.module.rules.push({
      test: yylConfig.urlLoaderMatch,
      use: [
        {
          loader: resolveModule('url-loader'),
          options: urlLoaderOptions
        }
      ]
    })
  }

  return wConfig
}
