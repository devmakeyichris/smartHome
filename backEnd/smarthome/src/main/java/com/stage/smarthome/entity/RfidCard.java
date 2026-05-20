package com.stage.smarthome.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class RfidCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String uid;
    
    //Force hibernate a ajouter lors de la presentation de la carte tous les information de l'utilisateur qui a la carte
    @ManyToOne(fetch = FetchType.EAGER)
    private User owner;
    
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getUid() {
        return uid;
    }
    
    public void setUid(String uid) {
        this.uid = uid;
    }
    
    public User getOwner() {
        return owner;
    }
    
    public void setOwner(User owner) {
        this.owner = owner;
    }
}

