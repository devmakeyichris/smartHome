package com.stage.smarthome.service;

import org.springframework.stereotype.Service;

import com.fazecast.jSerialComm.SerialPort;
import com.fazecast.jSerialComm.SerialPortDataListener;
import com.fazecast.jSerialComm.SerialPortEvent;


@Service
public class ArduinoService {

    private SerialPort port;

    public ArduinoService() {
        port = SerialPort.getCommPort("COM4"); // adapte selon ton PC
        port.setBaudRate(9600);
        port.openPort();

        // Ajout d’un listener pour lire les messages venant de l’Arduino
        port.addDataListener(new SerialPortDataListener() {
            @Override
            public int getListeningEvents() {
                return SerialPort.LISTENING_EVENT_DATA_AVAILABLE;
            }

            @Override
            public void serialEvent(SerialPortEvent event) {
                if (event.getEventType() == SerialPort.LISTENING_EVENT_DATA_AVAILABLE) {
                    byte[] newData = new byte[port.bytesAvailable()];
                    int numRead = port.readBytes(newData, newData.length);
                    String message = new String(newData, 0, numRead).trim();

                    System.out.println("Message reçu de l’Arduino: " + message);

                    // Ici tu peux décider quoi faire :
                    // - enregistrer dans la base (DoorLog/EventLog)
                    // - déclencher une action côté backend
                }
            }
        });
    }

    public void sendCommand(String command) {
        if (port.isOpen()) {
            byte[] data = (command + "\n").getBytes();
            port.writeBytes(data, data.length);
        }
    }

    public void sendDeviceCommand(String type, String action) {
        String command = type + ":" + action;
        sendCommand(command);
    }
}


