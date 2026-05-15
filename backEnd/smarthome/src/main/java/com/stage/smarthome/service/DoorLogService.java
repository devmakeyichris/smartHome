package com.stage.smarthome.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.stage.smarthome.entity.Device;
import com.stage.smarthome.entity.DoorLog;
import com.stage.smarthome.repository.DoorLogRepository;

@Service
public class DoorLogService {
    @Autowired
    private DoorLogRepository doorLogRepository;

    public DoorLog saveLog(Device door, String action) {
        DoorLog log = new DoorLog();
        log.setDoor(door);
        log.setAction(action);
        log.setTimestamp(LocalDateTime.now());
        return doorLogRepository.save(log);
    }

    public List<DoorLog> getLogsForDoor(Device door) {
        return doorLogRepository.findByDoor(door);
    }

    public DoorLogRepository getDoorLogRepository() {
        return doorLogRepository;
    }

    public void setDoorLogRepository(DoorLogRepository doorLogRepository) {
        this.doorLogRepository = doorLogRepository;
    }
}

