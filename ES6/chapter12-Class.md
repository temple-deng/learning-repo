# 12. Class



```
 1. 基本用法
 2. Class的继承
```

## 1.基本用法

```javascript
    Class Point {
        constructor(x, y){
            this.x = x;
            this.y = y;
        }

        toString(){
            return '(' + this.x + ',' + this.y + ')';
        }
    }
```  

上面代码定义了一个“类”，可以看到里面有一个constructor方法，这就是构造方法，而this关键字则代表实例对象。也就是说，ES5的构造函数Point，对应ES6的Point类的构造方法。  


定义类的方法时不用加`function`关键字，方法之间不需要逗号分隔，加了会报错。  


类的内部所有定义的方法，都是不可枚举的.这一点与ES5的行为不一致。  


一个类必须有constructor方法，如果没有显式定义，一个空的constructor方法会被默认添加。  

constructor方法默认返回实例对象（即this），完全可以指定返回另外一个对象。  

类的构造函数，不使用new是没法调用的，会报错。这是它跟普通构造函数的一个主要区别，后者不用new也可以执行。   

与ES5一样，实例的属性除非显式定义在其本身（即定义在this对象上），否则都是定义在原型上（即定义在class上）。  


Class不存在变量提升（hoist），这一点与ES5完全不同。  

```javascript
    //大多数浏览器的ES5实现之中，每一个对象都有__proto__属性，指向对应的构造函数的prototype属性。
    function Foo(){};
    var foo = new Foo();
    Foo.prototype.constructor === foo.__proto__.constructor //true
```  


## 2.Class的继承  

```javascript
    class ColorPoint extends Point {

      constructor(x, y, color) {
        super(x, y); // 调用父类的constructor(x, y)
        this.color = color;
      }

      toString() {
        return this.color + ' ' + super.toString(); // 调用父类的toString()
      }

    }
```  

constructor方法和toString方法之中，都出现了super关键字，它指代父类的实例（即父类的this对象）。  

子类必须在constructor方法中调用super方法，否则新建实例时会报错。这是因为子类没有自己的this对象，而是继承父类的this对象，然后对其进行加工。如果不调用super方法，子类就得不到this对象。  

ES5的继承，实质是先创造子类的实例对象this，然后再将父类的方法添加到this上面（Parent.apply(this)）。ES6的继承机制完全不同，实质是先创造父类的实例对象this（所以必须先调用super方法），然后再用子类的构造函数修改this。  

如果子类没有定义constructor方法，这个方法会被默认添加，代码如下。也就是说，不管有没有显式定义，任何一个子类都有constructor方法。  

另一个需要注意的地方是，在子类的构造函数中，只有调用super之后，才可以使用this关键字，否则会报错。这是因为子类实例的构建，是基于对父类实例加工，只有super方法才能返回父类实例。  

`Object.getPrototypeOf` 方法可以用来从子类上获取父类。

**super**  

`super` 这个关键字，既可以当作函数使用，也可以当作对象使用。在这两种情况下，它的用法完全不同。  

第一种情况，`super`作为函数调用时，代表父类的构造函数。ES6 要求，子类的构造函数必须执行一次`super`函数。

`super`虽然代表了父类A的构造函数，但是返回的是子类B的实例。  

作为函数时，`super()` 只能用在子类的构造函数之中，用在其他地方就会报错。

第二种情况，`super`作为对象时，在普通方法中，指向父类的原型对象；在静态方法中，指向父类。

**类的__proto__属性和prototype属性**   

Class作为构造函数的语法糖，同时有prototype属性和__proto__属性，因此同时存在两条继承链。  

（1）子类的__proto__属性，表示构造函数的继承，总是指向父类。  

（2）子类prototype属性的__proto__属性，表示方法的继承，总是指向父类的prototype属性。  

```javascript
    class A {
    }

    class B extends A {
    }

    B.__proto__ === A // true
    B.prototype.__proto__ === A.prototype // true
```  


## 3. 静态方法

如果在一个方法前，加上`static` 关键字，就表示该方法不会被实例继承，而是直接通过类来调用，这就称为“静态方法”。

父类的静态方法，可以被子类继承。  


## `new.target`

`new` 是从构造函数生成实例的命令。ES6为`new` 命令引入了一个`new.target`属性，（在构造函数中）返回 `new` 命令作用于的那个构造函数。如果构造函数不是通过`new` 命令调用的，`new.target` 会返回`undefined`，因此这个属性可以用来确定构造函数是怎么调用的。
