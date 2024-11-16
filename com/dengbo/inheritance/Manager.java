package com.dengbo.inheritance;

public class Manager extends Employee {
  private double bonus;
  private Employee secretary;

  public Manager(String name, double salary, int year, int month, int day) {
    super(name, salary, year, month, day);
    bonus = 0;
  }

  @Override
  public double getSalary() {
    double baseSalary = super.getSalary();
    return baseSalary + bonus;
  }

  public void setBonus(double b) {
    bonus = b;
  }

  public void setSecretary(Employee e) {
    secretary = e;
  }

  public Employee getSecretary() {
    return secretary;
  }
}
