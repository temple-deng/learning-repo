# next doc1  

<!-- TOC -->

- [next doc1](#next-doc1)
  - [入门](#入门)
  - [基础功能](#基础功能)
    - [Page](#page)
    - [data fetching](#data-fetching)
    - [内置的 CSS 支持](#内置的-css-支持)
    - [图片优化](#图片优化)
    - [Fast Refresh](#fast-refresh)
  - [eslint](#eslint)
    - [ts](#ts)
    - [环境变量](#环境变量)
    - [浏览器](#浏览器)
    - [Script](#script)
  - [路由](#路由)
    - [res helpers](#res-helpers)
  - [部署](#部署)
  - [高级功能](#高级功能)
    - [编译器](#编译器)
    - [预览模式](#预览模式)
    - [Automatic Static Optimization](#automatic-static-optimization)

<!-- /TOC -->

## 入门

安装：   

```bash
npx create-next-app@latest

pnpm create next-app

npx create-next-app@latest --typescript

pnpm create next-app --typescript
```     

## 基础功能

### Page   

默认情况下，预渲染每个页面。   

SSG 中两个关键 API:   

- `getStaticProps`: 返回一个对象，包含 props 属性，会直接传给 page 组件。
- `getStaticPaths`   

具体参数和返回值看文档吧，这里不展开说了。   

SSR: `getServerSideProps`。    

看情况可能默认都是 SSG 的页面。如果要 SSR 的话，就得定义 `getServerSideProps`。   

但是这里并不明确，同时定义 `getStaticProps`, 和 `getServerSideProps` 是用哪种。   

同时还有一个问题，`getStaticPaths` 这种动态路由只能和 SSG 一起用吗。    

话说这里还有一个问题哦，我们在项目内部通过 link 或者 router 进行单页跳转的时候，next 在请求新的页面的时候请求的是什么类型的东西，html 吗，还是哪一部分的东西，渲染的时候又是如何操作的。   

### data fetching   

ssr 的时候可以通过设置 Cache-Control 首部控制缓存。   

```jsx
// This value is considered fresh for ten seconds (s-maxage=10).
// If a request is repeated within the next 10 seconds, the previously
// cached value will still be fresh. If the request is repeated before 59 seconds,
// the cached value will be stale but still render (stale-while-revalidate=59).
//
// In the background, a revalidation request will be made to populate the cache
// with a fresh value. If you refresh the page, you will see the new value.
export async function getServerSideProps({ req, res }) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  )

  return {
    props: {},
  }
}

```   

`getStaticPaths` 必须和 `getStaticProps` 一起用。   

在构建的时候，`getStaticProps` 会同时生成 HTML 文件和一个 JSON 文件，json 文件是这个函数的返回结果。    

在前端路由跳转页面的时候，next 会请求这个 json 文件，然后把数据交给前端组件渲染，那也就是说几遍是 SSG 的页面，可能前端页面也要进行必要的打包。    

ISR 增量静态站点生成。貌似意思是在整体构建完成后，还可以针对单个页面进行 SSG，而不用整个构建整个项目。    

要使用 ISR，给 `getStaticProps` 的返回对象中，添加 `revalidate` 属性。   

```jsx
function Blog({ posts }) {
    return (
        <ul>
            posts.map((post) => (<li key={post.id}>{post.title}</li>))
        </ul>
    );
}

export async function getStaticProps() {
    const res = await fetch('https://.../posts');
    const posts = await res.json();

    return {
        props: {
            posts,
        }
        // Next.js will attempt to re-generate the page:
        // - When a request comes in
        // - At most once every 10 seconds
        revalidate: 10, // In seconds
    }
}
```     

当一个对 SSG 页面的请求到来后，首先会展现这个缓存的页面：   

- 在初始请求后 10s 以内的后续请求都会使用缓存的页面
- 在 10s 的时间窗口后，下次请求仍会使用缓存的页面
- nextjs 会在后台触发页面的重新生成
- 一旦页面成功生成，next 会立刻让缓存失效并展现更新后的页面     

这里还有一种情况是动态路由的情况，假设构建时有个路径没生成，但是后续访问了，这个时候如果 `getStaticPaths` 配置了 `fallback: 'blocking'`。那么就会重新调用 `getStaticPaths` 尝试生成这个页面。   

还有一种可以让 SSG 页面失效的方法。是手动调用 `revalidate` 函数。   

比如说这样，我们首先创建一个私钥，然后创建一个 api 路由：    

```
https://<your-site.com>/api/revalidate?secret=<token>
```     

然后在 api 中调用 revalidate。   

```js
// pages/api/revalidate.js

export default async function handler(req, res) {
  // Check for secret to confirm this is a valid request
  if (req.query.secret !== process.env.MY_SECRET_TOKEN) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  try {
    // this should be the actual path not a rewritten path
    // e.g. for "/blog/[slug]" this should be "/blog/post-1"
    await res.revalidate('/path-to-revalidate')
    return res.json({ revalidated: true })
  } catch (err) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return res.status(500).send('Error revalidating')
  }
}
```    

### 内置的 CSS 支持    

全局的 CSS 之前说过了，在 _app.js 中引入，会对所有的页面生效。    

在 production 模式，所有的 css 文件都会进行拼接形成单一的 css 文件。    

然后呢有时候我们可能需要引入第三方的 css，在 node_modules 这种情况下，貌似也是某种全局的，估计是本页全局，但具体是怎样的还不清楚。    

同时这里看情况，CSS Modules 是针对类名的。    

虽然文档上说 CSS Modules 是可选的，但是如果你在非 app 中引入 xxx.css 的文件会直接报错提示你。。。。那这算哪门子的可选啊。   

### 图片优化

导入本地图片：   

```js
import profilePic from '../public/me.png';
```   

还提供了自动检测宽高的功能，防止 CLS 引发性能问题。问题是检测图片的宽高有什么用，不应该检测我展示的大小吗。    

对于网络图片，因为不能自动检测，所以需要手动提供 width, height。     

规定图片尺寸，避免 CLS 问题的三种方式：   

1. 自动，使用 import
2. 手动指出，设置 width, height 属性
3. 使用 `layout="fill"` 隐式让图片 fill 父元素    

### Fast Refresh

工作原理：   

- 假设我们编译的是一个仅 export react 组件的文件，那么会立刻更新这个文件的代码，重新渲染组件
- 如果我们编辑的文件不是 export 组件的文件，那么会重新运行这个文件，以及所有导入他的文件。
- 最后，如果编辑文件是被 react 组件树之外的文件导入的。会回退到整个重新加载。    

## eslint   

默认是提供了 eslint，直接 next lint 即可，但是如果我们没提供配置文件，可能会开始默认的 eslint 配置文件创建流程。    

不过这里好像说错了，不是默认的 eslint，应该是 next 提供的模式选择的窗口，有3个值可选：    

- Strict: 包含 next 基础 eslint 配置，配置了 core web vitals rule-set。推荐使用
- Base: 包含基础 next eslint 配置
- Cancel: 不包含任何的 eslint 配置     

### ts    

默认是使用 SWC 编译 ts, tsx。不过如果有 .babelrc 配置文件的话，就会使用 babel。   

这整个学习成本也太高了，自己的路由系统，自己的编译器，自己的 hooks。   

### 环境变量     

next 可以自动加载 `.env.local` 中的变量，从而可以在 process.env 使用。   

这里说不让对 `process.env` 使用对象结构的方式，暂时看不懂为什么。   

如果想要暴露一些变量给浏览器，变量需要使用 `NEXT_PUBLIC_` 前缀。    

### 浏览器

Next 支持 IE11 及以上。   

除了对浏览器正常的垫片之外，还加了以下垫片：   

- `fetch()`
- `URL`
- `Object.assign`。    

### Script

加载策略：   

- `beforeInteractive`: 在页面可交互前加载，即添加到 html 头部，在自有脚本前执行，只能在 _document.js 中使用。
- `afterInteractive`: 默认值，在页面可交互后加载
- `lazyOnload`: 在空闲时加载
- `worker`: 在 web worker 中加载（试验性质）   

## 路由    

之前说过 Link 组件可能会预取，这种预取好像只针对 SSG 生成的页面。   

```jsx
// pages/post/[pid].js
import { useRouter } from 'next/router'

const Post = () => {
  const router = useRouter()
  const { pid } = router.query

  return <p>Post: {pid}</p>
}

export default Post
```     

这里不是很理解，为什么 path 部分的东西，要放到了 query 里面呢。   

对于 `/posts/abc?foo=bar`，就有这样的 query 对象 `{"foo": "bar", "pid": "abc"}`。    

不过需要注意一点是同名的 path 参数会覆盖 query 参数。对于 `/post/abc?pid=123`，query 对象就是`{pid: "abc"}`。    

在方括号中添加 `...` 可以让 next 捕获扩展的路由：   

- `pages/post/[...slug].js` 匹配 `/post/a`, `/post/a/b`, `/post/a/b/c` 等等    

这时候参数值就是数组了，`['a'], ['a', 'b'], ['a', 'b', 'c']`。    

然后呢，这种捕获路由是可选的，形式就是双括号 `[[...slug]]`。   

这种形式和上面最大的区别就是，这种还可以匹配 `/post`。   

一般来说，link 组件可以覆盖大部分跳转的情况。但是也提供了手动跳转的方式：   

```jsx
import { useRouter } from 'next/router';

export function ReadMore() {
    const router = useRouter();

    return (
        <button onClick={() => router.push('/about')}>
            Clicck here to read more
        </button>
    )
}
```    

api 内置了一些中间件：   

- `req.cookies`
- `req.query`
- `req.body`    

每个 api 路由还可以 export 一个 config 对象，修改默认的配置：   

```jsx
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1mb',
        }
    }
}
```


### res helpers    

- `res.status(code)`
- `res.json(body)`
- `res.send(body)`
- `res.redirect([status,] path)`
- `res.revalidate(urlPath)`    

## 部署    

`next build` 会生成：    

- 使用 `getStaticProps` 或 Automatic Static Optimization 的页面会生成 HTML 文件
- 全局的以及独立 scope 的样式文件
- 预渲染内容的 js 脚本
- 客户端脚本    

说了半天看不懂。那话说这里服务端脚本在哪。       

生成的东西都在 `.next` 目录中：    

- `.next/static/chunks/pages`: 这里面的每个 js 文件都和对应名称的路由相关。
- `.next/static/media`: next/image 中静态导入的图片会放到这里
- `.next/static/css`: 全局的 css 文件会放在这里
- `.next/server/pages`: 服务器预渲染的 js 和 html。
- `.next/server/chunks`: 一些在应用中多出使用的一些共享的 js 代码 chunk
- `.next/cache`: 缓存的一些东西    

所以看文档，build 是构建，最后 start 才会启动 nextjs 的服务器。   


## 高级功能

### 编译器     

这里很奇怪啊，它说使用的 SWC 做了编译器，但是代码中有大量 webpack 的东西，那这里 webpack 是充当打包工具？     

但是看文档上说 swc 也能打包。   

### 预览模式

首先创建一个预览的 api 路由，名称无所谓。   

然后需要在 api 中调用响应对象的 `setPreviewData` 方法，传入一个对象，这个对象最后可以在
`getStaticProps` 中使用。    

```js
export default function handler(req, res) {
    // ...
    res.setPreviewData({});
    // ...
}
```    

`setPreviewData` 会设置一些 cookies，以便开启预览模式。之后的请求带有 cookies 的便会认为是预览模式。   

如果我们现在是在预览模式下，则`getStaticProps` 会在请求时进行调用。    

带有一个 context 对象：   

- `context.preview`: true
- `context.previewData`: `setPreviewData` 传入的数据   

### Automatic Static Optimization    

当页面中出现 `getServerSideProps` 或者 `getInitialProps` 的时候，next 就会退化到
SSR。否则就会优化成 SSG。    

在预渲染阶段，router 的 query 对象会为空对象，因为这时候我们无法提供任何 query 信息，
在注水后，Nextjs 会触发一次应用的更新，从而提供正确的 query 参数。   

