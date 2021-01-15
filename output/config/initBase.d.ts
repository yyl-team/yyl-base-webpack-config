import { WebpackOptionsNormalized } from 'webpack';
import { InitBaseOption } from '../types';
export interface DefinePluginOption {
    [key: string]: any;
}
export declare type InitBaseResult = WebpackOptionsNormalized;
export declare function initBase(option: InitBaseOption): WebpackOptionsNormalized;
