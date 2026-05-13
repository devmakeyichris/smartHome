package com.stage.smarthome.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.stage.smarthome.entity.Room;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByUserId(Long userId);
}
