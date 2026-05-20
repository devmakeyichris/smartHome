package com.stage.smarthome.controller;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.stage.smarthome.entity.RfidCard;
import com.stage.smarthome.service.RfidCardService;

@RestController
@RequestMapping("/rfid")
public class RfidCardController {

    @Autowired
    private RfidCardService rfidCardService;

    // Enregistrer une nouvelle carte
    @PostMapping("/register")
    public RfidCard registerCard(@RequestBody RfidCard card) {
        return rfidCardService.registerCard(card);
    }

    // Récupérer toutes les cartes
    @GetMapping("/all")
    public List<RfidCard> getAllCards() {
        return rfidCardService.getAllCards();
    }

    // Vérifier une carte par UID
    @GetMapping("/{uid}")
    public Optional<RfidCard> getCardByUid(@PathVariable String uid) {
        return rfidCardService.findByUid(uid);
    }
}
