import { Configuration } from 'webpack';
import { InitBaseOption } from '../types';
/** 初始化 wConfig module 部分 - 返回值 */
export declare type InitModuleResult = Required<Pick<Configuration, 'module' | 'resolve' | 'plugins'>>;
/** 初始化 wConfig module 部分 */
export declare function initModule(op: InitBaseOption): Required<Pick<Configuration, "module" | "resolve" | "plugins">>;
