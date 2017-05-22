# React 原理

> 摘自 http://www.jianshu.com/p/978c4bd3a759
## 1. 原理

### IOS

首先要明白的一点是，即使使用了 React Native，我们依然需要 UIKit 等框架，调用的是 Objective-C 代码。总之，JavaScript 只是辅助，它只是提供了配置信息和逻辑的处理结果。React Native 与 Hybrid 完全没有关系，它只不过是以 JavaScript 的形式告诉 Objective-C 该执行什么代码。  

JavaScript 是一种脚本语言，它不会经过编译、链接等操作，而是在运行时才动态的进行词法、语法分析，生成抽象语法树(AST)和字节码，然后由解释器负责执行或者使用 JIT 将字节码转化为机器码再执行。整个流程由 JavaScript 引擎负责完成。   

苹果提供了一个叫做 JavaScript Core 的框架，这是一个 JavaScript 引擎。通过下面这段代码可以简单的感受一下 Objective-C 如何调用 JavaScript 代码：  

```Objective-C
JSContext *context = [[JSContext alloc] init];
JSValue *jsVal = [context evaluateScript:@"21+7"];
int iVal = [jsVal toInt32];
```  

这里的 JSContext 指的是 JavaScript 代码的运行环境，通过 evaluateScript 即可执行 JavaScript 代码并获取返回结果。   

JavaScript 是一种单线程的语言，它不具备自运行的能力，因此总是被动调用。很多介绍 React Native 的文章都会提到 “JavaScript 线程” 的概念，实际上，它表示的是 Objective-C 创建了一个单独的线程，这个线程只用于执行 JavaScript 代码，而且 JavaScript 代码只会在这个线程中执行。

#### Objective-C 与 JavaScript交互

Objective-C 和 JavaScript 两端都保存了一份配置表，里面标记了所有 Objective-C 暴露给 JavaScript 的模块和方法。这样，无论是哪一方调用另一方的方法，实际上传递的数据只有 `ModuleId`、`MethodId` 和 `Arguments` 这三个元素，它们分别表示类、方法和方法参数，当 Objective-C 接收到这三个值后，就可以通过 runtime 唯一确定要调用的是哪个函数，然后调用这个函数。  

，上述解决方案只是一个抽象概念，可能与实际的解决方案有微小差异，比如实际上 Objective-C 这一端，并没有直接保存这个模块配置表。  

##### 回调

JavaScript 代码调用 Objective-C 之后，如何在 Objective-C 的代码中，回调执行 JavaScript 代码。  

目前 React Native 的做法是：在 JavaScript 调用 Objective-C 代码时，注册要回调的 Block，并且把 `BlockId` 作为参数发送给 Objective-C，Objective-C 收到参数时会创建 Block，调用完 Objective-C 函数后就会执行这个刚刚创建的 Block。  

Objective-C 会向 Block 中传入参数和 `BlockId`，然后在 Block 内部调用 JavaScript 的方法，随后 JavaScript 查找到当时注册的 Block 并执行。  

![](http://upload-images.jianshu.io/upload_images/1171077-75412d65af198cf5.png?imageMogr2/auto-orient/strip%7CimageView2/2)

## 2. 源码分析

### IOS

#### 初始化 React Native

每个项目都有一个入口，然后进行初始化操作，React Native 也不例外。一个不含 Objective-C 代码的项目留给我们的唯一线索就是位于 AppDelegate 文件中的代码：  

```Objective-C
RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation     // 这应该是指JS文件的位置吧
                                                    moduleName:@"PropertyFinder"  // 这个好像就是注册的组件名
                                             initialProperties:nil
                                                 launchOptions:launchOptions];
```  

用户能看到的一切内容都来源于这个 `RootView`，所有的初始化工作也都在这个方法内完成。

在这个方法内部，在创建 `RootView` 之前，React Native 实际上先创建了一个 `Bridge` 对象。它是 Objective-C 与 JavaScript 交互的桥梁，后续的方法交互完全依赖于它，而整个初始化过程的最终目的其实也就是创建这个桥梁对象。

初始化方法的核心是 `setUp` 方法，而 `setUp` 方法的主要任务则是创建 `BatchedBridge`。

`BatchedBridge` 的作用是批量读取 JavaScript 对 Objective-C 的方法调用，同时它内部持有一个 `JavaScriptExecutor`，顾名思义，这个对象用来执行 JavaScript 代码。

创建 `BatchedBridge` 的关键是 `start` 方法，它可以分为五个步骤：

1. 读取 JavaScript 源码
2. 初始化模块信息
3. 初始化 JavaScript 代码的执行器，即 RCTJSCExecutor 对象
4. 生成模块列表并写入 JavaScript 端
5. 执行 JavaScript 源码


##### 初始化模块信息

这一步在方法 `initModulesWithDispatchGroup`: 中实现，主要任务是找到所有需要暴露给 JavaScript 的类。每一个需要暴露给 JavaScript 的类(也称为 Module，以下不作区分)都会标记一个宏：`RCT_EXPORT_MODULE`：  

```Objective-C
#define RCT_EXPORT_MODULE(js_name) \
RCT_EXTERN void RCTRegisterModule(Class); \
+ (NSString *)moduleName { return @#js_name; } \
+ (void)load { RCTRegisterModule(self); }
```  

这样，这个类在 `load` 方法中就会调用 `RCTRegisterModule` 方法注册自己：  

```Objective-C
void RCTRegisterModule(Class moduleClass)
{
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    RCTModuleClasses = [NSMutableArray new];
  });

  [RCTModuleClasses addObject:moduleClass];
}
```   

因此，React Native 可以通过 `RCTModuleClasses` 拿到所有暴露给 JavaScript 的类。下一步操作是遍历这个数组，然后生成 `RCTModuleData` 对象：  

```Objective-C
for (Class moduleClass in RCTGetModuleClasses()) {
    RCTModuleData *moduleData = [[RCTModuleData alloc]initWithModuleClass:moduleClass                                                                      bridge:self];
    [moduleClassesByID addObject:moduleClass];
    [moduleDataByID addObject:moduleData];
}
```  

可以想见，`RCTModuleData` 对象是模块配置表的主要组成部分。如果把模块配置表想象成一个数组，那么每一个元素就是一个 `RCTModuleData` 对象。  

这个对象保存了 Module 的名字，常量等基本信息，最重要的属性是一个数组，保存了所有需要暴露给 JavaScript 的方法。  


因此 Objective-C 管理模块配置表的逻辑是：Bridge 持有一个数组，数组中保存了所有的模块的 `RCTModuleData` 对象。只要给定 `ModuleId` 和 `MethodId` 就可以唯一确定要调用的方法。  
**


##### 初始化 JavaScript 代码的执行器，即 RCTJSCExecutor 对象

初始化 JavaScript 执行器的时候，`addSynchronousHookWithName` 这个方法被调用了多次，它其实向 JavaScript 上下文中添加了一些 Block 作为全局变量。  

这个 Block 并非由 Objective-C 主动调用，而是在第五步执行 JavaScript 代码时，由 JavaScript 在上下文中获取到 Block 对象并调用。  

需要重点注意的是名为 `nativeRequireModuleConfig` 的 Block，它在 JavaScript 注册新的模块时调用：  

```Objective-C
get: () => {
    let module = RemoteModules[moduleName];
    const json = global.nativeRequireModuleConfig(moduleName); // 调用 OC 的 Block
    const config = JSON.parse(json); // 解析 json
    module = BatchedBridge.processModuleConfig(config, module.moduleID); // 注册 config
    return module;
},
```    

这就是模块配置表能够加载到 JavaScript 中的原理。  

另一个值得关注的 Block 叫做 `nativeFlushQueueImmediate`。实际上，JavaScript 除了把调用信息放到 MessageQueue 中等待 Objective-C 来取以外，也可以主动调用 Objective-C 的方法：   

```Objective-C
if (global.nativeFlushQueueImmediate &&
    now - this._lastFlush >= MIN_TIME_BETWEEN_FLUSHES_MS) {
    global.nativeFlushQueueImmediate(this._queue); // 调用 OC 的代码
}
```  

目前，React Native 的逻辑是，如果消息队列中有等待 Objective-C 处理的逻辑，而且 Objective-C 超过 5ms 都没有来取走，那么 JavaScript 就会主动调用 Objective-C 的方法。  

![](http://upload-images.jianshu.io/upload_images/1171077-320b2bbb78e2b7e8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
