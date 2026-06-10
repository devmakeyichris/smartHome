package com.stage.smarthome.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.stage.smarthome.dto.RfidCardRequest;
import com.stage.smarthome.entity.House;
import com.stage.smarthome.entity.RfidCard;
import com.stage.smarthome.repository.HouseRepository;
import com.stage.smarthome.repository.RfidCardRepository;

@Service
public class RfidCardService {
    
    private final RfidCardRepository rfidCardRepository;
    private final HouseRepository houseRepository;
    
    public RfidCardService(RfidCardRepository rfidCardRepository,HouseRepository houseRepository) {
        this.rfidCardRepository = rfidCardRepository;
        this.houseRepository = houseRepository;
    }
    
    public RfidCard registerCard(RfidCardRequest request) {
        if (request.getHouseId() == null) {
            throw new RuntimeException("Maison obligatoire pour enregistrer une carte RFID");
        }
        
        House house = houseRepository.findById(request.getHouseId())
        .orElseThrow(() -> new RuntimeException("Maison introuvable"));
        
        String uid = request.getUid()
        .trim()
        .replace(" ", "")
        .toUpperCase();
        
        RfidCard card = new RfidCard();
        card.setUid(uid);
        card.setName(request.getName());
        card.setHouse(house);
        card.setActive(true);
        
        if (rfidCardRepository.existsByUidAndHouse_Id(uid, request.getHouseId())) {
            throw new RuntimeException("Cette carte RFID est déjà enregistrée pour cette maison.");
        }
        return rfidCardRepository.save(card);
    }
    public List<RfidCard> getCardsByHouse(Long houseId) {
        return rfidCardRepository.findByHouseId(houseId);
    }
    
    public Optional<RfidCard> findByUid(String uid) {
    uid = uid.trim().replace(" ", "").toUpperCase();
    return rfidCardRepository.findByUid(uid);
}
    
    public List<RfidCard> getAllCards() {
        return rfidCardRepository.findAll();
    }
    
    public RfidCard blockCard(Long cardId) {
        RfidCard card = rfidCardRepository.findById(cardId)
        .orElseThrow(() -> new RuntimeException("Carte RFID introuvable"));
        
        card.setActive(false);
        return rfidCardRepository.save(card);
    }
    
    public RfidCard unblockCard(Long cardId) {
        RfidCard card = rfidCardRepository.findById(cardId)
        .orElseThrow(() -> new RuntimeException("Carte RFID introuvable"));
        
        card.setActive(true);
        return rfidCardRepository.save(card);
    }
    
    public boolean checkAccess(String uid) {
        RfidCard card = rfidCardRepository.findByUid(uid)
        .orElseThrow(() -> new RuntimeException("Carte inconnue"));
        
        return card.isActive();
    }
}