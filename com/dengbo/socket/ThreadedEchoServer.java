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

public class ThreadedEchoServer {
  public static void main(String[] args) throws IOException {
    try (ServerSocket s = new ServerSocket(8189)) {
      int i = 1;

      while (true) {
        Socket incoming = s.accept();
        System.out.println("Spawning " + i);
        Runnable r = new ThreadedEchoHandler(incoming);
        Thread t = new Thread(r);
        t.start();
        i++;
      }
    }
  }
}

class ThreadedEchoHandler implements Runnable {
  private Socket incoming;

  public ThreadedEchoHandler(Socket incomingSocket) {
    incoming = incomingSocket;
  }

  public void run() {
    try (
        InputStream inStream = incoming.getInputStream();
        OutputStream outStream = incoming.getOutputStream();
        Scanner in = new Scanner(inStream, StandardCharsets.UTF_8.toString());
        PrintWriter out = new PrintWriter(new OutputStreamWriter(outStream, StandardCharsets.UTF_8), true);) {
      out.println("Hello! Enter BYE to exit.");

      boolean done = false;

      while (!done && in.hasNextLine()) {
        String line = in.nextLine();
        out.println("Echo: " + line);
        if (line.trim().equals("BYE")) {
          done = true;
        }
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
  }
}