import { Configuration, DefinePlugin } from 'webpack'
import path from 'path'
import util from 'yyl-util'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'

import { InitBaseOption } from '../types'
import { formatPath } from '../formatter'

export interface DefinePluginOption {
  [key: string]: any
}

export type InitBaseResult = Required<
  Pick<
    Configuration,
    'mode' | 'cache' | 'context' | 'output' | 'resolve' | 'devtool' | 'plugins' | 'optimization'
  >
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
    plugins: [],
    optimization: {
      minimize: !!env.isCommit,
      minimizer: [
        new CssMinimizerPlugin() as any,
        new TerserPlugin({
          parallel: true, // 可省略，默认开启并行
          extractComments: false,
          terserOptions: {
            toplevel: true, // 最高级别，删除无用代码
            ie8: true,
            safari10: true
          }
        })
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
      r['process.env'] = {}
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
