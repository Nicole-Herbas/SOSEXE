package bo.edu.sos.backend.config;

import bo.edu.sos.backend.constants.ApiRoutes;
import bo.edu.sos.backend.constants.Roles;
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
                                ApiRoutes.MAPA + "/**"
                        ).permitAll()


                        // Usuario autenticado
                        .requestMatchers(
                                ApiRoutes.AUTH_ME
                        ).authenticated()


                        // Acciones que puede realizar un usuario autenticado
                        .requestMatchers(
                                HttpMethod.POST,
                                ApiRoutes.DONACIONES,
                                ApiRoutes.POSTULACIONES
                        ).authenticated()


                        // Administración de usuarios
                        .requestMatchers(
                                ApiRoutes.USUARIOS + "/**"
                        ).hasAuthority(Roles.ADMIN)


                        // Escritura administrativa (centros, noticias, alertas, puntos)
                        .requestMatchers(
                                HttpMethod.POST,
                                ApiRoutes.CENTROS + "/**",
                                ApiRoutes.NOTICIAS + "/**",
                                ApiRoutes.ALERTAS + "/**",
                                ApiRoutes.PUNTOS_AYUDA + "/**"
                        ).hasAuthority(Roles.ADMIN)

                        // POST voluntariados — usuarios autenticados (responsables)
                        .requestMatchers(
                                HttpMethod.POST,
                                ApiRoutes.VOLUNTARIADOS + "/**"
                        ).authenticated()


                        .requestMatchers(
                                HttpMethod.PUT,
                                ApiRoutes.CENTROS + "/**",
                                ApiRoutes.NOTICIAS + "/**",
                                ApiRoutes.ALERTAS + "/**",
                                ApiRoutes.PUNTOS_AYUDA + "/**"
                        ).hasAuthority(Roles.ADMIN)

                        // PUT voluntariados — usuarios autenticados (responsables)
                        .requestMatchers(
                                HttpMethod.PUT,
                                ApiRoutes.VOLUNTARIADOS + "/**"
                        ).authenticated()


                        .requestMatchers(
                                HttpMethod.DELETE,
                                ApiRoutes.CENTROS + "/**",
                                ApiRoutes.NOTICIAS + "/**",
                                ApiRoutes.ALERTAS + "/**",
                                ApiRoutes.PUNTOS_AYUDA + "/**"
                        ).hasAuthority(Roles.ADMIN)


                        // Cambiar estado de postulaciones — autenticado (lógica de permisos en el servicio)
                        .requestMatchers(
                                HttpMethod.PATCH,
                                ApiRoutes.POSTULACIONES + "/**"
                        ).authenticated()

                        // DELETE voluntariados — autenticado (responsables)
                        .requestMatchers(
                                HttpMethod.DELETE,
                                ApiRoutes.VOLUNTARIADOS + "/**"
                        ).authenticated()

                        // Consultas administrativas de postulaciones
                        .requestMatchers(
                                HttpMethod.GET,
                                ApiRoutes.POSTULACIONES + "/usuario/**"
                        ).hasAuthority(Roles.ADMIN)

                        .requestMatchers(
                                HttpMethod.GET,
                                ApiRoutes.POSTULACIONES + "/voluntariado/**"
                        ).authenticated()

                        // Consultas de donaciones y postulaciones requieren login
                        .requestMatchers(
                                HttpMethod.GET,
                                ApiRoutes.DONACIONES + "/**",
                                ApiRoutes.POSTULACIONES + "/**"
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