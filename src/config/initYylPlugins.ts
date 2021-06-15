import fs from 'fs'
import path from 'path'
import extOs from 'yyl-os'
import type { WebpackOptionsNormalized } from 'webpack'
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server'
import { webpackLoader } from '../webpackLoader'
import YylConcatWebpackPlugin from 'yyl-concat-webpack-plugin'
import YylCopyWebpackPlugin, { YylCopyWebpackPluginOption } from 'yyl-copy-webpack-plugin'
import YylSugarWebpackPlugin from 'yyl-sugar-webpack-plugin'
import YylRevWebpackPlugin, { YylRevWebpackPluginOption } from 'yyl-rev-webpack-plugin'
import YylEnvPopPlugin from 'yyl-env-pop-webpack-plugin'
import YylServerWebpackPlugin, { YylServerWebpackPluginOption } from 'yyl-server-webpack-plugin'
import { LANG } from '../const'
import { initProxies } from '../util'
import { InitBaseOption } from '../types'
import util from 'yyl-util'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const { HotModuleReplacementPlugin } = webpackLoader

export interface InitYylPluginsResult {
  plugins: WebpackOptionsNormalized['plugins']
  devServer: DevServerConfiguration
}
export interface InitYylPluginsOption extends InitBaseOption {
  publicPath: string
  devServer: DevServerConfiguration | false
}

export function initYylPlugins(op: InitYylPluginsOption) {
  const { env, alias, devServer, yylConfig, resolveRoot, publicPath, logger } = op
  const pkgPath = path.join(alias.dirname, 'package.json')
  let pkg = {
    name: 'default'
  }
  if (fs.existsSync(pkgPath)) {
    pkg = require(pkgPath)
  }

  const devServerConfig: WebpackOptionsNormalized['devServer'] = {
    noInfo: `${env.logLevel}` !== '2',
    publicPath: /^\/\//.test(publicPath) ? `http:${publicPath}` : publicPath,
    writeToDisk: !!(env.remote || env.isCommit || env.writeToDisk || yylConfig?.localserver?.entry),
    headers: { 'Access-Control-Allow-Origin': '*' },
    disableHostCheck: true,
    contentBase: alias.root,
    port: yylConfig?.localserver?.port || (devServer && devServer?.port) || 5000,
    hot: !!env?.hmr,
    inline: !!env.https,
    liveReload: !!env.livereload,
    host: '0.0.0.0',
    sockHost: '127.0.0.1',
    serveIndex: true,
    watchOptions: {
      aggregateTimeout: 1000,
      ignored: ['node_modules']
    }
  }

  /** yylServer 配置 */
  const yylServerOption: Required<YylServerWebpackPluginOption> = {
    context: alias.dirname,
    https: !!env.https,
    devServer: {
      ...devServerConfig,
      ...devServer,
      disableHostCheck: true,
      contentBase: alias.root,
      port: yylConfig?.localserver?.port || (devServer && devServer?.port) || 5000,
      hot: !!env?.hmr,
      inline: !!env.https,
      liveReload: !!env.livereload,
      host: '0.0.0.0',
      sockHost: '127.0.0.1',
      serveIndex: true,
      before(app) {
        if (devServer) {
          const { historyApiFallback } = devServer
          app.use((req, res, next) => {
            if (typeof historyApiFallback === 'object') {
              const matchRewrite =
                historyApiFallback.rewrites &&
                historyApiFallback.rewrites.length &&
                historyApiFallback.rewrites.some((item) => req.url.match(item.from))
              if (
                req.method === 'GET' &&
                req.headers &&
                ([''].includes(path.extname(req.url)) || matchRewrite)
              ) {
                req.headers.accept =
                  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
              }
            }

            next()
          })
        }
      }
    },
    proxy: initProxies({
      yylConfig,
      env
    }),
    // proxy: {
    //   hosts: [
    //     yylConfig?.commit?.hostname || '',
    //     yylConfig?.commit?.mainHost || '',
    //     yylConfig?.commit?.staticHost || ''
    //   ].filter((x) => x !== ''),
    //   enable: !env.proxy && !env.remote
    // },
    homePage: '',
    HtmlWebpackPlugin
  }

  // 当为 false 时 会作为 中间件形式
  if (devServer === false) {
    logger('msg', 'success', [LANG.SERVER_UNDER_MIDDLEWARE_MODE])
    yylServerOption.devServer = {}
  } else {
    logger('msg', 'success', [LANG.SERVER_UNDER_NORMAL_MODE])
  }

  const r: InitYylPluginsResult = {
    plugins: [],
    devServer: YylServerWebpackPlugin.initDevServerConfig(yylServerOption)
  }

  r.plugins = [
    // pop
    new YylEnvPopPlugin({
      enable: !!env.tips,
      text: `${pkg.name} - ${extOs.LOCAL_IP}:${yylServerOption.devServer.port}`,
      duration: 3000
    }),
    // concat
    new YylConcatWebpackPlugin({
      fileMap: yylConfig?.concat || {},
      context: alias.dirname,
      minify: !!env?.isCommit
    }),
    // copy
    new YylCopyWebpackPlugin(
      (() => {
        const r: YylCopyWebpackPluginOption = {
          files: [],
          minify: false,
          context: alias.dirname
        }
        if (yylConfig?.resource) {
          Object.keys(yylConfig.resource).forEach((from) => {
            const iExt = path.extname(from)
            if (iExt) {
              if (r.files && yylConfig?.resource) {
                if (['.html'].includes(iExt)) {
                  r.files.push({
                    from,
                    to: yylConfig.resource[from],
                    filename: '[name].[ext]'
                  })
                } else {
                  r.files.push({
                    from,
                    to: yylConfig.resource[from],
                    filename: '[name]-[hash:8].[ext]'
                  })
                }
              }
            } else {
              if (r.files && yylConfig?.resource) {
                r.files.push({
                  from,
                  to: yylConfig.resource[from],
                  matcher: ['*.html', '!**/.*'],
                  filename: '[name].[ext]'
                })

                r.files.push({
                  from,
                  to: yylConfig.resource[from],
                  matcher: ['!*.html', '!**/.*'],
                  filename: '[name]-[hash:8].[ext]'
                })
              }
            }
          })
        }
        return r
      })()
    ),
    // sugar
    new YylSugarWebpackPlugin({
      context: alias.dirname,
      HtmlWebpackPlugin
    }),
    // rev
    new YylRevWebpackPlugin({
      revFileName: util.path.join(
        path.relative(resolveRoot, path.join(alias.revDest, './rev-manifest.json'))
      ),
      revRoot: alias.revRoot,
      remote: !!env.remote,
      remoteAddr: yylConfig?.commit?.revAddr,
      remoteBlankCss: !env.isCommit,
      extends: (() => {
        const r: YylRevWebpackPluginOption['extends'] = {
          version: util.makeCssJsDate(),
          staticRemotePath: yylConfig?.commit?.staticHost || yylConfig?.commit?.hostname || '',
          mainRemotePath: yylConfig?.commit?.mainHost || yylConfig?.commit?.hostname || ''
        }
        Object.keys(env)
          .filter((key) => {
            return ![
              'isCommit',
              'logLevel',
              'proxy',
              'name',
              'config',
              'workflow',
              'useHotPlugin',
              'hmr'
            ].includes(key)
          })
          .forEach((key) => {
            r[key] = env[key]
          })
        return r
      })()
    }),
    // server
    new YylServerWebpackPlugin(yylServerOption)
  ]

  // 插入 热更新插件
  if (devServer === false && (env?.hmr || env?.livereload)) {
    try {
      const webpack = require('webpack')
      r.plugins.push(new webpack.HotModuleReplacementPlugin())
    } catch (er) {}
  }

  return r
}
