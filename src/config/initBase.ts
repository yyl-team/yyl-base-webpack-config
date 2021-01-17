import { WebpackOptionsNormalized, DefinePlugin, config, EnvironmentPlugin } from 'webpack'
import path from 'path'
import util from 'yyl-util'
import TerserWebpackPlugin from 'terser-webpack-plugin'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'

import { InitBaseOption } from '../types'
import { formatPath } from '../formatter'

export interface DefinePluginOption {
  [key: string]: any
}

export type InitBaseResult = Pick<
  WebpackOptionsNormalized,
  | 'mode'
  | 'cache'
  | 'context'
  // | 'output'
  | 'resolveLoader'
  | 'resolve'
  | 'devtool'
  | 'plugins'
  | 'optimization'
>

export function initBase(option: InitBaseOption) {
  const { resolveRoot, alias, yylConfig, env } = option
  const nodeModulesPath = path.join(alias.dirname, 'node_modules')
  const wConfig: InitBaseResult = {
    mode: 'development',
    cache: {
      type: 'memory'
    },
    context: path.resolve(__dirname, alias.dirname),
    // output: {
    //   path: resolveRoot,
    //   filename: formatPath(
    //     path.relative(resolveRoot, path.join(alias.jsDest, '[name]-[hash:8].js'))
    //   ),
    //   chunkFilename: formatPath(
    //     path.relative(
    //       resolveRoot,
    //       path.join(alias.jsDest, 'async_component/[name]-[chunkhash:8].js')
    //     )
    //   )
    // },
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

  // 环境区分
  // if (env.proxy || env.remote) {
  //   wConfig.output.publicPath = util.path.join(
  //     alias.hostname,
  //     alias.basePath,
  //     path.relative(alias.root, resolveRoot),
  //     '/'
  //   )
  // } else if (env.isCommit) {
  //   wConfig.mode = 'production'
  //   wConfig.output.publicPath = util.path.join(
  //     alias.hostname,
  //     alias.basePath,
  //     path.relative(alias.root, resolveRoot),
  //     '/'
  //   )
  // } else {
  //   wConfig.output.publicPath = util.path.join(
  //     alias.basePath,
  //     path.relative(alias.root, resolveRoot),
  //     '/'
  //   )
  // }
  wConfig.plugins.push(
    new DefinePlugin({
      'process.env.NODE_ENV': env.NODE_ENV || wConfig.mode
    })
  )

  // TODO: yyl 系列 plugins 引入

  return wConfig
}
