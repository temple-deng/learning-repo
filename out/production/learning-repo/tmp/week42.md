# week42 10.11 - 10.17

<!-- TOC -->

- [week42 10.11 - 10.17](#week42-1011---1017)
- [prettier, eslint, stylelint](#prettier-eslint-stylelint)
  - [prettier](#prettier)
  - [eslint](#eslint)
- [Web Animation 接口](#web-animation-接口)
  - [Document.timeline](#documenttimeline)
  - [Animation 接口](#animation-接口)

<!-- /TOC -->

# prettier, eslint, stylelint

## prettier

关闭文件内的格式化：`// prettier-ignore`，文档上说会将 AST 分析的之后的代码禁用掉格式化，
但是这个之后的代码是怎么界定的还有待确定。   

prettier 和 linter 协作的方式，一种是有 prettier 负责代码风格，而由 linter 负责代码质量，
这样的话需要关闭掉 linter 对代码风格校验的规则，eslint 和 stylelint 都有对应的配置插件：
eslint-config-prettier, stylelint-config-prettier。   

另一种就是让 linter 去跑 prettier，将 prettier 作为一种 linter rule。也有对应的插件，
eslint-plugin-prettier, stylelint-prettier。    

理论上是推荐第一种的，因为第二种的首先运行速度会比较慢，其次可能他是在 linter 运行的时候进行
处理的，那我们编写代码的时候可能会有很多的报警提示，比较烦人。    

## eslint

安装了 eslint 以后，可以执行 `npx eslint --init` 生成一个配置文件。    

配置的形式有 `.eslintrc.*` 或者 package.json 的 `eslintConfig` 字段。   

有三方面的内容需要进行配置：   

- 运行环境：不同的环境有不同的预定义全局变量
- 全局变量：代码执行时可以访问的全局变量
- Rules：具体校验规则的配置，环境和全局变量其实都是对 Rules 进行辅助的     

除此之外，还有一些其他的工具的配置项。    

比如 `parserOptions`，值有：    

- `ecmaVersion`: `3 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12` 当然也可以用 2015 这种年份形式
- `sourceType`: `script` 或者 esm 的 `module`
- `ecmaFeatures`:
  + `globalReturn`
  + `impliesStrict`
  + `jsx`    

还有 `parser` 选项。   

环境配置 `/* eslint-env node, mocha */`。配置文件中这样配置：   

```json
{
  "env": {
    "browser": true,
    "node:: true
  }
}
```     

如果要使用plugin提供的环境，这样配置：   

```json
{
  "plugins": ["example"],
  "env": {
    "example/custom": true
  }
}
```     

全局变量配置： `/* global var1, var2 */` 如果可写 `/* global var1:writable, var2:writable */`。   

配置文件：   

```json
{
    "globals": {
        "var1": "writable",
        "var2": "readonly"
    }
}
```    

插件的使用：   

```json
{
    // ...
    "plugins": [
        "jquery",   // eslint-plugin-jquery
        "@foo/foo", // @foo/eslint-plugin-foo
        "@bar"      // @bar/eslint-plugin
    ],
    "extends": [
        "plugin:@foo/foo/recommended",
        "plugin:@bar/recommended"
    ],
    "rules": {
        "jquery/a-rule": "error",
        "@foo/foo/some-rule": "error",
        "@bar/another-rule": "error"
    },
    "env": {
        "jquery/jquery": true,
        "@foo/foo/env-foo": true,
        "@bar/env-bar": true,
    }
    // ...
}
```     

rule 配置： `0 - off`, `1 - warn`, `2 - error`。    

文件内配置： `/* eslint eqeqeq: "off", curly: "error" */`，`/* eslint quotes: ["error", "double"], curly: 2 */`    

配置文件：   

```json
{
    "rules": {
        "eqeqeq": "off",
        "curly": "error",
        "quotes": ["error", "double"]
    }
}
```     

配置的继承，`extends` 属性可以是字符串，或者是字符串数组。具体字符串值的话可以是文件的路径，或者
可共享配置的名称或者 `eslint:recommend`, `eslint:all`。   

一般插件是用来导出 rules，但也有一些插件导出了可共享的配置，所以我们也可以从插件来 extends 配置：   

```json
{
    "plugins": [
        "react"
    ],
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "rules": {
       "react/no-set-state": "off"
    }
}
```    

注意 extends 中的覆盖规则是后面的元素覆盖前面的，所以 eslint-config-prettier 要放在最后一个。   

最后的配置：   

eslint:   

```js
export default {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "prettier",
        "prettier/vue",
        "plugin:vue/essential"
    ],
    "parserOptions": {
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "plugins": [
        "vue"
    ],
    "rules": {
    }
};
```    

stylelint:   

```json
{
    "extends": "stylelint-config-standard",
    "rules": {
        "number-leading-zero": "never",
        "indentation": 4,
        "unit-no-unknown": [true, {
            "ignoreUnits": ["rpx"]
        }]
    }
}
```

# Web Animation 接口

## Document.timeline

```js
var pageTimeline = document.timeline;
var thisMoment = pageTimeline.currentTime;
```    

一个 `DocumentTimeline` 对象实例。   

## Animation 接口

- 构造函数 `new Animation([effect][, timeline])`
- 属性：
    + `currentTime`：感觉应该像是动画播放的时间，ms 单位，可以读或写，如果动画还没看是播放是 null
    + `effect`：读或写动画的效果，一个 `AnimationEffectReadOnly` 对象或者 null
    + `finished`：Promise
    + `id`：标识对话的 id
    + `pending`：是否处于一个暂停状态，注意播放完成不算暂停
    + `playState`：枚举值，标识动画状态
        - `idle`
        - `running`
        - `paused`
        - `finished`：如何区分 finished 和 idle，貌似一个动画如果被 cancel 了，就会进入 idle 状态
    + `playbackRate`
    + `ready`: Promise，文档上说是动画进入 pending state 或者被 canceled 的时候 resolve



这里又学习到一个知识点，即一个已经 resolved 或 rejected 的 promise，不管在状态变更后多久再
去 then 或者 catch 都是可以触发。    

这个没看懂：   

```js
animation.pause();
animation.ready.then(function() {
  // Displays 'running'
  alert(animation.playState);
});
animation.play();
```     


