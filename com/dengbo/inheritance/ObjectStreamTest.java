package com.dengbo.inheritance;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;

public class ObjectStreamTest {
    public static void main(String[] args) throws IOException, ClassNotFoundException {
        Employee harry = new Employee("Harry Hacker", 1000, 1992, 8, 28);
        Manager carl = new Manager("Carl Cracker", 8000, 1987, 12, 15);

        carl.setSecretary(harry);
        Manager tony = new Manager("Mike", 20000, 1999, 8, 12);

        tony.setSecretary(harry);

        Employee[] staff = {carl, harry, tony};

        try (ObjectOutputStream out = new ObjectOutputStream(new FileOutputStream("employee.dat"))) {
            out.writeObject(staff);
        }

        try (ObjectInputStream in = new ObjectInputStream(new FileInputStream("employee.dat"))) {
            Employee[] newStaff = (Employee[])in.readObject();

            newStaff[1].raiseSalary(10);
            for (Employee e : newStaff) {
                System.out.println(e);
            }
        }
    }
}
