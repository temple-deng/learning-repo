package com.dengbo.streams;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class CreatingStreams {
    public static <T> void show(String title, Stream<T> stream) {
        final int SIZE = 10;
        List<T> firstElements = stream.limit(SIZE + 1).collect(Collectors.toList());

        System.out.print(title + ": ");

        for (int i = 0; i < firstElements.size(); i++) {
            if (i > 0) {
                System.out.print(", ");
            }

            if (i < SIZE) {
                System.out.print(firstElements.get(i));
            } else {
                System.out.print("...");
            }
        }

        System.out.println();
    }

    public static void main(String[] args) {
        String contents = "This Alibaba Cloud International Website DNS Service Level Agreement (“SLA”) applies to your purchase and use of the Alibaba Cloud International Website Alibaba Cloud DNS (“Service”) and your use of the Service is subjected to the terms and conditions of the Alibaba Cloud International Website Product Terms of Service (“Product Terms”) between the relevant Alibaba Cloud entity described in the Product Terms (“Alibaba Cloud”, “us”, or “we”) and you. This SLA only applies to your purchase and use of the Services for a fee, and shall not apply to any free Services or trial Services provided by us.";
        Stream<String> words = Stream.of(contents.split("\\PL+"));

        show("words", words);

        Stream<String> song = Stream.of("gently", "down", "the", "stream");

        show("song", song);

        Stream<String> silence = Stream.empty();
        show("silence", silence);

        Stream<String> echos = Stream.generate(() -> "Echo");
        show("echos", echos);

        Stream<Double> randoms = Stream.generate(Math::random);
        show("randoms", randoms);

        // Stream<String> longestFirst =
        // words.sorted(Comparator.comparing(String::length).reversed());
        System.out.println(System.getProperty("user.dir"));
    }
}