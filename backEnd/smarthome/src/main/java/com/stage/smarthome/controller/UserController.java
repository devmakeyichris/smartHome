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

import com.stage.smarthome.dto.UserRegistrationWrapper;
import com.stage.smarthome.dto.UserResponse;
import com.stage.smarthome.entity.User;
import com.stage.smarthome.runtime.EmailAlreadyUsedException;
import com.stage.smarthome.service.UserService;

@RestController
@RequestMapping("/users")
public class UserController {
    
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRegistrationWrapper wrapper) {
        try {
            User savedUser = userService.registerUserWithHouse(wrapper.getUser(), wrapper.getHouse());
            UserResponse response = new UserResponse(savedUser, wrapper.getHouse());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (EmailAlreadyUsedException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
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
}
