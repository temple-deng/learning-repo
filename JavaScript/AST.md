# AST

## 简介

Babel 生成的 AST 是基于 ESTree 修改过的。    

以以下代码为例：   

```js
function square(n) {
  return n * n;
}
```    

生成的 AST 大致这个样子：   

```
FunctionDeclaration {
  type: 'FunctionDeclaration'
  start: 0
  end: 38
  loc: {
    start: {
      line: 1
      column: 0
    }
    end: {
      line: 3
      column: 1
    }
  }
  id: Identifier {
    type: "Identifier"
    start: 9
    end: 15
    loc: {
      start: {
        line: 1
        column: 9
      }
      end: {
        line: 1
        column: 15
      }
      identifierName: "square"
    }
    name: "square"
  }
  generator: false
  async: false
  params: [
    Identifier {
      type: "Identifier",
      start: 16
      end: 17    // 有点看不懂这个 end，到底算不算最后一个字符啊
      loc: {
        start: {
          line: 1,
          column: 16
        }
        end: {
          line: 1
          column: 17
        }
        identifierName: "n"
      }
      name: "n"
    }
  ]
  body: BlockStatement {
    type: "BlockStatement"
  }
}
```