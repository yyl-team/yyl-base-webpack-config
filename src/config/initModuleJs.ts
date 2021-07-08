import type { Configuration } from 'webpack'
import { InitBaseOption } from '../types'
import { isModuleInclude, resolveModule } from '../formatter'
import TerserPlugin from 'terser-webpack-plugin'
import util, { path } from 'yyl-util'

const NODE_MODULES_REG = /node_modules/
const IS_VUE_REG = /\.vue\.js/

/** 初始化 wConfig module 部分 - 返回值 */
export type InitModuleResult = Required<
  Pick<Configuration, 'module' | 'resolve' | 'plugins' | 'optimization'>
>

/** 初始化 wConfig module 部分 */
export function initModuleJs(op: InitBaseOption) {
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
                presets: [
                  [resolveModule('@babel/preset-env'), { modules: 'commonjs', loose: true }]
                ],
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
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.json', '.wasm', '.mjs', '.jsx'],
      plugins: []
    },
    plugins: [],
    optimization: {
      minimize: !!env.isCommit,
      minimizer: [
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

  return wConfig
}
