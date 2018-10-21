const fs = require('fs');
const path = require('path');
const babylon = require('babylon');
const traverse = require('babel-traverse').default;
const { transformFromAst } = require('babel-core');

let ID = 0;

// 先从一个接受文件路径参数的函数开始，读取其内容，并导出其依赖
// 注意文件路径是绝对路径
function createAsset(filename) {
  // 读取文件内容
  // 所以 loader 就是在这里，或者在下面的 absolutePath 附近进行作用咯
  // 分析文件名，然后调用 loader 进行处理，然后将一个能被分析的字符串
  // 返回出来
  const content = fs.readFileSync(filename, 'utf-8');

  // 找出文件的依赖，怎么做呢？借助 JS 解析器找出其导入字符串
  const ast = babylon.parse(content, {
    sourceType: "module"
  });

  // 保存模块的依赖的模块的相对路径
  const dependencies = [];

  // 遍历 AST 搜索依赖
  traverse(ast, {
    ImportDeclaration: ({node}) => {
      dependencies.push(node.source.value);
    }
  });

  // 递增计数器
  const id = ID++;

  // 使用 Babel 编译代码，使我们的代码能兼容老旧浏览器（其实这不属于打包器的内容了吧）
  const { code } = transformFromAst(ast, null, {
    presets: ['env']
  });

  // 返回关于模块的所有信息
  return {
    id,
    filename,
    dependencies,
    code
  };
}

// entry 也是绝对路径
function createGraph(entry) {
  // 从入口点文件开始解析
  const mainAsset = createAsset(entry);

  // 使用队列来解析每个资源的依赖
  const queue = [mainAsset];

  // 遍历队列
  for (const asset of queue) {
    asset.mapping = {};

    const dirname = path.dirname(asset.filename);

    asset.dependencies.forEach(relativePath => {
      const absolutePath = path.join(dirname, relativePath);

      const child = createAsset(absolutePath);

      asset.mapping[relativePath] = child.id;
      queue.push(child);
    })
  }

  return queue;
}

// 现在，定义一个函数，使用我们生成的依赖图，然后返回一个可以在浏览器中使用的打包文件
// 最终的打包文件就是一个自执行函数
// (function() {})()
// 这个函数只有一个参数，一个带有我们依赖图中所有模块信息的对象

function bundle(graph) {
  let modules = '';

  // 首先构造这个参数对象
  // 注意这个被构造的字符串会用 {} 抱起来，所以对于每个模块
  // 我们添加的是这样格式的字符串，`key: value,`
  graph.forEach(mod => {
    // 依赖图中的每个模块在这个对象中都有一个条目，使用模块 id 作为键，一个数组作为
    // 属性值，这个数组包含两个元素

    // 第一个元素是每个模块的代码，使用一个函数包裹着。因为模块都应该是局部的

    // 我们的模块在我们将它们`转换{被 babel 转译}`后, 使用`commonjs`模块系统: 
    // 他们期望一个`require`, 一个`module`和`exports`对象可用. 
    // 那些在浏览器中通常不可用,所以我们将它们实现并将它们注入到函数包装中. 

    // 第二个值，我们用 stringify 函数将模块依赖字符串化
    // { './relative/path': 1 }
    modules += `${mod.id}: [
      function (require, module, exports) {
        ${mod.code}
      },
      ${JSON.stringify(mod.mapping)}
    ],`;
  });

  // 最后，实现自执行函数的函数体

  // 首先定义一个 `require()` 函数：接受一个模块 id 作参数

  // 我们模块中的代码会调用是使用相对路径而不是模块 id 来调用 `require()` 函数的。
  // 另外,两个模块可能`require()`相同的相对路径,但意味着两个不同的模块. 

  // 为了处理这些情况，当一个模块被请求时，我们创建一个新的，专用的 `require`
  // 函数来使用。这个函数知道通过使用`模块的mapping对象`将 `其相对路径` 转换为`ID`. 

  // 最后，在 CJS 中，当模块被加载时，其通过 exports 对象暴露接口。

  const result = `
  (function(modules) {
    function require(id) {
      const [fn, mapping] = modules.[id];

      function localRequire(name) {
        return require(mapping[name]);
      }

      const module = { exports: {} };

      fn(localRequire, module, module.exports);

      return module.exports;
    }

    require(0);
  })({$modules})`;

  return result;
}

const graph = createGraph('./example/entry.js');
const result = bundle(graph);

console.log(result);