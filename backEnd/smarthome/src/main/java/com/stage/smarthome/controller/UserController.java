package com.stage.smarthome.controller;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stage.smarthome.dto.HouseResponse;
import com.stage.smarthome.dto.UserHouseAccessResponse;
import com.stage.smarthome.dto.UserRegistrationWrapper;
import com.stage.smarthome.dto.UserResponse;
import com.stage.smarthome.entity.House;
import com.stage.smarthome.entity.OthersUserHouse;
import com.stage.smarthome.entity.User;
import com.stage.smarthome.repository.OthersUserHouseRepository;
import com.stage.smarthome.runtime.EmailAlreadyUsedException;
import com.stage.smarthome.service.UserService;


import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/users")
public class UserController {
    
    private final UserService userService;
    private final OthersUserHouseRepository othersUserHouseRepository;
    
    public UserController(UserService userService,OthersUserHouseRepository othersUserHouseRepository) {
        this.userService = userService;
        this.othersUserHouseRepository = othersUserHouseRepository;
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRegistrationWrapper wrapper) {
        try {
            User savedUser = userService.registerUserWithHouse(
            wrapper.getUser(),
            wrapper.getHouse()
            );
            
            House savedHouse = userService.getHouseByEmail(savedUser.getEmail());
            
            UserResponse response = new UserResponse(savedUser, savedHouse);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (EmailAlreadyUsedException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body("Error: " + e.getMessage());
        }
    }
    
    
    @GetMapping("/email/{email}")
    public ResponseEntity<?> getByEmail(@PathVariable String email) {
        Optional<User> userOpt = userService.findByEmail(email);
        
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(userOpt.get()); // 200 OK avec l'objet User
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found"); // 404 avec message
        }
    }
    
    
    
    @GetMapping("/email/{email}/house")
    public ResponseEntity<UserHouseAccessResponse> getUserHouseByEmail(@PathVariable String email) {
        
        OthersUserHouse relation = othersUserHouseRepository.findFirstByUser_EmailOrderByIdDesc(email)
        .orElseThrow(() -> new RuntimeException("Aucune maison associée à cet utilisateur"));
        
        HouseResponse houseResponse = new HouseResponse(relation.getHouse());
        
        UserHouseAccessResponse response = new UserHouseAccessResponse(
        houseResponse,
        relation.getRole().name(),
        relation.getStatus().name()
        );
        
        return ResponseEntity.ok(response);
    }
    
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        Optional<User> userOpt = userService.getUserById(id);
        
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(userOpt.get()); // 200 OK avec l'objet User
        }
        else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest, HttpSession session) {
        User user = userService.login(loginRequest.getEmail(), loginRequest.getPassword());
        
        session.setAttribute("userId", user.getId());
        session.setAttribute("email", user.getEmail());
        
        House house = user.getHouseRelations().get(0).getHouse();
        UserResponse response = new UserResponse(user, house);
        
        return ResponseEntity.ok(response);
    }
}
