# 基础内容

- [基础内容](#基础内容)
  - [数据类型](#数据类型)
    - [缓存池](#缓存池)
    - [整数缓存池（Integer Cache）](#整数缓存池integer-cache)
    - [String 常量池（String Constant Pool）](#string-常量池string-constant-pool)
    - [其他类型的缓存](#其他类型的缓存)
    - [自定义缓存池](#自定义缓存池)
  - [继承](#继承)
    - [接口和抽象类](#接口和抽象类)
    - [super](#super)
  - [Object 通用方法](#object-通用方法)
- [注解](#注解)
  - [内置的注解](#内置的注解)
  - [元注解](#元注解)
  - [注解与反射接口](#注解与反射接口)

> 摘自 https://pdai.tech/

## 数据类型

### 缓存池

在 Java 中，“缓存池”通常是指对一些特定类型的对象实现的内存缓存机制，它有助于节省内存并提高性能。缓存池通过存储已经创建的对象实例，并在需要时重用它们，从而减少对象创建的频率。下面是 Java 中几个常见的缓存池例子：

### 整数缓存池（Integer Cache）

Java 对于 `-128` 到 `127`（包括 `-128` 和 `127`）之间的所有整数值自动维护了一个缓存池。当你通过 `Integer.valueOf()` 方法或者自动装箱获取这个范围内的 `Integer` 对象时，Java 会从缓存池中返回相应的实例，而不是创建新对象。例如：

```java
Integer a = 100;
Integer b = 100;
System.out.println(a == b); // 输出 true
```

在这个例子中，`a` 和 `b` 实际上指向了缓存池中的同一个 `Integer` 对象。这种缓存机制可以显著节约内存，因为这个数值范围的整数使用非常频繁。

### String 常量池（String Constant Pool）

Java 也为字符串常量维护了一个特殊的存储区域称为字符串常量池（String Constant Pool）。如果你创建了一个字符串字面量，Java 将首先检查字符串常量池，如果这个字符串已经存在，则返回现有的引用，否则，它会在池中创建一个新的字符串然后返回其引用。例如：

```java
String s1 = "hello";
String s2 = "hello";
System.out.println(s1 == s2); // 输出 true
```

在这个例子中，`s1` 和 `s2` 实际上指向了常量池中的同一个字符串对象。

### 其他类型的缓存

除了整数和字符串以外，Java 还对其他一些类型提供了类似的缓存，比如 `Byte`、`Character`、`Short` 和 `Long`。这些类型的包装器类在一定数值范围内也使用缓存池。还有例如 `Boolean`，它由于仅有 `true` 和 `false` 两个值，也自然使用了缓存。

### 自定义缓存池

开发者还可以自己实现缓存池模式，例如在应用层面使用对象池（Object Pool）模式。这通常适用于创建成本较高的对象，如数据库连接池。应用程序可以从对象池中借用对象使用，使用完后再将对象归还到池中，这样可以重复利用已有对象而不必每次都重新创建。

总的来说，“缓存池”在 Java 中是个利用对象重用来提高性能和减少内存开销的重要概念。

`new Integer(123)` 与 `Integer.valueOf(123)` 的区别在于:

- `new Integer(123)` 每次都会新建一个对象
- `Integer.valueOf(123)` 会使用缓存池中的对象，多次调用会取得同一个对象的引用。

看起来有点像 Symbol 和 Symbol.for。

```java
Integer x = new Integer(123);
Integer y = new Integer(123);

System.out.println(x == y);  // false

Integer z = Integer.valueOf(123);
Integer k = Integer.valueOf(123);
System.out.println(z == k);  // true
```

在 Java 8 中，Integer 缓存池的大小默认为 -128~127。

编译器会在缓冲池范围内的基本类型自动装箱过程调用 valueOf() 方法，因此多个 Integer 实例使用自动装箱来创建并且值相同，那么就会引用相同的对象。

```java
Integer m = 123;
Integer n = 123;
System.out.println(m == n); // true
```

String 内部使用 char 数组存储数据，该数组被声明为 final，这意味着 value 数组初始化之后就不能再引用其它数组。并且 String 内部没有改变 value 数组的方法，因此可以保证 String 不可变。

如果一个 String 对象已经被创建过了，那么就会从 String Pool 中取得引用。只有 String 是不可变的，才可能使用 String Pool。

1.1 字面量属于 double 类型，不能直接将 1.1 直接赋值给 float 变量，因为这是向下转型。Java 不能隐式执行向下转型，因为这会使得精度降低。

```java
// float f = 1.1
float f = 1.1f;
```

因为字面量 1 是 int 类型，它比 short 类型精度要高，因此不能隐式地将 int 类型下转型为 short 类型。

```java
short s1 = 1;
// s1 = s1 + 1;
// 但是使用 += 运算符可以执行隐式类型转换。
s1 += 1;
```

## 继承

protected 用于修饰成员，对类没有意义。

如果子类的方法重写了父类的方法，那么子类中该方法的访问级别不允许低于父类的访问级别。这是为了确保可以使用父类实例的地方都可以使用子类实例，也就是确保满足里氏替换原则。

### 接口和抽象类

接口是抽象类的延伸，在 Java 8 之前，它可以看成是一个完全抽象的类，也就是说它不能有任何的方法实现。

从 Java 8 开始，接口也可以拥有默认的方法实现，这是因为不支持默认方法的接口的维护成本太高了。在 Java 8 之前，如果一个接口想要添加新的方法，那么要修改所有实现了该接口的类。

接口的成员(字段 + 方法)默认都是 public 的，并且不允许定义为 private 或者 protected。

接口的字段默认都是 static 和 final 的。

接口和抽象类的比较：

- 从设计层面上看，抽象类提供了一种 IS-A 关系，那么就必须满足里式替换原则，即子类对象必须能够替换掉所有父类对象。而接口更像是一种 LIKE-A 关系，它只是提供一种方法实现契约，并不要求接口和实现接口的类具有 IS-A 关系。
- 从使用上来看，一个类可以实现多个接口，但是不能继承多个抽象类。
- 接口的字段只能是 static 和 final 类型的，而抽象类的字段没有这种限制。
- 接口的成员只能是 public 的，而抽象类的成员可以有多种访问权限。

### super

- 访问父类的构造函数: 可以使用 super() 函数访问父类的构造函数，从而委托父类完成一些初始化的工作。
- 访问父类的成员: 如果子类重写了父类的中某个方法的实现，可以通过使用 super 关键字来引用父类的方法实现。

## Object 通用方法

```java
public final native Class<?> getClass()

public native int hashCode()

public boolean equals(Object obj)

protected native Object clone() throws CloneNotSupportedException

public String toString()

public final native void notify()

public final native void notifyAll()

public final native void wait(long timeout) throws InterruptedException

public final void wait(long timeout, int nanos) throws InterruptedException

public final void wait() throws InterruptedException

protected void finalize() throws Throwable {}
```

- `equals`

  1. 自反性：`x.equals(x); // true`
  2. 对称性：`x.equals(y) == y.equals(x); // true`
  3. 传递性：`if (x.equals(y) && y.equals(z)) { x.equals(z); } // true`
  4. 一致性：`x.equals(y) == x.equals(y); // true`
  5. 与 null 的比较：`x.equals(null); // false`

- 对于基本类型，== 判断两个值是否相等，基本类型没有 equals() 方法。
- 对于引用类型，== 判断两个变量是否引用同一个对象，而 equals() 判断引用的对象是否等价。

- hashCode() 返回散列值，而 equals() 是用来判断两个对象是否等价。等价的两个对象散列值一定相同，但是散列值相同的两个对象不一定等价。在覆盖 equals() 方法时应当总是覆盖 hashCode() 方法，保证等价的两个对象散列值也相等。
- toString(): 默认返回 ToStringExample@4554617c 这种形式，其中 @ 后面的数值为散列码的无符号十六进制表示。

静态语句块在类初始化时运行一次。

```java
public class A {
    static {
        System.out.println("123");
    }

    public static void main(String[] args) {
        A a1 = new A();
        A a2 = new A();
    }
}
```

存在继承的情况下，初始化顺序为:

- 父类(静态变量、静态语句块)
- 子类(静态变量、静态语句块)
- 父类(实例变量、普通语句块)
- 父类(构造函数)
- 子类(实例变量、普通语句块)
- 子类(构造函数)

# 注解

注解是 JDK1.5 版本开始引入的一个特性，用于对代码进行说明，可以对包、类、接口、字段、方法参数、局部变量等进行注解。它主要的作用有以下四方面：

- 生成文档，通过代码里标识的元数据生成 javadoc 文档。
- 编译检查，通过代码里标识的元数据让编译器在编译期间进行检查验证。
- 编译时动态处理，编译时通过代码里标识的元数据动态处理，例如动态生成代码。
- 运行时动态处理，运行时通过代码里标识的元数据动态处理，例如使用反射注入实例

这么来说是比较抽象的，我们具体看下注解的常见分类：

- Java 自带的标准注解，包括@Override、@Deprecated 和@SuppressWarnings，分别用于标明重写某个方法、标明某个类或方法过时、标明要忽略的警告，用这些注解标明后编译器就会进行检查。
- 元注解，元注解是用于定义注解的注解，包括@Retention、@Target、@Inherited、@Documented，@Retention 用于标明注解被保留的阶段，@Target 用于标明注解使用的范围，@Inherited 用于标明注解可继承，@Documented 用于标明是否生成 javadoc 文档。
- 自定义注解，可以根据自己的需求定义注解，并可用元注解对自定义注解进行注解。

## 内置的注解

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.SOURCE)
public @interface Override {
}


@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(value={CONSTRUCTOR, FIELD, LOCAL_VARIABLE, METHOD, PACKAGE, PARAMETER, TYPE})
public @interface Deprecated {
}


@Target({TYPE, FIELD, METHOD, PARAMETER, CONSTRUCTOR, LOCAL_VARIABLE})
@Retention(RetentionPolicy.SOURCE)
public @interface SuppressWarnings {
    String[] value();
}
```

## 元注解

在 JDK 1.5 中提供了 4 个标准的元注解：@Target，@Retention，@Documented，@Inherited, 在 JDK 1.8 中提供了两个元注解 @Repeatable 和@Native。

Target 注解用来说明那些被它所注解的注解类可修饰的对象范围：注解可以用于修饰 packages、types（类、接口、枚举、注解类）、类成员（方法、构造方法、成员变量、枚举值）、方法参数和本地变量（如循环变量、catch 参数），在定义注解类时使用了@Target 能够更加清晰的知道它能够被用来修饰哪些对象，它的取值范围定义在 ElementType 枚举中。

```java
public enum ElementType {

    TYPE, // 类、接口、枚举类

    FIELD, // 成员变量（包括：枚举常量）

    METHOD, // 成员方法

    PARAMETER, // 方法参数

    CONSTRUCTOR, // 构造方法

    LOCAL_VARIABLE, // 局部变量

    ANNOTATION_TYPE, // 注解类

    PACKAGE, // 可用于修饰：包

    TYPE_PARAMETER, // 类型参数，JDK 1.8 新增

    TYPE_USE // 使用类型的任何地方，JDK 1.8 新增

}
```

Retention 注解用来限定那些被它所注解的注解类在注解到其他类上以后，可被保留到何时，一共有三种策略，定义在 RetentionPolicy 枚举中。

```java
public enum RetentionPolicy {

    SOURCE,    // 源文件保留
    CLASS,       // 编译期保留，默认值
    RUNTIME   // 运行期保留，可通过反射去获取注解信息
}
```

Documented 注解的作用是：描述在使用 javadoc 工具为类生成帮助文档时是否要保留其注解信息。

Inherited 注解的作用：被它修饰的 Annotation 将具有继承性。如果某个类使用了被@Inherited 修饰的 Annotation，则其子类将自动具有该注解。(那修饰到非类上是什么效果，或者可以用到非类上吗)

## 注解与反射接口

只有注解被定义为 RUNTIME 后，该注解才能是运行时可见，当 class 文件被装载时被保存在 class 文件中的 Annotation 才会被虚拟机读取。

AnnotatedElement 接口是所有程序元素（Class、Method 和 Constructor）的父接口，所以程序通过反射获取了某个类的 AnnotatedElement 对象之后，程序就可以调用该对象的方法来访问 Annotation 信息。

```java
boolean isAnnotationPresent(Class<? extends Annotation> annotationClass)
<T extends Annotation> T getAnnotation(Class<T> annotationClass)
Annotation[] getAnnotations()
<T extends Annotation> T[] getAnnotationsByType(Class<T> annotationClass)
<T extends Annotation> T getDeclaredAnnotation(Class<T> annotationClass)
// 返回直接存在于此元素上的所有注解。与此接口中的其他方法不同，该方法将忽略继承的注释。如果没有注释直接存在于此元素上，则返回null
<T extends Annotation> T[] getDeclaredAnnotationsByType(Class<T> annotationClass)
// 返回直接存在于此元素上的所有注解。与此接口中的其他方法不同，该方法将忽略继承的注释
Annotation[] getDeclaredAnnotations()
```

```java
package com.pdai.java.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface MyMethodAnnotation {

    public String title() default "";

    public String description() default "";

}
```

使用注解：

```java
package com.pdai.java.annotation;

import java.io.FileNotFoundException;
import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

public class TestMethodAnnotation {

    @Override
    @MyMethodAnnotation(title = "toStringMethod", description = "override toString method")
    public String toString() {
        return "Override toString method";
    }

    @Deprecated
    @MyMethodAnnotation(title = "old static method", description = "deprecated old static method")
    public static void oldMethod() {
        System.out.println("old method, don't use it.");
    }

    @SuppressWarnings({"unchecked", "deprecation"})
    @MyMethodAnnotation(title = "test method", description = "suppress warning static method")
    public static void genericsTest() throws FileNotFoundException {
        List l = new ArrayList();
        l.add("abc");
        oldMethod();
    }
}
```

获取注解信息

```java
public static void main(String[] args) {
    try {
        // 获取所有methods
        Method[] methods = TestMethodAnnotation.class.getClassLoader()
                .loadClass(("com.pdai.java.annotation.TestMethodAnnotation"))
                .getMethods();

        // 遍历
        for (Method method : methods) {
            // 方法上是否有MyMethodAnnotation注解
            if (method.isAnnotationPresent(MyMethodAnnotation.class)) {
                try {
                    // 获取并遍历方法上的所有注解
                    for (Annotation anno : method.getDeclaredAnnotations()) {
                        System.out.println("Annotation in Method '"
                                + method + "' : " + anno);
                    }

                    // 获取MyMethodAnnotation对象信息
                    MyMethodAnnotation methodAnno = method
                            .getAnnotation(MyMethodAnnotation.class);

                    System.out.println(methodAnno.title());

                } catch (Throwable ex) {
                    ex.printStackTrace();
                }
            }
        }
    } catch (SecurityException | ClassNotFoundException e) {
        e.printStackTrace();
    }
}
```
