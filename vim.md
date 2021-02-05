normal 模式
insert 模式
append 模式
open a line below 模式
I, A, O

# VIM

## 1. 模式

1. normal 模式
2. insert 模式: i, I
3. append 模式: a, A
4. open a line模式: o, O
5. command 模式: normal 模式下输入 : 后
6. visual 模式: normal 模式下输入 v 进入 visual 选择，使用 V 选择行，ctrl + v 块状选择，
注意是 ctrl，即便在 mac 下也是，这个模式主要是进行块级的操作

几个常用命令：

1. `:set nu`: 设置行号
2. `:vp`: vertical split 竖分屏
3. `:sp`: 横分屏  :q 来退出当前的分屏文件

## 2. insert 模式

1. `ctrl + h`: 删除前一个字符
2. `ctrl + w`: 删除前一个单词
3. `ctrl + u`: 视频里面说是删除当前行，但是在 mac 上试的时候感觉是 ctrl + w 一样，或者严格
来说，应该是删除光标当前位置到行首的这些字符，这两个是不是很熟，没错，shell 也是用的这几个快捷键
4. `ctrl + c` 或 `ctrl + [`: 回到 normal 模式

## 3. normal 模式

1. 移动光标：h(左),j(下),k(上),l(右)
2. gi 光标移动到上次编辑的地方，其实相当于 g 是移动，i 是进行 insert 模式，当时如果光按 g 的
话会发现光标并不会移动
3. w\/W 移动到下一个 work\/WORD 开头，e\/E 下一个word\/WORD尾
4. b\/B 回到上一个 word\/WORD 开头
5. word 指的是以非空白符分割的单词，WORD 是以空白符分割的单词
6. 行内搜索移动，搜索某个字符，注意是字符，用 f + 字符的方式，然后分号到下一个，逗号回上一个，
如果用 F 就是从当前位置到行首搜索
6. 0 移动到行首，`$` 移动到行尾（没成功）
8. gg 移动到文件开头，G 移动到文件结尾，`ctrl + o` 快速返回
9. H, M, L 移动到屏幕的HEAD, MIDDLE, LOW 地方
10. `ctrl + u`, `ctrl + f` 向上，下翻页，zz 放到屏幕中间