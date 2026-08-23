package com.spendtracker.service;

import com.spendtracker.model.RefreshToken;
import com.spendtracker.model.User;
import com.spendtracker.repository.RefreshTokenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
public class RefreshTokenService {

    private static final Duration REFRESH_TOKEN_DURATION =
            Duration.ofDays(7);

    private static final int REFRESH_TOKEN_BYTES =
            32;

    private final RefreshTokenRepository refreshTokenRepository;
    private final SecureRandom secureRandom;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository
    ) {
        this.refreshTokenRepository =
                refreshTokenRepository;

        this.secureRandom =
                new SecureRandom();
    }

    @Transactional
    public String createRefreshToken(
            User user
    ) {

        /*
         * Generate 256 bits of cryptographically secure
         * random data for the refresh token.
         */
        String rawToken =
                generateSecureToken();

        /*
         * Store only the SHA-256 hash.
         *
         * The raw token exists only in the browser cookie.
         */
        String tokenHash =
                hashToken(rawToken);

        RefreshToken refreshToken =
                new RefreshToken();

        refreshToken.setUser(user);
        refreshToken.setTokenHash(tokenHash);

        refreshToken.setExpiresAt(
                Instant.now()
                        .plus(
                                REFRESH_TOKEN_DURATION
                        )
        );

        refreshToken.setRevoked(false);
        refreshToken.setRevokedAt(null);

        refreshTokenRepository.save(
                refreshToken
        );

        return rawToken;
    }

    @Transactional
    public Optional<User> consumeRefreshToken(
            String rawToken
    ) {

        if (rawToken == null
                || rawToken.isBlank()) {

            return Optional.empty();
        }

        String tokenHash =
                hashToken(rawToken);

        Optional<RefreshToken> optionalToken =
                refreshTokenRepository
                        .findByTokenHash(
                                tokenHash
                        );

        if (optionalToken.isEmpty()) {

            /*
             * We cannot determine which user an unknown token
             * belonged to, so simply reject it.
             */
            return Optional.empty();
        }

        RefreshToken refreshToken =
                optionalToken.get();

        Instant now =
                Instant.now();

        /*
         * SECURITY:
         *
         * A previously revoked refresh token is being used again.
         *
         * For rotated tokens this can indicate that an old token
         * was copied and replayed.
         *
         * Revoke every currently active refresh token belonging
         * to this user.
         */
        if (refreshToken.isRevoked()) {

            revokeAllForUserInternal(
                    refreshToken
                            .getUser()
                            .getId(),
                    now
            );

            return Optional.empty();
        }

        /*
         * Expired refresh tokens cannot be used.
         */
        if (!refreshToken
                .getExpiresAt()
                .isAfter(now)) {

            refreshToken.setRevoked(true);
            refreshToken.setRevokedAt(now);

            refreshTokenRepository.save(
                    refreshToken
            );

            return Optional.empty();
        }

        User user =
                refreshToken.getUser();

        /*
         * Disabled accounts cannot obtain new access tokens.
         */
        if (!user.isEnabled()) {

            refreshToken.setRevoked(true);
            refreshToken.setRevokedAt(now);

            refreshTokenRepository.save(
                    refreshToken
            );

            revokeAllForUserInternal(
                    user.getId(),
                    now
            );

            return Optional.empty();
        }

        /*
         * Rotate the refresh token.
         *
         * A refresh token is single-use.
         */
        refreshToken.setRevoked(true);
        refreshToken.setRevokedAt(now);

        refreshTokenRepository.save(
                refreshToken
        );

        return Optional.of(user);
    }

    @Transactional
    public void revokeRefreshToken(
            String rawToken
    ) {

        if (rawToken == null
                || rawToken.isBlank()) {

            return;
        }

        String tokenHash =
                hashToken(rawToken);

        refreshTokenRepository
                .findByTokenHash(tokenHash)
                .ifPresent(refreshToken -> {

                    if (!refreshToken.isRevoked()) {

                        Instant now =
                                Instant.now();

                        refreshToken.setRevoked(true);
                        refreshToken.setRevokedAt(now);

                        refreshTokenRepository.save(
                                refreshToken
                        );
                    }
                });
    }

    @Transactional
    public void revokeAllForUser(
            Long userId
    ) {

        revokeAllForUserInternal(
                userId,
                Instant.now()
        );
    }

    public Duration getRefreshTokenDuration() {

        return REFRESH_TOKEN_DURATION;
    }

    private void revokeAllForUserInternal(
            Long userId,
            Instant revokedAt
    ) {

        List<RefreshToken> refreshTokens =
                refreshTokenRepository
                        .findAllByUserId(
                                userId
                        );

        for (RefreshToken refreshToken
                : refreshTokens) {

            if (!refreshToken.isRevoked()) {

                refreshToken.setRevoked(true);
                refreshToken.setRevokedAt(
                        revokedAt
                );
            }
        }

        refreshTokenRepository.saveAll(
                refreshTokens
        );
    }

    private String generateSecureToken() {

        byte[] randomBytes =
                new byte[
                        REFRESH_TOKEN_BYTES
                        ];

        secureRandom.nextBytes(
                randomBytes
        );

        return Base64
                .getUrlEncoder()
                .withoutPadding()
                .encodeToString(
                        randomBytes
                );
    }

    private String hashToken(
            String rawToken
    ) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance(
                            "SHA-256"
                    );

            byte[] hash =
                    digest.digest(
                            rawToken.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            return toHex(hash);

        } catch (NoSuchAlgorithmException exception) {

            throw new IllegalStateException(
                    "SHA-256 algorithm is unavailable",
                    exception
            );
        }
    }

    private String toHex(
            byte[] bytes
    ) {

        StringBuilder builder =
                new StringBuilder(
                        bytes.length * 2
                );

        for (byte value : bytes) {

            builder.append(
                    String.format(
                            "%02x",
                            value & 0xff
                    )
            );
        }

        return builder.toString();
    }
}