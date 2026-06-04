package com.stage.smarthome.entity;

import java.util.List;
import java.util.ArrayList;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import com.fasterxml.jackson.annotation.JsonIgnore;

/// ajout de la classe House pour ajouter une relation avec Room

@Entity
public class House {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "house_name")
    private String houseName;
    
    
    
    @JsonIgnore
    @OneToMany(mappedBy = "house", cascade = CascadeType.ALL)
    private List<OthersUserHouse> userRelations = new ArrayList<>();
    
    @OneToMany(mappedBy = "house", cascade = CascadeType.ALL)
    private List<Room> rooms = new ArrayList<>();
    
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
    
    
    
    public List<Room> getRooms() {
        return rooms;
    }
    
    public void setRooms(List<Room> rooms) {
        this.rooms = rooms;
    }
    
    public List<OthersUserHouse> getUserRelations() {
        return userRelations;
    }
    
    public void setUserRelations(List<OthersUserHouse> userRelations) {
        this.userRelations = userRelations;
    }
    
}
