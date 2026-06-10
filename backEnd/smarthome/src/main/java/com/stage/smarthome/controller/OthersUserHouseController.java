package com.stage.smarthome.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.stage.smarthome.dto.JoinRequestResponse;
import com.stage.smarthome.dto.RegisterWithHouseRequest;
import com.stage.smarthome.entity.House;
import com.stage.smarthome.entity.OthersUserHouse;
import com.stage.smarthome.entity.User;
import com.stage.smarthome.service.OthersUserHouseService;

@RestController
@RequestMapping("/othersUserHouse")
public class OthersUserHouseController {
    
    @Autowired
    private OthersUserHouseService othersUserHouseService;
    
    @PostMapping("/registerWithHouse")
    public ResponseEntity<Map<String, Object>> registerWithHouse(@RequestBody RegisterWithHouseRequest request) {
        User user = request.getUser();
        House house = request.getHouse();
        
        OthersUserHouse relation = othersUserHouseService.registerWithHouse(user, house);
        
        // Génération du lien via le service
        String invitationLink = othersUserHouseService.generateInvitationLink(house);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Maison créée avec succès");
        response.put("houseId", house.getId());
        response.put("invitationLink", invitationLink);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
   
    // Autres utilisateurs demandent à rejoindre une maison
    @PostMapping("/requestJoinHouse/{houseId}")
    public ResponseEntity<OthersUserHouse> requestJoinHouse(@PathVariable Long houseId, @RequestBody User user) {
        OthersUserHouse othersUserHouse = othersUserHouseService.requestJoinHouse(user, houseId);
        return ResponseEntity.status(HttpStatus.CREATED).body(othersUserHouse);
    }
    
    // Propriétaire approuve ou rejette la demande
    @PostMapping("/approveJoinRequest/{userHouseId}")
    public ResponseEntity<JoinRequestResponse> approveJoinRequest(
    @PathVariable Long userHouseId,
    @RequestParam boolean approved
    ) {
        OthersUserHouse othersUserHouse = othersUserHouseService.approveJoinRequest(userHouseId, approved);
        return ResponseEntity.ok(new JoinRequestResponse(othersUserHouse));
    }
    
    @GetMapping("/pending/{houseId}")
    public ResponseEntity<List<JoinRequestResponse>> getPendingRequests(@PathVariable Long houseId) {
        List<JoinRequestResponse> requests = othersUserHouseService.getPendingRequestsByHouse(houseId)
        .stream()
        .map(JoinRequestResponse::new)
        .toList();
        
        return ResponseEntity.ok(requests);
    }
}
