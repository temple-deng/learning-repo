package com.dengbo.test;

public class DotNewRuuner {
    public static void main(String args[]) {
        DotNew dn = new DotNew();
        DotNew.Inner in = dn.new Inner();
        System.out.println("xxx");
    }
}
