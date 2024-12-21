package com.dengbo.chapter2io;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Scanner;

import com.dengbo.inheritance.Employee;

public class TextFileTest {

  public static void main(String[] args) throws IOException{
    Employee[] employees = new Employee[3];

    employees[0] = new Employee("Carl Cracker", 75000, 1987, 12, 15);
    employees[1] = new Employee("Harry Hacker", 50000, 1989, 10, 1);
    employees[2] = new Employee("Tony Tester", 40000, 1990, 3, 15);

    try (PrintWriter out = new PrintWriter("com/dengbo/chapter2io/employee.dat")) {
      writeData(employees, out);
    }

    try (Scanner in = new Scanner(new FileInputStream("com/dengbo/chapter2io/employee.dat"))) {
      Employee[] newEmployees = readData(in);
      for (Employee e : newEmployees) {
        System.out.println(e);
      }
    }

  }
  
  private static void writeData(Employee[] employees, PrintWriter out) 
  throws IOException {
    out.println(employees.length);

    for (Employee employee : employees) {
      writeEmployee(out, employee);
    }
  }

  public static void writeEmployee(PrintWriter out, Employee e) {
    out.println(e.getName() + "|" + e.getSalary() + "|" + e.getHireDay());
  }

  private static Employee[] readData(Scanner in) throws IOException {
    int n = in.nextInt();
    in.nextLine();
    Employee[] employees = new Employee[n];

    for (int i = 0; i < n; i++) {
      employees[i] = readEmployee(in);
    }

    return employees;
  }

  public static Employee readEmployee(Scanner in) {
    String line = in.nextLine();
    String[] tokens = line.split("\\|");
    String name = tokens[0];
    double salary = Double.parseDouble(tokens[1]);
    String hireDay = tokens[2];
    String[] times = hireDay.split("\\-");

    return new Employee(name, salary, Integer.valueOf(times[0]),  Integer.valueOf(times[1]),  Integer.valueOf(times[2]));
  }
}
