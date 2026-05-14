package com.stage.smarthome.entity;

import java.util.List;

import jakarta.persistence.*;

/// ajout de la classe House pour ajouter une relation avec Room

@Entity
public class House {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String HouseName;

    
    @OneToMany(mappedBy = "house", cascade = CascadeType.ALL)
    private List<OthersUserHouse> userRelations;

    @OneToMany(mappedBy = "house", cascade = CascadeType.ALL)
    private List<Room> rooms;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getHouseName() {
        return HouseName;
    }

    public void setHouseName(String houseName) {
        HouseName = houseName;
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
