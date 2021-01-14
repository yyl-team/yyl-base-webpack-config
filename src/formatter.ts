import path from 'path'
/** 格式化路径 */
export function formatPath(str: string) {
  return str.split(path.sep).join('/')
}
