package com.dengbo.inheritance;

import java.util.Arrays;

public class ManagerTest {
  public static void main(String[] args) {
    Manager boss = new Manager("Clark", 80000, 1992, 8, 27);
    boss.setBonus(60000);

    Employee[] staff = new Employee[3];

    staff[0] = boss;
    staff[1] = new Employee("abc", 50000, 1989, 1, 1);
    staff[2] = new Employee("def", 40000, 1990, 3, 15);

    for (Employee e : staff) {
      System.out.println("name=" + e.getName() + ", salary=" + e.getSalary());
    }

    Arrays.sort(staff);
    for (Employee e : staff) {
      System.out.println("name=" + e.getName() + ", salary=" + e.getSalary());
    }
  }
}
