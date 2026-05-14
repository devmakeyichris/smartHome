package com.stage.smarthome.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.stage.smarthome.entity.Device;
import com.stage.smarthome.entity.DeviceState;
import com.stage.smarthome.repository.DeviceRepository;

@Service
public class DeviceService {

    private final DeviceRepository deviceRepository;

    public DeviceService(DeviceRepository deviceRepository) {
        this.deviceRepository = deviceRepository;
    }

    // Récupérer tous les devices d'une pièce
    public List<Device> getDevicesByRoom(Long roomId) {
        return deviceRepository.findByRoomId(roomId);
    }

    // Récupérer un device par son id
    public Optional<Device> getDeviceById(Long id) {
        return deviceRepository.findById(id);
    }

    // Changer l'état d'un device
    public Device updateDeviceState(Long id, String newState) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found"));

        device.setState(Enum.valueOf(DeviceState.class, newState));
        return deviceRepository.save(device);
    }

    // Ajouter un nouveau device
    public Device addDevice(Device device) {
        return deviceRepository.save(device);
    }

    // Supprimer un device
    public void deleteDevice(Long id) {
        deviceRepository.deleteById(id);
    }
}

