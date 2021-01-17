import { WebpackOptionsNormalized } from 'webpack';
import { InitBaseOption } from '../types';
/** 初始化 wConfig module 部分 - 返回值 */
export declare type InitModuleResult = Pick<WebpackOptionsNormalized, 'module' | 'resolve' | 'plugins'>;
/** 初始化 wConfig module 部分 */
export declare function initModule(op: InitBaseOption): Pick<WebpackOptionsNormalized, "module" | "resolve" | "plugins">;
