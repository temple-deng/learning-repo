package com.dengbo.chapter6time;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

public class ZonedTimes {
  public static void main(String[] args) {
    ZonedDateTime apollo11lanunch = ZonedDateTime.of(1969, 7, 16, 9, 32, 0, 0, ZoneId.of("America/New_York"));

    System.out.println("appllo11launch: " + apollo11lanunch);

    Instant instant = apollo11lanunch.toInstant();

    System.out.println("instant: " + instant);

    ZonedDateTime zonedDateTime = instant.atZone(ZoneId.of("UTC"));
    System.out.println("zonedDateTime: " + zonedDateTime);

    ZonedDateTime beijingTime = ZonedDateTime.of(LocalDate.of(2024, 12, 05), LocalTime.of(18, 30, 0), ZoneId.of("Asia/Shanghai"));

    System.out.println("beijingTime: " + beijingTime);
  }
}
