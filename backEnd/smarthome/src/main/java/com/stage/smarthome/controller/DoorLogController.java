package com.stage.smarthome.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.stage.smarthome.dto.DoorLogResponse;
import com.stage.smarthome.entity.Device;
import com.stage.smarthome.service.DoorLogService;

@RestController
@RequestMapping("/door/logs")
public class DoorLogController {
    @Autowired
    private DoorLogService doorLogService;

    @GetMapping("/{doorId}")
    public List<DoorLogResponse> getLogs(@PathVariable Long doorId) {
        Device door = new Device();
        door.setId(doorId);
        return doorLogService.getLogsForDoor(door)
                            .stream()
                            .map(DoorLogResponse::new)
                            .toList();
    }

}

