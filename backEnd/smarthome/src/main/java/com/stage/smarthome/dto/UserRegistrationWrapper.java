package com.stage.smarthome.dto;

import com.stage.smarthome.entity.House;
import com.stage.smarthome.entity.User;

public class UserRegistrationWrapper {
    private User user;
    private House house;

    public UserRegistrationWrapper() {
    }

    public UserRegistrationWrapper(User user, House house) {
        this.user = user;
        this.house = house;
    }

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

