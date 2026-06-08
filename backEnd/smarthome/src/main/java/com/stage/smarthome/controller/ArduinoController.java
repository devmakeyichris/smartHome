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

    @PostMapping("/light/{pin}/{action}")
    public ResponseEntity<?> controlLight(
            @PathVariable int pin,
            @PathVariable String action
    ) {
        if (action.equalsIgnoreCase("on")) {
            arduinoService.lightOn(pin);
            return ResponseEntity.ok(Map.of("message", "Lumière allumée", "pin", pin));
        }

        if (action.equalsIgnoreCase("off")) {
            arduinoService.lightOff(pin);
            return ResponseEntity.ok(Map.of("message", "Lumière éteinte", "pin", pin));
        }

        return ResponseEntity.badRequest().body(Map.of("error", "Action lumière invalide"));
    }

    @PostMapping("/door/{pin}/{action}")
    public ResponseEntity<?> controlDoor(
            @PathVariable int pin,
            @PathVariable String action
    ) {
        if (action.equalsIgnoreCase("open")) {
            arduinoService.doorOpen(pin);
            return ResponseEntity.ok(Map.of("message", "Porte ouverte", "pin", pin));
        }

        if (action.equalsIgnoreCase("close") || action.equalsIgnoreCase("closed")) {
            arduinoService.doorClose(pin);
            return ResponseEntity.ok(Map.of("message", "Porte fermée", "pin", pin));
        }

        return ResponseEntity.badRequest().body(Map.of("error", "Action porte invalide"));
    }
}