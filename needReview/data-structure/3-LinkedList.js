const OK = 1;
const ERROR = -1;
const TRUE = 1;
const FALSE = 0;

function Node(data) {
  this.next = null;
  this.data = data;
}

function LinkList() {
  this.head = {
    next: null
  };
}

/**
 * 所有接口
 * init 初始化一个空表
 * clear 清空表
 * get(i) 获取第 i 个元素
 * locate(data) 查找与 data 相等的元素，返回其序号
 * insert(i, data) 插入到第 i 个元素处
 * length 返回元素个数
 * init 方法其实就是构造函数了
 */


LinkList.prototype.clear = function() {
  let i = 0;
  let p, q;

  p = q = this.head;
  // 从头开始断开每个节点之间的链接
  while(p.next) {
    p = p.next;
    q.next = null;
    q = p;
  }
  return OK;
}

// 这个函数其实有点问题的，如果data 正好等于 -1 就尴尬了
LinkList.prototype.get = function(i) {
  let j = 0;
  let p = this.head;

  // i 的位置不合法
  if(j >= i) {
    return ERROR;
  }

  while(j < i && p) {
    p = p.next;
    j++;
  }

  // 位置超过链表长度
  if(!p) {
    return ERROR;
  }

  return p.data;
}


LinkList.prototype.append = function(data) {
  var node = new Node(data);
  let p = this.head;
  while(p.next) {
    p = p.next
  }

  p.next = node;
  return OK;
}

LinkList.prototype.insert = function(i, data) {
  let j = 0;
  let p = this.head;

  if(i <= j) {
    return ERROR;
  }

  // 应该是找到 i 之前的那个元素
  while(j < i - 1 && p) {
    p = p.next;
    j++;
  }

  if(!p) {
    return ERROR;
  }

  var node = new Node(data);
  node.next = p.next;
  p.next = node;
  return OK;
}


LinkList.prototype.delete = function(i) {
  let j = 0;
  let p = this.head.next;
  let prev = this.head;
  if(i <= j) {
    return ERROR;
  }

  while(p || i > j) {
    prev.next = p;
    p = p.next;
    j++;
  }
}

var ll = new LinkList();
ll.append('2');
ll.append('3');
ll.append('4');
console.log(ll);
ll.clear();
console.log(ll);
