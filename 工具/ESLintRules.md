# ESLint Rules

## Possible  Errors

|  | no-await-in-loop  | 禁止在循环中使用 `await` 咯 |
| :------------- | :------------- | :------------- |
|        | no-compare-neg-zero    | 不允许与 -0 比较 |
| m | no-cond-assign | 禁止在条件表达式使用赋值运算符 |
| m | no-console |  |
| m | no-constant-condition | 禁止在条件中使用常量表达式|
| m | no-control-regex | 禁止在正则表达式中使用控制字符(什么是控制字符？) |
| m | no-debugger | |
| m | no-dupe-args | 	禁止 function 定义中出现重名参数 |
| m | no-dupe-keys | 禁止在对象字面量中出现同名 keys |
| m | no-duplicate-case | 禁止出现重复的 case 标签 |
| m | no-empty | 禁止出现空语句块 |
| m | no-empty-character-class | 禁止在正则表达式中使用空字符类 |
| m | no-ex-assign | 禁止对 catch 子句的参数重新赋值 |
| m | no-extra-boolean-cast | 禁止不必要的布尔转换 |
|  | no-extra-parens | 禁止不必要的括号 |
| m | no-extra-semi | 禁止不必要的分号 |
| m | no-func-assign | 	禁止对 function 声明重新赋值 |
| m | no-inner-declarations | 禁止在嵌套的块中出现变量声明或 function 声明 |
| m | no-invalid-regexp | 禁止 RegExp 构造函数中存在无效的正则表达式字符串 |
| m | no-irregular-whitespace | 禁止在字符串和注释之外不规则的空白 |
| m | no-obj-calls | 	禁止把全局对象作为函数调用 |
|  | no-prototype-builtins | 禁止直接调用对象上的 `Object.prototype` 上的方法 |
| m | no-regex-spaces | 禁止正则表达式字面量中出现多个空格 |
| m | no-sparse-arrays | 禁用稀疏数组 |
|  | no-template-curly-in-string | 禁止常规字符串中的模板文字占位符语法(应该是指模板字符串中的那种占位符吧) |
| m | no-unexpected-multiline | 	禁止出现令人困惑的多行表达式 |
| m | no-unreachable | 	禁止在`return`、`throw`、`continue` 和 `break` 语句之后出现不可达代码 |
| m | no-unsafe-finally | 禁止在 `finally` 语句块中出现控制流语句 |
| m | no-unsafe-negation | 不允许对关系运算符的左操作数进行否定 |
| m | use-isnan | 要求使用 `isNaN()` 检查 `NaN`|
|  | valid-jsdoc | 强制使用有效的 JSDoc 注释 |
| m | valid-typeof | 强制 `typeof` 表达式与有效的字符串进行比较 |

## Best Practices

|  | accessor-pairs | 	强制 getter 和 setter 在对象中成对出现 |
| :------------- | :------------- | :------------- |
|  | array-callback-return  | 	强制数组方法的回调函数中有 `return` 语句 |
| | block-scoped-var | 强制使用作用域范围内定义的变量 |
| | class-methods-use-this | 强制类的方法使用 `this` |
| | complexity | enforce a maximum cyclomatic complexity allowed in a program |
| |consistent-return | 要求 `return` 要么总有返回值，要么从不声明返回值 |
| | curly | 	强制所有控制语句使用一致的括号风格 |
|  | default-case | `switch` 里要有 `default` |
| | dot-location | 	强制在点号之前或之后一致的换行 |
| | dot-notation | 尽可能使用点操作符 |
| | eqeqeq | 使用 `===` 和 `!==` |
| | guard-for-in | 要求 `for-in` 循环中有一个 `if` 语句  |
| | no-alert | 不准使用 `alert, confirm, prompt` |
| | no-caller | 不准使用 `arguments.caller` or `arguments.callee`|
| m | no-case-declarations | 不允许在 case 子句中使用词法声明 |
|  | no-div-regex | 禁止除法操作符显式的出现在正则表达式开始的位置 |
|  | no-else-return |  禁止在 `if` 块中的 `return` 声明之后使用 `else` 块 |
| | no-empty-function | |
| m | no-empty-pattern |禁止使用空解构模式|
| | no-eq-null | 禁止在没有类型检查操作符的情况下与 `null` 进行比较 |
| | no-eval | |
| | no-extend | 	禁止扩展原生类型 |
| | no-extra-bind | 禁止没必要的调用 `.bind()` |
| | no-extra-label | 	禁用不必要的标签 |
| m | no-fallthrough | 禁止多个 `case` 使用一个状况吧 |
| | no-floating-decimal | 禁止数字字面量中使用前导和末尾小数点 |
| m | no-global-assign | 禁止给原生对象或只读的全局变量赋值 |
| | no-implcit-coercion | disallow shorthand type conversions 类型转换的东西吧 |
| | no-implcit-globals | 禁止在全局范围内使用变量声明和 `function` 声明 |
| 
