package com.dengbo.objectAnalyzer;

import java.util.ArrayList;

public class ObjectAnalyzerTest {
    public static void main(String[] args) throws ReflectiveOperationException {
        ArrayList<Integer> squares = new ArrayList<>();

        for (int i = 1; i <= 5; i++) {
            squares.add(i);
        }

        System.out.println(new ObjectAnalyzer().toString(squares));
    }
}
