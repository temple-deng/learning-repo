# CSS Basic Box Model

标签（空格分隔）： 未分类

---

### 9. Calculating widths, heights and margins
The following two algorithms define the used value of ‘width’ and ‘height’ respectively and also the used values of the ‘margin’ properties and of ‘top’, ‘right’ ‘bottom’ and ‘left’.

下面两种算法分别定义了`width` `height`属性的使用值，以及`maring`属性和`top` `right` `bottom` `left`的使用值。

Note that they do not affect the computed values of ‘width’ and ‘height’. Also note that in some cases the used width has to be known in order to calculate the used height, or vice versa,

注意这些算法不会影响`width`和`height`的计算值。同时也要注意一些时候为了计算使用的`height`, 使用的`width`必须是已知的, 反之亦然。

对于 `width` 属性来说 :

1. The tentative used width is calculated (without ‘min-width’, and ‘max-width’) following the rules in the subsections below.
2. If the tentative used width is greater than ‘max-width’, the same rules are applied again, but this time using the computed value of ‘max-width’ as the computed value for 'width.
3. If the resulting width is smaller than ‘min-width’, the same rules are applied again, but this time using the computed value of ‘min-width’ as the computed value for ‘width’.

1. 在没有设置`min-width` 和 `max-width`时， 暂定的使用值是由下面的规则计算出来的。
2. 如果暂定的使用值是比`max-width`大， 相同的规则再使用一次， 但是这个使用`max-width`的计算值作为`width`的计算值。
3. 如果得出结果的`width`比`min-width`还小，相同的规则再使用一个，但是这个使用`min-width`的计算值作为`width`的计算值。

...东西太多，下次再说

<br>

#### 9.1. Inline, non-replaced elements
The ‘width’ and ‘height’ properties do not apply. For each of ‘left’, ‘right’, ‘top’, ‘bottom’, ‘margin-left’, ‘margin-right’, ‘margin-top’ and ‘margin-bottom’, the used value is equal to the computed value, except that a computed value of ‘auto’ becomes a used value of ‘0’.

对于行内非置换元素来说，`width`和`height`并不适用。对于`left`, `rigth`, `top`, `bottom`, `margin-left`, `margin-right`, `margin-top`, `margin-bottom`的每一个值来说，使用的值等于计算值，除了计算值为`auto`时，使用值为0.

#### 9.2. Inline or floating, replaced elements
The used values of ‘margin-left’, ‘margin-right’, ‘margin-top’ and ‘margin-bottom’ are equal to the computed value, except that a computed value of ‘auto’ becomes a used value of ‘0’.

对于行内的，或者浮动的替换元素来说，`margin-left`,`maring-right`, `margin-top`, `margin-bottom`的使用值等于计算值， 除了计算值`auto`使用值为0.

If ‘height’ and ‘width’ both have computed values of ‘auto’ and the element also has an intrinsic width, then that intrinsic width is the used value of ‘width’.

如果`height`和`width`都是计算值`auto`并且元素有内在的宽度, 那么`width`的使用值就是这个内在的宽度。

If ‘height’ and ‘width’ both have computed values of ‘auto’ and the element also has an intrinsic height, then that intrinsic height is the used value of ‘height’.

如果`height`和`width`都有计算值`auto`，元素有内在的高度， 那么`height`的使用值就是这个高度。

If ‘height’ and ‘width’ both have computed values of ‘auto’ and the element has no intrinsic width, but does have an intrinsic height and intrinsic ratio; or if ‘width’ has a computed value of ‘auto’, ‘height’ has some other computed value, and the element has an intrinsic ratio; then the used value of ‘width’ is:

如果`height`和`width`都是计算值`auto`， 元素没有内在的宽度，但有内在的高度和比例；或者`height`有其他的计算值，并且元素有内在的比例，那么`width`使用的计算值是:

> (used height) * (intrinsic ratio)






