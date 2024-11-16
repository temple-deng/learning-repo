package com.dengbo.socket;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.Scanner;

public class EchoServer {
  public static void main(String[] args) throws IOException {
    try (ServerSocket s = new ServerSocket(8189)) {
      try (Socket incoming = s.accept()) {
        InputStream in = incoming.getInputStream();
        OutputStream out = incoming.getOutputStream();

        try (Scanner inScanner = new Scanner(in, StandardCharsets.UTF_8.toString())) {
          PrintWriter writer = new PrintWriter(new OutputStreamWriter(out, StandardCharsets.UTF_8), true);

          writer.println("Hello! Enter BYE to exit.");

          boolean done = false;
          while (!done && inScanner.hasNextLine()) {
            String line = inScanner.nextLine();
            writer.println("Echo: " + line);
            if (line.trim().equals("BYE")) {
              done = true;
            }
          }
        }
      }
    }
  }
}
