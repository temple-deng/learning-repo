package com.dengbo.timer;

import java.awt.*;
import java.awt.event.*;
import java.time.Instant;

import javax.swing.*;

public class TimerTest {
    public static void main(String[] args) {
        TimerPrinter listener = new TimerPrinter();

        Timer timer = new Timer(1000, listener);
        timer.start();
    }
}

class TimerPrinter implements ActionListener {
    public void actionPerformed(ActionEvent evt) {
        System.out.println("At the tone, the time is " + Instant.ofEpochMilli(evt.getWhen()));
    }
}