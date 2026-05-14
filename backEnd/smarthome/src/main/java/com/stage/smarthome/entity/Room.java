package com.stage.smarthome.entity;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

//Changement de la classe Room pour ajouter une relation avec House 

@Entity
public class Room {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    @ManyToOne
    @JoinColumn(name = "house_id")
    private House house;
    
    
    @OneToMany(mappedBy = "room", cascade=CascadeType.ALL)
    private List<Device> devices;
    
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
    
    public List<Device> getDevices() {
        return devices;
    }
    
    public void setDevices(List<Device> devices) {
        this.devices = devices;
    }
    
    public House getHouse() {
        return house;
    }
    
    public void setHouse(House house) {
        this.house = house;
    }
}