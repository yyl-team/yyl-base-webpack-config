import webpack, { Compiler, WebpackOptionsNormalized } from 'webpack'
import merge from 'webpack-merge'
import path from 'path'
import { YylConfig, Env } from 'yyl-config-types'
import { initBase } from './init/base'
import { initEntry } from './init/entry'
import { initModule } from './init/module'

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
export class YylReactTsConfigWebpackPlugin {
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

    compiler.options = merge(
      options,
      baseWConfig,
      entryWConfig as WebpackOptionsNormalized,
      moduleWConfig as WebpackOptionsNormalized
    )
  }
}
