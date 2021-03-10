/*!
 * yyl-base-webpack-config cjs 0.1.4
 * (c) 2020 - 2021 
 * Released under the MIT License.
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var merge = require('webpack-merge');
var path = require('path');
var webpack = require('webpack');
var util = require('yyl-util');
var OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
var extFs = require('yyl-fs');
var fs = require('fs');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var autoprefixer = require('autoprefixer');
var px2rem = require('postcss-pxtorem');
var sass = require('sass');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var extOs = require('yyl-os');
var YylConcatWebpackPlugin = require('yyl-concat-webpack-plugin');
var YylCopyWebpackPlugin = require('yyl-copy-webpack-plugin');
var YylSugarWebpackPlugin = require('yyl-sugar-webpack-plugin');
var YylRevWebpackPlugin = require('yyl-rev-webpack-plugin');
var YylEnvPopPlugin = require('yyl-env-pop-webpack-plugin');
var YylServerWebpackPlugin = require('yyl-server-webpack-plugin');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var merge__default = /*#__PURE__*/_interopDefaultLegacy(merge);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var util__default = /*#__PURE__*/_interopDefaultLegacy(util);
var OptimizeCSSAssetsPlugin__default = /*#__PURE__*/_interopDefaultLegacy(OptimizeCSSAssetsPlugin);
var extFs__default = /*#__PURE__*/_interopDefaultLegacy(extFs);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var HtmlWebpackPlugin__default = /*#__PURE__*/_interopDefaultLegacy(HtmlWebpackPlugin);
var autoprefixer__default = /*#__PURE__*/_interopDefaultLegacy(autoprefixer);
var px2rem__default = /*#__PURE__*/_interopDefaultLegacy(px2rem);
var sass__default = /*#__PURE__*/_interopDefaultLegacy(sass);
var MiniCssExtractPlugin__default = /*#__PURE__*/_interopDefaultLegacy(MiniCssExtractPlugin);
var extOs__default = /*#__PURE__*/_interopDefaultLegacy(extOs);
var YylConcatWebpackPlugin__default = /*#__PURE__*/_interopDefaultLegacy(YylConcatWebpackPlugin);
var YylCopyWebpackPlugin__default = /*#__PURE__*/_interopDefaultLegacy(YylCopyWebpackPlugin);
var YylSugarWebpackPlugin__default = /*#__PURE__*/_interopDefaultLegacy(YylSugarWebpackPlugin);
var YylRevWebpackPlugin__default = /*#__PURE__*/_interopDefaultLegacy(YylRevWebpackPlugin);
var YylEnvPopPlugin__default = /*#__PURE__*/_interopDefaultLegacy(YylEnvPopPlugin);
var YylServerWebpackPlugin__default = /*#__PURE__*/_interopDefaultLegacy(YylServerWebpackPlugin);

/** 格式化路径 */
function formatPath(str) {
    return str.split(path__default['default'].sep).join('/');
}
function isModuleInclude(iPath, arr) {
    if (util.type(arr) !== 'array') {
        return false;
    }
    const matchModule = arr.filter((pkg) => {
        const pkgPath = path__default['default'].join('node_modules', pkg);
        return iPath.includes(pkgPath);
    });
    return !!matchModule[0];
}
function resolveModule(ctx) {
    return require.resolve(ctx);
}

function initBase(option) {
    const { resolveRoot, alias, yylConfig, env } = option;
    const nodeModulesPath = path__default['default'].join(alias.dirname, 'node_modules');
    const wConfig = {
        mode: 'development',
        cache: {
            type: 'memory'
        },
        context: path__default['default'].resolve(__dirname, alias.dirname),
        output: {
            path: resolveRoot,
            filename: formatPath(path__default['default'].relative(resolveRoot, path__default['default'].join(alias.jsDest, '[name]-[chunkhash:8].js'))),
            chunkFilename: formatPath(path__default['default'].relative(resolveRoot, path__default['default'].join(alias.jsDest, 'async_component/[name]-[chunkhash:8].js')))
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
            minimizer: [new OptimizeCSSAssetsPlugin__default['default']({})]
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
        wConfig.output.publicPath = util__default['default'].path.join(alias.hostname, alias.basePath, path__default['default'].relative(alias.root, resolveRoot), '/');
    }
    else if (env.isCommit) {
        wConfig.mode = 'production';
        wConfig.output.publicPath = util__default['default'].path.join(alias.hostname, alias.basePath, path__default['default'].relative(alias.root, resolveRoot), '/');
    }
    else {
        wConfig.output.publicPath = util__default['default'].path.join(alias.basePath, path__default['default'].relative(alias.root, resolveRoot), '/');
    }
    wConfig.plugins.push(new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV || wConfig.mode)
    }));
    // TODO: yyl 系列 plugins 引入
    return wConfig;
}

const OUTPUT_HTML_REG = /(\.jade|\.pug|\.html)$/;
const ENTRY_ERG = /\.(js|tsx?)$/;
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
            const entryPath = path__default['default'].join(srcRoot, 'entry');
            if (fs__default['default'].existsSync(entryPath)) {
                const fileList = extFs__default['default'].readFilesSync(entryPath, ENTRY_ERG);
                fileList.forEach((filePath) => {
                    const key = ignoreExtName(path__default['default'].basename(filePath));
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
        const bootPath = path__default['default'].join(srcRoot, 'boot');
        const entryPath = path__default['default'].join(srcRoot, 'entry');
        let outputPath = [];
        if (fs__default['default'].existsSync(bootPath)) {
            outputPath = outputPath.concat(extFs__default['default'].readFilesSync(bootPath, OUTPUT_HTML_REG));
        }
        if (fs__default['default'].existsSync(entryPath)) {
            outputPath = outputPath.concat(extFs__default['default'].readFilesSync(entryPath, OUTPUT_HTML_REG));
        }
        const outputMap = {};
        outputPath.forEach((iPath) => {
            outputMap[ignoreExtName(path__default['default'].basename(iPath))] = iPath;
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
            const filename = ignoreExtName(path__default['default'].basename(iPath));
            let iChunks = [];
            iChunks = iChunks.concat(commonChunks);
            if (typeof wConfig.entry === 'object') {
                if (filename in wConfig.entry) {
                    iChunks.push(filename);
                }
            }
            const opts = {
                template: iPath,
                filename: path__default['default'].relative(resolveRoot, path__default['default'].join(alias.htmlDest, `${filename}.html`)),
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
            return new HtmlWebpackPlugin__default['default'](opts);
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
        esModule: false,
        name: '[name]-[hash:8].[ext]',
        chunkFilename: 'async_component/[name]-[chunkhash:8].[ext]',
        outputPath: util.path.relative(resolveRoot, alias.imagesDest),
        publicPath: (function () {
            let r = util__default['default'].path.join(alias.basePath, util.path.relative(resolveRoot, alias.imagesDest), '/');
            if (env.proxy || env.remote || env.isCommit) {
                r = util__default['default'].path.join(alias.publicPath, r);
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
                            loader: resolveModule('pug-loader')
                        }
                    ]
                },
                // lib js
                {
                    test: util.path.join(alias.srcRoot, 'js/lib/'),
                    use: [
                        {
                            loader: `${resolveModule('imports-loader')}?this=?window`
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
                attributes: {
                    'data-module': (yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.name) || 'inline-style'
                }
            }
        },
        resolveModule('css-loader'),
        {
            loader: resolveModule('postcss-loader'),
            options: {
                postcssOptions: {
                    plugins: (() => {
                        const r = [];
                        if ((yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.platform) === 'pc') {
                            r.push(autoprefixer__default['default']({
                                overrideBrowserslist: ['> 1%', 'last 2 versions']
                            }));
                        }
                        else {
                            r.push(autoprefixer__default['default']({
                                overrideBrowserslist: ['iOS >= 7', 'Android >= 4']
                            }));
                        }
                        if ((yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.px2rem) === true) {
                            r.push(px2rem__default['default']({ unitPrecision: 75 }));
                        }
                        return r;
                    })()
                }
            }
        }
    ];
    if (env.isCommit || env.remote) {
        // 发版
        // 去掉 style-loader, 添加 mini-css-extract-plugin loader
        cssUse.splice(0, 1, {
            loader: MiniCssExtractPlugin__default['default'].loader,
            options: {}
        });
        wConfig.plugins.push(new MiniCssExtractPlugin__default['default']({
            filename: util__default['default'].path.relative(resolveRoot, util.path.join(alias.cssDest, '[name]-[chunkhash:8].css')),
            chunkFilename: util__default['default'].path.relative(resolveRoot, util.path.join(alias.cssDest, '[name]-[chunkhash:8].css'))
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
                        implementation: sass__default['default']
                    }
                }
            ])
        });
    }
    // - css & scss
    // + ts
    const localTsConfigPath = util.path.join(alias.dirname, 'tsconfig.json');
    if (fs__default['default'].existsSync(localTsConfigPath)) {
        const localPkgPath = util.path.join(alias.dirname, 'package.json');
        const localTsLoaderPath = util.path.join(alias.dirname, 'node_modules', 'ts-loader');
        const localTsLoaderExists = fs__default['default'].existsSync(localTsLoaderPath);
        let useProjectTs = false;
        if (fs__default['default'].existsSync(localPkgPath)) {
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

function initYylPlugins(op) {
    var _a, _b, _c, _d, _e, _f;
    const { env, alias, devServer, yylConfig, resolveRoot } = op;
    const pkgPath = path__default['default'].join(alias.dirname, 'package.json');
    let pkg = {
        name: 'default'
    };
    if (fs__default['default'].existsSync(pkgPath)) {
        pkg = require(pkgPath);
    }
    const yylServerOption = {
        context: alias.dirname,
        devServer: {
            noInfo: false,
            contentBase: alias.root,
            port: ((_a = yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.localserver) === null || _a === void 0 ? void 0 : _a.port) || 5000,
            hot: !!(env === null || env === void 0 ? void 0 : env.hmr)
        },
        proxy: {
            hosts: [
                ((_b = yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.commit) === null || _b === void 0 ? void 0 : _b.hostname) || '',
                ((_c = yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.commit) === null || _c === void 0 ? void 0 : _c.mainHost) || '',
                ((_d = yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.commit) === null || _d === void 0 ? void 0 : _d.staticHost) || ''
            ].filter((x) => x !== ''),
            enable: !env.proxy && !env.remote
        },
        homePage: (_e = yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.proxy) === null || _e === void 0 ? void 0 : _e.homePage,
        HtmlWebpackPlugin: HtmlWebpackPlugin__default['default']
    };
    const r = {
        plugins: [],
        devServer: YylServerWebpackPlugin__default['default'].initDevServerConfig(yylServerOption)
    };
    r.plugins = [
        // pop
        new YylEnvPopPlugin__default['default']({
            enable: !!env.tips,
            text: `${pkg.name} - ${extOs__default['default'].LOCAL_IP}:${devServer.port}`,
            duration: 3000
        }),
        // concat
        new YylConcatWebpackPlugin__default['default']({
            fileMap: (yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.concat) || {},
            context: alias.dirname,
            minify: !!(env === null || env === void 0 ? void 0 : env.isCommit)
        }),
        // copy
        new YylCopyWebpackPlugin__default['default']((() => {
            const r = {
                files: [],
                minify: false,
                context: alias.dirname
            };
            if (yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.resource) {
                Object.keys(yylConfig.resource).forEach((from) => {
                    const iExt = path__default['default'].extname(from);
                    if (iExt) {
                        if (r.files && (yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.resource)) {
                            if (['.html'].includes(iExt)) {
                                r.files.push({
                                    from,
                                    to: yylConfig.resource[from],
                                    filename: '[name].[ext]'
                                });
                            }
                            else {
                                r.files.push({
                                    from,
                                    to: yylConfig.resource[from],
                                    filename: '[name]-[hash:8].[ext]'
                                });
                            }
                        }
                    }
                    else {
                        if (r.files && (yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.resource)) {
                            r.files.push({
                                from,
                                to: yylConfig.resource[from],
                                matcher: ['*.html', '!**/.*'],
                                filename: '[name].[ext]'
                            });
                            r.files.push({
                                from,
                                to: yylConfig.resource[from],
                                matcher: ['!*.html', '!**/.*'],
                                filename: '[name]-[hash:8].[ext]'
                            });
                        }
                    }
                });
            }
            return r;
        })()),
        // sugar
        new YylSugarWebpackPlugin__default['default']({
            context: alias.dirname,
            HtmlWebpackPlugin: HtmlWebpackPlugin__default['default']
        }),
        // rev
        new YylRevWebpackPlugin__default['default']({
            revFileName: util__default['default'].path.join(path__default['default'].relative(resolveRoot, path__default['default'].join(alias.revDest, './rev-mainfest.json'))),
            revRoot: alias.revRoot,
            remote: !!env.remote,
            remoteAddr: (_f = yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.commit) === null || _f === void 0 ? void 0 : _f.revAddr,
            remoteBlankCss: !env.isCommit,
            extends: (() => {
                var _a, _b, _c, _d;
                const r = {
                    version: util__default['default'].makeCssJsDate(),
                    staticRemotePath: ((_a = yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.commit) === null || _a === void 0 ? void 0 : _a.staticHost) || ((_b = yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.commit) === null || _b === void 0 ? void 0 : _b.hostname) || '',
                    mainRemotePath: ((_c = yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.commit) === null || _c === void 0 ? void 0 : _c.mainHost) || ((_d = yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.commit) === null || _d === void 0 ? void 0 : _d.hostname) || ''
                };
                Object.keys(env)
                    .filter((key) => {
                    return ![
                        'isCommit',
                        'logLevel',
                        'proxy',
                        'name',
                        'config',
                        'workflow',
                        'useHotPlugin',
                        'hmr'
                    ].includes(key);
                })
                    .forEach((key) => {
                    r[key] = env[key];
                });
                return r;
            })()
        }),
        // server
        new YylServerWebpackPlugin__default['default'](yylServerOption)
    ];
    return r;
}

const DEFAULT_ALIAS = {
    root: './dist',
    srcRoot: './src',
    dirname: './',
    jsDest: './dist/js',
    cssDest: './dist/css',
    imagesDest: './dist/images',
    htmlDest: './dist/html',
    revDest: './dist/assets',
    revRoot: './dist',
    revAddr: '',
    basePath: '/',
    publicPath: '/'
};
const DEFAULT_DEV_SERVER = {
    port: 5000
};
function yylBaseInitConfig(op) {
    var _a, _b, _c;
    // 配置初始化 - env
    const env = (op === null || op === void 0 ? void 0 : op.env) || {};
    // 配置初始化 - context
    let context = process.cwd();
    if (op === null || op === void 0 ? void 0 : op.context) {
        context = path__default['default'].resolve(__dirname, op.context);
    }
    // 配置初始化 - alias
    let alias = Object.assign({}, DEFAULT_ALIAS);
    if (op === null || op === void 0 ? void 0 : op.alias) {
        alias = Object.assign(Object.assign({}, alias), op.alias);
    }
    // 配置 devServer
    let devServer = Object.assign({}, DEFAULT_DEV_SERVER);
    if (op === null || op === void 0 ? void 0 : op.devServer) {
        devServer = Object.assign(Object.assign({}, devServer), op.devServer);
    }
    // 配置初始化 - yylConfig
    let yylConfig;
    if (op === null || op === void 0 ? void 0 : op.yylConfig) {
        yylConfig = op.yylConfig;
        // 字段兼容
        if ((_a = yylConfig.dest) === null || _a === void 0 ? void 0 : _a.basePath) {
            alias.basePath = yylConfig.dest.basePath;
        }
        if ((_b = yylConfig.commit) === null || _b === void 0 ? void 0 : _b.hostname) {
            alias.publicPath = yylConfig.commit.hostname;
        }
        if (yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.alias) {
            alias = Object.assign(Object.assign({}, alias), yylConfig.alias);
        }
        if ((_c = yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.localserver) === null || _c === void 0 ? void 0 : _c.port) {
            devServer.port = yylConfig.localserver.port;
        }
    }
    // alias 路径 resolve
    Object.keys(alias).forEach((key) => {
        const iKey = key;
        if (alias[iKey] !== undefined) {
            if (!path__default['default'].isAbsolute(alias[iKey])) {
                alias[iKey] = path__default['default'].resolve(context, alias[iKey]);
                alias[iKey] = path__default['default'].resolve(__dirname, alias[iKey]);
            }
        }
    });
    // dist 目录
    const resolveRoot = path__default['default'].resolve(__dirname, alias.root);
    // 配置初始化
    const baseWConfig = initBase({ yylConfig, env, alias, resolveRoot, devServer });
    const entryWConfig = initEntry({ yylConfig, env, alias, resolveRoot, devServer });
    const moduleWConfig = initModule({ yylConfig, env, alias, resolveRoot, devServer });
    const yylPluginsWConfig = initYylPlugins({ yylConfig, env, alias, resolveRoot, devServer });
    // 配置合并
    const mixedOptions = merge__default['default'](baseWConfig, entryWConfig, moduleWConfig, yylPluginsWConfig);
    // 添加 yyl 脚本， 没有挂 hooks 所以放最后比较稳
    return mixedOptions;
}
module.exports = yylBaseInitConfig;

exports.default = yylBaseInitConfig;
