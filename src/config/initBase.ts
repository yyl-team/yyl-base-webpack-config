import type { Configuration } from 'webpack'
import { webpackLoader } from '../webpackLoader'
import path from 'path'
import util from 'yyl-util'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'

import { InitBaseOption } from '../types'
import { formatPath } from '../formatter'

const { DefinePlugin } = webpackLoader

export interface DefinePluginOption {
  [key: string]: any
}

export type InitBaseResult = Required<
  Pick<Configuration, 'mode' | 'cache' | 'context' | 'output' | 'resolve' | 'devtool' | 'plugins'>
>

export function initBase(option: InitBaseOption) {
  const { resolveRoot, alias, yylConfig, env } = option
  const nodeModulesPath = path.join(alias.dirname)
  const wConfig: InitBaseResult = {
    mode: env.isCommit ? 'production' : 'development',
    cache: {
      type: 'memory'
    },
    context: path.resolve(__dirname, alias.dirname),
    output: {
      path: resolveRoot,
      environment: {
        arrowFunction: false
      },
      filename: formatPath(
        path.relative(resolveRoot, path.join(alias.jsDest, '[name]-[chunkhash:8].js'))
      ),
      chunkFilename: formatPath(
        path.relative(
          resolveRoot,
          path.join(alias.jsDest, 'async_component/[name]-[chunkhash:8].js')
        )
      )
    },
    resolve: {
      modules: [nodeModulesPath, 'node_modules'],
      alias: {
        ...alias,
        ...yylConfig?.alias
      }
    },
    devtool: env.isCommit ? false : 'source-map',
    plugins: []
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
      r['process.env'] = {}
      r.process = {}
      return new DefinePlugin(r)
    })()
  )

  // 补充 node_modules
  if (yylConfig?.resolveModule) {
    if (wConfig.resolve.modules) {
      wConfig.resolve.modules.unshift(yylConfig.resolveModule)
    }
  }

  // 环境区分
  if (env.proxy || env.remote) {
    wConfig.output.publicPath = util.path.join(
      alias.publicPath,
      alias.basePath,
      path.relative(alias.root, resolveRoot),
      '/'
    )
  } else if (env.isCommit) {
    wConfig.mode = 'production'
    wConfig.output.publicPath = util.path.join(
      alias.publicPath,
      alias.basePath,
      path.relative(alias.root, resolveRoot),
      '/'
    )
  } else {
    wConfig.output.publicPath = util.path.join(
      alias.basePath,
      path.relative(alias.root, resolveRoot),
      '/'
    )
  }
  wConfig.plugins.push(
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV || wConfig.mode)
    })
  )

  // TODO: yyl 系列 plugins 引入

  return wConfig
}
