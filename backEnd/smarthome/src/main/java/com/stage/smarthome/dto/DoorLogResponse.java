package com.stage.smarthome.dto;

import java.time.LocalDateTime;

import com.stage.smarthome.entity.DoorLog;

public class DoorLogResponse {
    private String action;
    private LocalDateTime timestamp;

    public DoorLogResponse(DoorLog log) {
        this.action = log.getAction();
        this.timestamp = log.getTimestamp();
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
