package com.stage.smarthome.service;

import org.springframework.security.crypto.password.PasswordEncoder;
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
    
    private final OthersUserHouseRepository othersUserHouseRepository;
    private final UserRepository userRepository;
    private final HouseRepository houseRepository;
    private final PasswordEncoder passwordEncoder;
    
    public OthersUserHouseService(
    OthersUserHouseRepository othersUserHouseRepository,
    UserRepository userRepository,
    HouseRepository houseRepository,
    PasswordEncoder passwordEncoder
    ) {
        this.othersUserHouseRepository = othersUserHouseRepository;
        this.userRepository = userRepository;
        this.houseRepository = houseRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    public OthersUserHouse registerWithHouse(User user, House house) {
        
        House savedHouse = houseRepository.save(house);
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        
        OthersUserHouse othersUserHouse = new OthersUserHouse();
        othersUserHouse.setUser(savedUser);
        othersUserHouse.setHouse(savedHouse);
        othersUserHouse.setRole(Role.OWNER);
        othersUserHouse.setStatus(RequestStatus.APPROVED);
        
        return othersUserHouseRepository.save(othersUserHouse);
    }
    
    
    
    
    public OthersUserHouse requestJoinHouse(User user, Long houseId) {
        
        House house = houseRepository.findById(houseId)
        .orElseThrow(() -> new RuntimeException("Maison introuvable"));
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        
        OthersUserHouse othersUserHouse = new OthersUserHouse();
        othersUserHouse.setUser(savedUser);
        othersUserHouse.setHouse(house);
        othersUserHouse.setRole(Role.MEMBER);
        othersUserHouse.setStatus(RequestStatus.PENDING);
        
        return othersUserHouseRepository.save(othersUserHouse);
    }
    
    
    
    public java.util.List<OthersUserHouse> getPendingRequestsByHouse(Long houseId) {
        return othersUserHouseRepository.findByHouse_IdAndStatus(houseId, RequestStatus.PENDING);
    }
    
    public String generateInvitationLink(House house) {
        return "http://localhost:5173/register?houseId=" + house.getId();
    }
    

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