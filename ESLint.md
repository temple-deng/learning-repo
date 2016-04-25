# ESLint

###  1.基本介绍
ESLint的配置信息包括：  
+ **Environments** - 指定脚本的运行环境。每种环境都有一组特定的预定义变量。  
+ **Global** - 脚本在执行期间访问的额外的全局变量  
+ **Rules** - 启用的规则及各自的错误级别  


#### 描述语言选项 Specifying Parser Options
ESLint 允许你指定你想要支持的 JavaScript 语言选项。默认情况下，ESLint 支持 ECMAScript 5 语法。你可以通过使用解析器选项让它支持 ECMAScript 6 和 7 以及 JSX。  

使用parserOptions属性设置解析器选项。可用的选项有：
- ecmaVersion - 设置为3，5，6或7.指定JS版本  
- sourceType - 设置为"script"(默认) 或 "module"（如果你的代码是 ECMAScript 模块)。  
- ecmaFeatures - 这是个对象，表示你想使用的额外的语言特性:  
  + globalReturn - 允许在全局作用域下使用 return 语句   
  + impliedStrict - 启用全局 strict mode (如果 ecmaVersion 是 5 或更高)  
  + jsx - 启用 JSX  
  + experimentalObjectRestSpread - 启用对实验性的 object rest/spread properties 的支持。  


#### 配置环境 Specifying Environments 
环境定义了预定义的全局变量。可用的环境有：  
- browser - browser 全局变量。  
- node - Node.js 全局变量和 Node.js 作用域  
- commonjs - CommonJS 全局变量和 CommonJS 作用域 (仅为使用 Browserify/WebPack 写的只支持浏览器的代码)。  
- shared-node-browser - Node 和 Browser 通用全局变量。  
- es6 - 支持除了modules所有 ECMAScript 6 特性。  
- amd - 定义 require() 和 define() 作为像 amd 一样的全局变量。  
- mocha - 添加所有的 Mocha 测试全局变量。  
- jquery - jQuery 全局变量。  

这些环境并不是相互排斥的，所以你可以一次定义多个。  
在配置文件里指定环境，使用env键，指定你想启用的环境，设置它们为true。例如，以下示例启用了 browser 和 Node.js 的环境：
```javascript
	{
		"env": {
			"browser": true,
			"node": true
		}
	}
```

#### 配置全局变量 Specifying Globals
在配置文件里配置全局变量时，使用关键字globals键表示你要使用的全局变量。设置每个变量等于true允许变量被重写，或false不允许被重写。比如：  
```javascript
{
    "globals": {
        "var1": true,
        "var2": false
    }
}
```

#### 配置插件 
在配置文件里配置插件，要使用plugins键，其中包含插件名字的列表。插件名称可以省略eslint-plugin-前缀。  
```javascript
{
    "plugins": [
        "plugin1",
        "eslint-plugin-plugin2"
    ]
}
```

#### 配置规则
ESLint 附带有大量的规则。你可以使用注释或配置文件修改你项目中要使用哪些规则。改变一个规则设置，你必须设置规则ID等于这些值之一：  
+ "off" or 0 - 关闭规则  
+ "warn" or 1 - 开启规则，使用警告级别的错误: warn(不会导致程序退出)  
+ "error" or 2 - 开启规则，使用错误级别的错误：error(当被触发的时候，程序会退出)  
如果一个规则有额外的选项，你可以使用数组字面量指定它们。数组的第一项总是规则的严重程度（数字或字符串）。
```javascript
{
    "rules": {
        "eqeqeq": "off",
        "curly": "error",
        "quotes": ["error", "double"]
    }
}
```
配置定义在插件中的一个规则的时候，你必须使用插件名/规则ID的形式.当指定从插件来的规则时，确保删除eslint-plugin-前缀。ESLint 在内部只使用没有前缀的名称去定位规则。

<br/>
<br/>
### 2. Rules
#### Possible Errors 可能的错误
+ comma-dangle: 禁止或强化对象字面量中的拖尾逗号.(应该关闭)  
+ no-cond-assign：禁止在条件语句中赋值。  
+ no-console: 禁用 console。  
+ no-constant-condition：禁止在条件中使用常量表达式。
+ no-dupe-args：禁止重复参数。在严格模式下，如果一个函数有多个同名的参数，将会抛出 SyntaxError。   
+ no-dupe-keys：创建对象字面量时，禁止重复的键  
+ no-duplicate-case: 禁止重复的case标签  
+ no-empty: 禁止空语句块  
+ no-extra-boolean-cast: 在布尔类型的上下文中禁止双重否定布尔转换  
+ no-extra-parens: 禁止不必要的括号  
+ no-extra-semi: 禁止不必要的分号  
+ no-func-assign: 禁止重写函数声明  

