import { YylConfig, Env } from 'yyl-config-types';
import { Alias } from './types';
export interface YylReactTsConfigWebpackPluginOption {
    /** 当前路径 */
    context: string;
    /** 环境变量 */
    env?: Env;
    /** yyl.config */
    yylConfig?: YylConfig;
    alias?: Alias;
}
export declare type YylReactTsConfigWebpackPluginProperty = Required<YylReactTsConfigWebpackPluginOption>;
