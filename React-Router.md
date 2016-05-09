You should get the same screen as before, but this time with some junk in the URL. We're using hashHistory--it manages the routing history with the hash portion of the url. It's got that extra junk to shim some behavior the browser has natively when using real urls. We'll change this to use real urls later and lose the junk, but for now, this works great because it doesn't require any server-side configuration.  

现在屏幕上的东西和之前的是一样的，但是这次在URL上多了些东西。我们正在使用 hashHistory, 这个对象使用url的 hash部分来管理路由的历史。 它会使用这些额外的东西去处理浏览器在使用真实urls时一些原生的行为。我们稍后会改变这部分成真实的urls并且丢弃掉这些‘垃圾’，但是现在它可以正常工作而且无需客户端配置。  

Perhaps the most used component in your app is Link. Its almost identical to the &lt;a/&gt; tag you're used to except that its aware of the Router it was rendered in.  

或许我们app中使用最多的就是Link组件了。它几乎和a标签是一样的，除了它是被渲染到Router组件中。  

### Nested Routes 嵌套的路由 
The navigation we added to App should probably be present on every screen. Without React Router, we could wrap that ul into a component, say Nav, and render a Nav on every one of our screens.  

我们添加进App组件里的导航应该可以正常的显示到屏幕上。 没有React Router组件的话，我们可以将ul列表包裹到一个叫Nav的组件中，并且渲染这个组件到屏幕上。  

This approach isn't as clean as the application grows. React Router provides another way to share UI like this with nested routes, a trick it learned from Ember (/me tips hat).  

这个方法随着应用的变大显得不那么整洁。 React Routers 提供了另一种和这种类似的方式共享UI，使用嵌套的路由，一种从Ember学习的技巧。  

### Nested UI and Nested URLs 嵌套的UI和嵌套的路由
Have you ever noticed your app is just a series of boxes inside boxes inside boxes? Have you also noticed your URLs tend to be coupled to that nesting? For example given this url, /repos/123, our components would probably look like this:  

你是否注意到我们的app就像一系列嵌套的盒子，一个盒子套着一个盒子？ 你是否也注意到我们的URLs地址类似地也像这样嵌套着？ 比如说，给出一个这样的url， /repos/123, 我们的组件可能长的像这样：
```html
<App>       {/*  /          */}
  <Repos>   {/*  /repos     */}
    <Repo/> {/*  /repos/123 */}
  </Repos>
</App>
```
并且我们的UI界面可能像这样：
```
         +-------------------------------------+
         | Home Repos About                    | <- App
         +------+------------------------------+
         |      |                              |
Repos -> | repo |  Repo 1                      |
         |      |                              |
         | repo |  Boxes inside boxes          |
         |      |  inside boxes ...            | <- Repo
         | repo |                              |
         |      |                              |
         | repo |                              |
         |      |                              |
         +------+------------------------------+
``` 
React Router embraces this by letting you nest your routes, which automatically becomes nested UI.  


通过让你自己来嵌套你的路由， React Router可以自动转化成上面嵌套的UI。  

First, let the App Route have children, and move the other routes underneath it.  

### Sharing Our Navigation 共享我们的导航
Lets nest our About and Repos components inside of App so that we can share the navigation with all screens in the app. We do it in two steps:  

把我们的About和Repos组件放到App组件中，以便我们可以共享我们的导航在app的屏幕上， 我们需要下面这两个步骤：

First, let the App Route have children, and move the other routes underneath it.  

首先， 让App Route 拥有子节点，即把其他路由放到组件里面。  

```javascript
// index.js
// ...
render((
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      {/* make them children of `App` */}
      <Route path="/repos" component={Repos}/>
      <Route path="/about" component={About}/>
    </Route>
  </Router>
), document.getElementById('app'))
```
Next, render children inside of App.  

接下来， 渲染App组件的子节点。  

```javascript
// modules/App.js
// ...
  render() {
    return (
      <div>
        <h1>Ghettohub Issues</h1>
        <ul role="nav">
          <li><Link to="/about">About</Link></li>
          <li><Link to="/repos">Repos</Link></li>
        </ul>

        {/* add this */}
        {this.props.children}

      </div>
    )
  }
// ...
```
Alright, now go click the links and notice that the App component continues to render while the child route's component gets swapped around as this.props.children :)  

好了，现在去点击链接，我们会注意到App组件继续渲染直到子路由的组件交替出现作为它的子节点。 

React Router is constructing your UI like this:

React Router 是像下面这样构造你的UI界面：  
```html
// at /about
<App>
  <About/>
</App>

// at /repos
<App>
  <Repos/>
</App>
```

### By Small and Simple Things are Great Things Brought to Pass  

The best way to build large things is to stitch small things together.  

构建大型应用最好的方式是将一个一个小组件"缝合"到一起。  

This is the real power of React Router, every route can be developed (even rendered!) as an independent application. Your route configuration stitches all these apps together however you'd like. Applications inside of Applications, boxes inside of boxes.  

这就是React Router的能力，每个路由可以作为一个独立的组件开发（甚至是渲染）。你的路由配置按照你喜欢的样子将所有的这些app"缝合"到一起。应用嵌套到另一个应用里，盒子嵌套到另一个盒子里。  

What happens if you move the About route outside of App?  

如果把About路由移动到App外面会怎么样？


## 05-active-links Active Links
One way that Link is different from a is that it knows if the path it links to is active so you can style it differently.  

Link组件和a标签的一点不同是，Link组件知道哪些连接的路径是active的，以便你可以使用不同的样式。（？？？）   

###Active Styles
Let's see how it looks with inline styles, add activeStyle to your Linkss.  

让我们看一下使用内联样式是什么样的，把下面的激活的样式添加到Link中。

```javascript
// modules/App.js
<li><Link to="/about" activeStyle={{ color: 'red' }}>About</Link></li>
<li><Link to="/repos" activeStyle={{ color: 'red' }}>Repos</Link></li>
```
结果就是目前展示的组件的链接字体是红色。

###Active Class Name
You can also use an active class name instead of inline-styles.  

你也可以使用激活的类名来替代内联样式。  

```javascript
<li><Link to="/about" activeClassName="active">About</Link></li>
<li><Link to="/repos" activeClassName="active">Repos</Link></li>
```

We don't have a stylesheet on the page yet though. Lets add one--extra points if you can add a link tag from memory.  

我们的页面目前为止还没有样式表。 现在我们为页面添加一个link标签。   
`<link rel="stylesheet" href="index.css" />`  

And the css file: css文件内容如下：
```css
.active {
  color: green;
}
```

You'll need to manually refresh the browser since Webpack isn't building our index.html.   

你需要手动刷新浏览器，因为Webpack不能自动构建我们的index.html文件。

###Nav Link Wrappers
Most links in your site don't need to know they are active, usually just primary navigation links need to know. It's useful to wrap those so you don't have to remember what your activeClassName or activeStyle is everywhere.   

你网站内大部分的链接不需要知道它们是激活状态的，只有主导航链接需要知道。一个有用的办法是把这些链接包裹起来，这样你就没必要记住你的activeClassName 或者 activeStyle是什么。  

We will use an spread attribute here, the three dots. It clones our props and in this use case it clones activeClassName to our desired component for us to benefit from.  

我们会使用对象的解构语法。它会克隆一份props，在我们的例子中。。。  

## 06-params   URL Params
Consider the following urls:

考虑一下下面的这些urls:

```
/repos/reactjs/react-router
/repos/facebook/react
```

These urls would match a route path like this:  

这些urls地址会匹配一个路由路径像下面这样：

`/repos/:userName/:repoName`  

The parts that start with : are url parameters whose values will be parsed out and made available to route components on this.props.params[name].  

用:开头的url是url参数， 值会被解析出来并且在路由组件上作为 this.props.params[name]可用。  


### Adding a Route with Parameters
Lets teach our app how to render screens at /repos/:userName/:repoName.  

让我们告诉app该怎样渲染路径/repos/:userName/:repoName 在屏幕上。  

First we need a component to render at the route, make a new file at modules/Repo.js that looks something like this:  

首先我们需要一个组件在路由中被渲染， 新建一个文件保存在modules/Repo.js ,文件内容看上去像下面这样：

```javascript
// modules/Repo.js
import React from 'react'

export default React.createClass({
  render() {
    return (
      <div>
        <h2>{this.props.params.repoName}</h2>
      </div>
    )
  }
})
```
Now open up index.js and add the new route.  

打开index.js，将新路由添加进去。

```javascript
// ...
// import Repo
import Repo from './modules/Repo'

render((
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <Route path="/repos" component={Repos}/>
      {/* add the new route */}
      <Route path="/repos/:userName/:repoName" component={Repo}/>
      <Route path="/about" component={About}/>
    </Route>
  </Router>
), document.getElementById('app'))
```

Now we can add some links to this new route in Repos.js.   

我们在Repos.js 文件中为新的路由添加一些链接。

```javascript
// Repos.js
import { Link } from 'react-router'
// ...
export default React.createClass({
  render() {
    return (
      <div>
        <h2>Repos</h2>

        {/* add some links */}
        <ul>
          <li><Link to="/repos/reactjs/react-router">React Router</Link></li>
          <li><Link to="/repos/facebook/react">React</Link></li>
        </ul>

      </div>
    )
  }
})
```

Now go test your links out. Note that the parameter name in the route path becomes the property name in the component. Both repoName and userName are available on this.props.params of your component. You should probably add some prop types to help others and yourself out later.  

现在去测试一下我们的链接。注意路由路径中的参数名变成了组件的属性名。在我们的组件中，repoName和userName通过this.props.params都是可以获取到的。

## 07-more-nesting More Nesting
Notice how the list of links to different repositories goes away when we navigate to a repository? What if we want the list to persist, just like the global navigation persists?  

注意到当我们导航进一个repository和导航到repositories列表时链接列表的不同了嘛。如果我们希望列表像全局导航的列表保留下来该怎么办？


Try to figure that out before reading on.  

在读下面的内容前先试着想一想。   

First, nest the Repo route under the Repos route. Then go render this.props.children in Repos.   

首先，将Repo路由嵌套到到Repos路由组件中。然后在Repos组件中渲染this.props.children子节点。

```javascript
// index.js
// ...
<Route path="/repos" component={Repos}>
  <Route path="/repos/:userName/:repoName" component={Repo}/>
</Route>
```

```javascript
// Repos.js
// ...
<div>
  <h2>Repos</h2>
  <ul>
    <li><Link to="/repos/reactjs/react-router">React Router</Link></li>
    <li><Link to="/repos/facebook/react">React</Link></li>
  </ul>
  {/* will render `Repo.js` when at /repos/:userName/:repoName */}
  {this.props.children}
</div>
``` 

## 08-index-routes Index Routes
When we visit / in this app it's just our navigation and a blank page. We'd like to render a Home component there. Lets create a Home component and then talk about how to render it at /.   

当我们访问 / 页面时，这个页面仅仅是我们的导航页面，几乎是空白的页面。我们想要渲染一个Home组件在这个页面中。先创建一个Home组件然后谈谈怎样在 / 渲染它。  

```javascript
// modules/Home.js
import React from 'react'

export default React.createClass({
  render() {
    return <div>Home</div>
  }
})
```
One option is to see if we have any children in App, and if not, render Home:  

允许我们的App组件在有子节点时展示子节点，否则就展示Home组件：

```javascript
// App.js
import Home from './Home'

// ...
<div>
  {/* ... */}
  {this.props.children || <Home/>}
</div>
//...
```

This would work fine, but its likely we'll want Home to be attached to a route like About and Repos in the future. A few reasons include:  

现在这样可以很好的运行， 但是可能我们将来想要Home组件可以像About和Repos那样绑定一个路由。 这样做可能有以下几个原因：

1. Participating in a data fetching abstraction that relies on matched routes and their components.
2. Participating in onEnter hooks
3. Participating in code-splitting

Also, it just feels good to keep App decoupled from Home and let the route config decide what to render as the children. Remember, we want to build small apps inside small apps, not big ones!  

因此，让App组件和Home组件去耦合并且让路由配置决定怎样渲染子节点是不错的做法。 记住，我们想要在构建一些小型应用到另一些小型应用里面，而不是一个大的。  

Lets add a new route to index.js.  

现在在index.js中添加一个新路由。

```javascript
// index.js
// new imports:
// add `IndexRoute` to 'react-router' imports
import { Router, Route, hashHistory, IndexRoute } from 'react-router'
// and the Home component
import Home from './modules/Home'

// ...

render((
  <Router history={hashHistory}>
    <Route path="/" component={App}>

      {/* add it here, as a child of `/` */}
      <IndexRoute component={Home}/>

      <Route path="/repos" component={Repos}>
        <Route path="/repos/:userName/:repoName" component={Repo}/>
      </Route>
      <Route path="/about" component={About}/>
    </Route>
  </Router>
), document.getElementById('app'))
```
(注意还要把App组件中的Home组件删除掉)

Notice how the IndexRoute has no path. It becomes this.props.children of the parent when no other child of the parent matches, or in other words, when the parent's route matches exactly.  

注意 IndexRoute 组件并没有任何路径。 它会变成父节点的子节点当没有其他的子节点时， 或者换句话说， 当父节点的路由没有匹配的路径时。  

Index routes can twist people's brains up sometimes. Hopefully it will sink in with a bit more time. Just think about a web server that looks for index.html when you're at /. Same idea, React Router looks for an index route if a route's path matches exactly.   

Index 路由有时会让人很难理解。 但是再过一会它有希望变得容易理解。想想当你访问 / 路径时web服务器会去寻找 index.html。同样的，React Router会去寻找index 路由。  

## 09-index-links  Index Links
Have you noticed in our app that we don't have any navigation to get back to rendering the Home component?   

你是否注意到我们的app中每一任何回到Home组件的导航。  

Lets add a link to / and see what happens:  

让我们去为根路径/添加一个链接，看看会发生什么：

```javascript
// in App.js
// ...
<li><NavLink to="/">Home</NavLink></li>
// ...
```

Now navigate around. Notice anything weird? The link to Home is always active! As we learned earlier, parent routes are active when child routes are active. Unfortunately, / is the parent of everything.

现在导航会去。注意到什么奇怪的东西了吗？Home的链接总是激活的，正如我们之前学到的， 父级路由是激活的当子路由是激活的时候。不幸的时， / 就是所有路径的父级路由。  

For this link, we want it to only be active when the index route is active. There are two ways to let the router know you're linking to the "index route" so it only adds the active class (or styles) when the index route is rendered.

对于这个链接，我们想要它只有当index路由激活的时候才是激活的。这里有两种方式告诉你的路由器你正在链接到 "index route"，以便它仅仅添加active 类或者样式当index route被渲染时。  


### IndexLink
First lets use the IndexLink

首先让我们使用IndexLink 组件

```javascript
// App.js
import { IndexLink, Link } from 'react-router'

// ...
<li><IndexLink to="/" activeClassName="active">Home</IndexLink></li>
```

Fixed! Now this link is only "active" when we're at the index route. Go ahead and click around to see.  

问题解决了！现在这个链接只有当我们在index 路由时才是激活状态的。  

### onlyActiveOnIndex Property
We can use Link as well by passing it the onlyActiveOnIndex prop (IndexLink just wraps Link with this property for convenience).  

我们也可以通过给Link组件传递一个onlyActiveOnIndex 的属性(IndexLink 组件仅仅是包裹了Link组件加上了这个属性)  
`<li><Link to="/" activeClassName="active" onlyActiveOnIndex={true}>Home</Link></li>`  


## 10-clean-urls  Clean URLs with Browser History
The URLs in our app right now are built on a hack: the hash. Its the default because it will always work, but there's a better way.  

我们app现在的URLs是建立在黑科技上的：hash. 这个默认的选项因为这总是能正常工作，但是还有更好的方法。

Modern browsers let JavaScript manipulate the URL without making an http request, so we don't need to rely on the hash (#) portion of the url to do routing, but there's a catch (we'll get to it later).   

现代浏览器允许JS操作URL但是不发送http请求，所以我们没必要依赖url的hash(#)部分去做路由，但是这里会出现一点问题

### Configuring Browser History
Open up index.js and import browserHistory instead of hashHistory.

打开index.js文件并且导入browserHistory而不是hashHistory。

```javascript
// index.js
// ...
// bring in `browserHistory` instead of `hashHistory`
import { Router, Route, browserHistory, IndexRoute } from 'react-router'

render((
  <Router history={browserHistory}>
    {/* ... */}
  </Router>
), document.getElementById('app'))
```
Now go click around and admire your clean urls.

现在随便点击一下看看我们整洁的urls.

Oh yeah, the catch. Click on a link and then refresh your browser. What happens?

好了，现在问题马上出现。点击一个链接并且刷新浏览器，发生什么？

### Configuring Your Server
Your server needs to deliver your app no matter what url comes in, because your app, in the browser, is manipulating the url. Our current server doesn't know how to handle the URL.  

你的服务器需要知道当有url传入时该怎样处理你的app, 然而现在是我们的app操作着浏览器中的url地址。我们现在的服务器还不知道怎么处理URL。

The Webpack Dev Server has an option to enable this. Open up package.json and add --history-api-fallback.  

Webpack Dev Server 有一个选项开启这个功能。

```  "start": "webpack-dev-server --inline --content-base . --history-api-fallback"```   

We also need to change our relative paths to absolute paths in index.html since the urls will be at deep paths and the app, if it starts at a deep path, won't be able to find the files.   

我们也需要把index.html里的相对路径改为绝对路径，因为现在的urls是deep paths(???) ，如果app启动时是deep path, 那么服务器找不到文件。

```javascript
<!-- index.html -->
<!-- index.css -> /index.css -->
<link rel=stylesheet href=/index.css>

<!-- bundle.js -> /bundle.js -->
<script src="/bundle.js"></script>
```


##  11-productionish-server  Production-ish Server
None of this has anything to do with React Router, but since we're talking about web servers, we might as well take it one step closer to the real-world. We'll also need it for server rendering in the next section.    

这部分内容不需要我们对React Router去做任何的修改， 但是既然我们在讨论web服务器， 我们可以更近一步去考虑一下真实世界的服务器。下一部分服务器端渲染也需要这些内容。

Webpack dev server is not a production server. Let's make a production server and a little environment-aware script to boot up the right server depending on the environment.   

Webpack dev server 并不是一个产品环境的服务器。让我们创建一个产品服务器并且编写一些能分辨开发环境的脚本，这些脚本可以更具环境启动正确的服务器。

Let's install a couple modules:

```npm install express if-env compression --save```


First, we'll use the handy if-env in package.json. Update your scripts entry in package.json to look like this:  

首先，我们会使用便利的 if-env 模块在package.json文件中。 像下面这样更新你的入口脚本：

```javascript
// package.json
"scripts": {
  "start": "if-env NODE_ENV=production && npm run start:prod || npm run start:dev",
  "start:dev": "webpack-dev-server --inline --content-base . --history-api-fallback",
  "start:prod": "webpack && node server.js"
},
```

Now when we run npm start it will check if our NODE_ENV is production. If it is, we run npm run start:prod, if it's not, we run npm run start:dev.  

现在，当我们执行``npm run start``时会检查我们的NODE_ENV变量是否是production。 如果是，我们会执行npm run start:prod, 否则会执行npm run start:dev.

Now we're ready to create a production server with Express and add a new file at root dir. Here's a first attempt:  

现在我们需要使用Express创建一个产品服务器，并且添加一个文件在根目录。下面是文件的基本内容:

```javascript
// server.js
var express = require('express')
var path = require('path')
var compression = require('compression')

var app = express()

// serve our static stuff like index.css
app.use(express.static(__dirname))

// send all requests to index.html so browserHistory in React Router works
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'))
})

var PORT = process.env.PORT || 8080
app.listen(PORT, function() {
  console.log('Production Express server running at localhost:' + PORT)
})
```

Now run:

```
NODE_ENV=production npm start
# For Windows users:
# SET NODE_ENV=production npm start
```

Congratulations! You now have a production server for this app. After clicking around, try navigating to http://localhost:8080/package.json. Whoops. Let's fix that. We're going to shuffle around a couple files and update some paths scattered across the app.  


祝贺你！你现在已经拥有了一个生产环境的服务器。试着去导航到 http://localhost:8080/package.json 。发生了什么。 让我们处理一下这个问题。我们需要重新处理一下文件的位置并且更新app中的路径。

1. make a public directory.   
2. Move index.html and index.css into it.

Now let's update server.js to point to the right directory for static assets:  

现在更新server.js 去使它可以正确的找到静态文件的目录：

```javascript
// server.js
// ...
// add path.join here
app.use(express.static(path.join(__dirname, 'public')))

// ...
app.get('*', function (req, res) {
  // and drop 'public' in the middle of here
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})
```

We also need to tell wepback to build to this new directory: 

我们也需要告诉webpack去打包文件到这个新目录：

```javascript
// webpack.config.js
// ...
output: {
  path: 'public',
  // ...
}
```

And finally (!) add it to the --content-base argument to npm run start:dev script: 

最后添加下面的 --content-base 参数到npm run start:dev 脚本：

```
"start:dev": "webpack-dev-server --inline --content-base public --history-api-fallback",
```

If we had the time in this tutorial, we could use the WebpackDevServer API in a JavaScript file instead of the CLI in an npm script and then turn this path into config shared across all of these files. But, we're already on a tangent, so that will have to wait for another time.

如果你还有时间，我们可以使用 WebpackDevServer API在一个单独的JavaScript文件中，而不是在CLI调用的时候。但是，现在我们已经有点离题了，所以必须等到下次了。


Okay, now that we aren't serving up the root of our project as public files, let's add some code minification to Webpack and gzipping to express.

好了，现在我们不会提供项目根目录的文件了，现在添加一些代码开启Webpack和express gzipping压缩功能.

```javascript
// webpack.config.js

// make sure to import this
var webpack = require('webpack')

module.exports = {
  // ...

  // add this handful of plugins that optimize the build
  // when we're in production
  plugins: process.env.NODE_ENV === 'production' ? [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin()
  ] : [],

  // ...
}
```

```javascript
// server.js
// ...
var compression = require('compression')

var app = express()
// must be first!
app.use(compression())
```


##  12-navigating  Navigating Programatically
While most navigation happens with Link, you can programatically navigate around an application in response to form submissions, button clicks, etc.  

大部分的导航都会发生在Link组件上，你也可以通过编程实现应用在表单提交和按钮点击时触发导航行为。

Let's make a little form in Repos that programatically navigates.

现在创建一个表单在Repos组件中。

```javascript
// modules/Repos.js
import React from 'react'
import NavLink from './NavLink'

export default React.createClass({

  // add this method
  handleSubmit(event) {
    event.preventDefault()
    const userName = event.target.elements[0].value
    const repo = event.target.elements[1].value
    const path = `/repos/${userName}/${repo}`
    console.log(path)
  },

  render() {
    return (
      <div>
        <h2>Repos</h2>
        <ul>
          <li><NavLink to="/repos/reactjs/react-router">React Router</NavLink></li>
          <li><NavLink to="/repos/facebook/react">React</NavLink></li>
          {/* add this form */}
          <li>
            <form onSubmit={this.handleSubmit}>
              <input type="text" placeholder="userName"/> / {' '}
              <input type="text" placeholder="repo"/>{' '}
              <button type="submit">Go</button>
            </form>
          </li>
        </ul>
        {this.props.children}
      </div>
    )
  }
})
```

There are two ways you can do this, the first is simpler than the second.

现在有两种方式你可以选择，第一种要比第二种更简单。

First we can use the browserHistory singleton that we passed into Router in index.js and push a new url into the history.

第一种，我们可以使用browserHistory单例，将一个新的url地址添加到历史中。

```javscript
// Repos.js
import { browserHistory } from 'react-router'

// ...
  handleSubmit(event) {
    // ...
    const path = `/repos/${userName}/${repo}`
    browserHistory.push(path)
  },
// ...
```

