import { Configuration } from 'webpack';
import { InitBaseOption } from '../types';
export declare type InitYylPluginsResult = Required<Pick<Configuration, 'plugins' | 'devServer'>>;
export interface InitYylPluginsOption extends InitBaseOption {
    publicPath: string;
    devServer: Configuration['devServer'] | false;
}
export declare function initYylPlugins(op: InitYylPluginsOption): Required<Pick<Configuration, "plugins" | "devServer">>;
