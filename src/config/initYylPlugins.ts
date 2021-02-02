import fs from 'fs'
import path from 'path'
import extOs from 'yyl-os'
import { WebpackOptionsNormalized } from 'webpack'
import YylConcatWebpackPlugin from 'yyl-concat-webpack-plugin'
import YylCopyWebpackPlugin, { YylCopyWebpackPluginOption } from 'yyl-copy-webpack-plugin'
import YylSugarWebpackPlugin from 'yyl-sugar-webpack-plugin'
import YylRevWebpackPlugin from 'yyl-rev-webpack-plugin'
import YylEnvPopPlugin from 'yyl-env-pop-webpack-plugin'
import { InitBaseOption } from '../types'
export type InitYylPluginsResult = Pick<WebpackOptionsNormalized, 'plugins'>
export function initYylPlugins(op: InitBaseOption) {
  const { env, alias, devServer, yylConfig } = op
  const pkgPath = path.join(alias.dirname, 'package.json')
  let pkg = {
    name: 'default'
  }
  if (fs.existsSync(pkgPath)) {
    pkg = require(pkgPath)
  }
  const r: InitYylPluginsResult = {
    plugins: []
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
      basePath: alias.dirname,
      minify: !!env?.isCommit
    }),
    // copy
    new YylCopyWebpackPlugin(
      (() => {
        const r: YylCopyWebpackPluginOption = {
          files: [],
          minify: false,
          basePath: alias.dirname
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
    )
    // sugar TODO:
  ]

  return r
}
