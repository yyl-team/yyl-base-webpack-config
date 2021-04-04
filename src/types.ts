import { Env, YylConfig, YylConfigAlias } from 'yyl-config-types'
import { Configuration } from 'webpack'
import { Logger } from 'yyl-seed-base'
export interface Alias extends YylConfigAlias {}

/** 初始化基础配置 */
export interface InitBaseOption {
  resolveRoot: string
  env: Env
  alias: Required<Alias>
  yylConfig?: YylConfig
  logger: Logger
}
