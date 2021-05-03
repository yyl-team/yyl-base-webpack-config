/*!
 * yyl-base-webpack-config cjs 0.1.16
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
var querystring = require('querystring');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var autoprefixer = require('autoprefixer');
var px2rem = require('postcss-pxtorem');
var sass = require('sass');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
var extOs = require('yyl-os');
var YylConcatWebpackPlugin = require('yyl-concat-webpack-plugin');
var YylCopyWebpackPlugin = require('yyl-copy-webpack-plugin');
var YylSugarWebpackPlugin = require('yyl-sugar-webpack-plugin');
var YylRevWebpackPlugin = require('yyl-rev-webpack-plugin');
var YylEnvPopPlugin = require('yyl-env-pop-webpack-plugin');
var YylServerWebpackPlugin = require('yyl-server-webpack-plugin');
var devMiddleware = require('webpack-dev-middleware');
var WebpackHotMiddleware = require('webpack-hot-middleware');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var merge__default = /*#__PURE__*/_interopDefaultLegacy(merge);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var util__default = /*#__PURE__*/_interopDefaultLegacy(util);
var OptimizeCSSAssetsPlugin__default = /*#__PURE__*/_interopDefaultLegacy(OptimizeCSSAssetsPlugin);
var extFs__default = /*#__PURE__*/_interopDefaultLegacy(extFs);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var querystring__default = /*#__PURE__*/_interopDefaultLegacy(querystring);
var HtmlWebpackPlugin__default = /*#__PURE__*/_interopDefaultLegacy(HtmlWebpackPlugin);
var autoprefixer__default = /*#__PURE__*/_interopDefaultLegacy(autoprefixer);
var px2rem__default = /*#__PURE__*/_interopDefaultLegacy(px2rem);
var sass__default = /*#__PURE__*/_interopDefaultLegacy(sass);
var MiniCssExtractPlugin__default = /*#__PURE__*/_interopDefaultLegacy(MiniCssExtractPlugin);
var TsconfigPathsPlugin__default = /*#__PURE__*/_interopDefaultLegacy(TsconfigPathsPlugin);
var extOs__default = /*#__PURE__*/_interopDefaultLegacy(extOs);
var YylConcatWebpackPlugin__default = /*#__PURE__*/_interopDefaultLegacy(YylConcatWebpackPlugin);
var YylCopyWebpackPlugin__default = /*#__PURE__*/_interopDefaultLegacy(YylCopyWebpackPlugin);
var YylSugarWebpackPlugin__default = /*#__PURE__*/_interopDefaultLegacy(YylSugarWebpackPlugin);
var YylRevWebpackPlugin__default = /*#__PURE__*/_interopDefaultLegacy(YylRevWebpackPlugin);
var YylEnvPopPlugin__default = /*#__PURE__*/_interopDefaultLegacy(YylEnvPopPlugin);
var YylServerWebpackPlugin__default = /*#__PURE__*/_interopDefaultLegacy(YylServerWebpackPlugin);
var devMiddleware__default = /*#__PURE__*/_interopDefaultLegacy(devMiddleware);
var WebpackHotMiddleware__default = /*#__PURE__*/_interopDefaultLegacy(WebpackHotMiddleware);

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
            modules: [nodeModulesPath, 'node_modules']
        },
        resolve: {
            modules: [nodeModulesPath, 'node_modules'],
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
        wConfig.output.publicPath = util__default['default'].path.join(alias.publicPath, alias.basePath, path__default['default'].relative(alias.root, resolveRoot), '/');
    }
    else if (env.isCommit) {
        wConfig.mode = 'production';
        wConfig.output.publicPath = util__default['default'].path.join(alias.publicPath, alias.basePath, path__default['default'].relative(alias.root, resolveRoot), '/');
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

const HOT_CLIENT_PATH = require.resolve('webpack-hot-middleware/client');
const OUTPUT_HTML_REG = /(\.jade|\.pug|\.html)$/;
const ENTRY_ERG = /\.(js|tsx?)$/;
function ignoreExtName(iPath) {
    return iPath.replace(/(\.jade|.pug|\.html|\.js|\.css|\.ts|\.tsx|\.jsx)$/, '');
}
/** 初始化入口和输出html */
function initEntry(option) {
    const { env, alias, resolveRoot, yylConfig } = option;
    const wConfig = {
        entry: (() => {
            const { srcRoot } = alias;
            const r = {};
            const entryPath = path__default['default'].join(srcRoot, 'entry');
            if (fs__default['default'].existsSync(entryPath)) {
                const fileList = extFs__default['default'].readFilesSync(entryPath, ENTRY_ERG);
                fileList.forEach((filePath) => {
                    var _a;
                    const key = ignoreExtName(path__default['default'].basename(filePath));
                    if (key) {
                        r[key] = {
                            import: [filePath]
                        };
                        if (((_a = yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.localserver) === null || _a === void 0 ? void 0 : _a.entry) && ((env === null || env === void 0 ? void 0 : env.hmr) || (env === null || env === void 0 ? void 0 : env.livereload))) {
                            // use hot plugin
                            const queryObj = {
                                name: key,
                                path: `http://127.0.0.1:${env.port || (yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.localserver.port) || 5000}/__webpack_hmr`
                            };
                            r[key] = {
                                import: [`${HOT_CLIENT_PATH}?${querystring__default['default'].stringify(queryObj)}`, filePath]
                            };
                            // TODO:
                        }
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
            if (wConfig.resolve.plugins) {
                wConfig.resolve.plugins.push(new TsconfigPathsPlugin__default['default']({
                    configFile: localTsConfigPath
                }));
            }
            if (wConfig.resolve.extensions) {
                wConfig.resolve.extensions = wConfig.resolve.extensions.concat(['.tsx', '.ts']);
            }
        }
    }
    // - ts
    return wConfig;
}

const LANG = {
    SERVER_UNDER_MIDDLEWARE_MODE: '本地服务处于 中间件 模式',
    SERVER_UNDER_NORMAL_MODE: '本地服务处于 一般 模式',
    USE_DEV_MIDDLEWARE: '使用 dev-server 中间件',
    USE_HOT_MIDDLEWARE: '使用 热更新 中间件',
    USE_DEV_SERVER: '使用 webpack-dev-server'
};

/** 初始化 proxy 配置 */
function initProxies(op) {
    var _a, _b, _c, _d, _e;
    const { yylConfig, env } = op;
    let hosts = [];
    if ((_a = yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.localserver) === null || _a === void 0 ? void 0 : _a.proxies) {
        hosts = hosts.concat((_b = yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.localserver) === null || _b === void 0 ? void 0 : _b.proxies);
    }
    [
        (_c = yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.commit) === null || _c === void 0 ? void 0 : _c.hostname,
        (_d = yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.commit) === null || _d === void 0 ? void 0 : _d.mainHost,
        (_e = yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.commit) === null || _e === void 0 ? void 0 : _e.staticHost
    ].forEach((host) => {
        if (host && !hosts.includes(host)) {
            hosts = hosts.concat(host);
        }
    });
    const enable = !(env === null || env === void 0 ? void 0 : env.proxy) && !(env === null || env === void 0 ? void 0 : env.remote) && !(env === null || env === void 0 ? void 0 : env.isCommit);
    const logLevel = env === null || env === void 0 ? void 0 : env.logLevel;
    return {
        hosts,
        enable,
        logLevel
    };
}

function initYylPlugins(op) {
    var _a, _b, _c, _d, _e;
    const { env, alias, devServer, yylConfig, resolveRoot, publicPath, logger } = op;
    const pkgPath = path__default['default'].join(alias.dirname, 'package.json');
    let pkg = {
        name: 'default'
    };
    if (fs__default['default'].existsSync(pkgPath)) {
        pkg = require(pkgPath);
    }
    const devServerConfig = {
        noInfo: `${env.logLevel}` !== '2',
        publicPath: /^\/\//.test(publicPath) ? `http:${publicPath}` : publicPath,
        writeToDisk: !!(env.remote || env.isCommit || env.writeToDisk || ((_a = yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.localserver) === null || _a === void 0 ? void 0 : _a.entry)),
        headers: { 'Access-Control-Allow-Origin': '*' },
        disableHostCheck: true,
        contentBase: alias.root,
        port: ((_b = yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.localserver) === null || _b === void 0 ? void 0 : _b.port) || (devServer && (devServer === null || devServer === void 0 ? void 0 : devServer.port)) || 5000,
        hot: !!(env === null || env === void 0 ? void 0 : env.hmr),
        inline: !!env.https,
        liveReload: !!env.livereload,
        host: '0.0.0.0',
        sockHost: '127.0.0.1',
        serveIndex: true,
        watchOptions: {
            aggregateTimeout: 1000
        }
    };
    /** yylServer 配置 */
    const yylServerOption = {
        context: alias.dirname,
        https: !!env.https,
        devServer: Object.assign(Object.assign({}, devServerConfig), { disableHostCheck: true, contentBase: alias.root, port: ((_c = yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.localserver) === null || _c === void 0 ? void 0 : _c.port) || (devServer && (devServer === null || devServer === void 0 ? void 0 : devServer.port)) || 5000, hot: !!(env === null || env === void 0 ? void 0 : env.hmr), inline: !!env.https, liveReload: !!env.livereload, host: '0.0.0.0', sockHost: '127.0.0.1', serveIndex: true, before(app) {
                if (devServer) {
                    const { historyApiFallback } = devServer;
                    app.use((req, res, next) => {
                        if (typeof historyApiFallback === 'object') {
                            const matchRewrite = historyApiFallback.rewrites &&
                                historyApiFallback.rewrites.length &&
                                historyApiFallback.rewrites.some((item) => req.url.match(item.from));
                            if (req.method === 'GET' &&
                                req.headers &&
                                ([''].includes(path__default['default'].extname(req.url)) || matchRewrite)) {
                                req.headers.accept =
                                    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9';
                            }
                        }
                        next();
                    });
                }
            } }),
        proxy: initProxies({
            yylConfig,
            env
        }),
        // proxy: {
        //   hosts: [
        //     yylConfig?.commit?.hostname || '',
        //     yylConfig?.commit?.mainHost || '',
        //     yylConfig?.commit?.staticHost || ''
        //   ].filter((x) => x !== ''),
        //   enable: !env.proxy && !env.remote
        // },
        homePage: ((_d = yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.proxy) === null || _d === void 0 ? void 0 : _d.homePage) || '',
        HtmlWebpackPlugin: HtmlWebpackPlugin__default['default']
    };
    // 当为 false 时 会作为 中间件形式
    if (devServer === false) {
        logger('msg', 'info', [LANG.SERVER_UNDER_MIDDLEWARE_MODE]);
        yylServerOption.devServer = {};
    }
    else {
        logger('msg', 'info', [LANG.SERVER_UNDER_NORMAL_MODE]);
    }
    const r = {
        plugins: [],
        devServer: YylServerWebpackPlugin__default['default'].initDevServerConfig(yylServerOption)
    };
    r.plugins = [
        // pop
        new YylEnvPopPlugin__default['default']({
            enable: !!env.tips,
            text: `${pkg.name} - ${extOs__default['default'].LOCAL_IP}:${yylServerOption.devServer.port}`,
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
            remoteAddr: (_e = yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.commit) === null || _e === void 0 ? void 0 : _e.revAddr,
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
    // 插入 热更新插件
    if (devServer === false) {
        r.plugins.push(new webpack.HotModuleReplacementPlugin());
    }
    return r;
}

/** 初始化中间件 */
function initMiddleWare(op) {
    var _a;
    let { app, env, logger, yylConfig, compiler } = op;
    const publicPath = `${compiler.options.output.publicPath || ''}`;
    if (!logger) {
        logger = () => undefined;
    }
    /** init middleware */
    const middleware = devMiddleware__default['default'](compiler, {
        publicPath: /^\/\//.test(publicPath) ? `http:${publicPath}` : publicPath,
        serverSideRender: true,
        writeToDisk: !!((env === null || env === void 0 ? void 0 : env.remote) || (env === null || env === void 0 ? void 0 : env.isCommit) || (env === null || env === void 0 ? void 0 : env.writeToDisk) || ((_a = yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.localserver) === null || _a === void 0 ? void 0 : _a.entry)),
        headers: { 'Access-Control-Allow-Origin': '*' }
    });
    logger('msg', 'info', [LANG.USE_DEV_MIDDLEWARE]);
    app.use(middleware);
    app.use('/webpack-dev-server', (req, res) => {
        const { devMiddleware } = res.locals.webpack;
        res.setHeader('Content-Type', 'text/html');
        res.write('<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body>');
        const jsonWebpackStats = devMiddleware.stats.toJson();
        const filesystem = devMiddleware.outputFileSystem;
        const { assetsByChunkName, outputPath } = jsonWebpackStats;
        writeDirectory(publicPath || '/', outputPath || '/');
        res.end('</body></html>');
        function writeDirectory(baseUrl, basePath) {
            const content = filesystem.readdirSync(basePath);
            res.write('<ul>');
            content.forEach((item) => {
                const p = `${basePath}/${item}`;
                if (filesystem.statSync(p).isFile()) {
                    res.write(`<li><a href="${baseUrl + item}">${item}</a></li>`);
                    if (/\.js$/.test(item)) {
                        const html = item.substr(0, item.length - 3);
                        const containerHref = baseUrl + html;
                        const magicHtmlHref = baseUrl.replace(
                        // eslint-disable-next-line
                        /(^(https?:\/\/[^\/]+)?\/)/, '$1webpack-dev-server/') + html;
                        res.write(`<li><a href="${containerHref}">${html}</a>` +
                            ` (magic html for ${item}) (<a href="${magicHtmlHref}">webpack-dev-server</a>)` +
                            '</li>');
                    }
                }
                else {
                    res.write(`<li>${item}<br>`);
                    writeDirectory(`${baseUrl + item}/`, p);
                    res.write('</li>');
                }
            });
            res.write('</ul>');
        }
    });
    /** init hot middleware */
    if ((env === null || env === void 0 ? void 0 : env.hmr) || (env === null || env === void 0 ? void 0 : env.livereload)) {
        logger('msg', 'info', [LANG.USE_HOT_MIDDLEWARE]);
        app.use(WebpackHotMiddleware__default['default'](compiler, {
            path: '/__webpack_hmr',
            log: env.logLevel === 2 ? undefined : false,
            heartbeat: 2000
        }));
    }
    /** init server proxy middleware 只在非 --proxy, --remote 模式并且是watch 情况下运行 */
    YylServerWebpackPlugin__default['default'].initProxyMiddleware({
        app,
        logger,
        logLevel: env === null || env === void 0 ? void 0 : env.logLevel,
        proxy: initProxies({
            env,
            yylConfig
        })
    });
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
function initYylBaseConfig(op) {
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
    const logger = (op === null || op === void 0 ? void 0 : op.logger) || (() => undefined);
    // 配置 devServer
    let devServer = Object.assign({}, DEFAULT_DEV_SERVER);
    if (op === null || op === void 0 ? void 0 : op.devServer) {
        devServer = Object.assign(Object.assign({}, devServer), op.devServer);
    }
    else if ((op === null || op === void 0 ? void 0 : op.devServer) === false) {
        devServer = false;
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
        if (((_c = yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.localserver) === null || _c === void 0 ? void 0 : _c.port) && devServer) {
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
    const baseWConfig = initBase({ yylConfig, env, alias, resolveRoot, logger });
    const entryWConfig = initEntry({ yylConfig, env, alias, resolveRoot, logger });
    const moduleWConfig = initModule({ yylConfig, env, alias, resolveRoot, logger });
    const yylPluginsWConfig = initYylPlugins({
        yylConfig,
        env,
        alias,
        resolveRoot,
        devServer,
        logger,
        publicPath: (devServer && devServer.publicPath) || `${baseWConfig.output.publicPath}`
    });
    // 配置合并
    const mixedOptions = merge__default['default'](baseWConfig, entryWConfig, moduleWConfig, yylPluginsWConfig);
    // 添加 yyl 脚本， 没有挂 hooks 所以放最后比较稳
    return mixedOptions;
}

exports.initMiddleWare = initMiddleWare;
exports.initYylBaseConfig = initYylBaseConfig;
