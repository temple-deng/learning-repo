# 第 1 章 种子模块

## 1.2 功能介绍

种子模块也叫核心模块，是框架的最先执行执行的部分。既然是最先执行的模块，那么就要求其里面的方法是历经考验、千锤百炼
的，并且能将这个模块变得极具扩展性、高可用、稳定性。    

1. 扩展性，是指方便将其他模块的方法或属性加入进来，让种子迅速成长为一颗大叔
2. 高可用，是指这里的方法是及其常用的，其他模块不用重复定义它们
3. 稳定性，是指不能轻易在以后版本中删除    

种子模块应该包含以下功能：对象扩展、数组化、类型判断、无冲突处理、domReady。     

## 1.3 对象扩展

我们需要一种机制，将新功能添加到我们的命名空间上。命名空间，是指我们这个框架在全局作用域暴露的唯一变量，
它多是一个对象或一个函数。      

对象扩展这种机制，一般做成一个方法，叫做 extend 或 mixin。在属性描述符出现之前，我们是可以随意添加、
更改、删除其成员的，因此扩展一个对象非常便捷。一个简单的扩展方法如下：    

```js
function extend(dest, source) {
  for(let key in source) {
    dest[key] = source[key];
  }
  return dest;
}
```    

下面是 ES6 的 `Object.assign` 的一个 polyfill:    

```js
function ToObject(val) {
  if(val == null) {
    throw new TypeError('Object assign cannot be called with null or undefined');
  }
  return Object(val);
}

module.exports = Object.assign || function (target, source) {
  const to = ToObject(target);

  for (let i = 1; i < arguments.length; i++) {
    for(let key in arguments[i]) {
      to[key] = arguments[i][key];
    }
  }
  return to;
}
```    

代码里有 jQuery 的 extend 的简化版。