package com.stage.smarthome.controller;

import com.stage.smarthome.repository.DeviceRepository;
import java.util.List;
import java.util.Optional;
import com.stage.smarthome.entity.Device;
import com.stage.smarthome.service.ArduinoService;
import com.stage.smarthome.service.DeviceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/devices")
public class DeviceController {
    
    private final DeviceRepository deviceRepository;
    private final DeviceService deviceService;
    
    
    private final ArduinoService arduinoService = new ArduinoService();
    
    public DeviceController(DeviceService deviceService, DeviceRepository deviceRepository) {
        this.deviceService = deviceService;
        this.deviceRepository = deviceRepository;
    }
    
    @PutMapping("/{id}/state")
    public ResponseEntity<?> updateLightState(@PathVariable Long id, @RequestParam String state) {
        if (id == 1 && state.equalsIgnoreCase("ON")) {
            arduinoService.sendCommand("LIGHT1:ON");
            return ResponseEntity.ok("Light 1 turned on");
        } else if (id == 1 && state.equalsIgnoreCase("OFF")) {
            arduinoService.sendCommand("LIGHT1:OFF");
            return ResponseEntity.ok("Light 1 turned off");
        } else if (id == 2 && state.equalsIgnoreCase("ON")) {
            arduinoService.sendCommand("LIGHT2:ON");
            return ResponseEntity.ok("Light 2 turned on");
        } else if (id == 2 && state.equalsIgnoreCase("OFF")) {
            arduinoService.sendCommand("LIGHT2:OFF");
            return ResponseEntity.ok("Light 2 turned off");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid command");
        }
    }
    
    
    //  @PutMapping("/{id}/state")
    // public ResponseEntity<?> updateDeviceState(@PathVariable Long id, @RequestParam String state) {
    //     // Exemple : si id=1 → porte, si id=2 → lumière
    
    //     if (id == 1 && state.equals("OPEN")) {
    //         arduinoService.sendCommand("DOOR1:OPEN");
    //         return ResponseEntity.ok("Door opened");
    //     } else if (id == 2 && state.equals("ON")) {
    //         arduinoService.sendCommand("LIGHT1:ON");
    //         return ResponseEntity.ok("Light turned on");
    //     } else {
    //         return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid command");
    //     }
    // }
    
    //     @PutMapping("/{id}/state")
    // public ResponseEntity<?> updateDeviceState(@PathVariable Long id, @RequestParam String state) {
    //     try {
    //         // 1. Mettre à jour l’état dans la base
    //         Device updatedDevice = deviceService.updateDeviceState(id, state);
    
    //         // 2. Envoyer la commande à l’Arduino
    //         if (updatedDevice.getType().equalsIgnoreCase("DOOR")) {
    //             if (state.equalsIgnoreCase("OPEN")) {
    //                 arduinoService.sendCommand("DOOR" + id + ":OPEN");
    //             } else if (state.equalsIgnoreCase("CLOSE")) {
    //                 arduinoService.sendCommand("DOOR" + id + ":CLOSE");
    //             }
    //         } else if (updatedDevice.getType().equalsIgnoreCase("LIGHT")) {
    //             if (state.equalsIgnoreCase("ON")) {
    //                 arduinoService.sendCommand("LIGHT" + id + ":ON");
    //             } else if (state.equalsIgnoreCase("OFF")) {
    //                 arduinoService.sendCommand("LIGHT" + id + ":OFF");
    //             }
    //         }
    
    //         return ResponseEntity.ok(updatedDevice);
    
    //     } catch (RuntimeException e) {
    //         return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    //     }
    
    
    
    // Récupérer tous les devices d’une pièce
    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<Device>> getDevicesByRoom(@PathVariable Long roomId) {
        List<Device> devices = deviceService.getDevicesByRoom(roomId);
        return devices.isEmpty()? ResponseEntity.status(HttpStatus.NOT_FOUND).build()
        : ResponseEntity.ok(devices);
    }
    
    // Récupérer un device par id
    @GetMapping("/{id}")
    public ResponseEntity<?> getDeviceById(@PathVariable Long id) {
        Optional<Device> deviceOpt = deviceService.getDeviceById(id);
        if(deviceOpt.isPresent()){
            return ResponseEntity.ok(deviceOpt.get());
        }
        else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Device not found");
        }
        
    }
    
    // // Changer l’état d’un device
    // @PutMapping("/{id}/state")
    // public ResponseEntity<?> updateDeviceState(@PathVariable Long id, @RequestParam String state) {
    //     try {
    //         Device updatedDevice = deviceService.updateDeviceState(id, state);
    //         return ResponseEntity.ok(updatedDevice);
    //     } catch (RuntimeException e) {
    //         return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    //     }
    // }
    
    // Ajouter un device
    @PostMapping
    public ResponseEntity<Device> addDevice(@RequestBody Device device) {
        Device savedDevice = deviceService.addDevice(device);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedDevice);
    }
    
    // Supprimer un device
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDevice(@PathVariable Long id) {
        deviceService.deleteDevice(id);
        return ResponseEntity.noContent().build();
    }
}

