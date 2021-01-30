import { WebpackOptionsNormalized } from 'webpack';
import { InitBaseOption } from '../types';
export declare type InitYylPluginsResult = Pick<WebpackOptionsNormalized, 'plugins'>;
export declare function initYylPlugins(op: InitBaseOption): Pick<WebpackOptionsNormalized, "plugins">;
