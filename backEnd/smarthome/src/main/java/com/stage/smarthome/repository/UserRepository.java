package com.stage.smarthome.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.stage.smarthome.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
}
