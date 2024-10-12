# 异常

- [异常](#异常)
  - [异常的层次结构](#异常的层次结构)
    - [Exception](#exception)
- [反射](#反射)
  - [反射基础](#反射基础)
    - [Class 类](#class-类)
  - [反射的使用](#反射的使用)
    - [Class 类对象的或者](#class-类对象的或者)
- [SPI 机制](#spi-机制)
  - [SPI 机制的应用](#spi-机制的应用)
    - [JDBC DriveManager](#jdbc-drivemanager)

> 摘自 https://pdai.tech/

## 异常的层次结构

### Exception

运行时异常 RuntimeException 都 UncheckedException，即 Java 编辑器不会检查，出现了这种异常，不会影响编译。

那从这个特定也能看出来，我们自定义异常肯定要定义非 RuntimeException，即会影响编译的。即 CheckedException。

# 反射

反射就是把 java 类中的各种成分映射成一个个的 Java 对象

## 反射基础

### Class 类

Class 类也是一个实实在在的类，存在于 JDK 的 java.lang 包中。Class 类的实例表示 java 应用运行时的类(class ans enum)或接口(interface and annotation)（每个 java 类运行时都在 JVM 里表现为一个 class 对象，可通过类名.class、类型.getClass()、Class.forName("类名")等方法获取 class 对象）。数组同样也被映射为 class 对象的一个类，所有具有相同元素类型和维数的数组都共享该 Class 对象。基本类型 boolean，byte，char，short，int，long，float，double 和关键字 void 同样表现为 class 对象。

## 反射的使用

在反射包中，我们常用的类主要有 Constructor 类表示的是 Class 对象所表示的类的构造方法，利用它可以在运行时动态创建对象、Field 表示 Class 对象所表示的类的成员变量，通过它可以在运行时动态修改成员变量的属性值(包含 private)、Method 表示 Class 对象所表示的类的成员方法，通过它可以动态调用对象的方法(包含 private)，下面将对这几个重要类进行分别说明。

### Class 类对象的或者

在类加载的时候，jvm 会创建一个 class 对象。

Class 对象是可以说是反射中最常用的，或者 Class 对象的方式主要有三种：

- 根据类名：类名.class
- 根据对象：对象.getClass()
- 根据全限定类名：`Class.forName(全限定类名)`

Class 对象的方法：

- `getName()`：全限定的类名
- `getSimpleName()`：类名
- `getCanonicalName()`：全限定的类名
- `isInterface()`: 是否是一个接口
- `getInterfaces()`: 返回 Class 对象数组，表示 Class 对象所引用的类所实现的所有接口
- `getSuperclass()`
- `newInstance()`
- `getFields()`: 返回类的所有 public 字段，类似还有 getMethods 和 getConstructors
- `getDeclaredFields`: 返回类自己声明的字段，包括 public、private 和 protected，default，但不包括父类声明的字段，类似的还有 getDeclaredMethods, getDeclaredConstructors

# SPI 机制

SPI（Service Provider Interface），是 JDK 内置的一种 服务提供发现机制，可以用来启用框架扩展和替换组件，主要是被框架的开发人员使用。

当服务的提供者提供了一种接口的实现之后，需要在 classpath 下的 `META-INF/services/ `目录里创建一个以服务接口命名的文件，这个文件里的内容就是这个接口的具体的实现类。当其他的程序需要这个服务的时候，就可以通过查找这个 jar 包（一般都是以 jar 包做依赖）的`META-INF/services/` 中的配置文件，配置文件中有接口的具体实现类名，可以根据这个类名进行加载实例化，就可以使用该服务了。JDK 中查找服务的实现的工具类是：`java.util.ServiceLoader`。

## SPI 机制的应用

### JDBC DriveManager

关于驱动的查找其实都在 DriverManager 中，DriverManager 是 Java 中的实现，用来获取数据库连接，在 DriverManager 中有一个静态代码块如下：

```java
static {
    loadInitialDrivers();
    println("JDBC DriverManager initialized");
}

private static void loadInitialDrivers() {
    String drivers;
    try {
        drivers = AccessController.doPrivileged(new PrivilegedAction<String>() {
            public String run() {
                return System.getProperty("jdbc.drivers");
            }
        });
    } catch (Exception ex) {
        drivers = null;
    }

    AccessController.doPrivileged(new PrivilegedAction<Void>() {
        public Void run() {
			//使用SPI的ServiceLoader来加载接口的实现
            ServiceLoader<Driver> loadedDrivers = ServiceLoader.load(Driver.class);
            Iterator<Driver> driversIterator = loadedDrivers.iterator();
            try{
                while(driversIterator.hasNext()) {
                    driversIterator.next();
                }
            } catch(Throwable t) {
            // Do nothing
            }
            return null;
        }
    });

    println("DriverManager.initialize: jdbc.drivers = " + drivers);

    if (drivers == null || drivers.equals("")) {
        return;
    }
    String[] driversList = drivers.split(":");
    println("number of Drivers:" + driversList.length);
    for (String aDriver : driversList) {
        try {
            println("DriverManager.Initialize: loading " + aDriver);
            Class.forName(aDriver, true,
                    ClassLoader.getSystemClassLoader());
        } catch (Exception ex) {
            println("DriverManager.Initialize: load failed: " + ex);
        }
    }
}
```
