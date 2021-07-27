# 版本变更

## 0.3.5 (2021-07-27)

- fix: 修复 esbuild 模式下 sass 处理中 在 postcss 处理之前就把注释移除的问题

## 0.3.4 (2021-07-14)

- fix: 修复 esbuild 模式下 如 项目不支持 ts 会报错的问题

## 0.3.3 (2021-07-10)

- fix: 补充 svg-inline-loader

## 0.3.2 (2021-07-10)

- fix: 去掉多余的 log

## 0.3.1 (2021-07-08)

- fix: 修复 `esbuild-loader` 模式下 tsconfig paths 获取不了问题

## 0.3.0 (2021-07-08)

- feat: 补充 `esbuild-loader`

## 0.2.24 (2021-06-26)

- feat: 更新 `yyl-rev-webpack-plugin@1.0.11`
- fix: 修复 无 hash 图片不能显示问题

## 0.2.23 (2021-06-26)

- feat: 修复 serveIndex 不生效问题

## 0.2.22 (2021-06-26)

- feat: 更新 `yyl-sugar-webpack-plugin@1.0.10`
- fix: 修复 sugar 后会生成 2 分文件，一份未被 sugar 一份被 sugar 的问题

## 0.2.21 (2021-06-15)

- feat: 剔除 webpack 作为 devDependency 的角色

## 0.2.20 (2021-06-15)

- fix: 修复 当 yylConfig.commit.hostname 传参不合法时会报错问题

## 0.2.19 (2021-06-10)

- fix: 修复 px2rem 在 isCommit 时会把 `/*px*/` 这种注释去掉导致 px2rem 异常问题

## 0.2.18 (2021-06-03)

- feat: watchOption 不再监听 node_modules 里面的变化

## 0.2.17 (2021-06-03)

- fix: rev-mainfest -> rev-manifest
- fix: 修复 process && process.env && process.env.mode 判断 会报错问题

## 0.2.16 (2021-06-01)

- feat: 调整 resolve 规则

## 0.2.15 (2021-06-01)

- feat: 支持 entry/sub/index 形式的目录结构
- fix: 修复 px2rem 失效问题
- feat: 替换 `postcss-pxtorem` -> `postcss-px2rem`
- feat: 降级 `autoprefixer@9.7.2`
- feat: 降级 `postcss-loader@3.0.0`

## 0.2.14 (2021-05-26)

- fix: 修复 在 ssr 项目 hmr 启动报错问题

## 0.2.13 (2021-05-26)

- feat: env.isCommit 时 不生成 source map

## 0.2.12 (2021-05-26)

- feat: 补充 js 压缩逻辑

## 0.2.11 (2021-05-23)

- feat: 更新 `sass@1.26.3`

## 0.2.10 (2021-05-23)

- feat: 更新 `sass@1.25.0`

## 0.2.9 (2021-05-18)

- feat: 去掉 `html-webpack-plugin` scriptloading = defer 配置

## 0.2.8 (2021-05-17)

- feat: 兼容 `process is not defined` 问题

## 0.2.7 (2021-05-17)

- feat: 调整 babel 配置

## 0.2.5 (2021-05-17)

- feat: 去掉 imports-loader
- feat: 不再兼容 ie 8

## 0.2.4 (2021-05-17)

- del: 去掉自动打开 homePage 功能

## 0.2.3 (2021-05-16)

- feat: 更新 `yyl-config-types@0.5.3`
- feat: 更新 `yyl-server-webpack-plugin@1.3.2`

## 0.2.2 (2021-05-16)

- feat: 更新 `yyl-rev-webpack-plugin@1.0.10`

## 0.2.1 (2021-05-16)

- feat: 更新 `yyl-config-types@0.5.2`
- feat: 更新 `yyl-rev-webpack-plugin@1.0.9`
- feat: 更新 `yyl-seed-base@0.4.1`
- feat: 更新 `yyl-seed-response@0.2.0`
- feat: 替换 `optimize-css-assets-webpack-plugin` -> `css-minimizer-webpack-plugin`

## 0.2.0 (2021-05-07)

- feat: 更新 `yyl-config-types@0.5.1`
- feat: 更新 `yyl-seed-base@0.3.0`
- feat: 更新 `yyl-server-webpack-plugin@1.3.0`

## 0.1.16 (2021-05-03)

- feat: 更新 `yyl-config-types@0.4.3`

## 0.1.15 (2021-05-03)

- feat: 更新 `yyl-server-webpack-plugin@1.2.5`

## 0.1.14 (2021-04-19)

- fix: 补充 `pug-loader` `self` options

## 0.1.13 (2021-04-13)

- feat: 更新 `yyl-sugar-webpack-plugin@1.0.9`

## 0.1.12 (2021-04-13)

- feat: 更新 `yyl-rev-webpack-plugin@1.0.8`
- feat: 更新 `yyl-sugar-webpack-plugin@1.0.8`
- feat: 更新 `yyl-copy-webpack-plugin@1.0.8`
- feat: 更新 `yyl-concat-webpack-plugin@1.0.8`
- fix: 修复 yyl-concat 后 不能正确 sugar 问题

## 0.1.11 (2021-04-09)

- fix: 修复 在编译 ts 文件时对 `src/compponent` 路径不支持问题

## 0.1.10 (2021-04-08)

- fix: `--proxy` 下 `alias.hostname` -> `alias.publicPath`

## 0.1.9 (2021-04-08)

- feat: 更新 `yyl-server-webpack-plugin@1.2.4`
- feat: 补充 `proxy` debug 信息

## 0.1.8 (2021-04-08)

- feat: 调整 resolve.loader 配置

## 0.1.7 (2021-04-07)

- feat: 调整 devServer.noInfo 逻辑

## 0.1.6 (2021-04-05)

- feat: 补充 `中间件` 模式
- feat: 更新 `yyl-server-webpack-plugin@1.2.2`
- feat: 更新 `yyl-sugar-webpack-plugin@1.0.7`
- feat: 更新 `yyl-config-types@0.4.0`

## 0.1.5 (2021-03-09)

- feat: 更新 `yyl-server-webpack-plugin@1.1.4`

## 0.1.4 (2021-03-09)

- feat: 更新 `yyl-sugar-webpack-plugin@1.0.6`
- feat: 更新 `html-webpack-plugin@5.3.0`
- feat: types 调整

## 0.1.3 (2021-03-08)

- feat: 纠正 rev-manifest.json 生成 错误问题

## 0.1.2 (2021-03-07)

- feat: 更新 `yyl-concat-webpack-plugin@1.0.10`
- feat: 更新 `yyl-config-types@0.3.18`
- feat: 更新 `yyl-copy-webpack-plugin@1.0.7`
- feat: 更新 `yyl-rev-webpack-plugin@1.0.7`
- feat: 更新 `yyl-server-webpack-plugin@1.0.5`
- feat: 更新 `yyl-sugar-webpack-plugin@1.0.5`

## 0.1.1 (2021-02-09)

- feat: 补充 export default

## 0.1.0 (2021-02-08)

- feat: 诞生
