import { YylConfig, Env } from 'yyl-config-types'
import { YylServerWebpackPluginOption } from 'yyl-server-webpack-plugin'
export interface InitProxiesOption {
  yylConfig?: YylConfig
  env?: Env
}

/** 初始化 proxy 配置 */
export function initProxies(
  op: InitProxiesOption
): Required<YylServerWebpackPluginOption>['proxy'] {
  const { yylConfig, env } = op
  let hosts: string[] = []
  if (yylConfig?.localserver?.proxies) {
    hosts = hosts.concat(yylConfig?.localserver?.proxies)
  }

  ;[
    yylConfig?.commit?.hostname,
    yylConfig?.commit?.mainHost,
    yylConfig?.commit?.staticHost
  ].forEach((host) => {
    if (host && !hosts.includes(host)) {
      hosts = hosts.concat(host)
    }
  })

  const enable = !env?.proxy && !env?.remote && !env?.isCommit

  return {
    hosts,
    enable
  }
}
