# Java8 - Lambda

## lambda 表达式

lambda 表达式仅能放入如下代码: 预定义使用了 @Functional 注释的函数式接口，自带一个抽象函数的方法，或者 SAM(Single Abstract Method 单个抽象方法)类型。这些称为 lambda 表达式的目标类型，可以用作返回类型，或 lambda 目标代码的参数。例如，若一个方法接收 Runnable、Comparable 或者 Callable 接口，都有单个抽象方法，可以传入 lambda 表达式。类似的，如果一个方法接受声明于 java.util.function 包内的接口，例如 Predicate、Function、Consumer 或 Supplier，那么可以向其传 lambda 表达式。
