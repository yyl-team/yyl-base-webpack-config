import type { Configuration, RuleSetUse } from 'webpack'
import { InitBaseOption } from '../types'
import { resolveModule } from '../formatter'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import autoprefixer from 'autoprefixer'
import px2rem from 'postcss-px2rem'
import util, { path } from 'yyl-util'
import sass from 'sass'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

/** 初始化 wConfig module 部分 - 返回值 */
export type InitModuleResult = Required<Pick<Configuration, 'module' | 'plugins' | 'optimization'>>

/** 初始化 wConfig module 部分 */
export function initModuleScss(op: InitBaseOption) {
  const { yylConfig, alias, resolveRoot, env } = op

  const wConfig: InitModuleResult = {
    module: {
      rules: []
    },
    plugins: [],
    optimization: {
      minimizer: []
    }
  }

  // + css & scss
  const cssUse: RuleSetUse = [
    {
      loader: resolveModule('style-loader'),
      options: {
        attributes: {
          'data-module': yylConfig?.name || 'inline-style'
        }
      }
    },
    resolveModule('css-loader'),
    {
      loader: resolveModule('postcss-loader'),
      options: {
        ident: 'postcss',
        plugins() {
          const r = []
          if (yylConfig?.platform === 'pc') {
            r.push(
              autoprefixer({
                overrideBrowserslist: ['> 1%', 'last 2 versions']
              })
            )
          } else {
            r.push(
              autoprefixer({
                overrideBrowserslist: ['iOS >= 7', 'Android >= 4']
              })
            )
          }

          if (yylConfig?.px2rem === true) {
            r.push(px2rem({ remUnit: 75 }))
          }
          return r
        }
      }
    }
  ]

  if (env.isCommit || env.remote) {
    // 发版
    // 去掉 style-loader, 添加 mini-css-extract-plugin loader
    cssUse.splice(0, 1, {
      loader: MiniCssExtractPlugin.loader,
      options: {}
    })

    wConfig.plugins.push(
      new MiniCssExtractPlugin({
        filename: util.path.relative(
          resolveRoot,
          path.join(alias.cssDest, '[name]-[chunkhash:8].css')
        ),
        chunkFilename: util.path.relative(
          resolveRoot,
          path.join(alias.cssDest, '[name]-[chunkhash:8].css')
        )
      })
    )
  }
  if (wConfig.module.rules) {
    wConfig.module.rules.push({
      test: /\.css$/,
      use: cssUse
    })

    wConfig.module.rules.push({
      test: /\.(scss|sass)$/,
      use: cssUse.concat([
        {
          loader: resolveModule('sass-loader'),
          options: {
            implementation: sass,
            sassOptions: {
              outputStyle: 'expanded'
            }
          }
        }
      ])
    })
  }
  if (wConfig.optimization.minimizer) {
    wConfig.optimization.minimizer.push(new CssMinimizerPlugin() as any)
  }
  // - css & scss

  return wConfig
}
