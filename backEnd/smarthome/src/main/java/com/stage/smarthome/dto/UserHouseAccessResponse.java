package com.stage.smarthome.dto;

public class UserHouseAccessResponse {

    private HouseResponse house;
    private String role;
    private String status;

    public UserHouseAccessResponse(HouseResponse house, String role, String status) {
        this.house = house;
        this.role = role;
        this.status = status;
    }

    public HouseResponse getHouse() {
        return house;
    }

    public String getRole() {
        return role;
    }

    public String getStatus() {
        return status;
    }
}