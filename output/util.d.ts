import { YylConfig, Env } from 'yyl-config-types';
import { YylServerWebpackPluginOption } from 'yyl-server-webpack-plugin';
export interface InitProxiesOption {
    yylConfig?: YylConfig;
    env?: Env;
}
/** 初始化 proxy 配置 */
export declare function initProxies(op: InitProxiesOption): Required<YylServerWebpackPluginOption>['proxy'];
