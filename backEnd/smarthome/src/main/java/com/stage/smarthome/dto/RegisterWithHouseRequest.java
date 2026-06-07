package com.stage.smarthome.dto;

import com.stage.smarthome.entity.House;
import com.stage.smarthome.entity.User;

public class RegisterWithHouseRequest {
    private User user;
    private House house;

    
    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        this.user = user;
    }
    public House getHouse() {
        return house;
    }
    public void setHouse(House house) {
        this.house = house;
    }

    
}
