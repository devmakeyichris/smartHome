package com.stage.smarthome.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Device {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private boolean mainDoor;

    @Enumerated(EnumType.STRING)
    private DeviceType type;

    private int pin;

    @Enumerated(EnumType.STRING)
    private DeviceState state ;

    @ManyToOne
    private Room room;

    public Device() {
    }

    public Device(DeviceType type, int pin, Room room) {
    this.type = type;
    this.pin = pin;
    this.room = room;
    this.state = (type == DeviceType.LIGHT) ? DeviceState.OFF : DeviceState.CLOSED;
}


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DeviceType getType() {
        return type;
    }

    public void setType(DeviceType type) {
        this.type = type;
    }

    public int getPin() {
        return pin;
    }

    public void setPin(int pin) {
        this.pin = pin;
    }

    public DeviceState getState() {
        return state;
    }

    public void setState(DeviceState state) {
        this.state = state;
    }

    public Room getRoom() {
        return room;
    }

    public void setRoom(Room room) {
        this.room = room;
    }

    public boolean isMainDoor() {
        return mainDoor;
    }

    public void setMainDoor(boolean mainDoor) {
        this.mainDoor = mainDoor;
    }
}
