package com.stage.smarthome.dto;

import java.util.List;
import java.util.stream.Collectors;


// #########################

import com.stage.smarthome.entity.House;
// verifiosn
public class HouseResponse {
    private Long id;
    private String houseName;
    private List<RoomResponse> rooms;

    public HouseResponse(House house) {
        this.id = house.getId();
        this.houseName = house.getHouseName();
        this.rooms = house.getRooms()
                          .stream()
                          .map(RoomResponse::new)
                          .collect(Collectors.toList());
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getHouseName() {
        return houseName;
    }

    public void setHouseName(String houseName) {
        this.houseName = houseName;
    }

    public List<RoomResponse> getRooms() {
        return rooms;
    }

    public void setRooms(List<RoomResponse> rooms) {
        this.rooms = rooms;
    }
}

