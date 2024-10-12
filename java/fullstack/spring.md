# Spring

## 什么是 Spring

从 Spring 框架的特性来看：

- 非侵入式：基于 Spring 开发的应用中的对象可以不依赖于 Spring 的 API
- 控制反转：IOC——Inversion of Control，指的是将对象的创建权交给 Spring 去创建。使用 Spring 之前，对象的创建都是由我们自己在代码中 new 创建。而使用 Spring 之后。对象的创建都是给了 Spring 框架。
- 依赖注入：DI——Dependency Injection，是指依赖的对象不需要手动调用 setXX 方法去设置，而是通过配置赋值。
- 面向切面编程：Aspect Oriented Programming——AOP
- 容器：Spring 是一个容器，因为它包含并且管理应用对象的生命周期
- 组件化：Spring 实现了使用简单的组件配置组合成一个复杂的应用。在 Spring 中可以使用 XML 和 Java 注解组合这些对象。
- 一站式：在 IOC 和 AOP 的基础上可以整合各种企业应用的开源框架和优秀的第三方类库（实际上 Spring 自身也提供了表现层的 SpringMVC 和持久层的 Spring JDBC）

## Spring 的组件

### Core Container

Spring 的核心容器是其他模块建立的基础，由 Beans 模块、Core 核心模块、Context 上下文模块和 SpEL 表达式语言模块组成，没有这些核心容器，也不可能有 AOP、Web 等上层的功能。具体介绍如下。

- Beans 模块：提供了框架的基础部分，包括控制反转和依赖注入。
- Core 核心模块：封装了 Spring 框架的底层部分，包括资源访问、类型转换及一些常用工具类。
- Context 上下文模块：建立在 Core 和 Beans 模块的基础之上，集成 Beans 模块功能并添加资源绑定、数据验证、国际化、Java EE 支持、容器生命周期、事件传播等。ApplicationContext 接口是上下文模块的焦点。
- SpEL 模块：提供了强大的表达式语言支持，支持访问和修改属性值，方法调用，支持访问及修改数组、容器和索引器，命名变量，支持算数和逻辑运算，支持从 Spring 容器获取 Bean，它也支持列表投影、选择和一般的列表聚合等。

### Data Access/Integration（数据访问／集成）

- JDBC 模块：提供了一个 JDBC 的样例模板，使用这些模板能消除传统冗长的 JDBC 编码还有必须的事务控制，而且能享受到 Spring 管理事务的好处。
- ORM 模块：提供与流行的“对象-关系”映射框架无缝集成的 API，包括 JPA、JDO、Hibernate 和 MyBatis 等。而且还可以使用 Spring 事务管理，无需额外控制事务。
- OXM 模块：提供了一个支持 Object /XML 映射的抽象层实现，如 JAXB、Castor、XMLBeans、JiBX 和 XStream。将 Java 对象映射成 XML 数据，或者将 XML 数据映射成 Java 对象。
- JMS 模块：指 Java 消息服务，提供一套 “消息生产者、消息消费者”模板用于更加简单的使用 JMS，JMS 用于用于在两个应用程序之间，或分布式系统中发送消息，进行异步通信。
- Transactions 事务模块：支持编程和声明式事务管理。

### Web 模块

- Web 模块：提供了基本的 Web 开发集成特性，例如多文件上传功能、使用的 Servlet 监听器的 IOC 容器初始化以及 Web 应用上下文。
- Servlet 模块：提供了一个 Spring MVC Web 框架实现。Spring MVC 框架提供了基于注解的请求资源注入、更简单的数据绑定、数据验证等及一套非常易用的 JSP 标签，完全无缝与 Spring 其他技术协作。
- WebSocket 模块：提供了简单的接口，用户只要实现响应的接口就可以快速的搭建 WebSocket Server，从而实现双向通讯。
- Webflux 模块： Spring WebFlux 是 Spring Framework 5.x 中引入的新的响应式 web 框架。与 Spring MVC 不同，它不需要 Servlet API，是完全异步且非阻塞的，并且通过 Reactor 项目实现了 Reactive Streams 规范。Spring WebFlux 用于创建基于事件循环执行模型的完全异步且非阻塞的应用程序

### AOP、Aspects、Instrumentation 和 Messaging

- AOP 模块：提供了面向切面编程实现，提供比如日志记录、权限控制、性能统计等通用功能和业务逻辑分离的技术，并且能动态的把这些功能添加到需要的代码中，这样各司其职，降低业务逻辑和通用功能的耦合。
- Aspects 模块：提供与 AspectJ 的集成，是一个功能强大且成熟的面向切面编程（AOP）框架。
- Instrumentation 模块：提供了类工具的支持和类加载器的实现，可以在特定的应用服务器中使用。
- messaging 模块：Spring 4.0 以后新增了消息（Spring-messaging）模块，该模块提供了对消息传递体系结构和协议的支持。
- jcl 模块： Spring 5.x 中新增了日志框架集成的模块。

1. Spring 框架管理这些 Bean 的创建工作，即由用户管理 Bean 转变为框架管理 Bean，这个就叫控制反转 - Inversion of Control (IoC)
2. Spring 框架托管创建的 Bean 放在哪里呢？ 这便是 IoC Container;
3. Spring 框架为了更好让用户配置 Bean，必然会引入不同方式来配置 Bean？ 这便是 xml 配置，Java 配置，注解配置等支持
4. Spring 框架既然接管了 Bean 的生成，必然需要管理整个 Bean 的生命周期等；
5. 应用程序代码从 Ioc Container 中获取依赖的 Bean，注入到应用程序中，这个过程叫 依赖注入(Dependency Injection，DI) ； 所以说控制反转是通过依赖注入实现的，其实它们是同一个概念的不同角度描述。通俗来说就是 IoC 是设计思想，DI 是实现方式
6. 在依赖注入时，有哪些方式呢？这就是构造器方式，@Autowired, @Resource, @Qualifier... 同时 Bean 之间存在依赖（可能存在先后顺序问题，以及循环依赖问题等）

# IOC

## Ioc 配置的三种方式

- XML 配置，将 bean 的信息配置在 xml 里面，通过 Spring 加载文件创建 bean
- Java 配置，本质上是把 xml 文件的东西移到了 Java 类中
- 注解配置

## 依赖注入的三种方式

- setter 注入：即调用对象的 setter 方法将要注入的对象注入
- 构造函数：这要求注入类需要有带参数的构造函数
- 注解注入：例如 @Autowired

# AOP

感觉它这里的切面有点像 hook，就像 webpack 的 tapable，提供众多的 hook 点，你可以手动 hook 其中，然后提供额外的功能。同比 js 中，也可以理解为面向事件编程，对各个事件提供回调。

AOP 的本质也是为了解耦。

AOP 则是针对业务处理过程中的切面进行提取，它所面对的是处理过程的某个步骤或阶段，以获得逻辑过程的中各部分之间低耦合的隔离效果。

## AOP 术语

- 连接点（Jointpoint）：表示需要在程序中插入横切关注点的扩展点，连接点可能是类初始化、方法执行、方法调用、字段调用或处理异常等等，Spring 只支持方法执行连接点，在 AOP 中表示为在哪里干；（类似于事件触发）
- 切入点（Pointcut）： 选择一组相关连接点的模式，即可以认为连接点的集合，Spring 支持 perl5 正则表达式和 AspectJ 切入点模式，Spring 默认使用 AspectJ 语法，在 AOP 中表示为在哪里干的集合；
- 通知（Advice）：在连接点上执行的行为，通知提供了在 AOP 中需要在切入点所选择的连接点处进行扩展现有行为的手段；包括前置通知（before advice）、后置通知(after advice)、环绕通知（around advice），在 Spring 中通过代理模式实现 AOP，并通过拦截器模式以环绕连接点的拦截器链织入通知；在 AOP 中表示为干什么；
- 方面/切面（Aspect）：横切关注点的模块化，比如上边提到的日志组件。可以认为是通知、引入和切入点的组合；在 Spring 中可以使用 Schema 和@AspectJ 方式进行组织实现；在 AOP 中表示为在哪干和干什么集合；
- 引入（inter-type declaration）：也称为内部类型声明，为已有的类添加额外新的字段或方法，Spring 允许引入新的接口（必须对应一个实现）到所有被代理对象（目标对象）, 在 AOP 中表示为干什么（引入什么）；
- 目标对象（Target Object）：需要被织入横切关注点的对象，即该对象是切入点选择的对象，需要被通知的对象，从而也可称为被通知对象；由于 Spring AOP 通过代理模式实现，从而这个对象永远是被代理对象，在 AOP 中表示为对谁干；
- 织入（Weaving）：把切面连接到其它的应用程序类型或者对象上，并创建一个被通知的对象。这些可以在编译时（例如使用 AspectJ 编译器），类加载时和运行时完成。Spring 和其他纯 Java AOP 框架一样，在运行时完成织入。在 AOP 中表示为怎么实现的；
- AOP 代理（AOP Proxy）：AOP 框架使用代理模式创建的对象，从而实现在连接点处插入通知（即应用切面），就是通过代理来对目标对象应用切面。在 Spring 中，AOP 代理可以用 JDK 动态代理或 CGLIB 代理实现，而通过拦截器模型应用切面。在 AOP 中表示为怎么实现的一种典型方式；

## AOP 的配置方式

- XML Schema 配置方式
- AspectJ 注解方式

注解的方式：

- @Aspect：用来定义一个切面。
- @Pointcut 用于定义切入点表达式。在使用时还需要定义一个包含名字和任意参数的方法签名来表示切入点名称，这个方法签名就是一个返回值为 void，且方法体为空的普通方法。
- @Before 用于定义前置通知，相当于 BeforeAdvice。在使用时，通常需要指定一个 value 属性值，该属性值用于指定一个切入点表达式(可以是已有的切入点，也可以直接定义切入点表达式)。
- @AfterReturning 用于定义后置通知，相当于 AfterReturningAdvice。在使用时可以指定 pointcut / value 和 returning 属性，其中 pointcut / value 这两个属性的作用一样，都用于指定切入点表达式。
- @Around 用于定义环绕通知，相当于 MethodInterceptor。在使用时需要指定一个 value 属性，该属性用于指定该通知被植入的切入点。
- @After-Throwing 用于定义异常通知来处理程序中未处理的异常，相当于 ThrowAdvice。在使用时可指定 pointcut / value 和 throwing 属性。其中 pointcut/value 用于指定切入点表达式，而 throwing 属性值用于指定-一个形参名来表示 Advice 方法中可定义与此同名的形参，该形参可用于访问目标方法抛出的异常。
- @After 用于定义最终 final 通知，不管是否异常，该通知都会执行。使用时需要指定一个 value 属性，该属性用于指定该通知被植入的切入点。
- @DeclareParents 用于定义引介通知，相当于 IntroductionInterceptor (不要求掌握)。

## 切入点的声明规则

```
execution（modifiers-pattern? ret-type-pattern declaring-type-pattern? name-pattern（param-pattern） throws-pattern?）
```

- ret-type-pattern 返回类型模式, name-pattern 名字模式和 param-pattern 参数模式是必选的， 其它部分都是可选的。返回类型模式决定了方法的返回类型必须依次匹配一个连接点。 你会使用的最频繁的返回类型模式是\*，它代表了匹配任意的返回类型。
- declaring-type-pattern, 一个全限定的类型名将只会匹配返回给定类型的方法。
- name-pattern 名字模式匹配的是方法名。 你可以使用\*通配符作为所有或者部分命名模式。
- param-pattern 参数模式稍微有点复杂：()匹配了一个不接受任何参数的方法， 而(..)匹配了一个接受任意数量参数的方法（零或者更多）。 模式()匹配了一个接受一个任何类型的参数的方法。 模式(,String)匹配了一个接受两个参数的方法，第一个可以是任意类型， 第二个则必须是 String 类型。

# SpringMVC

![webrequest](https://pdai.tech/images/spring/springframework/spring-springframework-mvc-5.png)

1. 首先用户发送请求——DispatcherServlet，前端控制器收到请求后自己不进行处理，而是委托给其他的解析器进行 处理，作为统一访问点，进行全局的流程控制；
2. DispatcherServlet——&gt;HandlerMapping， HandlerMapping 将会把请求映射为 HandlerExecutionChain 对象（包含一 个 Handler 处理器（页面控制器）对象、多个 HandlerInterceptor 拦截器）对象，通过这种策略模式，很容易添加新 的映射策略；
3. DispatcherServlet——&gt;HandlerAdapter，HandlerAdapter 将会把处理器包装为适配器，从而支持多种类型的处理器， 即适配器设计模式的应用，从而很容易支持很多类型的处理器；
4. HandlerAdapter——&gt;处理器功能处理方法的调用，HandlerAdapter 将会根据适配的结果调用真正的处理器的功能处 理方法，完成功能处理；并返回一个 ModelAndView 对象（包含模型数据、逻辑视图名）；
5. ModelAndView 的逻辑视图名——&gt; ViewResolver，ViewResolver 将把逻辑视图名解析为具体的 View，通过这种策 略模式，很容易更换其他视图技术；
6. View——&gt;渲染，View 会根据传进来的 Model 模型数据进行渲染，此处的 Model 实际是一个 Map 数据结构，因此 很容易支持其他视图技术；
7. 返回控制权给 DispatcherServlet，由 DispatcherServlet 返回响应给用户，到此一个流程结束。
