package com.stage.smarthome.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class RfidCard {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String uid;
    
    private String name;
    
    private boolean active = true; // true = autorisée, false = bloquée
    
    @ManyToOne
    @JoinColumn(name = "house_id")
    private House house;
    
    public Long getId() {
        return id;
    }
    
    public String getUid() {
        return uid;
    }
    
    public boolean isActive() {
        return active;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public void setUid(String uid) {
        this.uid = uid;
    }
    
    public void setActive(boolean active) {
        this.active = active;
    }
    
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }

    public House getHouse() {
        return house;
    }

    public void setHouse(House house) {
        this.house = house;
    }
}