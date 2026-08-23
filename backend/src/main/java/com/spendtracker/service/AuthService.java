package com.spendtracker.service;

import com.spendtracker.dto.auth.AuthResponse;
import com.spendtracker.dto.auth.LoginRequest;
import com.spendtracker.dto.auth.LoginResult;
import com.spendtracker.dto.auth.RefreshResult;
import com.spendtracker.dto.auth.RegisterRequest;
import com.spendtracker.exception.InvalidCredentialsException;
import com.spendtracker.model.Role;
import com.spendtracker.model.User;
import com.spendtracker.repository.UserRepository;
import com.spendtracker.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;

@Service
public class AuthService {

    private static final int MAX_FAILED_LOGIN_ATTEMPTS = 5;

    private static final Duration ACCOUNT_LOCK_DURATION =
            Duration.ofMinutes(15);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            RefreshTokenService refreshTokenService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public AuthResponse register(
            RegisterRequest request
    ) {

        String normalizedEmail =
                normalizeEmail(request.getEmail());

        String normalizedName =
                request.getName().trim();

        if (!request.getPassword()
                .equals(request.getConfirmPassword())) {

            throw new IllegalArgumentException(
                    "Password and confirm password do not match"
            );
        }

        if (userRepository.existsByEmail(
                normalizedEmail
        )) {

            throw new IllegalArgumentException(
                    "An account already exists with this email"
            );
        }

        User user = new User();

        user.setName(normalizedName);
        user.setEmail(normalizedEmail);

        /*
         * Never store a raw password.
         */
        user.setPasswordHash(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        /*
         * Public registration can never assign ADMIN.
         */
        user.setRole(Role.USER);

        user.setEnabled(true);

        /*
         * OTP/email verification can be added later.
         */
        user.setEmailVerified(false);

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);

        User savedUser =
                userRepository.save(user);

        return toAuthResponse(savedUser);
    }

    @Transactional(
            noRollbackFor =
                    InvalidCredentialsException.class
    )
    public LoginResult login(
            LoginRequest request
    ) {

        String normalizedEmail =
                normalizeEmail(request.getEmail());

        User user = userRepository
                .findByEmail(normalizedEmail)
                .orElseThrow(
                        InvalidCredentialsException::new
                );

        Instant now =
                Instant.now();

        if (!user.isEnabled()) {
            throw new InvalidCredentialsException();
        }

        /*
         * Reject login while account is locked.
         */
        if (user.getLockedUntil() != null
                && now.isBefore(
                user.getLockedUntil()
        )) {

            throw new InvalidCredentialsException();
        }

        /*
         * Previous lock has expired.
         */
        if (user.getLockedUntil() != null) {

            user.setLockedUntil(null);
            user.setFailedLoginAttempts(0);
        }

        boolean passwordMatches =
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPasswordHash()
                );

        if (!passwordMatches) {

            int failedAttempts =
                    user.getFailedLoginAttempts() + 1;

            user.setFailedLoginAttempts(
                    failedAttempts
            );

            if (failedAttempts
                    >= MAX_FAILED_LOGIN_ATTEMPTS) {

                user.setLockedUntil(
                        now.plus(
                                ACCOUNT_LOCK_DURATION
                        )
                );
            }

            userRepository.save(user);

            throw new InvalidCredentialsException();
        }

        /*
         * Successful login resets failed-login state.
         */
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);

        userRepository.save(user);

        String accessToken =
                jwtService.generateAccessToken(user);

        String refreshToken =
                refreshTokenService
                        .createRefreshToken(user);

        return new LoginResult(
                toAuthResponse(user),
                accessToken,
                refreshToken
        );
    }

    /*
     * InvalidCredentialsException must not roll back
     * refresh-token security changes.
     *
     * Example:
     *
     * old token replayed
     *      ↓
     * active refresh sessions revoked
     *      ↓
     * InvalidCredentialsException thrown
     *      ↓
     * revocations MUST remain committed
     */
    @Transactional(
            noRollbackFor =
                    InvalidCredentialsException.class
    )
    public RefreshResult refresh(
            String rawRefreshToken
    ) {

        User user =
                refreshTokenService
                        .consumeRefreshToken(
                                rawRefreshToken
                        )
                        .orElseThrow(
                                InvalidCredentialsException::new
                        );

        /*
         * Generate a fresh access JWT.
         */
        String newAccessToken =
                jwtService.generateAccessToken(user);

        /*
         * Rotate refresh token.
         */
        String newRefreshToken =
                refreshTokenService
                        .createRefreshToken(user);

        return new RefreshResult(
                newAccessToken,
                newRefreshToken
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse getCurrentUser(
            Long userId
    ) {

        User user = userRepository
                .findById(userId)
                .orElseThrow(
                        InvalidCredentialsException::new
                );

        if (!user.isEnabled()) {
            throw new InvalidCredentialsException();
        }

        return toAuthResponse(user);
    }

    @Transactional
    public void logout(
            String rawRefreshToken
    ) {

        refreshTokenService
                .revokeRefreshToken(
                        rawRefreshToken
                );
    }

    private AuthResponse toAuthResponse(
            User user
    ) {

        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }

    private String normalizeEmail(
            String email
    ) {

        return email
                .trim()
                .toLowerCase(Locale.ROOT);
    }
}