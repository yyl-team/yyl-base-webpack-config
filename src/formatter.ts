import path from 'path'
import { type } from 'yyl-util'
import { require } from '../typing/global'
/** 格式化路径 */
export function formatPath(str: string) {
  return str.split(path.sep).join('/')
}

export function isModuleInclude(iPath: string, arr: string[]) {
  if (type(arr) !== 'array') {
    return false
  }
  const matchModule = arr.filter((pkg) => {
    const pkgPath = path.join('node_modules', pkg)
    return iPath.includes(pkgPath)
  })
  return !!matchModule[0]
}

export function resolveModule(ctx: string) {
  return require.resolve(ctx)
}
