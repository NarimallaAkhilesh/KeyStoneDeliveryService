package com.KeyStone.DeliveryService.exception;

public class SiteNotFoundException extends RuntimeException {

    public SiteNotFoundException(String message) {
        super(message);
    }
}
