import { WebpackOptionsNormalized } from 'webpack';
import { InitBaseOption } from '../types';
/** 初始化入口和输出html-返回结果 */
export declare type InitEntryResult = Pick<WebpackOptionsNormalized, 'entry' | 'plugins'>;
export interface OutputMap {
    [key: string]: string;
}
/** 初始化入口和输出html */
export declare function initEntry(option: InitBaseOption): Pick<WebpackOptionsNormalized, "entry" | "plugins">;
