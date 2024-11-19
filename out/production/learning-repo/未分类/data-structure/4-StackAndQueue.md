# 第 4 章 栈和队列

## 4.2 栈的定义

栈是限定仅在表尾进行插入和删除操作的线性表。     

允许插入和删除的一端称为栈顶，另一端称为栈底，不含任何数据元素的栈称为空栈。栈又称为后进先出（Last In
 First Out）的线性表，简称 LIFO 结构。   

首先栈是一个线性表，也就是说，栈元素具有线性关系，即前驱后继关系。      

由于栈本身就是一个线性表，那么线性表的顺序存储和链式存储，对于栈来说，也是同样适用的。     

栈的顺序存储就不说了，用数组实现的话，进栈和出栈的时间复杂度应该都是 O(1)，主要还是介绍链式存储。       

## 4.6 栈的链式存储结构及实现

对于链栈来说头结点是没有必要的了，有一个头指针即栈顶指针即可。       

栈的插入和删除：     

```js
function Node(data) {
  this.next = null;
  this.data = data;
}

function LinkStack() {
  this.top = null;
}

LinkStack.prototype.push = function (data) {
  let node = new Node(data);
  node.next = this.top;
  this.top = node;
}

LinkStack.prototype.pop = function() {
  if(this.top === null) {
    return -1;
  }

  let p = this.top;
  this.top = this.top.next;
  let data = p.data;
  p = null;
  return data;
}
```      

## 4.9 栈的应用-四则运算表达式求值

后缀表达式，所有的符号都在运算数字的后面

表达式：9 + ( 3 - 1 ) * 3 + 10 / 2     

后缀表达式： 9 3 1 - 3 * + 10 2 / +      

规则：从左到右遍历表达式的每个数字和符号，遇到是数字就进栈，遇到是符号就将处于栈顶的两个数字出栈，进行运算，
运算结果进栈，一直到获得最终结果。      

### 4.9.3 中缀表达式转后缀表达式

标准四则运算表达式叫做中缀表达式。因为所有的运算符号都在两数字的中间，现在我们的问题就是中缀到后缀的
转化。      

规则：从左到右遍历中缀表达式的每个数字和符号，若是数字就输出，即成为后缀表达式的一部分；若是符号，则判断其于
栈顶符号的优先级，是右括号或优先级不高于栈顶符号则栈顶元素依次出栈并输出，并将当前符号进栈。     

1. 第一个数字是9，输出9，后面是 + 号，进栈
2. 第三个字符是 (，因其只是左括号，还未配对，故进栈
3. 第四个字符是数字 3，输出，总表达式为9,3，接着是 -，进栈。
4. 之后是数字 1，输出，表达式为 9 3 1，之后是 )，此时我们需要去匹配此前的 (，所以栈顶元素依次出栈，直到
（ 出栈为止。此时表达式为 9 3 1 - ，这里就能看出作者的表述省略了很多内容，弄得意义根本不清楚。
5. 接着是 *，此时栈顶为 +，优先级低于 *，因此不输出，\*进栈，接着是3，输出，表达式为 9 3 1 - 3。
6. 之后是 +，低于 *，所以 * 出栈，+ 出栈，+ 进栈，此时表达式为 9 3 1 - 3 *+，然后是10，则 9 3 1 - 3 *+ 10。
7. 之后是 /，优先级高，入栈，再然后是2输出，最终就成了 9 3 1 - 3 *+ 10 2 / +。      


## 4.10 队列

队列是只允许在一端进行插入操作，而在另一端进行删除操作的线性表。      

队列是一种先进先出（First In First Out, FIFO）的线性表。允许插入的一端称为队尾，允许删除的一端称为队首。     

链队列的入队和出队操作：    

```js
// 其实有没有头结点对线性表的实现还是影响挺大的
function LinkQueue() {
  // 这里只用头尾指针不用头结点实现
  this.front = this.rear = null;
}

LinkQueue.prototype.enQueue = function(data) {
  let node = new Node(data);
  if(this.rear === null) {
    // 这种情况的话应该是队列为空
    this.front = this.rear = node;
    return;
  }

  this.rear.next = node;
  this.rear = node;
  return;
}

LinkQueue.prototype.deQueue = function() {
  if(this.read === null) {
    return -1;
  }
  let p = this.front;
  this.front = this.front.next;
  let data = p.data;
  p.next = null;
  return data;
}

LinkQueue.prototype.toString = function() {
  if(this.rear === null) {
    console.log('empty queue');
    return;
  }

  let p = this.front;
  while(p) {
    console.log(p.data);
    p = p.next;
  }
}

var lq = new LinkQueue();

lq.enQueue(1);
lq.enQueue(2);
lq.deQueue();
lq.enQueue(4);
lq.toString();
```      


