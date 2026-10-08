package bo.edu.sos.backend.config;

import bo.edu.sos.backend.constants.ApiRoutes;
import bo.edu.sos.backend.constants.Roles;
import bo.edu.sos.backend.helper.LogHelper;
import bo.edu.sos.backend.security.JwtAuthenticationFilter;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of("http://localhost:4200")
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(true);

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
            HttpSecurity http) throws Exception {

        http

                .csrf(csrf ->
                        csrf.disable()
                )

                .cors(cors -> {})

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // ==========================================
                        // CORS
                        // ==========================================

                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        // ==========================================
                        // AUTENTICACIÓN PÚBLICA
                        // ==========================================

                        .requestMatchers(
                                ApiRoutes.SWAGGER_UI,
                                ApiRoutes.SWAGGER_HTML,
                                ApiRoutes.OPENAPI_DOCS,
                                ApiRoutes.AUTH_LOGIN,
                                ApiRoutes.AUTH_REGISTRO,
                                ApiRoutes.AUTH_REFRESH,
                                ApiRoutes.AUTH_LOGOUT,
                                "/error"
                        ).permitAll()

                        // ==========================================
                        // DATOS PÚBLICOS
                        // ==========================================

                        .requestMatchers(
                                HttpMethod.GET,
                                ApiRoutes.CENTROS + "/**",
                                ApiRoutes.NOTICIAS + "/**",
                                ApiRoutes.ALERTAS + "/**",
                                ApiRoutes.PUNTOS_AYUDA + "/**",
                                ApiRoutes.VOLUNTARIADOS + "/**",
                                ApiRoutes.MAPA + "/**",
                                ApiRoutes.DEPARTAMENTOS,
                                ApiRoutes.DEPARTAMENTOS + "/**"
                        ).permitAll()

                        // ==========================================
                        // SOS-41
                        // REGISTRO DE CENTRO
                        // ==========================================

                        // Crear solicitud:
                        // cualquier usuario autenticado
                        .requestMatchers(
                                HttpMethod.POST,
                                ApiRoutes.SOLICITUDES_CENTRO
                        ).authenticated()

                        // Consultar solicitudes:
                        // solamente ADMIN
                        .requestMatchers(
                                HttpMethod.GET,
                                ApiRoutes.SOLICITUDES_CENTRO,
                                ApiRoutes.SOLICITUDES_CENTRO + "/**"
                        ).hasAuthority(Roles.ADMIN)

                        // ==========================================
                        // SOS-43
                        // APROBAR / RECHAZAR / PEDIR CAMBIOS
                        // ==========================================

                        .requestMatchers(
                                HttpMethod.PATCH,
                                ApiRoutes.SOLICITUDES_CENTRO + "/**"
                        ).hasAuthority(Roles.ADMIN)

                        // ==========================================
                        // USUARIO AUTENTICADO
                        // ==========================================

                        .requestMatchers(
                                ApiRoutes.AUTH_ME
                        ).authenticated()

                        // ==========================================
                        // DONACIONES / POSTULACIONES
                        // ==========================================

                        .requestMatchers(
                                HttpMethod.POST,
                                ApiRoutes.DONACIONES,
                                ApiRoutes.POSTULACIONES
                        ).authenticated()

                        // ==========================================
                        // ADMINISTRACIÓN DE USUARIOS
                        // ==========================================

                        .requestMatchers(
                                ApiRoutes.USUARIOS + "/**"
                        ).hasAuthority(Roles.ADMIN)

                        // ==========================================
                        // ESCRITURA ADMINISTRATIVA
                        // ==========================================

                        .requestMatchers(
                                HttpMethod.POST,
                                ApiRoutes.CENTROS + "/**",
                                ApiRoutes.NOTICIAS + "/**",
                                ApiRoutes.ALERTAS + "/**",
                                ApiRoutes.PUNTOS_AYUDA + "/**"
                        ).hasAuthority(Roles.ADMIN)

                        // ==========================================
                        // VOLUNTARIADOS
                        // ==========================================

                        .requestMatchers(
                                HttpMethod.POST,
                                ApiRoutes.VOLUNTARIADOS + "/**"
                        ).authenticated()

                        // ==========================================
                        // PUT ADMIN
                        // ==========================================

                        .requestMatchers(
                                HttpMethod.PUT,
                                ApiRoutes.CENTROS + "/**",
                                ApiRoutes.NOTICIAS + "/**",
                                ApiRoutes.ALERTAS + "/**",
                                ApiRoutes.PUNTOS_AYUDA + "/**"
                        ).hasAuthority(Roles.ADMIN)

                        // PUT voluntariados
                        .requestMatchers(
                                HttpMethod.PUT,
                                ApiRoutes.VOLUNTARIADOS + "/**"
                        ).authenticated()

                        // ==========================================
                        // DELETE ADMIN
                        // ==========================================

                        .requestMatchers(
                                HttpMethod.DELETE,
                                ApiRoutes.CENTROS + "/**",
                                ApiRoutes.NOTICIAS + "/**",
                                ApiRoutes.ALERTAS + "/**",
                                ApiRoutes.PUNTOS_AYUDA + "/**"
                        ).hasAuthority(Roles.ADMIN)

                        // DELETE voluntariados
                        .requestMatchers(
                                HttpMethod.DELETE,
                                ApiRoutes.VOLUNTARIADOS + "/**"
                        ).authenticated()

                        // ==========================================
                        // POSTULACIONES
                        // ==========================================

                        .requestMatchers(
                                HttpMethod.PATCH,
                                ApiRoutes.POSTULACIONES + "/**"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.GET,
                                ApiRoutes.POSTULACIONES + "/usuario/**"
                        ).hasAuthority(Roles.ADMIN)

                        .requestMatchers(
                                HttpMethod.GET,
                                ApiRoutes.POSTULACIONES + "/voluntariado/**"
                        ).authenticated()

                        // ==========================================
                        // DONACIONES
                        // ==========================================

                        .requestMatchers(
                                HttpMethod.GET,
                                ApiRoutes.DONACIONES
                        ).hasAuthority(Roles.ADMIN)

                        .requestMatchers(
                                HttpMethod.GET,
                                ApiRoutes.DONACIONES + "/**",
                                ApiRoutes.POSTULACIONES + "/**"
                        ).authenticated()

                        // ==========================================
                        // RESTO DE API
                        // ==========================================

                        .requestMatchers(
                                "/api/**"
                        ).authenticated()

                        .anyRequest()
                        .authenticated()
                )

                // ==========================================
                // MANEJO DE ERRORES DE SEGURIDAD
                // ==========================================

                .exceptionHandling(ex -> ex

                        .authenticationEntryPoint(
                                (request,
                                 response,
                                 authException) -> {

                                    LogHelper.debug(
                                            SecurityConfig.class,
                                            "Solicitud no autenticada rechazada. metodo={}, ruta={}",
                                            request.getMethod(),
                                            request.getRequestURI()
                                    );

                                    response.sendError(
                                            HttpServletResponse
                                                    .SC_UNAUTHORIZED
                                    );
                                }
                        )

                        .accessDeniedHandler(
                                (request,
                                 response,
                                 accessDeniedException) -> {

                                    LogHelper.debug(
                                            SecurityConfig.class,
                                            "Acceso denegado por permisos insuficientes. metodo={}, ruta={}",
                                            request.getMethod(),
                                            request.getRequestURI()
                                    );

                                    response.sendError(
                                            HttpServletResponse
                                                    .SC_FORBIDDEN
                                    );
                                }
                        )
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}