package com.stage.smarthome.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.stage.smarthome.service.ArduinoService;

@RestController
@RequestMapping("/arduino")
public class ArduinoController {

    private final ArduinoService arduinoService;

    public ArduinoController(ArduinoService arduinoService) {
        this.arduinoService = arduinoService;
    }

    @PostMapping("/light/on")
    public ResponseEntity<?> lightOn() {
        try {
            arduinoService.lightOn();
            return ResponseEntity.ok(Map.of("message", "Lumière allumée"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/light/off")
    public ResponseEntity<?> lightOff() {
        try {
            arduinoService.lightOff();
            return ResponseEntity.ok(Map.of("message", "Lumière éteinte"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/door/open")
    public ResponseEntity<?> doorOpen() {
        try {
            arduinoService.doorOpen();
            return ResponseEntity.ok(Map.of("message", "Porte ouverte"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/door/close")
    public ResponseEntity<?> doorClose() {
        try {
            arduinoService.doorClose();
            return ResponseEntity.ok(Map.of("message", "Porte fermée"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}