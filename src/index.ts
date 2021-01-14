import webpack, { Compiler, WebpackOptionsNormalized } from 'webpack'
import merge from 'webpack-merge'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import autoprefixer from 'autoprefixer'
import px2rem from 'postcss-pxtorem'
import sass from 'sass'
import path from 'path'
import util from 'yyl-util'
import fs from 'fs'
import extFs from 'yyl-fs'
import { YylConfig, Env } from 'yyl-config-types'

import { Alias } from './types'

export interface YylReactTsConfigWebpackPluginOption {
  /** 当前路径 */
  cwd: string
  /** 环境变量 */
  env?: Env
  /** yyl.config */
  yylConfig?: YylConfig
  alias?: Alias
}

/** 格式化路径 */
function formatPath(str: string) {
  return str.split(path.sep).join('/')
}

type AliasProperty = Required<YylReactTsConfigWebpackPluginProperty['alias']>

export type YylReactTsConfigWebpackPluginProperty = Required<YylReactTsConfigWebpackPluginOption>
export class YylReactTsConfigWebpackPlugin {
  cwd: YylReactTsConfigWebpackPluginProperty['cwd'] = process.cwd()
  env: YylReactTsConfigWebpackPluginProperty['env'] = {}
  yylConfig: YylReactTsConfigWebpackPluginOption['yylConfig']
  alias: AliasProperty = {
    root: './dist',
    srcRoot: './src',
    dirname: './',
    jsDest: './dist/js',
    cssDest: './dist/css',
    imageDest: './dist/images',
    htmlDest: './dist/html'
  }

  constructor(op?: YylReactTsConfigWebpackPluginOption) {
    if (op?.cwd) {
      this.cwd = path.resolve(__dirname, op.cwd)
    }

    if (op?.alias) {
      this.alias = {
        ...this.alias,
        ...op.alias
      }
    }

    if (op?.yylConfig) {
      this.yylConfig = op.yylConfig
    }
  }

  apply(compiler: Compiler) {
    const { alias, env, yylConfig } = this
    const { options } = compiler
    if (options.context) {
      this.cwd = path.resolve(__dirname, options.context)
    }

    // 路径纠正
    Object.keys(alias).forEach((key) => {
      const iKey = key as keyof AliasProperty
      alias[iKey] = path.resolve(__dirname, alias[iKey])
    })

    // dist 目录
    const resolveRoot = path.resolve(__dirname, alias.root)

    const wConfig: WebpackOptionsNormalized = {
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
      }
    }

    compiler.options = merge(options, wConfig)
  }
}
