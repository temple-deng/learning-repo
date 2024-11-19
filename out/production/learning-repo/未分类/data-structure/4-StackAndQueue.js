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

// var stack = new LinkStack();
// stack.push('1');
// stack.push(2);
// stack.push(3);
// console.log(stack.pop());
// console.log(stack.pop());
// console.log(stack.pop());
// console.log(stack.pop());


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