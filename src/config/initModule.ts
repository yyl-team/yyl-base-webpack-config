import { Configuration, RuleSetUse } from 'webpack'
import { InitBaseOption } from '../types'
import { isModuleInclude, resolveModule } from '../formatter'
import autoprefixer from 'autoprefixer'
import px2rem from 'postcss-pxtorem'
import util, { path } from 'yyl-util'
import sass from 'sass'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import fs from 'fs'

const NODE_MODULES_REG = /node_modules/
const IS_VUE_REG = /\.vue\.js/

/** 初始化 wConfig module 部分 - 返回值 */
export type InitModuleResult = Required<Pick<Configuration, 'module' | 'resolve' | 'plugins'>>

/** 初始化 wConfig module 部分 */
export function initModule(op: InitBaseOption) {
  const { yylConfig, alias, resolveRoot, env } = op

  const urlLoaderOptions = {
    limit: yylConfig?.base64Limit ? 3000 : Number(yylConfig?.base64Limit || 0),
    esModule: false,
    name: '[name]-[hash:8].[ext]',
    chunkFilename: 'async_component/[name]-[chunkhash:8].[ext]',
    outputPath: path.relative(resolveRoot, alias.imagesDest),
    publicPath: (function () {
      let r = util.path.join(alias.basePath, path.relative(resolveRoot, alias.imagesDest), '/')
      if (env.proxy || env.remote || env.isCommit) {
        r = util.path.join(alias.publicPath, r)
      }
      return r
    })()
  }
  const wConfig: InitModuleResult = {
    module: {
      rules: [
        // js
        {
          test: /\.jsx?$/,
          exclude(file) {
            if (file.match(NODE_MODULES_REG)) {
              if (
                yylConfig?.babelLoaderIncludes &&
                isModuleInclude(file, yylConfig?.babelLoaderIncludes)
              ) {
                return false
              } else if (file.match(IS_VUE_REG)) {
                return false
              } else {
                return true
              }
            } else {
              return false
            }
          },
          use: [
            {
              loader: resolveModule('babel-loader'),
              options: {
                babelrc: false,
                cacheDirectory: true,
                presets: [[resolveModule('@babel/preset-env'), { modules: 'commonjs' }]],
                plugins: [
                  // Stage 2
                  [resolveModule('@babel/plugin-proposal-decorators'), { legacy: true }],
                  [resolveModule('@babel/plugin-proposal-class-properties'), { loose: true }],
                  resolveModule('@babel/plugin-proposal-function-sent'),
                  resolveModule('@babel/plugin-proposal-export-namespace-from'),
                  resolveModule('@babel/plugin-proposal-numeric-separator'),
                  resolveModule('@babel/plugin-proposal-throw-expressions'),
                  resolveModule('@babel/plugin-syntax-dynamic-import')
                ]
              }
            }
          ]
        },
        // pug
        {
          test: /\.(pug|jade)$/,
          oneOf: [
            {
              resourceQuery: /^\?vue/,
              loader: resolveModule('pug-plain-loader'),
              options: {
                self: true
              }
            },
            {
              loader: resolveModule('pug-loader'),
              options: {
                self: true
              }
            }
          ]
        },
        // lib js
        {
          test: path.join(alias.srcRoot, 'js/lib/'),
          use: [
            {
              loader: `${resolveModule('imports-loader')}?this=?window`
            }
          ]
        },
        // images
        {
          test: /\.(png|jpg|gif|webp|ico)$/,
          use: [
            {
              loader: resolveModule('url-loader'),
              options: urlLoaderOptions
            }
          ]
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.json', '.wasm', '.mjs', '.jsx'],
      plugins: []
    },
    plugins: []
  }

  // url loader 补充
  if (yylConfig?.urlLoaderMatch && wConfig.module.rules) {
    wConfig.module.rules.push({
      test: yylConfig.urlLoaderMatch,
      use: [
        {
          loader: resolveModule('url-loader'),
          options: urlLoaderOptions
        }
      ]
    })
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
        postcssOptions: {
          plugins: (() => {
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
              r.push(px2rem({ unitPrecision: 75 }))
            }
            return r
          })()
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
            implementation: sass
          }
        }
      ])
    })
  }
  // - css & scss

  // + ts
  const localTsConfigPath = path.join(alias.dirname, 'tsconfig.json')
  if (fs.existsSync(localTsConfigPath)) {
    const localPkgPath = path.join(alias.dirname, 'package.json')
    const localTsLoaderPath = path.join(alias.dirname, 'node_modules', 'ts-loader')
    const localTsLoaderExists = fs.existsSync(localTsLoaderPath)
    let useProjectTs = false
    if (fs.existsSync(localPkgPath)) {
      const localPkg = require(localPkgPath)
      if (
        localPkg.dependencies &&
        localPkg.dependencies['ts-loader'] &&
        localPkg.dependencies.typescript &&
        localTsLoaderExists
      ) {
        useProjectTs = true
      }

      if (wConfig.module.rules) {
        wConfig.module.rules.push({
          test: /\.tsx?$/,
          use: [
            // happyPackLoader('ts')
            {
              loader: useProjectTs
                ? require.resolve(localTsLoaderPath)
                : require.resolve('ts-loader'),
              options: {
                appendTsSuffixTo: [/\.vue$/],
                context: alias.dirname,
                configFile: 'tsconfig.json'
              }
            }
          ]
        })
      }
      if (wConfig.resolve.plugins) {
        wConfig.resolve.plugins.push(
          new TsconfigPathsPlugin({
            configFile: localTsConfigPath
          })
        )
      }

      if (wConfig.resolve.extensions) {
        wConfig.resolve.extensions = wConfig.resolve.extensions.concat(['.tsx', '.ts'])
      }
    }
  }
  // - ts

  return wConfig
}
