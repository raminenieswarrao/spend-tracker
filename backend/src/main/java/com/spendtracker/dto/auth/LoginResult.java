package com.spendtracker.dto.auth;

public record LoginResult(
        AuthResponse user,
        String accessToken,
        String refreshToken
) {
}