import { Express } from 'express';
import { Env, YylConfig, Logger } from 'yyl-config-types';
import { Compiler } from 'webpack';
export interface InitMiddleWareOption {
    app: Express;
    compiler: Compiler;
    env?: Env;
    yylConfig?: YylConfig;
    logger?: Logger;
}
/** 初始化中间件 */
export declare function initMiddleWare(op: InitMiddleWareOption): void;
