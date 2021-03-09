import { Configuration } from 'webpack';
import { InitBaseOption } from '../types';
export declare type InitYylPluginsResult = Required<Pick<Configuration, 'plugins'>>;
export declare function initYylPlugins(op: InitBaseOption): Required<Pick<Configuration, "plugins">>;
