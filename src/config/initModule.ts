import type { Configuration } from 'webpack'
import { InitBaseOption } from '../types'
import { merge } from 'webpack-merge'
import { initModuleBase } from './initModuleBase'
import { initModuleJs } from './initModuleJs'
import { initModuleScss } from './initModuleScss'
import { initModuleTs } from './initModuleTs'
import { initModuleEsbuild } from './initModuleEsbuild'

/** 初始化 wConfig module 部分 - 返回值 */
export type InitModuleResult = Required<
  Pick<Configuration, 'module' | 'resolve' | 'plugins' | 'optimization'>
>

/** 初始化 wConfig module 部分 */
export function initModule(op: InitBaseOption): InitModuleResult {
  const { env } = op
  if (env.esbuild) {
    return merge<any>(initModuleBase(op), initModuleEsbuild(op))
  } else {
    return merge<any>(initModuleBase(op), initModuleJs(op), initModuleTs(op), initModuleScss(op))
  }
}
