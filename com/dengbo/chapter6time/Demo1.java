package com.dengbo.chapter6time;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;

public class Demo1 {
  public static void main(String[] args) throws InterruptedException {
    Instant start = Instant.now();
    Thread.sleep(10000);
    Instant end = Instant.now();

    Duration timeElapsed = Duration.between(start, end);
    long millis = timeElapsed.toMillis();
    System.out.println(millis);

  }
}
