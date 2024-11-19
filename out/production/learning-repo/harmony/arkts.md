# arkTS

相当于静态类型吧 TS，TS 只是可选性的动态类型声明，而这个是相当于必须写类型和静态类型。

## 类型

- number
- boolean
- string
- void
- Object
- Array
- enum
- union

不能说完全一致吧，只能说一摸一样。

## UI 范式

- 装饰器：用于装饰类、结构、方法以及变量，并赋予其特殊的含义。如上述示例中@Entry、@Component和@State都是装饰器，@Component表示自定义组件，@Entry表示该自定义组件为入口组件，@State表示组件中的状态变量，状态变量变化会触发UI刷新。
- UI描述：以声明式的方式来描述UI的结构，例如build()方法中的代码块。
- 自定义组件：可复用的UI单元，可组合其他组件，如上述被@Component装饰的struct Hello。 
- 系统组件：ArkUI框架中默认内置的基础和容器组件，可直接被开发者调用，比如示例中的Column、Text、Divider、Button。
- 属性方法：组件可以通过链式调用配置多项属性，如fontSize()、width()、height()、backgroundColor()等。
- 事件方法：组件可以通过链式调用设置多个事件的响应逻辑，如跟随在Button后面的onClick()。

但是吧，咱就说使用组件及方法的方式有点怪。

## 声明式UI描述

如果组件支持子组件配置，则需在尾随闭包"{...}"中为组件添加子组件的UI描述。Column、Row、Stack、Grid、List等组件都是容器组件。

## 自定义组件

- struct：自定义组件基于struct实现
- @Component：@Component装饰器仅能装饰struct关键字声明的数据结构。struct被@Component装饰后具备组件化的能力，需要实现build方法描述UI，
一个struct只能被一个@Component装饰。@Component可以接受一个可选的bool类型参数。
- build()函数：build()函数用于定义自定义组件的声明式UI描述，自定义组件必须定义build()函数。
- @Entry：@Entry装饰的自定义组件将作为UI页面的入口。在单个UI页面中，最多可以使用@Entry装饰一个自定义组件。@Entry可以接受一个可选的LocalStorage的参数。
- @Reusable：@Reusable装饰的自定义组件具备可复用能力（什么意思，不装饰的组件不能复用？）


```ts
@Component
struct MyComponent {
  private countDownFrom: number = 0;
  private color: Color = Color.Blue;

  build() {
  }
}

@Entry
@Component
struct ParentComponent {
  private someColor: Color = Color.Pink;

  build() {
    Column() {
      // 创建MyComponent实例，并将创建MyComponent成员变量countDownFrom初始化为10，将成员变量color初始化为this.someColor
      MyComponent({ countDownFrom: 10, color: this.someColor })
    }
  }
}
```

它这个感觉有点怪，相当于 props 会直接赋值给成员变量。

```tsx
@Entry
@Component
struct Parent {
  @State cnt: number = 0
  submit: () => void = () => {
    this.cnt++;
  }

  build() {
    Column() {
      Text(`${this.cnt}`)
      Son({ submitArrow: this.submit })
    }
  }
}

@Component
struct Son {
  submitArrow?: () => void

  build() {
    Row() {
      Button('add')
        .width(80)
        .onClick(() => {
          if (this.submitArrow) {
            this.submitArrow()
          }
        })
    }
    .justifyContent(FlexAlign.SpaceBetween)
    .height(56)
  }
}
```


页面生命周期，即被@Entry装饰的组件生命周期，提供以下生命周期接口：

- onPageShow：页面每次显示时触发一次，包括路由过程、应用进入前台等场景。 
- onPageHide：页面每次隐藏时触发一次，包括路由过程、应用进入后台等场景。
- onBackPress：当用户点击返回按钮时触发。

组件生命周期，即一般用@Component装饰的自定义组件的生命周期，提供以下生命周期接口：

- aboutToAppear：组件即将出现时回调该接口，具体时机为在创建自定义组件的新实例后，在执行其build()函数之前执行。
- onDidBuild：组件build()函数执行完成之后回调该接口，不建议在onDidBuild函数中更改状态变量、使用animateTo等功能，这可能会导致不稳定的UI表现。
- aboutToDisappear：aboutToDisappear函数在自定义组件析构销毁之前执行。不允许在aboutToDisappear函数中改变状态变量，特别是@Link变量的修改可能会导致应用程序行为不稳定。

![lifecycle](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20240913142307.81971413732491105650919984883335:50001231000000:2800:67C556DEE8F9A5179CE47328BC9343F38B4253DC66ABA341E4018FA31240BCDB.png?needInitFileName=true?needInitFileName=true)

## 自定义组件成员属性访问限定符使用限制

- 对于@State/@Prop/@Provide/@BuilderParam/常规成员变量(不涉及更新的普通变量)，当使用private修饰时，在自定义组件构造时，不允许进行赋值传参，否则会有编译告警日志提示。（这个看起来就只是 private 的就不能通过 props 赋值）
- 对于@StorageLink/@StorageProp/@LocalStorageLink/@LocalStorageProp/@Consume变量，当使用public修饰时，会有编译告警日志提示。
- 对于@Link/@ObjectLink变量，当使用private修饰时，会有编译告警日志提示。
- 由于struct没有继承能力，上述所有的这些变量使用protected修饰时，会有编译告警日志提示。
- 当@Require和private同时修饰自定义组件struct的@State/@Prop/@Provide/@BuilderParam/常规成员变量(不涉及更新的普通变量)时，会有编译告警日志提示。

说实话，看不大懂，毕竟好多装饰器干嘛的都不知道。

## @Builder

这个东西感觉就是定义一段能重用的 ui 内容，就好像我们在 react 定义一段小 ui，然后在 render 中多处可以使用。

- @Builder通过按引用传递的方式传入参数，才会触发动态渲染UI，并且参数只能是一个。
- @Builder如果传入的参数是两个或两个以上，不会触发动态渲染UI。
- @Builder传入的参数中同时包含按值传递和按引用传递两种方式，不会触发动态渲染UI。
- @Builder的参数必须按照对象字面量的形式，把所需要的属性一一传入，才会触发动态渲染UI。

啥东西啊。

只有传入一个参数，且参数需要直接传入对象字面量才会按引用传递该参数，其余传递方式均为按值传递。

按引用传递：

```tsx
class Tmp {
  paramA1: string = ''
}

@Builder function overBuilder(params: Tmp) {
  Row() {
    Text(`UseStateVarByReference: ${params.paramA1} `)
  }
}
@Entry
@Component
struct Parent {
  @State label: string = 'Hello';
  build() {
    Column() {
      // Pass the this.label reference to the overBuilder component when the overBuilder component is called in the Parent component.
      overBuilder({ paramA1: this.label })
      Button('Click me').onClick(() => {
        // After Click me is clicked, the UI text changes from Hello to ArkUI.
        this.label = 'ArkUI';
      })
    }
  }
}
```

