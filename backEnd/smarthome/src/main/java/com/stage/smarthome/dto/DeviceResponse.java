package com.stage.smarthome.dto;

import com.stage.smarthome.entity.Device;

public class DeviceResponse {
    private Long id;
    private String type;
    private int pin;
    private String state;

    public DeviceResponse(Device device) {
        this.id = device.getId();
        this.type = device.getType().name();
        this.pin = device.getPin();
        this.state = device.getState().name();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getPin() {
        return pin;
    }

    public void setPin(int pin) {
        this.pin = pin;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }
}

