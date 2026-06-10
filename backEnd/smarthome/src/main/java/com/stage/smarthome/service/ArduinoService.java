package com.stage.smarthome.service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.fazecast.jSerialComm.SerialPort;
import com.fazecast.jSerialComm.SerialPortDataListener;
import com.fazecast.jSerialComm.SerialPortEvent;
import com.stage.smarthome.entity.Device;
import com.stage.smarthome.entity.DeviceState;
import com.stage.smarthome.entity.DoorLog;
import com.stage.smarthome.entity.RfidCard;

import com.stage.smarthome.repository.DeviceRepository;
import com.stage.smarthome.repository.DoorLogRepository;
import com.stage.smarthome.repository.RfidCardRepository;

@Service
public class ArduinoService {

    private SerialPort port;

    private final RfidCardRepository rfidCardRepository;
    private final DoorLogRepository doorLogRepository;
    private final DeviceRepository deviceRepository;

    private static final String PORT_NAME = "COM6";
    private static final int BAUD_RATE = 9600;

    private static final int MAIN_DOOR_PIN = 6;

    private final Map<String, String> deviceStates = new ConcurrentHashMap<>();
    private final StringBuilder serialBuffer = new StringBuilder();

    public ArduinoService(
            RfidCardRepository rfidCardRepository,
            DoorLogRepository doorLogRepository,
            DeviceRepository deviceRepository
    ) {
        this.rfidCardRepository = rfidCardRepository;
        this.doorLogRepository = doorLogRepository;
        this.deviceRepository = deviceRepository;

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

                String chunk = new String(newData, 0, numRead);

                synchronized (serialBuffer) {
                    serialBuffer.append(chunk);

                    int newlineIndex;

                    while ((newlineIndex = serialBuffer.indexOf("\n")) >= 0) {
                        String line = serialBuffer.substring(0, newlineIndex)
                                .replace("\r", "")
                                .trim();

                        serialBuffer.delete(0, newlineIndex + 1);

                        if (!line.isEmpty()) {
                            processArduinoMessage(line);
                        }
                    }
                }
            }
        });
    }

    private void processArduinoMessage(String message) {
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
                saveDeviceStateInDatabase(6, "OPEN");
                System.out.println("État mis à jour : DOOR:6 = OPEN");
            } else if (message.endsWith(":CLOSED")) {
                deviceStates.put("DOOR:6", "CLOSED");
                saveDeviceStateInDatabase(6, "CLOSED");
                System.out.println("État mis à jour : DOOR:6 = CLOSED");
            }
        }
    }

    private void handleRfid(String uid) {
        uid = uid.trim().replace(" ", "").toUpperCase();

        System.out.println("UID RFID reçu : " + uid);

        Optional<RfidCard> cardOpt = rfidCardRepository.findByUid(uid);

        if (cardOpt.isPresent() && cardOpt.get().isActive()) {
            sendDoorCommand(MAIN_DOOR_PIN, "TOGGLE");

            DoorLog log = new DoorLog();
            log.setAction("TOGGLE");
            log.setTimestamp(LocalDateTime.now());
            log.setCard(cardOpt.get());

            doorLogRepository.save(log);

            System.out.println("RFID valide : porte principale inversée");
        } else {
            System.out.println("RFID refusé : carte inconnue ou bloquée : " + uid);
        }
    }

    private void handleDeviceState(String message) {
        String[] parts = message.split(":");

        if (parts.length != 3) {
            return;
        }

        String type = parts[0].trim().toUpperCase();
        String pinText = parts[1].trim();
        String state = parts[2].trim().toUpperCase();

        String key = type + ":" + pinText;

        deviceStates.put(key, state);

        System.out.println("État mis à jour en mémoire : " + key + " = " + state);

        try {
            int pin = Integer.parseInt(pinText);
            saveDeviceStateInDatabase(pin, state);
        } catch (NumberFormatException e) {
            System.out.println("PIN invalide reçu depuis Arduino : " + pinText);
        }
    }

    private void saveDeviceStateInDatabase(int pin, String state) {
        try {
            Optional<Device> deviceOpt = deviceRepository.findFirstByPin(pin);

            if (deviceOpt.isEmpty()) {
                System.out.println("Aucun équipement trouvé en base pour le PIN " + pin);
                return;
            }

            Device device = deviceOpt.get();
            device.setState(DeviceState.valueOf(state.toUpperCase()));

            deviceRepository.save(device);

            System.out.println("État sauvegardé en base : PIN " + pin + " = " + state);

        } catch (IllegalArgumentException e) {
            System.out.println("État invalide pour la base : " + state);
        } catch (RuntimeException e) {
            System.out.println("Erreur sauvegarde état en base : " + e.getMessage());
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

        int bytesWritten = port.writeBytes(data, data.length);

        System.out.println("Commande envoyée à l'Arduino : " + command);
        System.out.println("Octets envoyés : " + bytesWritten + "/" + data.length);

        if (bytesWritten != data.length) {
            throw new RuntimeException("Commande non envoyée complètement à l'Arduino");
        }
    }

    public void sendLightCommand(int pin, String action) {
        String finalAction = action.toUpperCase();

        sendCommand("LIGHT:" + pin + ":" + finalAction);

        deviceStates.put("LIGHT:" + pin, finalAction);
        saveDeviceStateInDatabase(pin, finalAction);
    }

    public void sendDoorCommand(int pin, String action) {
        String finalAction = action.toUpperCase();

        if (finalAction.equals("CLOSE")) {
            finalAction = "CLOSED";
        }

        if (finalAction.equals("TOGGLE")) {
            sendCommand("DOOR:" + pin + ":TOGGLE");
            return;
        }

        sendCommand("DOOR:" + pin + ":" + finalAction);

        deviceStates.put("DOOR:" + pin, finalAction);
        saveDeviceStateInDatabase(pin, finalAction);
    }

    public void doorToggle(int pin) {
        sendDoorCommand(pin, "TOGGLE");
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