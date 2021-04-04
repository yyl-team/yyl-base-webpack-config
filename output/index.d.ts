import { Configuration } from 'webpack';
import { YylConfig, Env } from 'yyl-config-types';
import { Alias } from './types';
import { Logger } from 'yyl-seed-base';
export * from './initMiddleware';
export interface InitYylBaseConfigOption {
    /** 当前路径 */
    context: string;
    /** 环境变量 */
    env?: Env;
    /** yyl.config */
    yylConfig?: YylConfig;
    alias?: Alias;
    /** devServer false 表示不配置 devServer */
    devServer?: Configuration['devServer'] | false;
    /** 日志输出 */
    logger?: Logger;
}
export declare type InitYylBaseConfigProperty = Required<InitYylBaseConfigOption>;
export declare function initYylBaseConfig(op?: InitYylBaseConfigOption): Configuration;
