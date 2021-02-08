# yyl-base-webpack-config

## 安装

```typescript
yarn add yyl-base-webpack-config
```

### 使用

```typescript
// webpack.config.js
import yylBaseWebpackConfig from 'yyl-base-webpack-config'
import { merge } from 'webpack-mergej'

module.exports = (env) => {
  ...merge({
    context: __dirname,
    env,
    alias: {
      '~': path.join(__dirname, './src'),
      '~@': path.join(__dirname, './src/components/')
    },
    yylConfig: {
      concat: {
        'dist/js/shim.js': [
          'src/js/lib/shim/es5-sham.min.js',
          'src/js/lib/shim/es5-shim.min.js',
          'src/js/lib/shim/es6-sham.min.js',
          'src/js/lib/shim/es6-shim.min.js',
          'src/js/lib/shim/json3.min.js'
        ]
      },
      commit: {
        hostname: '//web.yystatic.com',
        mainHost: 'http://www.yy.com'
      }
    }
  })
}
```

### 文档

直接看 types 吧

```typescript
import { YylConfig, Env } from 'yyl-config-types'
import { Alias } from './types'
export interface YylBaseInitConfigOption {
  /** 当前路径 */
  context: string
  /** 环境变量 */
  env?: Env
  /** yyl.config */
  yylConfig?: YylConfig
  alias?: Alias
  devServer?: {
    port: number
  }
}
export declare type YylBaseInitConfigProperty = Required<YylBaseInitConfigOption>
```
