package com.stage.smarthome.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.stage.smarthome.dto.RfidCardRequest;
import com.stage.smarthome.dto.RfidCardResponse;
import com.stage.smarthome.entity.RfidCard;
import com.stage.smarthome.service.RfidCardService;
import com.stage.smarthome.dto.RfidCardRequest;
import org.springframework.http.ResponseEntity;

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
        return ResponseEntity.ok(savedCard);
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