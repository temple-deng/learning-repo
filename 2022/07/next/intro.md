# Next

<!-- TOC -->

- [Next](#next)
  - [入门教程](#入门教程)

<!-- /TOC -->


## 入门教程    

Next 提供 3 种渲染方法：SSR, SSG 和 CSR。    

默认情况下都是预渲染的。    

Next 的特征：   

- 直观的基于页面的路由系统
- 单页级别的 SSG, SSR 支持
- 自动化的代码分割
- 优化过的客户端路由预取
- 内置 CSS 和 Sass 支持，以及 CSS-in-JS 支持
- Fast Refresh 支持
- 完全可扩展     

示例项目安装命令：   

```bash
npx create-next-app nextjs-blog --use-npm --example "https://github.com/vercel/next-learn/tree/master/basics/learn-starter"
```     

进入目录的有3个文件夹，一个 public 里面有两个 icon，一个 pages，里面有一个 index.js 内容。然后一个 .next 文件夹，里面有一些东西，像是构建后的内容，暂时先不管。index.js 内容如下：   

```jsx
import Head from 'next/head'

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p className="description">
          Get started by editing <code>pages/index.js</code>
        </p>

        <div className="grid">
          <a href="https://nextjs.org/docs" className="card">
            <h3>Documentation &rarr;</h3>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className="card">
            <h3>Learn &rarr;</h3>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/master/examples"
            className="card"
          >
            <h3>Examples &rarr;</h3>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/import?filter=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className="card"
          >
            <h3>Deploy &rarr;</h3>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>

      <footer>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel" className="logo" />
        </a>
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        footer img {
          margin-left: 0.5rem;
        }

        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .title,
        .description {
          text-align: center;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          max-width: 800px;
          margin-top: 3rem;
        }

        .card {
          margin: 1rem;
          flex-basis: 45%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }

        .card:hover,
        .card:focus,
        .card:active {
          color: #0070f3;
          border-color: #0070f3;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        .logo {
          height: 1em;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
```   

这框架背后做的东西还是挺多的，首先是有 ssr 的，然后像上面的 Head 组件看起来也有点学问，然后还有 HMR 功能，目前我们是一点配置都没加的。而且 index 中的也没调用 react-dom 相关的内容进行渲染。看起来是有服务器处理的。        

在 next 中，pages 目录中每个文件导出的 react 组件就是一个页面。页面是通过文件名进行路由的。   

但是奇怪啊，这种情况下，我们访问 http://localhost:3000/index，报了404，不是很理解。。。    

跳转组件用框架的：   

```jsx
import Link from 'next/link';
<h1 className="title">
  Read{' '}
  <Link href="/posts/first-post">
    <a>this page!</a>
  </Link>
</h1>
```   

然后使用的是客户端的跳转，非页面跳转，具体内部用的哪个框架还不清楚。   

根据文档的描述的话，当页面视口中出现 `Link` 组件的时候，next 会去预取链接页面的代码。等真正跳转的时候
代码可能已经加载好了。   

public 目录下的东西都可以直接引用。   

对于图片来说，Next 提供了开箱即用的 Image 组件，应该是可以替我们处理响应式，压缩及懒加载的功能。   

而且这种处理还不是发生在构建时，而是运行时，即用户请求的时候。    

```jsx
import Image from 'next/image';

const YourComponent = () => (
  <Image
    src="/images/profile.jpg" // Route of the image file
    height={144} // Desired size with correct aspect ratio
    width={144} // Desired size with correct aspect ratio
    alt="Your Name"
  />
);
```    

之前见到的 Head 组件就是类似页面中 head，用来添加元数据的。    

添加 Script 内容：   

```jsx
import Script from 'next/script';
<Script
    src="https://connect.facebook.net/en_US/sdk.js"
    strategy="lazyOnload"
    onLoad={() =>
        console.log(`script loaded correctly, window.FB has been populated`)
    }
/>
```    

这一般是用来加载一些第三方的代码，即外部的代码。    

对于之前见过 style 内容：   

```jsx
<style jsx>{`
  …
`}</style>
```     

这个使用 styled-jsx 库，一个 CSS-in-JS 库。.module.css 的文件会认为使用了 CSS Modules。   

```jsx
import styles from './layout.module.css';

export default function Layout({ children }) {
    return <div className={styles.container}>{children}</div>
}
```   

所以目前 next 支持 SASS, CSS-in-JS，CSS Modules。   

全局性的组件，在 pages/_app.js 添加内容：   

```jsx
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
```   

App 组件是一个顶层组件，所有的页面都会用到，可以使用他进行页面间一些状态的保存。同时也只能在这个文件中引入全局的 CSS 文件。其他的地方都不可以。那这是什么意思，是我别的地方都只能从 css-in-js 和 css modules 中进行二选一？    

根据文档，nextjs 使用了 postcss 编译 css，话说这里并没有看出哪部分需要编译啊。   

因此可以在根目录顶层定义 postcss.config.js 配置文件。   

SSG 是在构建的时候就生成 HTML。