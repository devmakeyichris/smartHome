package com.stage.smarthome.service;

import com.fazecast.jSerialComm.SerialPort;

public class ArduinoService {

    private SerialPort port;

    public ArduinoService() {
        port = SerialPort.getCommPort("COM3"); // adapte selon ton PC
        port.setBaudRate(9600);
        port.openPort();
    }

    public void sendCommand(String command) {
        if (port.isOpen()) {
            byte[] data = (command + "\n").getBytes();
            port.writeBytes(data, data.length);
        }
    }
}

