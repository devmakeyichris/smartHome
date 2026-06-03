package com.stage.smarthome.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.stage.smarthome.entity.RfidCard;
import com.stage.smarthome.repository.RfidCardRepository;

@Service
public class RfidCardService {

    private final RfidCardRepository rfidCardRepository;

    public RfidCardService(RfidCardRepository rfidCardRepository) {
        this.rfidCardRepository = rfidCardRepository;
    }

    public RfidCard registerCard(RfidCard card) {
        card.setActive(true);
        return rfidCardRepository.save(card);
    }

    public Optional<RfidCard> findByUid(String uid) {
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