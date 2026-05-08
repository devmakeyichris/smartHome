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
    private DeviceType type;
    private int number;

    @Enumerated(EnumType.STRING)
    private DeviceState state ;

    @ManyToOne
    private Room room;

    public Device() {
    }

    public Device(DeviceType type, int number, Room room) {
    this.type = type;
    this.number = number;
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

    public int getNumber() {
        return number;
    }

    public void setNumber(int number) {
        this.number = number;
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
}
