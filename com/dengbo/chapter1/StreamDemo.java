package com.dengbo.chapter1;

import java.io.InputStreamReader;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.function.BiConsumer;
import java.util.function.BiFunction;
import java.util.function.BinaryOperator;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.function.UnaryOperator;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class StreamDemo {

  public static void main(String[] args) throws Exception {
    Stream<String> words = Stream.of("one", "two", "three", "four");

    Stream<String> song = Arrays.stream(new String[] { "five", "six"});

    System.out.println(words.filter(s -> s.length() >= 4).collect(Collectors.toList()));

    InputStreamReader reader= new InputStreamReader(System.in);
    reader.close();

    // String content = Files.readAllLines(null)
  }
}