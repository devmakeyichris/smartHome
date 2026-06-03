package com.stage.smarthome.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.stage.smarthome.entity.RfidCard;
import com.stage.smarthome.service.RfidCardService;

@RestController
@RequestMapping("/rfid")
public class RfidCardController {

    private final RfidCardService rfidCardService;

    public RfidCardController(RfidCardService rfidCardService) {
        this.rfidCardService = rfidCardService;
    }

    @PostMapping("/register")
    public RfidCard registerCard(@RequestBody RfidCard card) {
        return rfidCardService.registerCard(card);
    }

    @GetMapping("/all")
    public List<RfidCard> getAllCards() {
        return rfidCardService.getAllCards();
    }

    @PutMapping("/{id}/block")
    public RfidCard blockCard(@PathVariable Long id) {
        return rfidCardService.blockCard(id);
    }

    @PutMapping("/{id}/unblock")
    public RfidCard unblockCard(@PathVariable Long id) {
        return rfidCardService.unblockCard(id);
    }

    @GetMapping("/check/{uid}")
    public String checkAccess(@PathVariable String uid) {
        boolean access = rfidCardService.checkAccess(uid);

        if (access) {
            return "ACCESS_GRANTED";
        } else {
            return "ACCESS_DENIED";
        }
    }
}