package com.stage.smarthome.dto;

import com.stage.smarthome.entity.RfidCard;

public class RfidCardResponse {
    private Long id;
    private String uid;
    private Long ownerId;
    private String ownerFirstName;
    private String ownerLastName;
    private String ownerEmail;

    public RfidCardResponse(RfidCard card) {
        this.id = card.getId();
        this.uid = card.getUid();
        if (card.getOwner() != null) {
            this.ownerId = card.getOwner().getId();
            this.ownerFirstName = card.getOwner().getFirstName();
            this.ownerLastName = card.getOwner().getLastName();
            this.ownerEmail = card.getOwner().getEmail();
        }
    }
}
