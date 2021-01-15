import { Compiler } from 'webpack';
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
declare type AliasProperty = Required<YylReactTsConfigWebpackPluginProperty['alias']>;
export declare type YylReactTsConfigWebpackPluginProperty = Required<YylReactTsConfigWebpackPluginOption>;
export declare class YylReactTsConfigWebpackPlugin {
    context: YylReactTsConfigWebpackPluginProperty['context'];
    env: YylReactTsConfigWebpackPluginProperty['env'];
    yylConfig: YylReactTsConfigWebpackPluginOption['yylConfig'];
    alias: AliasProperty;
    constructor(op?: YylReactTsConfigWebpackPluginOption);
    apply(compiler: Compiler): void;
}
export {};
