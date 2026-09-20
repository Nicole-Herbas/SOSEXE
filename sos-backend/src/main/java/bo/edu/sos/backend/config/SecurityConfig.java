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

                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/api/auth/login",
                                "/api/auth/registro",
                                "/error"
                        ).permitAll()


                        .requestMatchers(
                                "/api/auth/me"
                        ).authenticated()


                        .requestMatchers(
                                "/api/admin/**",
                                "/api/usuarios/**"
                        ).hasAuthority("ADMIN")


                        // Por ahora los demás endpoints siguen públicos
                        .requestMatchers(
                                "/api/**"
                        ).permitAll()


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