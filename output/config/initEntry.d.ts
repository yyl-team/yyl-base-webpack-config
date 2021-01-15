import { WebpackOptionsNormalized } from 'webpack';
import { InitBaseOption } from '../types';
/** 初始化入口和输出html-返回结果 */
export interface InitEntryResult {
    entry: WebpackOptionsNormalized['entry'];
    plugins: WebpackOptionsNormalized['plugins'];
}
export interface OutputMap {
    [key: string]: string;
}
/** 初始化入口和输出html */
export declare function initEntry(option: InitBaseOption): InitEntryResult;
