import fs from 'fs'
import path from 'path'
import extOs from 'yyl-os'
import { WebpackOptionsNormalized } from 'webpack'
import YylConcatWebpackPlugin from 'yyl-concat-webpack-plugin'
import YylCopyWebpackPlugin from 'yyl-copy-webpack-plugin'
import YylSugarWebpackPlugin from 'yyl-sugar-webpack-plugin'
import YylRevWebpackPlugin from 'yyl-rev-webpack-plugin'
import YylEnvPopPlugin from 'yyl-env-pop-webpack-plugin'
import { InitBaseOption } from '../types'
export type InitYylPluginsResult = Pick<WebpackOptionsNormalized, 'plugins'>
export function initYylPlugins(op: InitBaseOption) {
  const { env, alias, devServer } = op
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
    new YylEnvPopPlugin({
      enable: !!env.tips,
      text: `${pkg.name} - ${extOs.LOCAL_IP}:${devServer.port}`,
      duration: 3000
    })
  ]

  return r
}
