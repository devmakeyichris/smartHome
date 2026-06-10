package com.stage.smarthome.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.stage.smarthome.dto.DeviceResponse;
import com.stage.smarthome.entity.Device;
import com.stage.smarthome.repository.DeviceRepository;
import com.stage.smarthome.service.ArduinoService;
import com.stage.smarthome.service.DeviceService;

@RestController
@RequestMapping("/devices")
public class DeviceController {
    
    private final DeviceRepository deviceRepository;
    private final DeviceService deviceService;
    private final ArduinoService arduinoService;
    
    public DeviceController(DeviceService deviceService,
    DeviceRepository deviceRepository,
    ArduinoService arduinoService) {
        this.deviceService = deviceService;
        this.deviceRepository = deviceRepository;
        this.arduinoService = arduinoService;
    }
    
    @PostMapping("/light/{pin}/{action}")
    public ResponseEntity<?> controlLight(
    @PathVariable int pin,
    @PathVariable String action
    ) {
        try {
            if (action.equalsIgnoreCase("on")) {
                arduinoService.lightOn(pin);
                return ResponseEntity.ok("Lumière allumée");
            } else if (action.equalsIgnoreCase("off")) {
                arduinoService.lightOff(pin);
                return ResponseEntity.ok("Lumière éteinte");
            }
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body("Action lumière invalide");
            
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(e.getMessage());
        }
    }
    
    @PostMapping("/door/{pin}/{action}")
    public ResponseEntity<?> controlDoor(
    @PathVariable int pin,
    @PathVariable String action
    ) {
        try {
            if (action.equalsIgnoreCase("open")) {
                arduinoService.doorOpen(pin);
                return ResponseEntity.ok("Porte ouverte");
            } else if (action.equalsIgnoreCase("close")) {
                arduinoService.doorClose(pin);
                return ResponseEntity.ok("Porte fermée");
            } else if (action.equalsIgnoreCase("toggle")) {
                arduinoService.doorToggle(pin);
                return ResponseEntity.ok("Porte inversée");
            }
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body("Action porte invalide");
            
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}/state")
    public ResponseEntity<?> updateDeviceState(
    @PathVariable Long id,
    @RequestParam String state
    ) {
        try {
            Device updatedDevice = deviceService.updateState(id, state);
            return ResponseEntity.ok(new DeviceResponse(updatedDevice));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/room/{roomId}")
    public ResponseEntity<?> getDevicesByRoom(@PathVariable Long roomId) {
        List<Device> devices = deviceService.getDevicesByRoom(roomId);
        
        if (devices.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body("Aucun appareil trouvé pour cette pièce");
        }
        
        List<DeviceResponse> response = devices.stream()
        .map(DeviceResponse::new)
        .toList();
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getDeviceById(@PathVariable Long id) {
        Optional<Device> deviceOpt = deviceService.getDeviceById(id);
        
        if (deviceOpt.isPresent()) {
            return ResponseEntity.ok(new DeviceResponse(deviceOpt.get()));
        }
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body("Device not found");
    }
    
    @PostMapping
    public ResponseEntity<DeviceResponse> addDevice(@RequestBody Device device) {
        Device savedDevice = deviceService.addDevice(device);
        return ResponseEntity.status(HttpStatus.CREATED)
        .body(new DeviceResponse(savedDevice));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDevice(@PathVariable Long id) {
        deviceService.deleteDevice(id);
        return ResponseEntity.noContent().build();
    }
}