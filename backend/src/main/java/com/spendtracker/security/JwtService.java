package com.spendtracker.security;

import com.spendtracker.model.User;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
public class JwtService {

    private static final Duration ACCESS_TOKEN_DURATION =
            Duration.ofMinutes(15);

    private static final String ISSUER =
            "spend-tracker-api";

    private final JwtEncoder jwtEncoder;

    public JwtService(JwtEncoder jwtEncoder) {
        this.jwtEncoder = jwtEncoder;
    }

    public String generateAccessToken(User user) {

        Instant now = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ISSUER)
                .issuedAt(now)
                .expiresAt(now.plus(ACCESS_TOKEN_DURATION))

                /*
                 * Use internal user ID as the subject.
                 * We intentionally do not put the user's email
                 * or password-related data inside the JWT.
                 */
                .subject(String.valueOf(user.getId()))

                // Unique ID for this specific token.
                .id(UUID.randomUUID().toString())

                // Used later for authorization.
                .claim("role", user.getRole().name())

                .build();

        JwsHeader header = JwsHeader
                .with(MacAlgorithm.HS256)
                .type("JWT")
                .build();

        return jwtEncoder
                .encode(
                        JwtEncoderParameters.from(
                                header,
                                claims
                        )
                )
                .getTokenValue();
    }
}