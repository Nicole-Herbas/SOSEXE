package bo.edu.sos.backend.config;

import bo.edu.sos.backend.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;


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
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

                .csrf(csrf ->
                        csrf.disable()
                )


                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )


                .authorizeHttpRequests(auth -> auth

                        // Endpoints públicos de autenticación
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/api/auth/login",
                                "/api/auth/registro",
                                "/api/auth/refresh",
                                "/api/auth/logout",
                                "/error"
                        ).permitAll()


                        // Datos públicos de lectura
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/centros/**",
                                "/api/noticias/**",
                                "/api/alertas/**",
                                "/api/puntos-ayuda/**",
                                "/api/voluntariados/**"
                        ).permitAll()


                        // Usuario autenticado
                        .requestMatchers(
                                "/api/auth/me"
                        ).authenticated()


                        // Acciones que puede realizar un usuario autenticado
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/donaciones",
                                "/api/postulaciones"
                        ).authenticated()


                        // Administración de usuarios
                        .requestMatchers(
                                "/api/usuarios/**"
                        ).hasAuthority("ADMIN")


                        // Escritura administrativa
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/centros/**",
                                "/api/noticias/**",
                                "/api/alertas/**",
                                "/api/puntos-ayuda/**",
                                "/api/voluntariados/**"
                        ).hasAuthority("ADMIN")


                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/centros/**",
                                "/api/noticias/**",
                                "/api/alertas/**",
                                "/api/puntos-ayuda/**",
                                "/api/voluntariados/**"
                        ).hasAuthority("ADMIN")


                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/centros/**",
                                "/api/noticias/**",
                                "/api/alertas/**",
                                "/api/puntos-ayuda/**",
                                "/api/voluntariados/**"
                        ).hasAuthority("ADMIN")


                        // Cambiar estado de postulaciones → ADMIN
                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/postulaciones/**"
                        ).hasAuthority("ADMIN")


                        // Consultas de donaciones y postulaciones requieren login
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/donaciones/**",
                                "/api/postulaciones/**"
                        ).authenticated()


                        // Cualquier otro endpoint de API necesita autenticación
                        .requestMatchers(
                                "/api/**"
                        ).authenticated()


                        .anyRequest()
                        .authenticated()
                )


                .exceptionHandling(ex -> ex

                        .authenticationEntryPoint(
                                (request,
                                 response,
                                 authException) ->

                                        response.sendError(
                                                HttpServletResponse
                                                        .SC_UNAUTHORIZED
                                        )
                        )


                        .accessDeniedHandler(
                                (request,
                                 response,
                                 accessDeniedException) ->

                                        response.sendError(
                                                HttpServletResponse
                                                        .SC_FORBIDDEN
                                        )
                        )
                )


                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );


        return http.build();
    }
}