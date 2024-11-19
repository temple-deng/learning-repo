package com.dengbo.test;

interface HasBatteries {}

interface Waterproof {}

interface Shoots {}

class Toy {
    Toy() {}

    Toy(int i) {}
}

class FancyToy extends Toy implements HasBatteries, Waterproof, Shoots {
    FancyToy() {
        super(1);
    }
}

public class ToyTest {
    static void printInfo(Class<?> cls) {
        System.out.println("Class name: " + cls.getName() + " is interface? ["
            + cls.isInterface() + "]");
        System.out.println("Simple name: " + cls.getSimpleName());
        System.out.println("Canonical name: " + cls.getCanonicalName());
    }

    public static void main(String args[]) {
        Class<?> c = null;

        try {
            c = Class.forName("com.dengbo.test.FancyToy");
        } catch (ClassNotFoundException e) {
            System.out.println("Can't find FancyToy");
            System.exit(1);
        }

        printInfo(c);

        for (Class<?> face : c.getInterfaces()) {
            printInfo(face);
        }

        Class<?> up = c.getSuperclass();
        Object obj = null;

        try {
            obj = up.newInstance();
        } catch (InstantiationException e) {
            System.out.println("can't 实例化");
            System.exit(1);
        } catch (IllegalAccessException e) {
            System.out.println("can't access");
            System.exit(1);
        }
        printInfo(obj.getClass());
    }
}
