package com.stage.smarthome.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fazecast.jSerialComm.SerialPort;
import com.fazecast.jSerialComm.SerialPortDataListener;
import com.fazecast.jSerialComm.SerialPortEvent;
import com.stage.smarthome.entity.DoorLog;
import com.stage.smarthome.entity.RfidCard;
import com.stage.smarthome.repository.DoorLogRepository;
import com.stage.smarthome.repository.RfidCardRepository;

@Service
public class ArduinoService {

    private SerialPort port;

    @Autowired
    private RfidCardRepository rfidCardRepository;

    @Autowired
    private DoorLogRepository doorLogRepository;

    public ArduinoService() {
        port = SerialPort.getCommPort("COM4"); // adapte selon ton PC
        port.setBaudRate(9600);
        port.openPort();

        // Listener pour lire les messages venant de l’Arduino
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

                    if (message.startsWith("RFID:")) {
                        String uid = message.substring(5);
                        handleRfid(uid);
                    }
                }
            }
        });
    }

    private void handleRfid(String uid) {
        Optional<RfidCard> cardOpt = rfidCardRepository.findByUid(uid);

        if (cardOpt.isPresent()) {
            // Carte valide → ouvrir la porte
            sendCommand("DOOR:OPEN");
            System.out.println("Carte valide, ouverture de la porte");

            // Enregistrer un log
            DoorLog log = new DoorLog();
            log.setAction("OPEN");
            log.setTimestamp(LocalDateTime.now());
            log.setCard(cardOpt.get()); // nécessite un champ card dans DoorLog
            doorLogRepository.save(log);

        } else {
            // Carte inconnue → refus
            sendCommand("DOOR:DENIED");
            System.out.println("Carte inconnue, accès refusé");
        }
    }

    public void sendCommand(String command) {
    if (port.isOpen()) {
        String cmd = command + "\n"; // retour à la ligne obligatoire
        byte[] data = cmd.getBytes();
        port.writeBytes(data, data.length);
        System.out.println("Commande envoyée à l’Arduino: " + cmd);
    }
}


    public void sendDeviceCommand(String type, String action) {
        String command = type + ":" + action;
        sendCommand(command);
    }
}
