package com.stage.smarthome.entity;

import com.stage.smarthome.enumerateur.RequestStatus;
import com.stage.smarthome.enumerateur.Role;

import jakarta.persistence.*;

@Entity
public class OthersUserHouse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    private House house;

    @Enumerated(EnumType.STRING)
    private Role role; // OWNER ou MEMBER


    @Enumerated(EnumType.STRING)
    private RequestStatus status; // PENDING, APPROVED, REJECTED


    public Long getId() {
        return id;
    }


    public User getUser() {
        return user;
    }


    public House getHouse() {
        return house;
    }


    public Role getRole() {
        return role;
    }


    public RequestStatus getStatus() {
        return status;
    }


    public void setId(Long id) {
        this.id = id;
    }


    public void setUser(User user) {
        this.user = user;
    }


    public void setHouse(House house) {
        this.house = house;
    }


    public void setRole(Role role) {
        this.role = role;
    }


    public void setStatus(RequestStatus status) {
        this.status = status;
    }
    
}
