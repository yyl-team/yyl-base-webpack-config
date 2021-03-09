import { Configuration } from 'webpack';
import { YylConfig, Env } from 'yyl-config-types';
import { Alias } from './types';
export interface YylBaseInitConfigOption {
    /** 当前路径 */
    context: string;
    /** 环境变量 */
    env?: Env;
    /** yyl.config */
    yylConfig?: YylConfig;
    alias?: Alias;
    devServer?: {
        port: number;
    };
}
export declare type YylBaseInitConfigProperty = Required<YylBaseInitConfigOption>;
export default function yylBaseInitConfig(op?: YylBaseInitConfigOption): Configuration;
