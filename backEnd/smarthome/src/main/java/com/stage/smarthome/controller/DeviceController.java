package com.stage.smarthome.controller;

import com.stage.smarthome.repository.DeviceRepository;
import java.util.List;
import java.util.Optional;
import com.stage.smarthome.entity.Device;
import com.stage.smarthome.service.DeviceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/devices")
public class DeviceController {

    private final DeviceRepository deviceRepository;
    private final DeviceService deviceService;

    public DeviceController(DeviceService deviceService, DeviceRepository deviceRepository) {
        this.deviceService = deviceService;
        this.deviceRepository = deviceRepository;
    }

    // Récupérer tous les devices d’une pièce
    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<Device>> getDevicesByRoom(@PathVariable Long roomId) {
        List<Device> devices = deviceService.getDevicesByRoom(roomId);
        return devices.isEmpty()
                ? ResponseEntity.status(HttpStatus.NOT_FOUND).build()
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

    // Changer l’état d’un device
    @PutMapping("/{id}/state")
    public ResponseEntity<?> updateDeviceState(@PathVariable Long id, @RequestParam String state) {
        try {
            Device updatedDevice = deviceService.updateDeviceState(id, state);
            return ResponseEntity.ok(updatedDevice);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

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

