package com.stage.smarthome.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stage.smarthome.dto.RfidCardRequest;
import com.stage.smarthome.dto.RfidCardResponse;
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
    public ResponseEntity<?> registerCard(@RequestBody RfidCardRequest request) {
        try {
            RfidCard savedCard = rfidCardService.registerCard(request);
            return ResponseEntity.ok(new RfidCardResponse(savedCard));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/all")
    public List<RfidCardResponse> getAllCards() {
        return rfidCardService.getAllCards()
                .stream()
                .map(RfidCardResponse::new)
                .toList();
    }

    @PutMapping("/{id}/block")
    public RfidCardResponse blockCard(@PathVariable Long id) {
        return new RfidCardResponse(rfidCardService.blockCard(id));
    }

    @PutMapping("/{id}/unblock")
    public RfidCardResponse unblockCard(@PathVariable Long id) {
        return new RfidCardResponse(rfidCardService.unblockCard(id));
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