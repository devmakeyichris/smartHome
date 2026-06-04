package com.stage.smarthome.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stage.smarthome.entity.Device;
import com.stage.smarthome.entity.House;
import com.stage.smarthome.entity.OthersUserHouse;
import com.stage.smarthome.entity.Room;
import com.stage.smarthome.entity.User;
import com.stage.smarthome.enumerateur.RequestStatus;
import com.stage.smarthome.enumerateur.Role;
import com.stage.smarthome.repository.DeviceRepository;
import com.stage.smarthome.repository.HouseRepository;
import com.stage.smarthome.repository.OthersUserHouseRepository;
import com.stage.smarthome.repository.RoomRepository;
import com.stage.smarthome.repository.UserRepository;
import com.stage.smarthome.runtime.EmailAlreadyUsedException;


@Service
public class UserService {
    
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final HouseRepository houseRepository;
    private final RoomRepository roomRepository;
    private final DeviceRepository deviceRepository;
    private final OthersUserHouseRepository othersUserHouseRepository;
    
    
    public UserService(PasswordEncoder passwordEncoder, UserRepository userRepository, DeviceRepository deviceRepository, 
    HouseRepository houseRepository, RoomRepository roomRepository,
    OthersUserHouseRepository othersUserHouseRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.deviceRepository = deviceRepository;
        this.houseRepository = houseRepository;
        this.roomRepository = roomRepository;
        this.othersUserHouseRepository = othersUserHouseRepository;
    }
    
    
    public User login(String email, String password) {
        
        User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("Email incorrect"));
        
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Mot de passe incorrect");
        }
        return user;
    }
    
    
    public House getHouseByEmail(String email) {
        User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));
        
        return othersUserHouseRepository.findByUser(user)
        .stream()
        .findFirst()
        .map(rel -> rel.getHouse())
        .orElseThrow(() -> new RuntimeException("House not found"));
    }
    
    
    
    
    
    public User registerUser(User user) {
        userRepository.findByEmail(user.getEmail()).ifPresent(u -> {
            throw new EmailAlreadyUsedException();
        });
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
    
    @Transactional
    public User registerUserWithHouse(User user, House house) {
        userRepository.findByEmail(user.getEmail()).ifPresent(u -> {
            throw new EmailAlreadyUsedException();
        });
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        
        if (house == null) {
            throw new RuntimeException("Maison obligatoire");
        }
        
        House savedHouse = houseRepository.save(house);
        
        if (house.getRooms() != null) {
            for (Room room : house.getRooms()) {
                room.setHouse(savedHouse);
                Room savedRoom = roomRepository.save(room);
                
                if (room.getDevices() != null) {
                    for (Device device : room.getDevices()) {
                        device.setRoom(savedRoom);
                        deviceRepository.save(device);
                    }
                }
            }
        }
        
        OthersUserHouse userHouse = new OthersUserHouse();
        userHouse.setUser(savedUser);
        userHouse.setHouse(savedHouse);
        userHouse.setRole(Role.OWNER);
        userHouse.setStatus(RequestStatus.APPROVED);
        othersUserHouseRepository.save(userHouse);
        
        return savedUser;
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
