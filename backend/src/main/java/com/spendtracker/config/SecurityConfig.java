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

        /*
         * Angular needs to read the XSRF-TOKEN cookie
         * and send it back using X-XSRF-TOKEN.
         *
         * The JWT cookies remain HttpOnly.
         */
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

    /*
     * Browser CORS configuration.
     *
     * Local Angular commonly runs on port 4200.
     * Ionic commonly runs on port 8100.
     *
     * Production origins can later be supplied using:
     *
     * app.cors.allowed-origins
     *
     * We do NOT use "*" because authenticated
     * requests use cookies.
     */
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

        /*
         * Required because authentication uses
         * browser cookies.
         */
        configuration.setAllowCredentials(
                true
        );

        /*
         * Cache successful preflight responses
         * for one hour.
         */
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

                /*
                 * Enable our CorsConfigurationSource.
                 */
                .cors(
                        Customizer.withDefaults()
                )

                /*
                 * REST API only.
                 */
                .formLogin(
                        AbstractHttpConfigurer::disable
                )

                /*
                 * No HTTP Basic authentication.
                 */
                .httpBasic(
                        AbstractHttpConfigurer::disable
                )

                /*
                 * JWT authentication is completely stateless.
                 */
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                /*
                 * CSRF remains ENABLED.
                 *
                 * Registration and login are ignored because
                 * they do not depend on an existing authenticated
                 * browser session.
                 *
                 * IMPORTANT:
                 *
                 * /refresh and /logout are NOT ignored here.
                 *
                 * They both require a valid CSRF token because
                 * they operate using HttpOnly cookies.
                 */
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
                         * Browser CORS preflight.
                         */
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        /*
                         * Public registration and login.
                         */
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/auth/register",
                                "/api/auth/login"
                        ).permitAll()

                        /*
                         * Public CSRF-token endpoint.
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/auth/csrf"
                        ).permitAll()

                        /*
                         * Refresh must work even when the
                         * 15-minute access JWT has expired.
                         *
                         * It is still protected by CSRF and
                         * requires a valid refresh-token cookie.
                         */
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/auth/refresh"
                        ).permitAll()

                        /*
                         * Logout must also be possible if the
                         * access JWT has expired.
                         *
                         * It remains protected by CSRF.
                         */
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/auth/logout"
                        ).permitAll()

                        /*
                         * Spring Boot internal error endpoint.
                         */
                        .requestMatchers(
                                "/error"
                        ).permitAll()

                        /*
                         * All normal application APIs require
                         * a valid access JWT.
                         */
                        .anyRequest()
                        .authenticated()
                )

                /*
                 * Read access JWT from our HttpOnly cookie.
                 */
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

                /*
                 * Return 401 instead of redirecting users
                 * to a Spring login page.
                 */
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

        /*
         * JWT:
         *
         * "role": "USER"
         *
         * becomes:
         *
         * ROLE_USER
         */
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