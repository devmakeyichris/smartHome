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

import com.stage.smarthome.entity.Room;
import com.stage.smarthome.service.RoomService;

@RestController
@RequestMapping("/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

     // Récupérer toutes les pièces d’un utilisateur
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Room>> getRoomsByUser(@PathVariable Long userId) {
        List<Room> rooms = roomService.getRoomsByUser(userId);
        return rooms.isEmpty()
                ? ResponseEntity.status(HttpStatus.NOT_FOUND).build()
                : ResponseEntity.ok(rooms);
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

