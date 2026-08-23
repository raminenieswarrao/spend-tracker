package com.spendtracker.controller;

import com.spendtracker.dto.auth.AuthResponse;
import com.spendtracker.dto.auth.LoginRequest;
import com.spendtracker.dto.auth.LoginResult;
import com.spendtracker.dto.auth.RefreshResult;
import com.spendtracker.dto.auth.RegisterRequest;
import com.spendtracker.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String ACCESS_TOKEN_COOKIE =
            "access_token";

    private static final String REFRESH_TOKEN_COOKIE =
            "refresh_token";

    private static final Duration ACCESS_TOKEN_DURATION =
            Duration.ofMinutes(15);

    private static final Duration REFRESH_TOKEN_DURATION =
            Duration.ofDays(7);

    private static final String ACCESS_COOKIE_PATH =
            "/";

    private static final String REFRESH_COOKIE_PATH =
            "/api/auth";

    private final AuthService authService;
    private final boolean secureCookie;

    public AuthController(
            AuthService authService,
            @Value("${app.security.cookie-secure:false}")
            boolean secureCookie
    ) {
        this.authService = authService;
        this.secureCookie = secureCookie;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {

        AuthResponse response =
                authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {

        LoginResult result =
                authService.login(request);

        ResponseCookie accessTokenCookie =
                createAccessTokenCookie(
                        result.accessToken()
                );

        ResponseCookie refreshTokenCookie =
                createRefreshTokenCookie(
                        result.refreshToken()
                );

        return ResponseEntity
                .ok()
                .header(
                        HttpHeaders.SET_COOKIE,
                        accessTokenCookie.toString()
                )
                .header(
                        HttpHeaders.SET_COOKIE,
                        refreshTokenCookie.toString()
                )
                .body(result.user());
    }

    @PostMapping("/refresh")
    public ResponseEntity<Void> refresh(
            @CookieValue(
                    name = REFRESH_TOKEN_COOKIE,
                    required = false
            )
            String refreshToken
    ) {

        /*
         * AuthService validates the existing refresh token,
         * revokes it, and creates a new token pair.
         */
        RefreshResult result =
                authService.refresh(refreshToken);

        ResponseCookie accessTokenCookie =
                createAccessTokenCookie(
                        result.accessToken()
                );

        ResponseCookie refreshTokenCookie =
                createRefreshTokenCookie(
                        result.refreshToken()
                );

        return ResponseEntity
                .noContent()
                .header(
                        HttpHeaders.SET_COOKIE,
                        accessTokenCookie.toString()
                )
                .header(
                        HttpHeaders.SET_COOKIE,
                        refreshTokenCookie.toString()
                )
                .build();
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(
            @AuthenticationPrincipal Jwt jwt
    ) {

        Long userId =
                Long.valueOf(jwt.getSubject());

        AuthResponse response =
                authService.getCurrentUser(userId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/csrf")
    public ResponseEntity<Map<String, String>> csrf(
            CsrfToken csrfToken
    ) {

        /*
         * Accessing the token causes Spring Security
         * to generate/load the CSRF token and expose
         * it through the XSRF-TOKEN cookie.
         */
        return ResponseEntity.ok(
                Map.of(
                        "headerName",
                        csrfToken.getHeaderName(),
                        "parameterName",
                        csrfToken.getParameterName(),
                        "token",
                        csrfToken.getToken()
                )
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(
                    name = REFRESH_TOKEN_COOKIE,
                    required = false
            )
            String refreshToken
    ) {

        /*
         * Revoke the server-side refresh token.
         */
        authService.logout(refreshToken);

        /*
         * Delete both browser cookies.
         */
        ResponseCookie expiredAccessTokenCookie =
                expireAccessTokenCookie();

        ResponseCookie expiredRefreshTokenCookie =
                expireRefreshTokenCookie();

        return ResponseEntity
                .noContent()
                .header(
                        HttpHeaders.SET_COOKIE,
                        expiredAccessTokenCookie.toString()
                )
                .header(
                        HttpHeaders.SET_COOKIE,
                        expiredRefreshTokenCookie.toString()
                )
                .build();
    }

    private ResponseCookie createAccessTokenCookie(
            String accessToken
    ) {

        return ResponseCookie
                .from(
                        ACCESS_TOKEN_COOKIE,
                        accessToken
                )
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Lax")
                .path(ACCESS_COOKIE_PATH)
                .maxAge(ACCESS_TOKEN_DURATION)
                .build();
    }

    private ResponseCookie createRefreshTokenCookie(
            String refreshToken
    ) {

        return ResponseCookie
                .from(
                        REFRESH_TOKEN_COOKIE,
                        refreshToken
                )
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Lax")
                .path(REFRESH_COOKIE_PATH)
                .maxAge(REFRESH_TOKEN_DURATION)
                .build();
    }

    private ResponseCookie expireAccessTokenCookie() {

        return ResponseCookie
                .from(
                        ACCESS_TOKEN_COOKIE,
                        ""
                )
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Lax")
                .path(ACCESS_COOKIE_PATH)
                .maxAge(Duration.ZERO)
                .build();
    }

    private ResponseCookie expireRefreshTokenCookie() {

        return ResponseCookie
                .from(
                        REFRESH_TOKEN_COOKIE,
                        ""
                )
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Lax")
                .path(REFRESH_COOKIE_PATH)
                .maxAge(Duration.ZERO)
                .build();
    }
}