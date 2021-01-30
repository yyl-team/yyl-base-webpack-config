/*!
 * yyl-base-webpack-config cjs 0.1.0
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
var px2rem = _interopDefault(require('postcss-pxtorem'));
var sass = _interopDefault(require('sass'));
var MiniCssExtractPlugin = _interopDefault(require('mini-css-extract-plugin'));
var net = _interopDefault(require('net'));
var os = _interopDefault(require('os'));
var child_process = _interopDefault(require('child_process'));
var YylEnvPopPlugin = _interopDefault(require('yyl-env-pop-webpack-plugin'));

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
        mode: 'development',
        cache: {
            type: 'memory'
        },
        context: path.resolve(__dirname, alias.dirname),
        output: {
            path: resolveRoot,
            filename: formatPath(path.relative(resolveRoot, path.join(alias.jsDest, '[name]-[chunkhash:8].js'))),
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
            const entryPath = path.join(srcRoot, 'entry');
            if (fs.existsSync(entryPath)) {
                const fileList = extFs.readFilesSync(entryPath, ENTRY_ERG);
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
                            r.push(autoprefixer({
                                overrideBrowserslist: ['> 1%', 'last 2 versions']
                            }));
                        }
                        else {
                            r.push(autoprefixer({
                                overrideBrowserslist: ['iOS >= 7', 'Android >= 4']
                            }));
                        }
                        if ((yylConfig === null || yylConfig === void 0 ? void 0 : yylConfig.px2rem) === true) {
                            r.push(px2rem({ unitPrecision: 75 }));
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
            loader: MiniCssExtractPlugin.loader,
            options: {}
        });
        wConfig.plugins.push(new MiniCssExtractPlugin({
            filename: util__default.path.relative(resolveRoot, util.path.join(alias.cssDest, '[name]-[chunkhash:8].css')),
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

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}

const IS_WINDOWS = process.platform == 'win32';
const IS_LINUX = process.platform === 'linux';
const IS_MAC = process.platform === 'darwin';
const IS_WINDOWS_7 = IS_WINDOWS && /^6\.1\.\d+$/.test(os.release());

const extOs = {
  IS_WINDOWS,
  IS_LINUX,
  IS_MAC,
  IS_WINDOWS_7,
  // 本机 ip地址
  LOCAL_IP: (function () {
    var ipObj = os.networkInterfaces();
    var ipArr;
    for (var key in ipObj) {
      // eslint-disable-next-line no-prototype-builtins
      if (ipObj.hasOwnProperty(key)) {
        ipArr = ipObj[key];
        for (var fip, i = 0, len = ipArr.length; i < len; i++) {
          fip = ipArr[i];
          if (fip.family.toLowerCase() == 'ipv4' && !fip.internal) {
            return fip.address
          }
        }
      }
    }
    return '127.0.0.1'
  })(),

  // 复制内容到剪贴板
  async clip(str) {
    if (IS_MAC) {
      await extOs.runCMD(`echo ${str} | tr -d '\n' | pbcopy`);
    } else if (IS_WINDOWS) {
      await extOs.runCMD(`echo|set /p=${str}|clip`);
    }
  },

  /**
   * 检查端口是否可用
   * @param  {Number}   port         需要检查的端口
   * @param  {boolean}  canUse       是否可用
   * @return {Promise}  p(canUse)    promise 对象
   */
  checkPort(port) {
    return new Promise((done) => {
      const server = net.createServer().listen(port);
      server.on('listening', () => {
        // 执行这块代码说明端口未被占用
        server.close(); // 关闭服务
        done(true);
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          // 端口已经被使用
          done(false);
        }
      });
    })
  },

  rm(iPath) {
    if (!fs.existsSync(iPath)) {
      return Promise.resolve()
    }

    let cmd = '';
    let rPath = iPath.replace(/ /g, '\\ ');

    if (IS_WINDOWS) {
      if (fs.statSync(iPath).isDirectory()) {
        cmd = `rd /s /q ${rPath}`;
      } else {
        cmd = `del ${rPath}`;
      }
    } else {
      cmd = `rm -rf ${rPath}`;
    }
    return extOs.runCMD(cmd)
  },

  openBrowser(address) {
    if (/^[/]{2}/.test(address)) {
      address = `http:${address}`;
    }
    if (IS_WINDOWS) {
      return extOs.runCMD(`start ${address.replace(/&/g, '^&')}`)
    } else if (IS_LINUX) {
      return Promise.resolve()
    } else {
      return extOs.runCMD(`open ${address.replace(/&/g, '\\&')}`)
    }
  },

  runCMD: function (str, iEnv, iPath, showOutput, newWindow) {
    const myCmd = child_process.exec;
    const runner = (next, reject) => {
      if (typeof iEnv === 'string') {
        // (str, iPath, showOutput, newWindow)
        newWindow = showOutput;
        showOutput = iPath;
        iPath = iEnv;
        iEnv = null;
      }
      if (showOutput === undefined) {
        showOutput = true;
      }
      if (!str) {
        return reject('没任何 cmd 操作')
      }
      if (!/Array/.test(Object.prototype.toString.call(str))) {
        str = [str];
      }

      if (iPath && !fs.existsSync(iPath)) {
        return reject(`runCMD 当前目录不存在: ${iPath}`)
      }

      let iCmd = str.join(' && ');

      if (newWindow) {
        if (IS_WINDOWS) {
          iCmd = `cmd /k start cmd /k ${iCmd}`;
        } else if (IS_LINUX) {
          iCmd = `${iCmd}`;
        } else {
          iCmd = `osascript -e 'tell application "Terminal" to activate' -e 'tell application "System Events" to tell process "Terminal" to keystroke "t" using command down' -e 'delay 0.2' -e 'tell application "Terminal" to do script "cd ${iPath} && ${iCmd}" in selected tab of the front window'`;
        }
      }

      const child = myCmd(
        iCmd,
        {
          maxBuffer: 2000 * 1024,
          cwd: iPath || '',
          env: iEnv,
        },
        (err, stdout) => {
          if (err) {
            if (showOutput) {
              console.log('cmd运行 出错');
              console.log(err.stack);
            }
            reject(err);
          } else {
            next(stdout);
          }
        }
      );

      child.stdout.setEncoding('utf8');

      if (showOutput) {
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
      }

      if (newWindow && IS_WINDOWS) {
        next();
      }
    };
    return new Promise(runner)
  },
  /**
   * 运行 单行 cmd
   * @param  {String}       str             cmd执行语句 or 数组
   * @param  {funciton}     callback(error) 回调函数
   *                        - error         错误信息
   * @return {Void}
   */
  runSpawn: function (ctx, iEnv, iPath, showOutput) {
    const iSpawn = child_process.spawn;
    const runner = (next, reject) => {
      if (typeof iEnv === 'string') {
        // (str, iPath, showOutput, newWindow)
        showOutput = iPath;
        iPath = iEnv;
        iEnv = null;
      }
      let ops = '';
      let hand = '';
      const cwd = iPath || process.cwd();

      if (IS_WINDOWS) {
        hand = 'cmd.exe';
        ops = ['/s', '/c', ctx];
      } else {
        hand = '/bin/sh';
        ops = ['-c', ctx];
      }

      if (iPath && !fs.existsSync(iPath)) {
        return reject(`runSpawn 当前目录不存在: ${iPath}`)
      }

      const child = iSpawn(hand, ops, {
        cwd: cwd,
        silent: showOutput ? true : false,
        stdio: [0, 1, 2],
        env: iEnv,
      });
      child.on('exit', (err) => {
        if (err) {
          reject(err);
        } else {
          next();
        }
      });
    };

    return new Promise(runner)
  },
  /**
   * 打开文件所在位置
   */
  openPath: function (iPath) {
    if (IS_WINDOWS) {
      return extOs.runCMD(`start ${iPath.replace(/\//g, '\\')}`, __dirname)
    } else if (IS_LINUX) {
      return Promise.resolve()
    } else {
      return extOs.runCMD(`open ${iPath}`)
    }
  },

  /**
   * 安装 node 接件
   */
  async installNodeModules(plugins, basePath, useYarn) {
    if (!plugins || !plugins.length) {
      return
    }

    if (!basePath) {
      throw new Error('install node_modules fail, basePath is not set')
    }

    if (!fs.existsSync(basePath)) {
      throw new Error(
        `install node_modules fail, basePath is not exists: ${basePath}`
      )
    }
    const iPkgPath = path.join(basePath, './package.json');
    const nodeModulePath = path.join(basePath, 'node_modules');
    if (!fs.existsSync(iPkgPath)) {
      fs.writeFileSync(
        iPkgPath,
        JSON.stringify(
          {
            description: 'none',
            repository: 'none',
            license: 'ISC',
          },
          null,
          2
        )
      );
    } else {
      const iPkg = commonjsRequire();
      let changeed = false;

      if (!iPkg.description) {
        iPkg.description = 'none';
        changeed = true;
      }

      if (!iPkg.repository) {
        iPkg.repository = 'none';
        changeed = true;
      }

      if (!iPkg.license) {
        iPkg.license = 'ISC';
        changeed = true;
      }
      if (changeed) {
        fs.writeFileSync(iPkgPath, JSON.stringify(iPkg, null, 2));
      }
    }

    if (!fs.existsSync(nodeModulePath)) {
      fs.mkdirSync(nodeModulePath);
    }

    const installLists = [];

    plugins.forEach((str) => {
      let iDir = '';
      let iVer = '';
      const pathArr = str.split(/[\\/]+/);
      let pluginPath = '';
      let pluginName = '';
      if (pathArr.length > 1) {
        pluginName = pathArr.pop();
        pluginPath = pathArr.join('/');
      } else {
        pluginName = pathArr[0];
      }

      if (~pluginName.indexOf('@')) {
        iDir = pluginName.split('@')[0];
        iVer = pluginName.split('@')[1];
      } else {
        iDir = pluginName;
      }
      let iBasePath = path.join(nodeModulePath, pluginPath, iDir);
      let iPkgPath = path.join(iBasePath, 'package.json');
      let iPkg;
      if (fs.existsSync(iBasePath) && fs.existsSync(iPkgPath)) {
        if (iVer) {
          iPkg = commonjsRequire();
          if (iPkg.version != iVer) {
            installLists.push(str);
          }
        }
      } else {
        installLists.push(str);
      }
    });

    if (installLists.length) {
      let cmd = `npm install ${installLists.join(' ')} --loglevel http`;
      if (useYarn) {
        cmd = `yarn add ${installLists.join(' ')}`;
      }
      return await extOs.runCMD(cmd, basePath)
    } else {
      return
    }
  },
  async installPackage(pkgPath, op = {}) {
    let bPath = path.dirname(pkgPath);

    const nodeModulePath = util__default.path.join(bPath, 'node_modules');
    const nodePathExists = fs.existsSync(nodeModulePath);
    const getModuleVersion = function (name) {
      const modVerPath = util__default.path.join(nodeModulePath, name, 'package.json');
      let r = '0';
      if (!fs.existsSync(modVerPath)) {
        return r
      }

      try {
        const modPkg = commonjsRequire(modVerPath);
        r = modPkg.version;
      } catch (er) {}
      return r
    };
    let needInstall = false;
    if (fs.existsSync(pkgPath)) {
      let iPkg = {};
      try {
        iPkg = commonjsRequire(pkgPath);
      } catch (er) {}

      let checkMap = {};
      if (iPkg.dependencies) {
        checkMap = Object.assign(checkMap, iPkg.dependencies);
      }
      if (iPkg.devDependencies && !op.production) {
        checkMap = Object.assign(checkMap, iPkg.devDependencies);
      }

      Object.keys(checkMap).some((key) => {
        if (
          !nodePathExists ||
          !util__default.matchVersion(checkMap[key], getModuleVersion(key))
        ) {
          needInstall = true;
          return true
        }
      });
    }

    if (needInstall) {
      let cmd = 'npm install';
      if (op.useYarn) {
        cmd = 'yarn install';
      }

      if (op.loglevel) {
        cmd = `${cmd} --loglevel ${op.loglevel}`;
      }
      if (op.production) {
        cmd = `${cmd} --production`;
      }
      return await extOs.runCMD(cmd, bPath)
    }
  },
  async getYarnVersion() {
    try {
      const version = await extOs.runCMD('yarn -v');
      return version.trim()
    } catch (er) {
      return
    }
  },
  async getChromeVersion() {
    const self = this;
    let verStr = '';
    let cmd = '';
    let verReg = null;

    if (IS_MAC) {
      cmd =
        '/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --version';
      verReg = /^[\w\W]*Chrome\s+([0-9._]+)[\w\W]*$/i;
    } else if (IS_WINDOWS) {
      cmd =
        'reg query "HKEY_CURRENT_USER\\Software\\Google\\Chrome\\BLBeacon" /v version';
      verReg = /^[\w\W]*REG_SZ\s*([0-9._]+)[\w\W]*$/i;
    } else if (IS_LINUX) {
      cmd = 'google-chrome --version';
      verReg = /^[\w\W]*Chrome\s+([0-9._]+)[\w\W]*$/i;
    }
    if (cmd) {
      try {
        verStr = await self.runCMD(cmd, __dirname, false);
      } catch (er) {}
      if (verStr && verStr.match(verReg)) {
        return verStr.replace(verReg, '$1')
      } else {
        return
      }
    } else {
      return
    }
  },
  getJavaVersion() {
    let verStr = '';
    const reg = /^[\w\W]*version "([0-9._]+)"[\w\W]*$/;
    return new Promise((next) => {
      const child = child_process.spawn('java', ['-version']);
      child.stderr.on('data', (data) => {
        verStr = data.toString();
        if (verStr && verStr.match(reg)) {
          next(verStr.replace(reg, '$1'));
        } else {
          next();
        }
      });
      child.on('error', () => {
        next();
      });
    })
  },
};

var os_1 = extOs;

function initYylPlugins(op) {
    const { env, alias, devServer } = op;
    const pkgPath = path.join(alias.dirname, 'package.json');
    let pkg = {
        name: 'default'
    };
    if (fs.existsSync(pkgPath)) {
        pkg = require(pkgPath);
    }
    const r = {
        plugins: []
    };
    r.plugins = [
        new YylEnvPopPlugin({
            enable: !!env.tips,
            text: `${pkg.name} - ${os_1.LOCAL_IP}:${devServer.port}`,
            duration: 3000
        })
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
        context = path.resolve(__dirname, op.context);
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
        if (!path.isAbsolute(alias[iKey])) {
            alias[iKey] = path.resolve(context, alias[iKey]);
            alias[iKey] = path.resolve(__dirname, alias[iKey]);
        }
    });
    // dist 目录
    const resolveRoot = path.resolve(__dirname, alias.root);
    // 配置初始化
    const baseWConfig = initBase({ yylConfig, env, alias, resolveRoot, devServer });
    const entryWConfig = initEntry({ yylConfig, env, alias, resolveRoot, devServer });
    const moduleWConfig = initModule({ yylConfig, env, alias, resolveRoot, devServer });
    const yylPluginsWConfig = initYylPlugins({ yylConfig, env, alias, resolveRoot, devServer });
    // 配置合并
    const mixedOptions = merge(baseWConfig, entryWConfig, moduleWConfig, yylPluginsWConfig);
    // 添加 yyl 脚本， 没有挂 hooks 所以放最后比较稳
    return mixedOptions;
}
module.exports = yylBaseInitConfig;
