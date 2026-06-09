package com.stage.smarthome.dto;

import com.stage.smarthome.entity.RfidCard;

public class RfidCardResponse {

    private Long id;
    private String uid;
    private String name;
    private boolean active;
    private Long houseId;

    public RfidCardResponse(RfidCard card) {
        this.id = card.getId();
        this.uid = card.getUid();
        this.name = card.getName();
        this.active = card.isActive();

        if (card.getHouse() != null) {
            this.houseId = card.getHouse().getId();
        }
    }

    public Long getId() {
        return id;
    }

    public String getUid() {
        return uid;
    }

    public String getName() {
        return name;
    }

    public boolean isActive() {
        return active;
    }

    public Long getHouseId() {
        return houseId;
    }
}