package com.stage.smarthome.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stage.smarthome.dto.RoomResponse;
import com.stage.smarthome.entity.Room;
import com.stage.smarthome.service.RoomService;

@RestController
@RequestMapping("/rooms")
public class RoomController {
    
    private final RoomService roomService;
    
    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }
    
    // Récupérer toutes les pièces d’un @GetMapping("/home/{homeId}")
    // Récupérer toutes les pièces d’une maison
    @GetMapping("/home/{homeId}")
    public ResponseEntity<?> getRoomsByHome(@PathVariable Long homeId) {
        List<Room> rooms = roomService.getRoomsHome(homeId);
        
        if (rooms.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body("Aucune pièce trouvée pour cette maison");
        }
        
        List<RoomResponse> response = rooms.stream()
        .map(RoomResponse::new)
        .toList();
        
        return ResponseEntity.ok(response);
    }
    
    // Ajouter une pièce
    @PostMapping
    public ResponseEntity<Room> addRoom(@RequestBody Room room) {
        Room savedRoom = roomService.addRoom(room);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedRoom);
    }
    
    
    // Supprimer une pièce
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}

