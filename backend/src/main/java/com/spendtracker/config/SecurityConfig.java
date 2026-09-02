package com.spendtracker.config;

import com.spendtracker.security.CookieBearerTokenResolver;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public CookieCsrfTokenRepository csrfTokenRepository(
            @Value("${app.security.cookie-secure:false}")
            boolean secureCookie
    ) {

        CookieCsrfTokenRepository repository =
                CookieCsrfTokenRepository.withHttpOnlyFalse();

        repository.setCookieCustomizer(cookie ->
                cookie
                        .path("/")
                        .secure(secureCookie)
                        .sameSite("Lax")
        );

        return repository;
    }

    @Bean
    public CsrfTokenRequestAttributeHandler
    csrfTokenRequestHandler() {

        return new CsrfTokenRequestAttributeHandler();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value(
                    "${app.cors.allowed-origins:"
                            + "http://localhost:4200,"
                            + "http://localhost:8100}"
            )
            String allowedOriginsProperty
    ) {

        List<String> allowedOrigins =
                Arrays.stream(
                                allowedOriginsProperty.split(",")
                        )
                        .map(String::trim)
                        .filter(origin -> !origin.isBlank())
                        .toList();

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                allowedOrigins
        );

        configuration.setAllowedMethods(
                List.of(
                        HttpMethod.GET.name(),
                        HttpMethod.POST.name(),
                        HttpMethod.PUT.name(),
                        HttpMethod.DELETE.name(),
                        HttpMethod.OPTIONS.name()
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        HttpHeaders.CONTENT_TYPE,
                        HttpHeaders.ACCEPT,
                        "X-XSRF-TOKEN"
                )
        );

        configuration.setAllowCredentials(
                true
        );

        configuration.setMaxAge(
                3600L
        );

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            CookieBearerTokenResolver cookieBearerTokenResolver,
            CookieCsrfTokenRepository csrfTokenRepository,
            CsrfTokenRequestAttributeHandler csrfTokenRequestHandler,
            Converter<Jwt, ? extends AbstractAuthenticationToken>
                    jwtAuthenticationConverter
    ) throws Exception {

        http

                .cors(
                        Customizer.withDefaults()
                )

                .formLogin(
                        AbstractHttpConfigurer::disable
                )

                .httpBasic(
                        AbstractHttpConfigurer::disable
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .csrf(csrf ->
                        csrf
                                .csrfTokenRepository(
                                        csrfTokenRepository
                                )
                                .csrfTokenRequestHandler(
                                        csrfTokenRequestHandler
                                )
                                .ignoringRequestMatchers(
                                        "/api/auth/register",
                                        "/api/auth/login"
                                )
                )

                .authorizeHttpRequests(auth -> auth

                        /*
                         * CORS preflight.
                         */
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        /*
                         * Angular frontend entry points.
                         *
                         * These pages themselves are public.
                         * The Angular auth guard protects /home
                         * in the browser and the backend still
                         * protects all expense APIs.
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/",
                                "/index.html",
                                "/login",
                                "/register",
                                "/home"
                        ).permitAll()

                        /*
                         * Angular static assets.
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/assets/**",
                                "/*.js",
                                "/*.css",
                                "/*.ico",
                                "/*.png",
                                "/*.svg",
                                "/*.webp",
                                "/*.json",
                                "/*.webmanifest"
                        ).permitAll()

                        /*
                         * Render health check.
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/health"
                        ).permitAll()

                        /*
                         * Authentication endpoints.
                         */
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/auth/register",
                                "/api/auth/login"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/auth/csrf"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/auth/refresh"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/auth/logout"
                        ).permitAll()

                        /*
                         * Spring error endpoint.
                         */
                        .requestMatchers(
                                "/error"
                        ).permitAll()

                        /*
                         * Everything else requires authentication.
                         *
                         * This includes:
                         *
                         * /api/expenses/**
                         * future authenticated APIs
                         */
                        .anyRequest()
                        .authenticated()
                )

                .oauth2ResourceServer(oauth2 ->
                        oauth2
                                .bearerTokenResolver(
                                        cookieBearerTokenResolver
                                )
                                .jwt(jwt ->
                                        jwt.jwtAuthenticationConverter(
                                                jwtAuthenticationConverter
                                        )
                                )
                )

                .exceptionHandling(exceptions ->
                        exceptions.authenticationEntryPoint(
                                (request, response, exception) ->
                                        response.sendError(
                                                HttpServletResponse
                                                        .SC_UNAUTHORIZED
                                        )
                        )
                );

        return http.build();
    }

    @Bean
    public Converter<Jwt, ? extends AbstractAuthenticationToken>
    jwtAuthenticationConverter() {

        JwtGrantedAuthoritiesConverter authoritiesConverter =
                new JwtGrantedAuthoritiesConverter();

        authoritiesConverter.setAuthoritiesClaimName(
                "role"
        );

        authoritiesConverter.setAuthorityPrefix(
                "ROLE_"
        );

        JwtAuthenticationConverter authenticationConverter =
                new JwtAuthenticationConverter();

        authenticationConverter
                .setJwtGrantedAuthoritiesConverter(
                        authoritiesConverter
                );

        return authenticationConverter;
    }
}