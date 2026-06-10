package com.stage.smarthome.dto;

import com.stage.smarthome.entity.OthersUserHouse;

public class JoinRequestResponse {

    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private Long houseId;
    private String status;
    private String role;

    public JoinRequestResponse(OthersUserHouse relation) {
        this.id = relation.getId();

        if (relation.getUser() != null) {
            this.userId = relation.getUser().getId();
            this.firstName = relation.getUser().getFirstName();
            this.lastName = relation.getUser().getLastName();
            this.email = relation.getUser().getEmail();
        }

        if (relation.getHouse() != null) {
            this.houseId = relation.getHouse().getId();
        }

        this.status = relation.getStatus().name();
        this.role = relation.getRole().name();
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public Long getHouseId() {
        return houseId;
    }

    public String getStatus() {
        return status;
    }

    public String getRole() {
        return role;
    }
}