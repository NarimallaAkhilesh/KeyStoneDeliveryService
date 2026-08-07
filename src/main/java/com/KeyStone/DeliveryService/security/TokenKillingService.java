package com.KeyStone.DeliveryService.security;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

@Component
public class TokenKillingService {

    private final Set<String> blockToken = ConcurrentHashMap.newKeySet();

    public void blockTokenProcess(String token) {
        blockToken.add(token);
    }

    public boolean isBlockToken(String token) {
        return blockToken.contains(token);
    }
}
