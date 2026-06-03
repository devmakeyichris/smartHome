package com.stage.smarthome.entity;

import jakarta.persistence.*;

@Entity
public class RfidCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String uid;

    private boolean active = true; // true = autorisée, false = bloquée

    @ManyToOne(fetch = FetchType.EAGER)
    private User owner;

    public Long getId() {
        return id;
    }

    public String getUid() {
        return uid;
    }

    public boolean isActive() {
        return active;
    }

    public User getOwner() {
        return owner;
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

    public void setOwner(User owner) {
        this.owner = owner;
    }
}