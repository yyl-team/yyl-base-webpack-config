import { WebpackOptionsNormalized, DefinePlugin, config } from 'webpack'
import { Env, YylConfig } from 'yyl-config-types'
import path from 'path'
import TerserWebpackPlugin from 'terser-webpack-plugin'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'

import { Alias } from './types'
import { formatPath } from './formatter'
import { __dirname } from '../typing/global'

export interface DefinePluginOption {
  [key: string]: any
}
export interface InitBaseOption {
  resolveRoot: string
  env: Env
  alias: Required<Alias>
  yylConfig?: YylConfig
}

export interface InitBaseResult {
  context: Required<WebpackOptionsNormalized['context']>
  output: WebpackOptionsNormalized['output']
  resolveLoader: WebpackOptionsNormalized['resolveLoader']
  resolve: WebpackOptionsNormalized['resolve']
  devtool: Required<WebpackOptionsNormalized['devtool']>
  optimization: WebpackOptionsNormalized['optimization']
  plugins: Required<WebpackOptionsNormalized['plugins']>
}

export function initBase(option: InitBaseOption) {
  const { resolveRoot, alias, yylConfig, env } = option
  const nodeModulesPath = path.join(alias.dirname, 'node_modules')
  const wConfig: InitBaseResult = {
    context: path.resolve(__dirname, alias.dirname),
    output: {
      path: resolveRoot,
      filename: formatPath(
        path.relative(resolveRoot, path.join(alias.jsDest, '[name]-[hash:8].js'))
      ),
      chunkFilename: formatPath(
        path.relative(
          resolveRoot,
          path.join(alias.jsDest, 'async_component/[name]-[chunkhash:8].js')
        )
      )
    },
    resolveLoader: {
      modules: [nodeModulesPath]
    },
    resolve: {
      modules: [nodeModulesPath],
      alias: {
        ...alias,
        ...yylConfig?.alias
      }
    },
    devtool: 'source-map',
    plugins: [],
    optimization: {
      minimizer: [
        new TerserWebpackPlugin({
          extractComments: false,
          terserOptions: {
            ie8: false,
            keep_fnames: false
          }
        }),
        new OptimizeCSSAssetsPlugin({})
      ]
    }
  }

  // 环境变量
  wConfig.plugins.push(
    (() => {
      const r: DefinePluginOption = {}
      Object.keys(env).forEach((key) => {
        if (typeof env[key] === 'string') {
          r[`process.env.${key}`] = JSON.stringify(env[key])
        } else {
          r[`process.env.${key}`] = env[key]
        }
      })
      return new DefinePlugin(r)
    })()
  )

  // 补充 node_modules
  if (yylConfig?.resolveModule) {
    if (wConfig.resolve.modules) {
      wConfig.resolve.modules.unshift(yylConfig.resolveModule)
    }
    if (wConfig.resolveLoader.modules) {
      wConfig.resolveLoader.modules.unshift(yylConfig.resolveModule)
    }
  }
  // TODO: yyl 系列 plugins 引入

  return wConfig
}
