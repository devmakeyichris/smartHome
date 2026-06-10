package com.stage.smarthome.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.stage.smarthome.entity.Device;

public interface DeviceRepository extends JpaRepository<Device, Long> {
    List<Device> findByRoomId(Long roomId);
    Optional<Device> findFirstByPin(Integer pin);
}
