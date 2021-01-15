import { WebpackOptionsNormalized } from 'webpack';
import { InitBaseOption } from '../types';
/** 初始化 wConfig module 部分 - 返回值 */
export interface InitModuleResult {
    module: WebpackOptionsNormalized['module'];
    resolve: WebpackOptionsNormalized['resolve'];
    plugins: WebpackOptionsNormalized['plugins'];
}
/** 初始化 wConfig module 部分 */
export declare function initModule(op: InitBaseOption): InitModuleResult;
