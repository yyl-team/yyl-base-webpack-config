import fs from 'fs'
import path from 'path'
import extOs from 'yyl-os'
import { Configuration } from 'webpack'
import YylConcatWebpackPlugin from 'yyl-concat-webpack-plugin'
import YylCopyWebpackPlugin, { YylCopyWebpackPluginOption } from 'yyl-copy-webpack-plugin'
import YylSugarWebpackPlugin from 'yyl-sugar-webpack-plugin'
import YylRevWebpackPlugin, { YylRevWebpackPluginOption } from 'yyl-rev-webpack-plugin'
import YylEnvPopPlugin from 'yyl-env-pop-webpack-plugin'
import YylServerWebpackPlugin, { YylServerWebpackPluginOption } from 'yyl-server-webpack-plugin'
import { InitBaseOption } from '../types'
import util from 'yyl-util'
import HtmlWebpackPlugin from 'html-webpack-plugin'
export type InitYylPluginsResult = Required<Pick<Configuration, 'plugins' | 'devServer'>>
export function initYylPlugins(op: InitBaseOption) {
  const { env, alias, devServer, yylConfig, resolveRoot } = op
  const pkgPath = path.join(alias.dirname, 'package.json')
  let pkg = {
    name: 'default'
  }
  if (fs.existsSync(pkgPath)) {
    pkg = require(pkgPath)
  }

  const yylServerOption: YylServerWebpackPluginOption = {
    context: alias.dirname,
    devServer: {
      noInfo: false,
      contentBase: alias.root,
      port: yylConfig?.localserver?.port || 5000,
      hot: !!env?.hmr
    },
    proxy: {
      hosts: [
        yylConfig?.commit?.hostname || '',
        yylConfig?.commit?.mainHost || '',
        yylConfig?.commit?.staticHost || ''
      ].filter((x) => x !== ''),
      enable: !env.proxy && !env.remote
    },
    homePage: yylConfig?.proxy?.homePage,
    HtmlWebpackPlugin
  }

  const r: InitYylPluginsResult = {
    plugins: [],
    devServer: YylServerWebpackPlugin.initDevServerConfig(yylServerOption)
  }
  r.plugins = [
    // pop
    new YylEnvPopPlugin({
      enable: !!env.tips,
      text: `${pkg.name} - ${extOs.LOCAL_IP}:${devServer.port}`,
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
        path.relative(resolveRoot, path.join(alias.revDest, './rev-mainfest.json'))
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

  return r
}
