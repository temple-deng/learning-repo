package com.dengbo.concurrency;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;

public class DaemonThreadFactory implements ThreadFactory{
  public Thread newThread(Runnable r) {
    Thread t =  new Thread(r);
    t.setDaemon(true);
    return t;
  }
  

  public static void main(String[] args) throws Exception {
    ExecutorService exec = Executors.newCachedThreadPool(
      new DaemonThreadFactory()
    );

    for (int i = 0; i < 10; i++) {
      exec.execute(new DaemonFormFactory());
    }

    System.out.println("All daemons started");

    TimeUnit.MILLISECONDS.sleep(175);
  }
}

class DaemonFormFactory implements Runnable {
  public void run() {
    try {
      while (true) {
        TimeUnit.MILLISECONDS.sleep(100);
        System.out.println(Thread.currentThread() + " " + this);
      }
    } catch (InterruptedException e) {
      System.out.println("Interrupted");
    }
  }
}