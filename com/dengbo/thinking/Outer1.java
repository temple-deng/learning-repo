package com.dengbo.thinking;

public class Outer1 {
    public static void main(String args[]) {
        Outer outer = new Outer();
        Outer.Inner inner = outer.new Inner();
    }
}


class Outer {
    public class Inner {
        Inner() {
            System.out.println("Inner");
        }
    }
}