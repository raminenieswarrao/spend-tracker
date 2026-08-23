package com.spendtracker.dto.auth;

public record RefreshResult(
        String accessToken,
        String refreshToken
) {
}