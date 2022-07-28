# next doc2  

<!-- TOC -->

- [next doc2](#next-doc2)
  - [api](#api)
    - [cli](#cli)
    - [next/router](#nextrouter)

<!-- /TOC -->

## api    

### cli

支持的子命令：`build, start, export, dev, lint, telemetry, info`。    

### next/router

主要是 `useRouter` hook 和 `withRouter` hoc。然后对象有这些内容：   

- `pathname`: 字符串，当前的路由
- `query`
- `asPath`: 字符串，包含 query 部分的路径
- `isFallback`: 当前页面是否处于 fallback mode
- `basePath`
- `locale`
- `locales`
- `defaultLocale`
- `domainLocales`
- `isReady`: 
- `isPreview`   

方法：   

- `router.push(url, as, options)`
- `router.replace(url, as, options)`
- `router.prefetch(url, as)`
- `router.beforePopState(cb)`
- `router.back()`