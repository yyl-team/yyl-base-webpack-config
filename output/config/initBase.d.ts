import { WebpackOptionsNormalized } from 'webpack';
import { InitBaseOption } from '../types';
export interface DefinePluginOption {
    [key: string]: any;
}
export declare type InitBaseResult = Pick<WebpackOptionsNormalized, 'mode' | 'cache' | 'context' | 'output' | 'resolveLoader' | 'resolve' | 'devtool' | 'plugins' | 'optimization'>;
export declare function initBase(option: InitBaseOption): Pick<WebpackOptionsNormalized, "mode" | "cache" | "context" | "output" | "resolveLoader" | "resolve" | "devtool" | "plugins" | "optimization">;
