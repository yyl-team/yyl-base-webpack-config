import { Compiler, WebpackOptionsNormalized } from 'webpack'
import merge from 'webpack-merge'
import path from 'path'
import { YylConfig, Env } from 'yyl-config-types'
import { initBase } from './config/initBase'
import { initEntry } from './config/initEntry'
import { initModule } from './config/initModule'

import { Alias } from './types'
export interface YylReactTsConfigWebpackPluginOption {
  /** 当前路径 */
  context: string
  /** 环境变量 */
  env?: Env
  /** yyl.config */
  yylConfig?: YylConfig
  alias?: Alias
}

type AliasProperty = Required<YylReactTsConfigWebpackPluginProperty['alias']>

export type YylReactTsConfigWebpackPluginProperty = Required<YylReactTsConfigWebpackPluginOption>
module.exports = class YylReactTsConfigWebpackPlugin {
  context: YylReactTsConfigWebpackPluginProperty['context'] = process.cwd()
  env: YylReactTsConfigWebpackPluginProperty['env'] = {}
  yylConfig: YylReactTsConfigWebpackPluginOption['yylConfig']
  alias: AliasProperty = {
    root: './dist',
    srcRoot: './src',
    dirname: './',
    jsDest: './dist/js',
    cssDest: './dist/css',
    imagesDest: './dist/images',
    htmlDest: './dist/html',
    basePath: '/',
    publicPath: '/'
  }

  constructor(op?: YylReactTsConfigWebpackPluginOption) {
    if (op?.context) {
      this.context = path.resolve(__dirname, op.context)
    }

    if (op?.alias) {
      this.alias = {
        ...this.alias,
        ...op.alias
      }
    }

    if (op?.yylConfig) {
      this.yylConfig = op.yylConfig
      // 字段兼容
      if (this.yylConfig.dest?.basePath) {
        this.alias.basePath = this.yylConfig.dest.basePath
      }

      if (this.yylConfig.commit?.hostname) {
        this.alias.publicPath = this.yylConfig.commit.hostname
      }

      if (this.yylConfig?.alias) {
        this.alias = {
          ...this.alias,
          ...this.yylConfig.alias
        }
      }
    }

    // alias 路径 resolve
    Object.keys(this.alias).forEach((key) => {
      const iKey = key as keyof Alias
      this.alias[iKey] = path.resolve(this.context, this.alias[iKey])
    })
  }

  apply(compiler: Compiler) {
    const { alias, env, yylConfig } = this
    const { options } = compiler
    if (options.context) {
      this.context = path.resolve(__dirname, options.context)
    }

    // 路径纠正
    Object.keys(alias).forEach((key) => {
      const iKey = key as keyof AliasProperty
      alias[iKey] = path.resolve(__dirname, alias[iKey])
    })

    // dist 目录
    const resolveRoot = path.resolve(__dirname, alias.root)
    const baseWConfig = initBase({ yylConfig, env, alias, resolveRoot })
    const entryWConfig = initEntry({ yylConfig, env, alias, resolveRoot })
    const moduleWConfig = initModule({ yylConfig, env, alias, resolveRoot })

    console.log('baseWConfig', baseWConfig)
    console.log('===========================')
    console.log('entryWConfig', entryWConfig)
    console.log('===========================')
    console.log('moduleWConfig', moduleWConfig)
    console.log('===========================')

    const mixedOptions = merge(
      options,
      baseWConfig as WebpackOptionsNormalized
      // entryWConfig as WebpackOptionsNormalized,
      // moduleWConfig as WebpackOptionsNormalized
    )
    if ('main' in mixedOptions.entry && Object.keys(mixedOptions.entry.main).length === 0) {
      delete mixedOptions.entry.main
    }
    compiler.options = mixedOptions
    console.log('r', compiler.options)
    // console.log('===', compiler.options)
  }
}
