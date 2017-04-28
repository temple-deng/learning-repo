# 5 Document Structure

## 5.2 Grouping: the 'g' element

'g' 元素是一个用来将相关的图形元素分组在一起的容器元素。  

分组结构与'desc'和'title'元素结合使用时，提供有关文档结构和语义的信息。  

一组元素就像独立的对象一样可以使用一个 'id' 属性作为名字。  

## 5.3 Defining content for reuse, and the 'defs' element

SVG允许为了之后重用而定义图形对象。例如，为了用线性渐变填充一个矩形，可以先定义一个
'linearGradient' 元素，并给它一个ID，如：  

`<linearGradient id="MyGradient">...</linearGradient>`  

之后可以在矩形的 'fill' 属性值中引用这个线性渐变：  

`<rect style="fill:url(#MyGradient)" />`  

某些元素类型如渐变自身是不会生成图形结果的。因此他们可以放置在任何地方。然而，有时可能会需要
定义一个图形对象但是却不允许其直接渲染，只能在别处引用。为了这样做，并且为了方便的将定义内容
分组，就可以使用 'defs' 元素。  

推荐的做法是只要有可能，就尽量在 'defs' 元素内定义引用的元素。这些元素是总是被引用的：'altGlyphDef',
'clipPath', 'cursor', 'filter', 'linearGradient', 'radialGradient', 'marker', 'mask',
 'pattern', 'symbol'。  

'defs' 元素是被引用元素的容器元素。  

'defs' 的内容模型是和 'g' 元素相同的；因此，任何可以作为 'g' 元素子元素的元素可以做 'defs' 的子元素。  

作为 'defs' 后代的元素不会直接被渲染；
