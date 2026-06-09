package com.stage.smarthome.service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

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
    
    private final RfidCardRepository rfidCardRepository;
    private final DoorLogRepository doorLogRepository;
    
    private static final String PORT_NAME = "COM6";
    private static final int BAUD_RATE = 9600;
    
    private static final int MAIN_DOOR_PIN = 6;
    private final Map<String, String> deviceStates = new ConcurrentHashMap<>();
    
    public ArduinoService(RfidCardRepository rfidCardRepository,
    DoorLogRepository doorLogRepository) {
        this.rfidCardRepository = rfidCardRepository;
        this.doorLogRepository = doorLogRepository;
        
        connectArduino();
    }
    
    private void connectArduino() {
        port = SerialPort.getCommPort(PORT_NAME);
        port.setBaudRate(BAUD_RATE);
        
        if (port.openPort()) {
            System.out.println("Arduino connecté sur " + PORT_NAME);
            listenToArduino();
        } else {
            System.out.println("Arduino non connecté sur " + PORT_NAME);
        }
    }
    
    private void listenToArduino() {
        port.addDataListener(new SerialPortDataListener() {
            @Override
            public int getListeningEvents() {
                return SerialPort.LISTENING_EVENT_DATA_AVAILABLE;
            }
            
            @Override
            public void serialEvent(SerialPortEvent event) {
                if (event.getEventType() != SerialPort.LISTENING_EVENT_DATA_AVAILABLE) {
                    return;
                }
                
                byte[] newData = new byte[port.bytesAvailable()];
                int numRead = port.readBytes(newData, newData.length);
                
                if (numRead <= 0) {
                    return;
                }
                
                String rawMessage = new String(newData, 0, numRead).trim();
                
                if (rawMessage.isEmpty()) {
                    return;
                }
                
                String[] messages = rawMessage.split("\\r?\\n");
                
                for (String message : messages) {
                    message = message.trim();
                    
                    if (message.isEmpty()) {
                        continue;
                    }
                    
                    System.out.println("Message Arduino : " + message);
                    
                    if (message.startsWith("RFID:")) {
                        String uid = message.substring(5).trim();
                        handleRfid(uid);
                    }
                    
                    else if (message.startsWith("LIGHT:")) {
                        handleDeviceState(message);
                    }
                    
                    else if (message.startsWith("DOOR:")) {
                        handleDeviceState(message);
                    }
                    
                    else if (message.startsWith("MAIN_DOOR:")) {
                        if (message.endsWith(":OPEN")) {
                            deviceStates.put("DOOR:6", "OPEN");
                        } else if (message.endsWith(":CLOSED")) {
                            deviceStates.put("DOOR:6", "CLOSED");
                        }
                    }
                }
            }
        });
    }
    
    private void handleDeviceState(String message) {
        String[] parts = message.split(":");
        
        if (parts.length != 3) {
            return;
        }
        
        String type = parts[0].trim();
        String pin = parts[1].trim();
        String state = parts[2].trim();
        
        String key = type + ":" + pin;
        
        deviceStates.put(key, state);
        
        System.out.println("État mis à jour : " + key + " = " + state);
    }
    
    private void handleRfid(String uid) {
        uid = uid.trim().replace(" ", "").toUpperCase();
        
        Optional<RfidCard> cardOpt = rfidCardRepository.findByUid(uid);
        
        if (cardOpt.isPresent() && cardOpt.get().isActive()) {
            sendDoorCommand(MAIN_DOOR_PIN, "OPEN");
            
            DoorLog log = new DoorLog();
            log.setAction("OPEN");
            log.setTimestamp(LocalDateTime.now());
            log.setCard(cardOpt.get());
            
            doorLogRepository.save(log);
            
            System.out.println("RFID valide : porte principale ouverte");
        } else {
            sendDoorCommand(MAIN_DOOR_PIN, "CLOSED");
            System.out.println("RFID refusé : carte inconnue ou bloquée : " + uid);
        }
    }
    
    public void sendCommand(String command) {
        if (port == null || !port.isOpen()) {
            connectArduino();
        }
        
        if (port == null || !port.isOpen()) {
            throw new RuntimeException("Arduino non connecté");
        }
        
        String fullCommand = command + "\n";
        byte[] data = fullCommand.getBytes();
        
        port.writeBytes(data, data.length);
        System.out.println("Commande envoyée à l'Arduino : " + fullCommand);
    }
    
    public void sendLightCommand(int pin, String action) {
        String finalAction = action.toUpperCase();
        sendCommand("LIGHT:" + pin + ":" + finalAction);
        deviceStates.put("LIGHT:" + pin, finalAction);
    }
    
    public void sendDoorCommand(int pin, String action) {
        String finalAction = action.toUpperCase();
        
        if (finalAction.equals("CLOSE")) {
            finalAction = "CLOSED";
        }
        
        sendCommand("DOOR:" + pin + ":" + finalAction);
        deviceStates.put("DOOR:" + pin, finalAction);
    }
    public void lightOn(int pin) {
        sendLightCommand(pin, "ON");
    }
    
    public void lightOff(int pin) {
        sendLightCommand(pin, "OFF");
    }
    
    public void doorOpen(int pin) {
        sendDoorCommand(pin, "OPEN");
    }
    
    public void doorClose(int pin) {
        sendDoorCommand(pin, "CLOSED");
    }
    
    public Map<String, String> getDeviceStates() {
        return deviceStates;
    }
}