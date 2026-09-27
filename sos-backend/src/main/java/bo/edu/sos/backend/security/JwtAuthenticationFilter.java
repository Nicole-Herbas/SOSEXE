package bo.edu.sos.backend.security;

import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;


    public JwtAuthenticationFilter(
            JwtService jwtService,
            UsuarioRepository usuarioRepository) {

        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }


    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authorizationHeader =
                request.getHeader("Authorization");


        if (authorizationHeader == null ||
                !authorizationHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }


        String token =
                authorizationHeader.substring(7);


        if (!jwtService.esValido(token)) {

            filterChain.doFilter(request, response);
            return;
        }


        String email =
                jwtService.extraerEmail(token);


        Optional<Usuario> usuarioOpt =
                usuarioRepository.findByEmail(email);


        if (usuarioOpt.isEmpty()) {

            filterChain.doFilter(request, response);
            return;
        }


        Usuario usuario =
                usuarioOpt.get();


        if (!Boolean.TRUE.equals(usuario.getActivo())) {

            filterChain.doFilter(request, response);
            return;
        }


        if (SecurityContextHolder
                .getContext()
                .getAuthentication() == null) {


            SimpleGrantedAuthority autoridad =
                    new SimpleGrantedAuthority(
                            usuario.getRol().getNombre()
                    );


            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            usuario.getEmail(),
                            null,
                            List.of(autoridad)
                    );


            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);
        }


        filterChain.doFilter(request, response);
    }
}