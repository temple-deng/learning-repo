package com.dengbo.chapter6time;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class CustomFormatter {
  public static void main(String[] args) {
    LocalDateTime localDateTime = LocalDateTime.now();

    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    
    System.out.println(formatter.format(localDateTime));

    LocalDate birthday = LocalDate.parse("1992-08-27");
  }
}
