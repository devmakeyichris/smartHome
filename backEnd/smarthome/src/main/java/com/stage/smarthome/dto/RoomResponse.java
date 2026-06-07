package com.stage.smarthome.dto;

import java.util.List;
import java.util.stream.Collectors;

import com.stage.smarthome.entity.Room;

public class RoomResponse {
    private Long id;
    private String name;
    private List<DeviceResponse> devices;

    
    public RoomResponse(Room room) {
        this.id = room.getId();
        this.name = room.getName();
        if (room.getDevices() != null) {
            this.devices = room.getDevices()
            .stream()
            .map(DeviceResponse::new)
            .collect(Collectors.toList());
        } else {
            this.devices = List.of();
        }
    }

        
        public Long getId() {
            return id;
        }
        
        public void setId(Long id) {
            this.id = id;
        }
        
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
        
        public List<DeviceResponse> getDevices() {
            return devices;
        }
        
        public void setDevices(List<DeviceResponse> devices) {
            this.devices = devices;
        }
    }  
    