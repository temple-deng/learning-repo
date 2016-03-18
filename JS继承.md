# JS继承
Tags: extend 继承
---


### 原型链继承
为了让子类继承父类的属性（也包括方法），首先需要定义一个构造函数。然后，将父类的新实例赋值给构造函数的原型。代码如下：
```
	function Parent(){
		this.name = 'hehe';
	}

	function Child(){
		this.age = 23;
	}

	Child.prototype = new Parent();

	var child = new Child();
```