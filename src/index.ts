import { WebpackOptionsNormalized } from 'webpack'
import merge from 'webpack-merge'
import path from 'path'
import { YylConfig, Env } from 'yyl-config-types'
import { initBase } from './config/initBase'
import { initEntry } from './config/initEntry'
import { initModule } from './config/initModule'
import { initYylPlugins } from './config/initYylPlugins'

import { Alias, InitBaseOption } from './types'
export interface YylBaseInitConfigOption {
  /** 当前路径 */
  context: string
  /** 环境变量 */
  env?: Env
  /** yyl.config */
  yylConfig?: YylConfig
  alias?: Alias
  devServer?: {
    port: number
  }
}

type AliasProperty = Required<YylBaseInitConfigProperty['alias']>

export type YylBaseInitConfigProperty = Required<YylBaseInitConfigOption>

const DEFAULT_ALIAS: AliasProperty = {
  root: './dist',
  srcRoot: './src',
  dirname: './',
  jsDest: './dist/js',
  cssDest: './dist/css',
  imagesDest: './dist/images',
  htmlDest: './dist/html',
  revDest: './dist/assets',
  revRoot: './dist',
  revAddr: '',
  basePath: '/',
  publicPath: '/'
}

const DEFAULT_DEV_SERVER: InitBaseOption['devServer'] = {
  port: 5000
}

export default function yylBaseInitConfig(op?: YylBaseInitConfigOption) {
  // 配置初始化 - env
  const env = op?.env || {}

  // 配置初始化 - context
  let context = process.cwd()
  if (op?.context) {
    context = path.resolve(__dirname, op.context)
  }

  // 配置初始化 - alias
  let alias = {
    ...DEFAULT_ALIAS
  }

  if (op?.alias) {
    alias = {
      ...alias,
      ...op.alias
    }
  }

  // 配置 devServer
  let devServer = {
    ...DEFAULT_DEV_SERVER
  }

  if (op?.devServer) {
    devServer = {
      ...devServer,
      ...op.devServer
    }
  }

  // 配置初始化 - yylConfig
  let yylConfig: YylConfig | undefined
  if (op?.yylConfig) {
    yylConfig = op.yylConfig
    // 字段兼容
    if (yylConfig.dest?.basePath) {
      alias.basePath = yylConfig.dest.basePath
    }

    if (yylConfig.commit?.hostname) {
      alias.publicPath = yylConfig.commit.hostname
    }

    if (yylConfig?.alias) {
      alias = {
        ...alias,
        ...yylConfig.alias
      }
    }

    if (yylConfig?.localserver?.port) {
      devServer.port = yylConfig.localserver.port
    }
  }

  // alias 路径 resolve
  Object.keys(alias).forEach((key) => {
    const iKey = key as keyof Alias
    if (alias[iKey] !== undefined) {
      if (!path.isAbsolute(alias[iKey] as string)) {
        alias[iKey] = path.resolve(context, alias[iKey] as string)
        alias[iKey] = path.resolve(__dirname, alias[iKey] as string)
      }
    }
  })
  // dist 目录
  const resolveRoot = path.resolve(__dirname, alias.root)

  // 配置初始化
  const baseWConfig = initBase({ yylConfig, env, alias, resolveRoot, devServer })
  const entryWConfig = initEntry({ yylConfig, env, alias, resolveRoot, devServer })
  const moduleWConfig = initModule({ yylConfig, env, alias, resolveRoot, devServer })
  const yylPluginsWConfig = initYylPlugins({ yylConfig, env, alias, resolveRoot, devServer })

  // 配置合并
  const mixedOptions = merge(
    baseWConfig as WebpackOptionsNormalized,
    entryWConfig as WebpackOptionsNormalized,
    moduleWConfig as WebpackOptionsNormalized,
    yylPluginsWConfig as WebpackOptionsNormalized
  )

  // 添加 yyl 脚本， 没有挂 hooks 所以放最后比较稳

  return mixedOptions
}

module.exports = yylBaseInitConfig
