# 泛型

> 摘自 https://pdai.tech/

Java 泛型这个特性是从 JDK 1.5 才开始加入的，因此为了兼容之前的版本，Java 泛型的实现采取了“伪泛型”的策略，即 Java 在语法上支持泛型，但是在编译阶段会进行所谓的“类型擦除”（Type Erasure），将所有的泛型表示（尖括号中的内容）都替换为具体的类型（其对应的原生态类型），就像完全没有泛型一样。

泛型包括泛型类、泛型接口和泛型方法。

```java
interface Info<T>{        // 在接口上定义泛型
    public T getVar() ; // 定义抽象方法，抽象方法的返回值就是泛型类型
}
class InfoImpl<T> implements Info<T>{   // 定义泛型接口的子类
    private T var ;             // 定义属性
    public InfoImpl(T var){     // 通过构造方法设置属性内容
        this.setVar(var) ;
    }
    public void setVar(T var){
        this.var = var ;
    }
    public T getVar(){
        return this.var ;
    }
}
```

为了解决泛型中隐含的转换问题，Java 泛型加入了类型参数的上下边界机制。`<? extends A>`表示该类型参数可以是 A(上边界)或者 A 的子类类型。编译时擦除到类型 A，即用 A 类型代替类型参数。这种方法可以解决开始遇到的问题，编译器知道类型参数的范围，如果传入的实例类型 B 是在这个范围内的话允许转换，这时只要一次类型转换就可以了，运行时会把对象当做 A 的实例看待。

```java
class A{}
class B extends A {}

public static void funC(List<? extends A> listA) {
    // ...
}
public static void funD(List<B> listB) {
    funC(listB); // OK
    // ...
}
```

和 TS 里面的泛型约束类型，即泛型的类型需要满足声明的约束才行。

泛型的下限：

```java
class Info<T>{
    private T var ;        // 定义泛型变量
    public void setVar(T var){
        this.var = var ;
    }
    public T getVar(){
        return this.var ;
    }
    public String toString(){    // 直接打印
        return this.var.toString() ;
    }
}
public class GenericsDemo21{
    public static void main(String args[]){
        Info<String> i1 = new Info<String>() ;        // 声明String的泛型对象
        Info<Object> i2 = new Info<Object>() ;        // 声明Object的泛型对象
        i1.setVar("hello") ;
        i2.setVar(new Object()) ;
        fun(i1) ;
        fun(i2) ;
    }
    public static void fun(Info<? super String> temp){    // 只能接收String或Object类型的泛型，String类的父类只有Object类
        System.out.print(temp + ", ") ;
    }
}
```

这个 TS 里面好想没见过，即泛型需要满足指定类型的父类。

## 类型擦除

泛型的类型擦除原则是：

- 消除类型参数声明，即删除`<>`及其包围的部分。
- 根据类型参数的上下界推断并替换所有的类型参数为原生态类型：如果类型参数是无限制通配符或没有上下界限定则替换为 Object，如果存在上下界限定则根据子类替换原则取类型参数的最左边限定类型（即父类）。
- 为了保证类型安全，必要时插入强制类型转换代码。
- 自动产生“桥接方法”以保证擦除类型后的代码仍然具有泛型的“多态性”。

具体一点：

- 擦除类定义中的类型参数 - 无限制类型擦除。

当类定义中的类型参数没有任何限制时，在类型擦除中直接被替换为 Object，即形如`<T>`和`<?>`的类型参数都被替换为 Object。

![erase-1](https://pdai.tech/images/java/java-basic-generic-1.png)

- 擦除类定义中的类型参数 - 有限制类型擦除

当类定义中的类型参数存在限制（上下界）时，在类型擦除中替换为类型参数的上界或者下界，比如形如`<T extends Number>`和`<? extends Number>`的类型参数被替换为`Number`，`<? super Number>`被替换为 Object。

![erase-2](https://pdai.tech/images/java/java-basic-generic-2.png)

在调用泛型方法时，可以指定泛型，也可以不指定泛型:

- 在不指定泛型的情况下，泛型变量的类型为该方法中的几种类型的同一父类的最小级，直到 Object
- 在指定泛型的情况下，该方法的几种类型必须是该泛型的实例的类型或者其子类

```java
public class Test {
    public static void main(String[] args) {

        /**不指定泛型的时候*/
        int i = Test.add(1, 2); //这两个参数都是Integer，所以T为Integer类型
        Number f = Test.add(1, 1.2); //这两个参数一个是Integer，一个是Float，所以取同一父类的最小级，为Number
        Object o = Test.add(1, "asd"); //这两个参数一个是Integer，一个是String，所以取同一父类的最小级，为Object

        /**指定泛型的时候*/
        int a = Test.<Integer>add(1, 2); //指定了Integer，所以只能为Integer类型或者其子类
        int b = Test.<Integer>add(1, 2.2); //编译错误，指定了Integer，不能为Float
        Number c = Test.<Number>add(1, 2.2); //指定为Number，所以可以为Integer和Float
    }

    //这是一个简单的泛型方法
    public static <T> T add(T x,T y){
        return y;
    }
}
```

类型擦除会造成多态的冲突，而 JVM 解决方法就是桥接方法。简单来说，就是假设我继承了一个泛型类，同时注入具体的类型，编译时候类型擦除，可以父类就替换成 Object 了，而子类可能还是特定的类型，这样就使得原本我们可能子类 override 父类的方法，这时候反而看起来不是 override，因为可能某些方法参数类型或者返回类型都不一样了。而解决的问题就是 JVM 在编译的时候添加桥接方法，使得 override 还能生效。
