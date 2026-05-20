package com.stage.smarthome.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import com.stage.smarthome.entity.Device;
import com.stage.smarthome.entity.DoorLog;

public interface DoorLogRepository extends JpaRepository<DoorLog, Long> {
    List<DoorLog> findByDoor(Device door);
}
