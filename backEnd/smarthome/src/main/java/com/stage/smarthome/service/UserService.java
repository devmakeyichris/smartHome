package com.stage.smarthome.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.stage.smarthome.entity.User;
import com.stage.smarthome.repository.DeviceRepository;
import com.stage.smarthome.repository.UserRepository;
import com.stage.smarthome.runtime.EmailAlreadyUsedException;

@Service
public class UserService {

    private final UserRepository userRepository;


    public UserService(UserRepository userRepository, DeviceRepository deviceRepository, DeviceService deviceService) {
        this.userRepository = userRepository;
    }

    

    public User registerUser(User user) {
        userRepository.findByEmail(user.getEmail()).ifPresent(u -> {
            throw new EmailAlreadyUsedException();
        });
        return userRepository.save(user);
    }

    // Chercher un utilisateur par email (utile pour login)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // Récupérer un utilisateur par id
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
}
