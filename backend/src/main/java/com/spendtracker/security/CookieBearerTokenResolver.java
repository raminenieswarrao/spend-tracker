package com.spendtracker.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpMethod;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class CookieBearerTokenResolver
        implements BearerTokenResolver {

    private static final String ACCESS_TOKEN_COOKIE =
            "access_token";

    /*
     * These endpoints intentionally do not use the access JWT.
     *
     * This is especially important for /refresh:
     * the access JWT may already be expired, but the valid
     * refresh token must still be allowed to create a new one.
     */
    private static final Set<String> ACCESS_TOKEN_IGNORED_PATHS =
            Set.of(
                    "/api/auth/register",
                    "/api/auth/login",
                    "/api/auth/csrf",
                    "/api/auth/refresh",
                    "/api/auth/logout"
            );

    @Override
    public String resolve(
            HttpServletRequest request
    ) {

        /*
         * CORS preflight requests must not attempt
         * JWT authentication.
         */
        if (HttpMethod.OPTIONS.matches(
                request.getMethod()
        )) {
            return null;
        }

        String servletPath =
                request.getServletPath();

        /*
         * Do not process an access JWT on authentication
         * lifecycle endpoints that do not require it.
         *
         * This prevents an expired access_token cookie
         * from causing an early 401 response.
         */
        if (ACCESS_TOKEN_IGNORED_PATHS.contains(
                servletPath
        )) {
            return null;
        }

        Cookie[] cookies =
                request.getCookies();

        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {

            if (ACCESS_TOKEN_COOKIE.equals(
                    cookie.getName()
            )) {

                String token =
                        cookie.getValue();

                if (token == null
                        || token.isBlank()) {

                    return null;
                }

                return token;
            }
        }

        return null;
    }
}