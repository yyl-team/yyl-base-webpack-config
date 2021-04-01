import { Logger } from 'yyl-seed-base'
import { Express } from 'express'
import { Env, YylConfig } from 'yyl-config-types'
import { LANG } from './const'
import { Configuration, Compiler } from 'webpack'
import devMiddleware from 'webpack-dev-middleware'
import WebpackHotMiddleware, {
  ClientOptions as hotMiddlewareOption,
  MiddlewareOptions
} from 'webpack-hot-middleware'

export interface InitMiddleWareOption {
  app: Express
  compiler: Compiler
  env?: Env
  yylConfig?: YylConfig
  logger?: Logger
}
/** 初始化中间件 */
export function initMiddleWare(op: InitMiddleWareOption) {
  let { app, env, logger, yylConfig, compiler } = op

  const publicPath = `${compiler.options.output.publicPath || ''}`

  if (!logger) {
    logger = () => undefined
  }

  logger('msg', 'info', [LANG.USE_MIDDLEWARE])

  /** init middleware */
  const middleware = devMiddleware(compiler as any, {
    publicPath: /^\/\//.test(publicPath) ? `http:${publicPath}` : publicPath,
    writeToDisk: !!(
      env?.remote ||
      env?.isCommit ||
      env?.writeToDisk ||
      yylConfig?.localserver?.entry
    ),
    headers: { 'Access-Control-Allow-Origin': '*' }
  })

  app.use(middleware)

  app.use('/webpack-dev-server', (req, res) => {
    const { devMiddleware } = res.locals.webpack
    res.setHeader('Content-Type', 'text/html')

    res.write('<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body>')

    const jsonWebpackStats = devMiddleware.stats.toJson()

    const filesystem = devMiddleware.outputFileSystem
    const { assetsByChunkName, outputPath } = jsonWebpackStats

    writeDirectory(publicPath || '/', outputPath || '/')

    res.end('</body></html>')

    function writeDirectory(baseUrl: string, basePath: string) {
      const content = filesystem.readdirSync(basePath)

      res.write('<ul>')

      content.forEach((item: string) => {
        const p = `${basePath}/${item}`

        if (filesystem.statSync(p).isFile()) {
          res.write(`<li><a href="${baseUrl + item}">${item}</a></li>`)

          if (/\.js$/.test(item)) {
            const html = item.substr(0, item.length - 3)
            const containerHref = baseUrl + html

            const magicHtmlHref =
              baseUrl.replace(
                // eslint-disable-next-line
                /(^(https?:\/\/[^\/]+)?\/)/,
                '$1webpack-dev-server/'
              ) + html

            res.write(
              `<li><a href="${containerHref}">${html}</a>` +
                ` (magic html for ${item}) (<a href="${magicHtmlHref}">webpack-dev-server</a>)` +
                '</li>'
            )
          }
        } else {
          res.write(`<li>${item}<br>`)

          writeDirectory(`${baseUrl + item}/`, p)

          res.write('</li>')
        }
      })

      res.write('</ul>')
    }
  })

  /** init hot middleware */
  if (env?.hmr || env?.livereload) {
    app.use(
      WebpackHotMiddleware(compiler as any, {
        path: publicPath,
        log: env.logLevel === 2 ? undefined : false,
        heartbeat: 2000
      })
    )
  }
}
