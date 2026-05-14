package com.stage.smarthome.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.stage.smarthome.entity.Room;
import com.stage.smarthome.repository.RoomRepository;

@Service
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    // Récupérer toutes les pièces d’une maison
    public List<Room> getRoomsHome(Long userId) {
        return roomRepository.findByHouseId(userId);
    }

    // Ajouter une nouvelle pièce
    public Room addRoom(Room room) {
        return roomRepository.save(room);
    }

    // Supprimer une pièce
    public void deleteRoom(Long id) {
        roomRepository.deleteById(id);
    }
}
