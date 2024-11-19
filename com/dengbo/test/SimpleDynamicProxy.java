package com.dengbo.test;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.ArrayList;

interface Interface {
  void doSomething();
  void somethingElse(String arg);
}

class DynamicProxyHandler implements InvocationHandler {
  private Object proxied;

  public DynamicProxyHandler(Object proxied) {
    this.proxied = proxied;
  }

  public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
    System.out.println("proxy: " + proxy.getClass() + ", method:" + method + ". args: " + args);

    if (args != null) {
      for (Object arg: args) {
        System.out.println(" " + arg);
      }
    }

    return method.invoke(proxied, args);
  }
}

class RealObject implements Interface {
  public void doSomething() {
    System.out.println("doSomething");
  }

  public void somethingElse(String arg) {
    System.out.println("something else " + arg);
  }
}

public class SimpleDynamicProxy {
  public static void consumer(Interface iface) {
    iface.doSomething();
    iface.somethingElse("banana");
  }

  public static void main(String[] args) {
    RealObject real = new RealObject();

    consumer(real);

    Interface proxy = (Interface) Proxy.newProxyInstance(
      Interface.class.getClassLoader(), 
      new Class[]{ Interface.class }, 
      new DynamicProxyHandler(real)
    );

    consumer(proxy);
  }
}
