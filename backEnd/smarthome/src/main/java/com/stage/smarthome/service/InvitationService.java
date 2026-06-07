package com.stage.smarthome.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.stage.smarthome.entity.House;
import com.stage.smarthome.entity.Invitation;
import com.stage.smarthome.entity.OthersUserHouse;
import com.stage.smarthome.entity.User;
import com.stage.smarthome.enumerateur.RequestStatus;
import com.stage.smarthome.enumerateur.Role;
import com.stage.smarthome.repository.HouseRepository;
import com.stage.smarthome.repository.InvitationRepository;
import com.stage.smarthome.repository.OthersUserHouseRepository;
import com.stage.smarthome.repository.UserRepository;
import com.stage.smarthome.runtime.EmailAlreadyUsedException;

@Service
public class InvitationService {
    
    private final InvitationRepository invitationRepository;
    private final HouseRepository houseRepository;
    private final UserRepository userRepository;
    private final OthersUserHouseRepository othersUserHouseRepository;
    private final PasswordEncoder passwordEncoder;
    
    public InvitationService(
    InvitationRepository invitationRepository,
    HouseRepository houseRepository,
    UserRepository userRepository,
    OthersUserHouseRepository othersUserHouseRepository,
    PasswordEncoder passwordEncoder
    ) {
        this.invitationRepository = invitationRepository;
        this.houseRepository = houseRepository;
        this.userRepository = userRepository;
        this.othersUserHouseRepository = othersUserHouseRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    public String createInvitation(Long houseId) {
        House house = houseRepository.findById(houseId)
        .orElseThrow(() -> new RuntimeException("Maison introuvable"));
        
        Invitation invitation = new Invitation();
        invitation.setToken(UUID.randomUUID().toString());
        invitation.setHouse(house);
        invitation.setExpiresAt(LocalDateTime.now().plusHours(24));
        invitation.setUsed(false);
        
        invitationRepository.save(invitation);
        
        return "http://localhost:5173/invitation/" + invitation.getToken();
    }
    
    
    public void joinWithToken(String token, User user) {
        Invitation invitation = invitationRepository.findByToken(token)
        .orElseThrow(() -> new RuntimeException("Invitation invalide"));
        
        if (invitation.isUsed()) {
            throw new RuntimeException("Invitation déjà utilisée");
        }
        
        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invitation expirée");
        }
        
        User savedUser = userRepository.findByEmail(user.getEmail())
        .orElseGet(() -> {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            return userRepository.save(user);
        });
        
        boolean alreadyLinked = othersUserHouseRepository
        .findByUser(savedUser)
        .stream()
        .anyMatch(rel ->
        rel.getHouse().getId().equals(invitation.getHouse().getId())
        );
        
        if (alreadyLinked) {
            throw new RuntimeException(
            "Cet utilisateur est déjà lié à cette maison"
            );
        }
        
        OthersUserHouse relation = new OthersUserHouse();
        relation.setUser(savedUser);
        relation.setHouse(invitation.getHouse());
        relation.setRole(Role.MEMBER);
        relation.setStatus(RequestStatus.PENDING);
        
        othersUserHouseRepository.save(relation);
        
        invitation.setUsed(true);
        invitationRepository.save(invitation);
    }
}