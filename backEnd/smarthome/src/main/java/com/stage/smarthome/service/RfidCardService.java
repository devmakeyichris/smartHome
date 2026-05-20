package com.stage.smarthome.service;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.stage.smarthome.entity.RfidCard;
import com.stage.smarthome.repository.RfidCardRepository;

@Service
public class RfidCardService {

    @Autowired
    private RfidCardRepository rfidCardRepository;

    public RfidCard registerCard(RfidCard card) {
        return rfidCardRepository.save(card);
    }

    public Optional<RfidCard> findByUid(String uid) {
        return rfidCardRepository.findByUid(uid);
    }

    public java.util.List<RfidCard> getAllCards() {
        return rfidCardRepository.findAll();
    }
}
