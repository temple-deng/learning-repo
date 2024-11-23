package com.dengbo.annotation;

import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;

public class TableCreator {
  public static void main(String[] args) throws Exception {
    if (args.length < 1) {
      System.out.println("arguments: annotated classes");
      System.exit(1);
    }

    for (String className: args) {
      Class<?> cl = Class.forName(className);
      DBTable dbTable = cl.getAnnotation(DBTable.class);
      if (dbTable == null) {
        System.out.println("No DBTable annotations in class " + className);
        continue;
      }

      String tableName = dbTable.name();

      if (tableName.length() < 1) {
        tableName = cl.getName().toUpperCase();
      }

      List<String> columnsDefs = new ArrayList<>();

      for (Field field: cl.getDeclaredFields()) {
        String columnName = null;

        Annotation[] anns = field.getAnnotations();

        if (anns.length < 1) {
          continue;
        }

        if (anns[0] instanceof SQLInteger) {
          SQLInteger sInt = (SQLInteger) anns[0];
          if (sInt.name().length() < 1) {
            columnName = field.getName().toUpperCase();
          } else {
            columnName = sInt.name();
          }

          columnsDefs.add(columnName + " INT" + getConstraints(sInt.constraints()));
        }

        if (anns[0] instanceof SQLString) {
          SQLString sqlString = (SQLString) anns[0];
          if (sqlString.name().length() < 1) {
            columnName = field.getName().toUpperCase();
          } else {
            columnName = sqlString.name();
          }

          columnsDefs.add(columnName + " VARCHAR(" + sqlString.value() + ")" + getConstraints(sqlString.constraints()));
        }

        StringBuilder createCommand = new StringBuilder();
        createCommand.append("CREATE TABLE " + tableName + "(");

        for (String columnDef : columnsDefs) {
          createCommand.append("\n     " + columnDef + ",");
        }

        String tableCreate = createCommand.substring(0, createCommand.length() - 1) + ");";

        System.out.println("Table Creation SQL for " + className + " is: \n" + tableCreate);
      }
    }
  }

  private static String getConstraints(Constraints con) {
    String constraints = "";

    if (!con.allowNull()) {
      constraints += " NOT NULL";
    } else if (con.primaryKey()) {
      constraints += " PRIMARY KEY";
    } else if (con.unique()) {
      constraints += " UNIQUE";
    }

    return constraints;
  }
}