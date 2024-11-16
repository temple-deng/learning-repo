package com.dengbo.socket;

import java.io.IOException;
import java.net.InetAddress;

public class InetAddressTest {
  public static void main(String[] args) throws IOException {
    if (args.length > 0) {
      String host = args[0];
      InetAddress[] address = InetAddress.getAllByName(host);
      for (InetAddress inetAddress : address) {
        System.out.println(inetAddress);
      }
    } else {
      InetAddress localhost = InetAddress.getLocalHost();
      System.out.println(localhost);
    }
  }
}
