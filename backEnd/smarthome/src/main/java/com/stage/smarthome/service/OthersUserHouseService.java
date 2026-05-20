package com.stage.smarthome.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.stage.smarthome.entity.House;
import com.stage.smarthome.entity.OthersUserHouse;
import com.stage.smarthome.entity.User;
import com.stage.smarthome.enumerateur.RequestStatus;
import com.stage.smarthome.enumerateur.Role;
import com.stage.smarthome.repository.HouseRepository;
import com.stage.smarthome.repository.OthersUserHouseRepository;
import com.stage.smarthome.repository.UserRepository;

@Service
public class OthersUserHouseService {
    @Autowired
    private OthersUserHouseRepository othersUserHouseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HouseRepository houseRepository;

    // Premier utilisateur qui crée la maison
    public OthersUserHouse registerWithHouse(User user, House house) {
        houseRepository.save(house);

        userRepository.save(user);

        OthersUserHouse othersUserHouse = new OthersUserHouse();
        othersUserHouse.setUser(user);
        othersUserHouse.setHouse(house);
        othersUserHouse.setRole(Role.OWNER);
        othersUserHouse.setStatus(RequestStatus.APPROVED);

        return othersUserHouseRepository.save(othersUserHouse);
    }

      // Autres utilisateurs qui demandent à rejoindre une maison
    public OthersUserHouse requestJoinHouse(User user, Long houseId) {
        House house = houseRepository.findById(houseId)
                .orElseThrow(() -> new RuntimeException("Maison introuvable"));

        userRepository.save(user);

        OthersUserHouse othersUserHouse = new OthersUserHouse();
        othersUserHouse.setUser(user);
        othersUserHouse.setHouse(house);
        othersUserHouse.setRole(Role.MEMBER);
        othersUserHouse.setStatus(RequestStatus.PENDING);

        return othersUserHouseRepository.save(othersUserHouse);
    }

    public String generateInvitationLink(House house) {
    return "https://app.com/join?houseId=" + house.getId();
}


    
    // Validation par le propriétaire
    public OthersUserHouse approveJoinRequest(Long othersUserHouseId, boolean approved) {

        OthersUserHouse othersUserHouse = othersUserHouseRepository.findById(othersUserHouseId)
                .orElseThrow(() -> new RuntimeException("Demande introuvable"));

        if (approved) {
            othersUserHouse.setStatus(RequestStatus.APPROVED);
        } else {
            othersUserHouse.setStatus(RequestStatus.REJECTED);
        }

        return othersUserHouseRepository.save(othersUserHouse);
    }

    
}
