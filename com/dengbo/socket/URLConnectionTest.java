package com.dengbo.socket;

import java.io.IOException;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Scanner;

public class URLConnectionTest {
  public static void main(String[] args) {
    try {
      String urlName;
      if (args.length > 0) {
        urlName = args[0];
      } else {
        urlName = "https://www.baidu.com";
      }

      URL url = new URL(urlName);

      URLConnection conn = url.openConnection();

      conn.connect();
      Map<String, List<String>> headers = conn.getHeaderFields();

      for (Map.Entry<String, List<String>> entry : headers.entrySet()) {
        String key = entry.getKey();
        for (String value: entry.getValue()) {
          System.out.println(key + ": " + value);
        }
      }

      String encoding = StandardCharsets.UTF_8.toString();
      try (Scanner scanner = new Scanner(conn.getInputStream(), encoding)) {
        for (int i = 0; scanner.hasNextLine() && i < 20; i++) {
          System.out.println(scanner.nextLine());
        }
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
  }
}
