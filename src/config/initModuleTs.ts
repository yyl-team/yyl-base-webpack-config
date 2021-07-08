import type { Configuration } from 'webpack'
import { InitBaseOption } from '../types'
import util, { path } from 'yyl-util'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import fs from 'fs'

/** 初始化 wConfig module 部分 - 返回值 */
export type InitModuleResult = Required<Pick<Configuration, 'module' | 'plugins' | 'resolve'>>

/** 初始化 wConfig module 部分 */
export function initModuleTs(op: InitBaseOption) {
  const { yylConfig, alias, resolveRoot, env } = op

  const wConfig: InitModuleResult = {
    module: {
      rules: []
    },
    plugins: [],
    resolve: {
      extensions: ['.tsx', '.ts'],
      plugins: []
    }
  }

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
    }
  }
  // - ts

  return wConfig
}
