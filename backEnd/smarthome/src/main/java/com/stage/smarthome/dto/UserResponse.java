package com.stage.smarthome.dto;

import com.stage.smarthome.entity.House;
import com.stage.smarthome.entity.User;

public class UserResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    
    
    private HouseResponse house;
    
    public UserResponse(User user, House house) {
        this.id = user.getId();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.email = user.getEmail();
        this.house = new HouseResponse(house); 
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public HouseResponse getHouse() {
        return house;
    }

    public void setHouse(HouseResponse house) {
        this.house = house;
    }
























    
}

