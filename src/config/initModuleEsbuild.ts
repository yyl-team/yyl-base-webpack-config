import type { Configuration, RuleSetUse } from 'webpack'
import { InitBaseOption } from '../types'
import { resolveModule } from '../formatter'
import autoprefixer from 'autoprefixer'
import px2rem from 'postcss-px2rem'
import util, { path } from 'yyl-util'
import sass from 'sass'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import { ESBuildMinifyPlugin } from 'esbuild-loader'
import fs from 'fs'

const NODE_MODULES_REG = /node_modules/
const IS_VUE_REG = /\.vue\.js/

/** 初始化 wConfig module 部分 - 返回值 */
export type InitModuleResult = Required<
  Pick<Configuration, 'module' | 'resolve' | 'plugins' | 'optimization'>
>

/** 初始化 wConfig module 部分 */
export function initModuleEsbuild(op: InitBaseOption) {
  const { yylConfig, alias, resolveRoot, env } = op

  const localTsConfigPath = path.join(alias.dirname, 'tsconfig.json')

  const tsconfigRaw = fs.existsSync(localTsConfigPath) ? require(localTsConfigPath) : undefined
  if (tsconfigRaw) {
    if (!tsconfigRaw.compilerOptions.rootDirs) {
      tsconfigRaw.compilerOptions.rootDirs = []
    }
    tsconfigRaw.compilerOptions.rootDirs.push(alias.dirname)
    console.log('===zzzddd', tsconfigRaw)
  }

  const wConfig: InitModuleResult = {
    module: {
      rules: [
        // js
        {
          test: /\.jsx?$/,
          loader: resolveModule('esbuild-loader'),
          options: {
            loader: 'jsx',
            target: 'es2015'
          }
        },
        // tsx
        {
          test: /\.tsx?$/,
          loader: resolveModule('esbuild-loader'),
          options: {
            loader: 'tsx',
            target: 'es2015',
            tsconfigRaw
          }
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.json', '.wasm', '.mjs', '.jsx', '.ts', '.tsx'],
      plugins: []
    },
    plugins: [],
    optimization: {
      minimize: !!env.isCommit,
      minimizer: [
        new ESBuildMinifyPlugin({
          target: 'es2015',
          css: true
        })
      ]
    }
  }

  if (wConfig.resolve.plugins) {
    wConfig.resolve.plugins.push(
      new TsconfigPathsPlugin({
        configFile: localTsConfigPath
      })
    )
  }

  // + css & scss
  const postCssOptions = {
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

  let cssUse: RuleSetUse = []
  if (env.isCommit || env.remote) {
    cssUse = [
      {
        loader: MiniCssExtractPlugin.loader,
        options: {}
      },
      resolveModule('css-loader'),
      {
        loader: resolveModule('postcss-loader'),
        options: postCssOptions
      }
    ]
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
  } else {
    cssUse = [
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
        options: postCssOptions
      },
      {
        loader: resolveModule('esbuild-loader'),
        options: {
          loader: 'css',
          minify: !!env.isCommit
        }
      }
    ]
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
  // - css & scss

  return wConfig
}
