# cssnext()

## 安装

`npm install postcss-cssnext`   

可以直接在 PostCSS API 中使用。不过一般是搭配 PostCSS 执行器。而且貌似 cssnext 原本是
独立的工具，后来直接就集成到 PostCSS 中了，所有使用时直接就按插件的使用就行了。      

注意这个包其实也就是一系列 PostCSS 插件的集合，只不过放到一个包里方便使用，一般来说，这个工具
提供的每个特征都是一个插件。   

## Options   

### browsers   

默认：browserslist 的默认值。看样子也是根据 browserslist 来执行转换的。   

### features

默认：所有的特征是取决于 browsers 选项的。   

应该直接使用 browsers 选项而不是这个。   

这是个对象，键名应该是启用或者禁用的特征的名字。默认是都启用的。    

```javascript
//eg: disable custom properties support

var postcss = require("postcss")
var cssnext = require("postcss-cssnext")

postcss([
  cssnext({
    features: {
      customProperties: false
    }
  })
])
```   

注意每个特征都是一个插件，因此都有自己的选项。如果要传递选项给一个特征，直接传递一个对象值：   

```javascript
//eg: pass variables

var postcss = require("postcss")
var cssnext = require("postcss-cssnext")

postcss([
  cssnext({
    features: {
      customProperties: {
        variables: {
          mainColor: "red",
          altColor: "blue",
        }
      }
    }
  })
])
```   

### warnForDuplicates  

默认：`true`。    

这个选项应该保持它的默认值。    

### warnForDeprecations

默认：`true`。   

这个选项应该保持它的默认值。    
