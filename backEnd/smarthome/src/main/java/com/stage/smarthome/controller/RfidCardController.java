package com.stage.smarthome.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<?> registerCard(@RequestBody RfidCard card) {
        try {
            RfidCard savedCard = rfidCardService.registerCard(card);
            return ResponseEntity.status(HttpStatus.CREATED)
            .body(new RfidCardResponse(savedCard));
            
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(e.getMessage());
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
        RfidCard card = rfidCardService.blockCard(id);
        return new RfidCardResponse(card);
    }
    
    @GetMapping("/house/{houseId}")
    public List<RfidCardResponse> getCardsByHouse(@PathVariable Long houseId) {
        return rfidCardService.getCardsByHouse(houseId)
        .stream()
        .map(RfidCardResponse::new)
        .toList();
    }
    
    @PutMapping("/{id}/unblock")
    public RfidCardResponse unblockCard(@PathVariable Long id) {
        RfidCard card = rfidCardService.unblockCard(id);
        return new RfidCardResponse(card);
    }
    
    @GetMapping("/check/{uid}")
    public String checkAccess(@PathVariable String uid) {
        boolean access = rfidCardService.checkAccess(uid);
        return access ? "ACCESS_GRANTED" : "ACCESS_DENIED";
    }

    
}