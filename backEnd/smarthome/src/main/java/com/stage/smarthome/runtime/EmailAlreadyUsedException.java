package com.stage.smarthome.runtime;

public class EmailAlreadyUsedException extends RuntimeException {
    
    public EmailAlreadyUsedException() {
        super("Email is already in use!");
    }

}
