/*!
 * yyl-react-ts-config-webpack-plugin cjs 0.1.0
 * (c) 2020 - 2021 jackness
 * Released under the MIT License.
 */
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var merge = _interopDefault(require('webpack-merge'));
var path = _interopDefault(require('path'));
var webpack = require('webpack');
var util = require('yyl-util');
var util__default = _interopDefault(util);
var TerserWebpackPlugin = _interopDefault(require('terser-webpack-plugin'));
var OptimizeCSSAssetsPlugin = _interopDefault(require('optimize-css-assets-webpack-plugin'));
var extFs = _interopDefault(require('yyl-fs'));
var fs = _interopDefault(require('fs'));
var HtmlWebpackPlugin = _interopDefault(require('html-webpack-plugin'));
var autoprefixer = _interopDefault(require('autoprefixer'));
var px2rem = _interopDefault(require('postcss-px2rem'));
var sass = _interopDefault(require('sass'));
var MiniCssExtractPlugin = _interopDefault(require('mini-css-extract-plugin'));

/** 格式化路径 */
function formatPath(str) {
    return str.split(path.sep).join('/');
}
function isModuleInclude(iPath, arr) {
    if (util.type(arr) !== 'array') {
        return false;
    }
    const matchModule = arr.filter((pkg) => {
        const pkgPath = path.join('node_modules', pkg);
        return iPath.includes(pkgPath);
    });
    return !!matchModule[0];
}
function resolveModule(ctx) {
    return require.resolve(ctx);
}

function initBase(option) {
    const { resolveRoot, alias, yylConfig, env } = option;
    const nodeModulesPath = path.join(alias.dirname, 'node_modules');
    const wConfig = {
        node: {},
        mode: 'development',
        cache: {
            type: 'memory'
        },
        entry: {},
        experiments: {},
        externals: [],
        externalsPresets: {},
        infrastructureLogging: {},
        module: {},
        snapshot: {},
        stats: {},
        watchOptions: {},
        context: path.resolve(__dirname, alias.dirname),
        output: {
            path: resolveRoot,
            filename: formatPath(path.relative(resolveRoot, path.join(alias.jsDest, '[name]-[hash:8].js'))),
            chunkFilename: formatPath(path.relative(resolveRoot, path.join(alias.jsDest, 'async_component/[name]-[chunkhash:8].js')))
        },
        resolveLoader: {
            modules: [nodeModulesPath]
        },
        resolve: {
            modules: [nodeModulesPath],
            alias: Object.assign(Object.assign({}, alias), yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.alias)
        },
        devtool: 'source-map',
        plugins: [],
        optimization: {
            minimizer: [
                new TerserWebpackPlugin({
                    extractComments: false,
                    terserOptions: {
                        ie8: false,
                        keep_fnames: false
                    }
                }),
                new OptimizeCSSAssetsPlugin({})
            ]
        }
    };
    // 环境变量
    wConfig.plugins.push((() => {
        const r = {};
        Object.keys(env).forEach((key) => {
            if (typeof env[key] === 'string') {
                r[`process.env.${key}`] = JSON.stringify(env[key]);
            }
            else {
                r[`process.env.${key}`] = env[key];
            }
        });
        return new webpack.DefinePlugin(r);
    })());
    // 补充 node_modules
    if (yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.resolveModule) {
        if (wConfig.resolve.modules) {
            wConfig.resolve.modules.unshift(yylConfig.resolveModule);
        }
        if (wConfig.resolveLoader.modules) {
            wConfig.resolveLoader.modules.unshift(yylConfig.resolveModule);
        }
    }
    // 环境区分
    if (env.proxy || env.remote) {
        wConfig.output.publicPath = util__default.path.join(alias.hostname, alias.basePath, path.relative(alias.root, resolveRoot), '/');
    }
    else if (env.isCommit) {
        wConfig.mode = 'production';
        wConfig.output.publicPath = util__default.path.join(alias.hostname, alias.basePath, path.relative(alias.root, resolveRoot), '/');
    }
    else {
        wConfig.output.publicPath = util__default.path.join(alias.basePath, path.relative(alias.root, resolveRoot), '/');
    }
    wConfig.plugins.push(new webpack.DefinePlugin({
        'process.env.NODE_ENV': env.NODE_ENV || wConfig.mode
    }));
    // TODO: yyl 系列 plugins 引入
    return wConfig;
}

const OUTPUT_HTML_REG = /(\.jade|\.pug|\.html)$/;
function ignoreExtName(iPath) {
    return iPath.replace(/(\.jade|.pug|\.html|\.js|\.css|\.ts|\.tsx|\.jsx)$/, '');
}
/** 初始化入口和输出html */
function initEntry(option) {
    const { env, alias, resolveRoot } = option;
    const wConfig = {
        entry: (() => {
            const { srcRoot } = alias;
            const r = {};
            const entryPath = path.join(srcRoot, 'entry');
            if (fs.existsSync(entryPath)) {
                const fileList = extFs.readFilesSync(entryPath);
                fileList.forEach((filePath) => {
                    const key = ignoreExtName(path.basename(filePath));
                    if (key) {
                        r[key] = {
                            import: [filePath]
                        };
                        if (env.useHotPlugin) ;
                    }
                });
            }
            return r;
        })(),
        plugins: []
    };
    wConfig.plugins = wConfig.plugins.concat((() => {
        const { srcRoot } = alias;
        const bootPath = path.join(srcRoot, 'boot');
        const entryPath = path.join(srcRoot, 'entry');
        let outputPath = [];
        if (fs.existsSync(bootPath)) {
            outputPath = outputPath.concat(extFs.readFilesSync(bootPath, OUTPUT_HTML_REG));
        }
        if (fs.existsSync(entryPath)) {
            outputPath = outputPath.concat(extFs.readFilesSync(entryPath, OUTPUT_HTML_REG));
        }
        const outputMap = {};
        outputPath.forEach((iPath) => {
            outputMap[ignoreExtName(path.basename(iPath))] = iPath;
        });
        const commonChunks = [];
        Object.keys(wConfig.entry).forEach((key) => {
            if (key in outputMap) ;
            else {
                // common chunk
                commonChunks.push(key);
            }
        });
        return outputPath.map((iPath) => {
            const filename = ignoreExtName(path.basename(iPath));
            let iChunks = [];
            iChunks = iChunks.concat(commonChunks);
            if (filename in wConfig.entry) {
                iChunks.push(filename);
            }
            const opts = {
                template: iPath,
                filename: path.relative(resolveRoot, path.join(alias.htmlDest, `${filename}.html`)),
                chunks: iChunks,
                chunksSortMode(a, b) {
                    return iChunks.indexOf(a) - iChunks.indexOf(b);
                },
                inlineSource: '.(js|css|ts|tsx|jsx)\\?__inline$',
                minify: false,
                inject: 'body',
                process: {
                    env: env
                }
            };
            return new HtmlWebpackPlugin(opts);
        });
    })());
    return wConfig;
}

const NODE_MODULES_REG = /node_modules/;
const IS_VUE_REG = /\.vue\.js/;
/** 初始化 wConfig module 部分 */
function initModule(op) {
    const { yylConfig, alias, resolveRoot, env } = op;
    const urlLoaderOptions = {
        limit: (yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.base64Limit) ? 3000 : Number((yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.base64Limit) || 0),
        name: '[name]-[hash:8].[ext]',
        chunkFilename: 'async_component/[name]-[chunkhash:8].[ext]',
        outputPath: util.path.relative(resolveRoot, alias.imagesDest),
        publicPath: (function () {
            let r = util__default.path.join(alias.basePath, util.path.relative(resolveRoot, alias.imagesDest), '/');
            if (env.proxy || env.remote || env.isCommit) {
                r = util__default.path.join(alias.publicPath, r);
            }
            return r;
        })()
    };
    const wConfig = {
        module: {
            rules: [
                // js
                {
                    test: /\.jsx?$/,
                    exclude(file) {
                        if (file.match(NODE_MODULES_REG)) {
                            if ((yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.babelLoaderIncludes) &&
                                isModuleInclude(file, yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.babelLoaderIncludes)) {
                                return false;
                            }
                            else if (file.match(IS_VUE_REG)) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }
                        else {
                            return false;
                        }
                    },
                    use: [
                        {
                            loader: resolveModule('babel-loader'),
                            options: {
                                babelrc: false,
                                cacheDirectory: true,
                                presets: [[resolveModule('@babel/preset-env'), { modules: 'commonjs' }]],
                                plugins: [
                                    // Stage 2
                                    [resolveModule('@babel/plugin-proposal-decorators'), { legacy: true }],
                                    [resolveModule('@babel/plugin-proposal-class-properties'), { loose: true }],
                                    resolveModule('@babel/plugin-proposal-function-sent'),
                                    resolveModule('@babel/plugin-proposal-export-namespace-from'),
                                    resolveModule('@babel/plugin-proposal-numeric-separator'),
                                    resolveModule('@babel/plugin-proposal-throw-expressions'),
                                    resolveModule('@babel/plugin-syntax-dynamic-import')
                                ]
                            }
                        }
                    ]
                },
                // pug
                {
                    test: /\.(pug|jade)$/,
                    oneOf: [
                        {
                            resourceQuery: /^\?vue/,
                            loader: resolveModule('pug-plain-loader'),
                            options: {
                                self: true
                            }
                        },
                        {
                            loader: resolveModule('pug-loader'),
                            options: {
                                self: true
                            }
                        }
                    ]
                },
                // lib js
                {
                    test: util.path.join(alias.srcRoot, 'js/lib/'),
                    use: [
                        {
                            loader: resolveModule('imports-loader'),
                            options: 'this=>window'
                        }
                    ]
                },
                // images
                {
                    test: /\.(png|jpg|gif|webp|ico)$/,
                    use: [
                        {
                            loader: resolveModule('url-loader'),
                            options: urlLoaderOptions
                        }
                    ]
                }
            ]
        },
        resolve: {
            extensions: ['.js', '.json', '.wasm', '.mjs', '.jsx'],
            plugins: []
        },
        plugins: []
    };
    // url loader 补充
    if ((yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.urlLoaderMatch) && wConfig.module.rules) {
        wConfig.module.rules.push({
            test: yylConfig.urlLoaderMatch,
            use: [
                {
                    loader: resolveModule('url-loader'),
                    options: urlLoaderOptions
                }
            ]
        });
    }
    // + css & scss
    const cssUse = [
        {
            loader: resolveModule('style-loader'),
            options: {
                attrs: {
                    'data-module': (yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.name) || 'inline-style'
                }
            }
        },
        resolveModule('css-loader'),
        {
            loader: resolveModule('postcss-loader'),
            options: {
                ident: 'postcss',
                plugins() {
                    const r = [];
                    if ((yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.platform) === 'pc') {
                        r.push(autoprefixer({
                            overrideBrowserslist: ['> 1%', 'last 2 versions']
                        }));
                    }
                    else {
                        r.push(autoprefixer({
                            overrideBrowserslist: ['iOS >= 7', 'Android >= 4']
                        }));
                        if ((yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.px2rem) !== false) {
                            r.push(px2rem({ remUnit: 75 }));
                        }
                    }
                    return r;
                }
            }
        }
    ];
    if (env.isCommit || env.remote) {
        // 发版
        // 去掉 style-loader, 添加 mini-css-extract-plugin loader
        cssUse.splice(0, 1, {
            loader: MiniCssExtractPlugin.loader,
            options: {}
        });
        wConfig.plugins.push(new MiniCssExtractPlugin({
            filename: util__default.path.relative(resolveRoot, util.path.join(alias.cssDest, '[name]-[hash:8].css')),
            chunkFilename: util__default.path.relative(resolveRoot, util.path.join(alias.cssDest, '[name]-[chunkhash:8].css'))
        }));
    }
    if (wConfig.module.rules) {
        wConfig.module.rules.push({
            test: /\.css$/,
            use: cssUse
        });
        wConfig.module.rules.push({
            test: /\.(scss|sass)$/,
            use: cssUse.concat([
                {
                    loader: resolveModule('sass-loader'),
                    options: {
                        implementation: sass
                    }
                }
            ])
        });
    }
    // - css & scss
    // + ts
    const localTsConfigPath = util.path.join(alias.dirname, 'tsconfig.json');
    if (fs.existsSync(localTsConfigPath)) {
        const localPkgPath = util.path.join(alias.dirname, 'package.json');
        const localTsLoaderPath = util.path.join(alias.dirname, 'node_modules', 'ts-loader');
        const localTsLoaderExists = fs.existsSync(localTsLoaderPath);
        let useProjectTs = false;
        if (fs.existsSync(localPkgPath)) {
            const localPkg = require(localPkgPath);
            if (localPkg.dependencies &&
                localPkg.dependencies['ts-loader'] &&
                localPkg.dependencies.typescript &&
                localTsLoaderExists) {
                useProjectTs = true;
            }
            if (wConfig.module.rules) {
                wConfig.module.rules.push({
                    test: /\.tsx?$/,
                    use: [
                        // happyPackLoader('ts')
                        {
                            loader: useProjectTs
                                ? require.resolve(localTsLoaderPath)
                                : require.resolve('ts-loader'),
                            options: {
                                appendTsSuffixTo: [/\.vue$/],
                                context: alias.dirname,
                                configFile: 'tsconfig.json'
                            }
                        }
                    ]
                });
            }
            if (wConfig.resolve.extensions) {
                wConfig.resolve.extensions = wConfig.resolve.extensions.concat(['.tsx', '.ts']);
            }
        }
    }
    // - ts
    return wConfig;
}

module.exports = class YylReactTsConfigWebpackPlugin {
    constructor(op) {
        var _a, _b, _c;
        this.context = process.cwd();
        this.env = {};
        this.alias = {
            root: './dist',
            srcRoot: './src',
            dirname: './',
            jsDest: './dist/js',
            cssDest: './dist/css',
            imagesDest: './dist/images',
            htmlDest: './dist/html',
            basePath: '/',
            publicPath: '/'
        };
        if (op === null || op === void 0 ? void 0 : op.context) {
            this.context = path.resolve(__dirname, op.context);
        }
        if (op === null || op === void 0 ? void 0 : op.alias) {
            this.alias = Object.assign(Object.assign({}, this.alias), op.alias);
        }
        if (op === null || op === void 0 ? void 0 : op.yylConfig) {
            this.yylConfig = op.yylConfig;
            // 字段兼容
            if ((_a = this.yylConfig.dest) === null || _a === void 0 ? void 0 : _a.basePath) {
                this.alias.basePath = this.yylConfig.dest.basePath;
            }
            if ((_b = this.yylConfig.commit) === null || _b === void 0 ? void 0 : _b.hostname) {
                this.alias.publicPath = this.yylConfig.commit.hostname;
            }
            if ((_c = this.yylConfig) === null || _c === void 0 ? void 0 : _c.alias) {
                this.alias = Object.assign(Object.assign({}, this.alias), this.yylConfig.alias);
            }
        }
    }
    apply(compiler) {
        const { alias, env, yylConfig } = this;
        const { options } = compiler;
        if (options.context) {
            this.context = path.resolve(__dirname, options.context);
        }
        // 路径纠正
        Object.keys(alias).forEach((key) => {
            const iKey = key;
            alias[iKey] = path.resolve(__dirname, alias[iKey]);
        });
        // dist 目录
        const resolveRoot = path.resolve(__dirname, alias.root);
        const baseWConfig = initBase({ yylConfig, env, alias, resolveRoot });
        const entryWConfig = initEntry({ yylConfig, env, alias, resolveRoot });
        const moduleWConfig = initModule({ yylConfig, env, alias, resolveRoot });
        compiler.options = merge(options, baseWConfig, entryWConfig, moduleWConfig);
    }
};
