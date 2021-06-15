import type { DefinePlugin, HotModuleReplacementPlugin } from 'webpack'

interface WebpackEntry {
  DefinePlugin: typeof DefinePlugin
  HotModuleReplacementPlugin: typeof HotModuleReplacementPlugin
}

export const webpackLoader: WebpackEntry = require('webpack')
