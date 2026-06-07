package com.stage.smarthome.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stage.smarthome.entity.User;
import com.stage.smarthome.runtime.EmailAlreadyUsedException;
import com.stage.smarthome.service.InvitationService;

@RestController
@RequestMapping("/invitations")
public class InvitationController {
    
    private final InvitationService invitationService;
    
    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }
    
    @PostMapping("/house/{houseId}")
    public ResponseEntity<?> createInvitation(@PathVariable Long houseId) {
        String link = invitationService.createInvitation(houseId);
        return ResponseEntity.ok(Map.of("invitationLink", link));
    }
    
    @PostMapping("/join/{token}")
    public ResponseEntity<?> joinWithToken(
    @PathVariable String token,
    @RequestBody User user
    ) {
        try {
            
            invitationService.joinWithToken(token, user);
            
            return ResponseEntity.status(HttpStatus.CREATED)
            .body(Map.of("message", "Demande envoyée"));
            
        } catch (EmailAlreadyUsedException e) {
            
            return ResponseEntity.badRequest()
            .body(Map.of(
            "message",
            "Cet email est déjà utilisé"
            ));
        }
    }
}