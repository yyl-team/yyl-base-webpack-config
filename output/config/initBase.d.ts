import { Configuration } from 'webpack';
import { InitBaseOption } from '../types';
export interface DefinePluginOption {
    [key: string]: any;
}
export declare type InitBaseResult = Required<Pick<Configuration, 'mode' | 'cache' | 'context' | 'output' | 'resolveLoader' | 'resolve' | 'devtool' | 'plugins' | 'optimization'>>;
export declare function initBase(option: InitBaseOption): Required<Pick<Configuration, "mode" | "cache" | "context" | "output" | "resolveLoader" | "resolve" | "devtool" | "plugins" | "optimization">>;
