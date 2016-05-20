# Vue.js
---
> vue.js 的官方文档摘录
> 摘自https://vuejs.org.cn/guide

---
###  1. Vue实例
#### 属性和方法
___
每个 Vue 实例都会代理其 data 对象里所有的属性：   
```javascript
var data = { a: 1 }
var vm = new Vue({
  data: data
})

vm.a === data.a // -> true

// 设置属性也会影响到原始数据
vm.a = 2
data.a // -> 2

// ... 反之亦然
data.a = 3
vm.a // -> 3
```
注意只有这些被代理的属性是响应的。如果在实例创建之后添加新的属性到实例上，它不会触发视图更新。   

可以认为传入Vue构造函数参数中data对象是对其键值对象下所有属性的引用（事实上对于原始类型如字符串等应该不存在引用的问题），之所以说是对其键值对象下所有属性的引用而不是对其键值对象的引用是因为当在键值对象上添加属性时，并不能同时反应到data的值中。（注意这种引用关系在后面的计算属性时可能会出现问题）如下面的例子：  

```javascript
var data = { a:1 , c : { d: 2}};
var vm = new Vue({
  data: data
})

data.b = 2;
vm.b //  undefined,可以看出新加的属性并没能添加到data的键值对象上去

vm.c === data.c  // true， vm.c 是对data.c 属性的引用
```

除了这些数据属性，Vue 实例暴露了一些有用的实例属性与方法。这些属性与方法都有前缀 $，以便与代理的数据属性区分。  
```javascript
var data = { a: 1 }
var vm = new Vue({
  el: '#example',
  data: data
})

vm.$data === data // -> true
vm.$el === document.getElementById('example') // -> true

// $watch 是一个实例方法
vm.$watch('a', function (newVal, oldVal) {
  // 这个回调将在 `vm.a`  改变后调用
})
```
这里的vm.$data是对data键值对象的整体引用

#### 实例的生命周期
---
![实例的生命周期][1]

### 2. 数据绑定语法
#### 插值
***
文本插值，使用 “Mustache” 语法（双大括号）：    

`<span>Message: {{ msg }}</span>`  

Mustache 标签会被相应数据对象的 msg 属性的值替换。每当这个属性变化时它也会更新。

你也可以只处理单次插值，今后的数据变化就不会再引起插值更新了：    

`<span>This will never change: {{* msg }}</span>`  

注意：貌似星号*和括号之间不能有空格，星号与数据之间的空格可有可无，感觉还是不要使用单次插值的好，可能会出现数据与视图不同步的现象。  

为了输出真的 HTML 字符串，需要用三 Mustache 标签：  

`<div>{{{ raw_html }}}</div>`  

Mustache 标签也可以用在 HTML 特性 (Attributes) 内：  

`<div id="item-{{ id }}"></div>`   

注意在 Vue.js 指令和特殊特性内不能用插值。

#### 绑定表达式
***
##### javascript表达式
放在 Mustache 标签内的文本称为绑定表达式。在 Vue.js 中，一段绑定表达式由一个简单的 JavaScript 表达式和可选的一个或多个过滤器构成。  

Vue.js 在数据绑定内支持全功能的 JavaScript 表达式：

```javascript
{{ number + 1 }}

{{ ok ? 'YES' : 'NO' }}

{{ message.split('').reverse().join('') }}
```
这些表达式将在所属的 Vue 实例的作用域内计算。一个限制是每个绑定只能包含单个表达式，注意表达式和语句的不同，表达式必须有返回值。

##### 过滤器
Vue.js 允许在表达式后添加可选的“过滤器 (Filter) ”，以“管道符”指示(空格可有可无)：  

`{{ message | capitalize }}`   

这里我们将表达式 message 的值“管输（pipe）”到内置的 capitalize 过滤器，这个过滤器其实只是一个 JavaScript 函数，返回大写化的值。Vue.js 提供数个内置过滤器，在后面我们会谈到如何开发自己的过滤器。

注意管道语法不是 JavaScript 语法，因此不能在表达式内使用过滤器，只能添加到表达式的后面。

过滤器可以串联：

`{{ message | filterA | filterB }}`


过滤器也可以接受参数：

`{{ message | filterA 'arg1' arg2 }}`

过滤器函数始终以表达式的值作为第一个参数。带引号的参数视为字符串，而不带引号的参数按表达式计算。这里，字符串 'arg1' 将传给过滤器作为第二个参数，表达式 arg2 的值在计算出来之后作为第三个参数。

#### 指令
***
指令 (Directives) 是特殊的带有前缀 v- 的特性。指令的值限定为绑定表达式，因此上面提到的 JavaScript 表达式及过滤器规则在这里也适用。指令的职责就是当其表达式的值改变时把某些特殊的行为应用到 DOM 上。我们来回头看下“概述”里的例子：

`<p v-if="greeting">Hello!</p>`

这里 v-if 指令将根据表达式 greeting 值的真假删除/插入 <p> 元素。

有些指令可以在其名称后面带一个“参数” (Argument)，中间放一个冒号隔开。例如，v-bind 指令用于响应地更新 HTML 特性：   

`<a v-bind:href="url"></a>`  

这里 href 是参数，它告诉 v-bind 指令将元素的 href 特性跟表达式 url 的值绑定。可能你已注意到可以用特性插值 href="{{url}}" 获得同样的结果：这样没错，并且实际上在内部特性插值会转为 v-bind 绑定。

另一个例子是 v-on 指令，它用于监听 DOM 事件：  

`<a v-on:click="doSomething">`

这里参数是被监听的事件的名字。我们也会详细说明事件绑定。

修饰符 (Modifiers) 是以半角句号 . 开始的特殊后缀，用于表示指令应当以特殊方式绑定。例如 .literal 修饰符告诉指令将它的值解析为一个字面字符串而不是一个表达式：

`<a v-bind:href.literal="/a/b/c"></a>`

当然，这似乎没有意义，因为我们只需要使用 href="/a/b/c" 而不必使用一个指令。这个例子只是为了演示语法。后面我们将看到修饰符更多的实践用法。

#### 缩写
***
v- 前缀是一种标识模板中特定的 Vue 特性的视觉暗示。当你需要在一些现有的 HTML 代码中添加动态行为时，这些前缀可以起到很好的区分效果。但你在使用一些常用指令的时候，你会感觉一直这么写实在是啰嗦。而且在构建单页应用（SPA ）时，Vue.js 会管理所有的模板，此时 v- 前缀也没那么重要了。因此Vue.js 为两个最常用的指令 v-bind 和 v-on 提供特别的缩写：

```javascript
<!-- 完整语法 -->
<a v-bind:href="url"></a>

<!-- 缩写 -->
<a :href="url"></a>

<!-- 完整语法 -->
<button v-bind:disabled="someDynamicCondition">Button</button>

<!-- 缩写 -->
<button :disabled="someDynamicCondition">Button</button>

<!-- 完整语法 -->
<a v-on:click="doSomething"></a>

<!-- 缩写 -->
<a @click="doSomething"></a>
```

### 3. 计算属性
***
在模板中绑定表达式是非常便利的，但是它们实际上只用于简单的操作。模板是为了描述视图的结构。在模板中放入太多的逻辑会让模板过重且难以维护。这就是为什么 Vue.js 将绑定表达式限制为一个表达式。如果需要多于一个表达式的逻辑，应当使用计算属性。 

```javascript
<div id="example">
  a={{ a }}, b={{ b }}
</div>
var vm = new Vue({
  el: '#example',
  data: {
    a: 1
  },
  computed: {
    // 一个计算属性的 getter
    b: function () {
      // `this` 指向 vm 实例
      return this.a + 1
    }
  }
})

// a=1 , b=2
```

你可以打开浏览器的控制台，修改 vm。vm.b 的值始终取决于 vm.a 的值。

对于计算属性，可以直接赋值，但并没有赋值效果。(应该是针对于只定义了getter的计算属性，定义了setter可以赋值)
```javascript
var data = { a: 1 , b: 3};

var vm = new Vue({
  el : '#app',
  data: data,
  computed: {
    b: function() {
      return this.a +1;
    }
  }
})

// 仍然是a=1,b=2
vm.b = 4;  // 不会报错，但vm.b 的值仍然是2
```

注意，如果data的值时一个外部的对象，那么对于计算属性，貌似它们之间的引用关系不成立，但$data与外部对象的引用关系仍然存在。

Vue.js 提供了一个方法 $watch，它用于观察 Vue 实例上的数据变动。当一些数据需要根据其它数据变化时， $watch 很诱人 —— 特别是如果你来自 AngularJS。不过，通常更好的办法是使用计算属性而不是一个命令式的 $watch 回调。考虑下面例子：

```javascript
<div id="demo">{{fullName}}</div>
var vm = new Vue({
  data: {
    firstName: 'Foo',
    lastName: 'Bar',
    fullName: 'Foo Bar'
  }
})

vm.$watch('firstName', function (val) {
  this.fullName = val + ' ' + this.lastName
})

vm.$watch('lastName', function (val) {
  this.fullName = this.firstName + ' ' + val
})
```

计算属性默认只是 getter，不过在需要时你也可以提供一个 setter：

```javascript
// ...
computed: {
  fullName: {
    // getter
    get: function () {
      return this.firstName + ' ' + this.lastName
    },
    // setter
    set: function (newValue) {
      var names = newValue.split(' ')
      this.firstName = names[0]
      this.lastName = names[names.length - 1]
    }
  }
}
// ...
```

```javascript
var data = { a: 1 , b: 3};

var vm = new Vue({
  el : '#app',
  data: data,
  computed: {
    b: {
      get : function() {
        return this.a+1;
      },

      set : function (newValue) {
          this.a = newValue-1;
      }
    }
  }
})

// 仍然是a=1,b=2
// 不过当给vm.b赋值时是可以的
 vm.b = 4;
// a=3,b=4, 但此时与data.b的引用关系仍然不存在，注意与data.a的引用关系存在，此时data.a=3,当data.b=3

```

<br>
<br>

### 4.Class 与 Style 绑定
#### 绑定html Class
***
##### 对象语法

我们可以传给 v-bind:class 一个对象，以动态地切换 class。注意 v-bind:class 指令可以与普通的 class 特性共存：  

`<div class="static" v-bind:class="{ 'class-a': isA, 'class-b': isB }"></div>`

```javascript
data: {
  isA: true,
  isB: false
}
```

渲染为：

`<div class="static class-a"></div>`

当 isA 和 isB 变化时，class 列表将相应地更新。例如，如果 isB 变为 true，class 列表将变为 "static class-a class-b"。

你也可以直接绑定数据里的一个对象：

`<div v-bind:class="classObject"></div>`

```javascript
data: {
  classObject: {
    'class-a': true,
    'class-b': false
  }
}
```

##### 数组语法

我们可以把一个数组传给 v-bind:class，以应用一个 class 列表：

`<div v-bind:class="[classA, classB]">`

```
data: {
  classA: 'class-a',
  classB: 'class-b'
}
```

渲染为：

`<div class="class-a class-b"></div>`

在 1.0.19+ 中，可以在数组语法中使用对象语法：

`<div v-bind:class="[classA, { classB: isB, classC: isC }]">
`

#### 绑定style
***
##### 对象语法
v-bind:style 的对象语法十分直观——看着非常像 CSS，其实它是一个 JavaScript 对象。CSS 属性名可以用驼峰式（camelCase）或短横分隔命名（kebab-case）：   

`<div v-bind:style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>
`

```
data: {
  activeColor: 'red',
  fontSize: 30
}
```

直接绑定到一个样式对象通常更好，让模板更清晰：

`<div v-bind:style="styleObject"></div>`

```
data: {
  styleObject: {
    color: 'red',
    fontSize: '13px'
  }
}
```

##### 数组语法
v-bind:style 的数组语法可以将多个样式对象应用到一个元素上：

`<div v-bind:style="[styleObjectA, styleObjectB]">`

##### 自动添加前缀
当 v-bind:style 使用需要厂商前缀的 CSS 属性时，如 transform，Vue.js 会自动侦测并添加相应的前缀。


### 5. 条件渲染
#### v-if
***
```
	<p v-if="ok">hello</p>
	<p v-else>no hello</p>	
```

注意貌似嵌套if的写法并不被支持，与v-if同一标签的v-else会被忽略，也没有v-else-if指令

```html
	  <p v-if="greeting">Hello!</p>
      <p v-else-if="greet">no Hello!</p>
      <p v-else>no greet</p>
```

```javascript
data = {  greeting: true, greet:false};

// 并没有第一个if所对应的v-else指令，第一个v-else是无效的，第二个对应的是第二个的v-if指令
// Hello no greet  
```

#### template v-if
因为 v-if 是一个指令，需要将它添加到一个元素上。但是如果我们想切换多个元素呢？此时我们可以把一个 <template> 元素当做包装元素，并在上面使用 v-if，最终的渲染结果不会包含它。

```html
<template v-if="ok">
  <h1>Title</h1>
  <p>Paragraph 1</p>
  <p>Paragraph 2</p>
</template>
```

#### v-show
另一个根据条件展示元素的选项是 v-show 指令。用法大体上一样：

`<h1 v-show="ok">Hello!</h1>`

不同的是有 v-show 的元素会始终渲染并保持在 DOM 中。v-show 是简单的切换元素的 CSS 属性 display。

注意 v-show 不支持 &lt;template&gt; 语法。

#### v-else
可以用 v-else 指令给 v-if 或 v-show 添加一个 “else 块”：

```html
<div v-if="Math.random() > 0.5">
  Sorry
</div>
<div v-else>
  Not sorry
</div>
```

v-else 元素必须立即跟在 v-if 或 v-show 元素的后面——否则它不能被识别。

<br>
<br>

### 6.列表渲染
#### v-for
***
可以使用 v-for 指令基于一个数组渲染一个列表。这个指令使用特殊的语法，形式为 item in items，items 是数据数组，item 是当前数组元素的别名：

```html
<ul id="example-1">
  <li v-for="item in items">
    {{ item.message }}
  </li>
</ul>
```

```javascript
var example1 = new Vue({
  el: '#example-1',
  data: {
    items: [
      { message: 'Foo' },
      { message: 'Bar' }
    ]
  }
})
```

在 v-for 块内我们能完全访问父组件作用域内的属性，另有一个特殊变量 $index，正如你猜到的，它是当前数组元素的索引：

```html
<ul id="example-2">
  <li v-for="item in items">
    {{ parentMessage }} - {{ $index }} - {{ item.message }}
  </li>
</ul>
```

```javascript
var example2 = new Vue({
  el: '#example-2',
  data: {
    parentMessage: 'Parent',
    items: [
      { message: 'Foo' },
      { message: 'Bar' }
    ]
  }
})
```

另外，你可以为索引指定一个别名（如果 v-for 用于一个对象，则可以为对象的键指定一个别名）：  

```
<div v-for="(index, item) in items">
  {{ index }} {{ item.message }}
</div>
```

从 1.0.17 开始可以使用 of 分隔符，更接近 JavaScript 遍历器语法：

`<div v-for="item of items"></div>`

#### template v-for
***
类似于 template v-if，也可以将 v-for 用在 <template> 标签上，以渲染一个包含多个元素的块。例如：

```html
<ul>
  <template v-for="item in items">
    <li>{{ item.msg }}</li>
    <li class="divider"></li>
  </template>
</ul>
```

#### 数组变动检测
***
##### 变异方法
Vue.js 包装了被观察数组的变异方法，故它们能触发视图更新。被包装的方法有：
+ push()  
+ pop()
+ shift()
+ unshift()
+ splice()
+ sort()
+ reverse()

##### 替换数组
变异方法，如名字所示，修改了原始数组。相比之下，也有非变异方法，如 filter(), concat() 和 slice()，不会修改原始数组而是返回一个新数组。在使用非变异方法时，可以直接用新数组替换旧数组：

```
example1.items = example1.items.filter(function (item) {
  return item.message.match(/Foo/)
})
```

##### 对象 v-for
也可以使用 v-for 遍历对象。除了 $index 之外，作用域内还可以访问另外一个特殊变量 $key。

```html
<ul id="repeat-object" class="demo">
  <li v-for="value in object">
    {{ $key }} : {{ value }}
  </li>
</ul>
```

```javascript
new Vue({
  el: '#repeat-object',
  data: {
    object: {
      FirstName: 'John',
      LastName: 'Doe',
      Age: 30
    }
  }
})
```

##### 值域 v-for
v-for 也可以接收一个整数，此时它将重复模板数次。

```
<div>
  <span v-for="n in 10">{{ n }} </span>
</div>
```


### 7. 方法与事件处理器
#### 方法处理器
***
可以用 v-on 指令监听 DOM 事件：

```html
<div id="example">
  <button v-on:click="greet">Greet</button>
</div>
```

我们绑定了一个单击事件处理器到一个方法 greet。下面在 Vue 实例中定义这个方法：

```javascript
var vm = new Vue({
  el: '#example',
  data: {
    name: 'Vue.js'
  },
  // 在 `methods` 对象中定义方法
  methods: {
    greet: function (event) {
      // 方法内 `this` 指向 vm
      alert('Hello ' + this.name + '!')
      // `event` 是原生 DOM 事件
      alert(event.target.tagName)
    }
  }
})

// 也可以在 JavaScript 代码中调用方法
vm.greet() // -> 'Hello Vue.js!'
```

#### 内联语句处理器
***
除了直接绑定到一个方法，也可以用内联 JavaScript 语句：

```html
<div id="example-2">
  <button v-on:click="say('hi')">Say Hi</button>
  <button v-on:click="say('what')">Say What</button>
</div>
```

```javascript
new Vue({
  el: '#example-2',
  methods: {
    say: function (msg) {
      alert(msg)
    }
  }
})
```

类似于内联表达式，事件处理器限制为一个语句。

有时也需要在内联语句处理器中访问原生 DOM 事件。可以用特殊变量 $event 把它传入方法：

`<button v-on:click="say('hello!', $event)">Submit</button>`

```javascript
// ...
methods: {
  say: function (msg, event) {
    // 现在我们可以访问原生事件对象
    event.preventDefault()
  }
}
```

#### 事件修饰符
在事件处理器中经常需要调用 event.preventDefault() 或 event.stopPropagation()。尽管我们在方法内可以轻松做到，不过让方法是纯粹的数据逻辑而不处理 DOM 事件细节会更好。

为了解决这个问题，Vue.js 为 v-on 提供两个 事件修饰符：.prevent 与 .stop。你是否还记得修饰符是点号打头的指令后缀？

```html
<!-- 阻止单击事件冒泡 -->
<a v-on:click.stop="doThis"></a>

<!-- 提交事件不再重载页面 -->
<form v-on:submit.prevent="onSubmit"></form>

<!-- 修饰符可以串联 -->
<a v-on:click.stop.prevent="doThat">

<!-- 只有修饰符 -->
<form v-on:submit.prevent></form>
```

1.0.16 添加了两个额外的修饰符：

```html
<!-- 添加事件侦听器时使用 capture 模式 -->
<div v-on:click.capture="doThis">...</div>

<!-- 只当事件在该元素本身（而不是子元素）触发时触发回调 -->
<div v-on:click.self="doThat">...</div>
```

#### 按键修饰符
***
在监听键盘事件时，我们经常需要检测 keyCode。Vue.js 允许为 v-on 添加按键修饰符：

```html
<!-- 只有在 keyCode 是 13 时调用 vm.submit() -->
<input v-on:keyup.13="submit">
```

记住所有的 keyCode 比较困难，Vue.js 为最常用的按键提供别名：

+ enter
+ tab
+ delete
+ space
+ up
+ down
+ left
+ right  

1.0.8+： 支持单字母按键别名。

1.0.17+： 可以自定义按键别名：

```
// 可以使用 @keyup.f1
Vue.directive('on').keyCodes.f1 = 112
```

### 8. 表单控件绑定
#### 基础用法
***
可以用 v-model 指令在表单控件元素上创建双向数据绑定。根据控件类型它自动选取正确的方法更新元素。尽管有点神奇，v-model 不过是语法糖，在用户输入事件中更新数据，以及特别处理一些极端例子。

### 9. 过渡

### 10.组件
#### 使用组件
***
之前说过，我们可以用 Vue.extend() 创建一个组件构造器：

```
var MyComponent = Vue.extend({
  // 选项...
})
```
要把这个构造器用作组件，需要用 Vue.component(tag, constructor) 注册 ：

```
// 全局注册组件，tag 为 my-component
Vue.component('my-component', MyComponent)
```
组件在注册之后，便可以在父实例的模块中以自定义元素 <my-component> 的形式使用。要确保在初始化根实例之前注册了组件：

```html
<div id="example">
  <my-component></my-component>
</div>
```

```javascript
// 定义
var MyComponent = Vue.extend({
  template: '<div>A custom component!</div>'
})

// 注册
Vue.component('my-component', MyComponent)

// 创建根实例
new Vue({
  el: '#example'
})
```

注意组件的模板替换了自定义元素，自定义元素的作用只是作为一个挂载点。可以用实例选项 replace 决定是否替换。

##### 局部注册
不需要全局注册每个组件。可以让组件只能用在其它组件内，用实例选项 components 注册：

```javascript
var Child = Vue.extend({ /* ... */ })

var Parent = Vue.extend({
  template: '...',
  components: {
    // <my-component> 只能用在父组件模板内
    'my-component': Child
  }
})
```

##### 注册语法糖
为了让事件更简单，可以直接传入选项对象而不是构造器给 Vue.component() 和 component 选项。Vue.js 在背后自动调用 Vue.extend()：

```javascript
// 在一个步骤中扩展与注册
Vue.component('my-component', {
  template: '<div>A custom component!</div>'
})

// 局部注册也可以这么做
var Parent = Vue.extend({
  components: {
    'my-component': {
      template: '<div>A custom component!</div>'
    }
  }
})
```

##### 组件选项问题
传入 Vue 构造器的多数选项也可以用在 Vue.extend() 中，不过有两个特例： data 和 el。试想如果我们简单地把一个对象作为 data 选项传给 Vue.extend()：

```javascript
var data = { a: 1 }
var MyComponent = Vue.extend({
  data: data
})
```
这么做的问题是 MyComponent 所有的实例将共享同一个 data 对象！这基本不是我们想要的，因此我们应当使用一个函数作为 data 选项，让这个函数返回一个新对象：

同理，el 选项用在 Vue.extend() 中时也须是一个函数。

#### Props
***
组件实例的作用域是孤立的。这意味着不能并且不应该在子组件的模板内直接引用父组件的数据。可以使用 props 把数据传给子组件。

“prop” 是组件数据的一个字段，期望从父组件传下来。子组件需要显式地用 props 选项 声明 props：

```javascript
Vue.component('child', {
  // 声明 props
  props: ['msg'],
  // prop 可以用在模板内
  // 可以用 `this.msg` 设置
  template: '<span>{{ msg }}</span>'
})
```

然后向它传入一个普通字符串：

`<child msg="hello!"></child>`

##### 动态Props
类似于用 v-bind 绑定 HTML 特性到一个表达式，也可以用 v-bind 绑定动态 Props 到父组件的数据。每当父组件的数据变化时，也会传导给子组件：

```html
<div>
  <input v-model="parentMsg">
  <br>
  <child v-bind:my-message="parentMsg"></child>
</div>
```

##### Prop绑定类型
prop 默认是单向绑定：当父组件的属性变化时，将传导给子组件，但是反过来不会。这是为了防止子组件无意修改了父组件的状态——这会让应用的数据流难以理解。不过，也可以使用 .sync 或 .once 绑定修饰符显式地强制双向或单次绑定：

```html
<!-- 默认为单向绑定 -->
<child :msg="parentMsg"></child>

<!-- 双向绑定 -->
<child :msg.sync="parentMsg"></child>

<!-- 单次绑定 -->
<child :msg.once="parentMsg"></child>
```

注意如果 prop 是一个对象或数组，是按引用传递。在子组件内修改它会影响父组件的状态，不管是使用哪种绑定类型。(那怎么还需要双向绑定。。。。)


#### 父子组件通信
***
##### 父链
子组件可以用 this.$parent 访问它的父组件。根实例的后代可以用 this.$root 访问它。父组件有一个数组 this.$children，包含它所有的子元素。

尽管可以访问父链上任意的实例，不过子组件应当避免直接依赖父组件的数据，尽量显式地使用 props 传递数据。另外，在子组件中修改父组件的状态是非常糟糕的做法，因为：

1. 这让父组件与子组件紧密地耦合；

2. 只看父组件，很难理解父组件的状态。因为它可能被任意子组件修改！理想情况下，只有组件自己能修改它的状态。

##### 自定义事件
Vue 实例(个人觉得应该是组件实例)实现了一个自定义事件接口，用于在组件树中通信。这个事件系统独立于原生 DOM 事件，用法也不同。

每个 Vue 实例(个人觉得应该是组件实例)都是一个事件触发器：

+ 使用 $on() 监听事件；

+ 使用 $emit() 在它上面触发事件；

+ 使用 $dispatch() 派发事件，事件沿着父链冒泡；

+ 使用 $broadcast() 广播事件，事件向下传导给所有的后代。

不同于 DOM 事件，Vue 事件在冒泡过程中第一次触发回调之后自动停止冒泡，除非回调明确返回 true。

```html
<!-- 子组件模板 -->
<template id="child-template">
  <input v-model="msg">
  <button v-on:click="notify">Dispatch Event</button>
</template>

<!-- 父组件模板 -->
<div id="events-example">
  <p>Messages: {{ messages | json }}</p>
  <child></child>
</div>
```

```javascript
// 注册子组件
// 将当前消息派发出去
Vue.component('child', {
  template: '#child-template',
  data: function () {
    return { msg: 'hello' }
  },
  methods: {
    notify: function () {
      if (this.msg.trim()) {
        this.$dispatch('child-msg', this.msg)
        this.msg = ''
      }
    }
  }
})

// 初始化父组件
// 将收到消息时将事件推入一个数组
var parent = new Vue({
  el: '#events-example',
  data: {
    messages: []
  },
  // 在创建实例时 `events` 选项简单地调用 `$on`
  events: {
    'child-msg': function (msg) {
      // 事件回调内的 `this` 自动绑定到注册它的实例上
      this.messages.push(msg)
    }
  }
})
```

##### 使用v-on绑定自定义事件
上例非常好，不过从父组件的代码中不能直观的看到 "child-msg" 事件来自哪里。如果我们在模板中子组件用到的地方声明事件处理器会更好。为此子组件可以用 v-on 监听自定义事件：

`<child v-on:child-msg="handleIt"></child>`

这样就很清楚了：当子组件触发了 "child-msg" 事件，父组件的 handleIt 方法将被调用。所有影响父组件状态的代码放到父组件的 handleIt 方法中；子组件只关注触发事件。

  [1]: https://vuejs.org.cn/images/lifecycle.png