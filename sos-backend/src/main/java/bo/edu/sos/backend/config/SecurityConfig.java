package bo.edu.sos.backend.config;

import bo.edu.sos.backend.constants.ApiRoutes;
import bo.edu.sos.backend.constants.Roles;
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

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of("http://localhost:4200"));
        configuration.setAllowedMethods(
                List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(cors -> {})

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        // Permitir preflight CORS
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Endpoints públicos de autenticación
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

                        // Datos públicos de lectura
                        .requestMatchers(
                                HttpMethod.GET,
                                ApiRoutes.CENTROS + "/**",
                                ApiRoutes.NOTICIAS + "/**",
                                ApiRoutes.ALERTAS + "/**",
                                ApiRoutes.PUNTOS_AYUDA + "/**",
                                ApiRoutes.VOLUNTARIADOS + "/**",
                                ApiRoutes.MAPA + "/**",
                                ApiRoutes.DEPARTAMENTOS,          // SOS-41: combo del formulario
                                ApiRoutes.DEPARTAMENTOS + "/**"
                        ).permitAll()

                        // ── SOS-41: solicitudes de registro de centro ──────────────
                        // Enviar una solicitud -> cualquier usuario con sesión
                        .requestMatchers(
                                HttpMethod.POST,
                                ApiRoutes.SOLICITUDES_CENTRO
                        ).authenticated()

                        // Consultar solicitudes -> solo ADMIN
                        .requestMatchers(
                                HttpMethod.GET,
                                ApiRoutes.SOLICITUDES_CENTRO,
                                ApiRoutes.SOLICITUDES_CENTRO + "/**"
                        ).hasAuthority(Roles.ADMIN)

                        // SOS-43: aprobar / rechazar / solicitar cambios -> solo ADMIN
                        // (los documentos GET .../{id}/documentos/{tipo} ya quedan
                        //  cubiertos por la regla GET de arriba)
                        .requestMatchers(
                                HttpMethod.PATCH,
                                ApiRoutes.SOLICITUDES_CENTRO + "/**"
                        ).hasAuthority(Roles.ADMIN)
                        // ─────────────────────────────────────────────────────────

                        // Usuario autenticado
                        .requestMatchers(ApiRoutes.AUTH_ME).authenticated()

                        // Acciones que puede realizar un usuario autenticado
                        .requestMatchers(
                                HttpMethod.POST,
                                ApiRoutes.DONACIONES,
                                ApiRoutes.POSTULACIONES
                        ).authenticated()

                        // Administración de usuarios
                        .requestMatchers(ApiRoutes.USUARIOS + "/**").hasAuthority(Roles.ADMIN)

                        // Escritura administrativa (centros, noticias, alertas, puntos)
                        .requestMatchers(
                                HttpMethod.POST,
                                ApiRoutes.CENTROS + "/**",
                                ApiRoutes.NOTICIAS + "/**",
                                ApiRoutes.ALERTAS + "/**",
                                ApiRoutes.PUNTOS_AYUDA + "/**"
                        ).hasAuthority(Roles.ADMIN)

                        // POST voluntariados — usuarios autenticados (responsables)
                        .requestMatchers(HttpMethod.POST, ApiRoutes.VOLUNTARIADOS + "/**").authenticated()

                        .requestMatchers(
                                HttpMethod.PUT,
                                ApiRoutes.CENTROS + "/**",
                                ApiRoutes.NOTICIAS + "/**",
                                ApiRoutes.ALERTAS + "/**",
                                ApiRoutes.PUNTOS_AYUDA + "/**"
                        ).hasAuthority(Roles.ADMIN)

                        // PUT voluntariados — usuarios autenticados (responsables)
                        .requestMatchers(HttpMethod.PUT, ApiRoutes.VOLUNTARIADOS + "/**").authenticated()

                        .requestMatchers(
                                HttpMethod.DELETE,
                                ApiRoutes.CENTROS + "/**",
                                ApiRoutes.NOTICIAS + "/**",
                                ApiRoutes.ALERTAS + "/**",
                                ApiRoutes.PUNTOS_AYUDA + "/**"
                        ).hasAuthority(Roles.ADMIN)

                        // Cambiar estado de postulaciones — autenticado (lógica de permisos en el servicio)
                        .requestMatchers(HttpMethod.PATCH, ApiRoutes.POSTULACIONES + "/**").authenticated()

                        .requestMatchers(HttpMethod.DELETE, ApiRoutes.VOLUNTARIADOS + "/**").authenticated()

                        // Consultas administrativas de postulaciones
                        .requestMatchers(HttpMethod.GET, ApiRoutes.POSTULACIONES + "/usuario/**")
                                .hasAuthority(Roles.ADMIN)

                        .requestMatchers(HttpMethod.GET, ApiRoutes.POSTULACIONES + "/voluntariado/**")
                                .authenticated()

                        // Ver todas las donaciones → solo ADMIN
                        .requestMatchers(HttpMethod.GET, ApiRoutes.DONACIONES).hasAuthority(Roles.ADMIN)

                        // Consultas de donaciones y postulaciones requieren login
                        .requestMatchers(
                                HttpMethod.GET,
                                ApiRoutes.DONACIONES + "/**",
                                ApiRoutes.POSTULACIONES + "/**"
                        ).authenticated()

                        // Cualquier otro endpoint de API necesita autenticación
                        .requestMatchers("/api/**").authenticated()

                        .anyRequest().authenticated()
                )

                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) ->
                                response.sendError(HttpServletResponse.SC_UNAUTHORIZED))
                        .accessDeniedHandler((request, response, accessDeniedException) ->
                                response.sendError(HttpServletResponse.SC_FORBIDDEN))
                )

                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
