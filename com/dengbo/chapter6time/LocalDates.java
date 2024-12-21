package com.dengbo.chapter6time;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.Month;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjuster;
import java.time.temporal.TemporalAdjusters;

public class LocalDates {
  public static void main(String[] args) {
    LocalDate today = LocalDate.now();
    System.out.println("today: " + today);
    System.out.println("next WEDNESDAY: " + today.with(TemporalAdjusters.nextOrSame(DayOfWeek.WEDNESDAY)));

    LocalDate dengboBirthday = LocalDate.of(1992, 8, 27);
    dengboBirthday = LocalDate.of(1992, Month.AUGUST, 27);
    System.out.println("dengboBirthday: " + dengboBirthday);

    LocalDate programmersDay = LocalDate.of(2024, 1, 1).plusDays(255);
    System.out.println("programmersDay: " + programmersDay);

    LocalDate nationalDay = LocalDate.of(2024, 10, 1);
    LocalDate christmas = LocalDate.of(2024, 12, 25);

    System.out.println("Until christmas: " + nationalDay.until(christmas));
    System.out.println("Until christmas: " + nationalDay.until(christmas, ChronoUnit.DAYS));

    System.out.println(LocalDate.of(2024, 1, 31).plusMonths(1));
    System.out.println(LocalDate.of(2024, 3, 31).minusMonths(1));

    DayOfWeek startOfLastMillennium = LocalDate.of(1900, 1, 1).getDayOfWeek();
    System.out.println("startOfLastMillennium: " + startOfLastMillennium);
    System.out.println(startOfLastMillennium.getValue());
    System.out.println(DayOfWeek.SATURDAY.plus(3));

    // LocalDate start = LocalDate.of(2000, 1, 1);
    // LocalDate endExclusive = LocalDate.now();
    // Stream<LocalDate> firstDaysInMonth = star
  }
}
