package com.KeyStone.DeliveryService.security;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Component;

import com.KeyStone.DeliveryService.enums.Permissions;
import com.KeyStone.DeliveryService.entity.UserAuth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JWTUtil {

    private final SecretKey key;
    private final long validateTime = 12 * 60 * 60 * 1000L; // 12 hours

    public JWTUtil() {
        String secret = System.getenv("JWT_SECRET");

        if (secret == null || secret.isEmpty()) {
            // WARNING: Never use this fallback in production.
            // Set the JWT_SECRET environment variable to a cryptographically strong 64+ character secret.
            secret = "K3y$t0n3-D3l!v3ry-S3rv!c3-JWT-F4llb4ck-S3cr3t-K3y-F0r-D3v0nly!!";
        }

        if (secret.getBytes().length < 32) {
            throw new IllegalStateException("JWT_SECRET must be at least 32 bytes long for HMAC-SHA256");
        }

        key = Keys.hmacShaKeyFor(secret.getBytes());
    }


    public String generateToken(UserAuth user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("Role", user.getRole().name());

        Set<Permissions> perm = RoleBasedPermissions.getRoleBasedPermissions().get(user.getRole());
        if (perm != null) {
            claims.put("Permissions", perm.stream().map(Enum::name).toList());
        }

        Date now = new Date();
        Date expire = new Date(now.getTime() + validateTime);

        return Jwts.builder()
                .claims(claims)
                .subject(user.getUserEmail())
                .issuedAt(now)
                .expiration(expire)
                .signWith(key)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    public Claims getClaim(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getUserEmail(String token) {
        return getClaim(token).getSubject();
    }

    public String extractToken(String header) {
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
