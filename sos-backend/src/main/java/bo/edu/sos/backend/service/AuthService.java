package bo.edu.sos.backend.service;

import bo.edu.sos.backend.constants.AuthConstants;
import bo.edu.sos.backend.dto.AuthResponseDTO;
import bo.edu.sos.backend.dto.LoginRequestDTO;
import bo.edu.sos.backend.dto.RegistroRequestDTO;
import bo.edu.sos.backend.entity.Departamento;
import bo.edu.sos.backend.entity.Rol;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.exception.BadRequestException;
import bo.edu.sos.backend.exception.DuplicateResourceException;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.RolRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servicio de autenticación.
 * Contiene toda la lógica de negocio de registro e inicio de sesión.
 * Sigue la arquitectura limpia: Controller → Service → Repository.
 */
@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final DepartamentoRepository departamentoRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            DepartamentoRepository departamentoRepository,
            PasswordEncoder passwordEncoder) {

        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.departamentoRepository = departamentoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Registra un nuevo usuario en el sistema.
     *
     * @param request DTO con los datos del nuevo usuario
     * @throws DuplicateResourceException si el correo ya está registrado
     * @throws ResourceNotFoundException  si el rol o departamento no existen
     */
    @Transactional
    public void registrar(RegistroRequestDTO request) {

        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(AuthConstants.EMAIL_YA_REGISTRADO);
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setTelefono(request.getTelefono());
        usuario.setActivo(true);

        Long rolId = request.getRolId() != null ? request.getRolId() : AuthConstants.ROL_CIUDADANO_ID;
        Rol rol = rolRepository.findById(rolId)
                .orElseThrow(() -> new ResourceNotFoundException("Rol", rolId));
        usuario.setRol(rol);

        if (request.getDepartamentoId() != null) {
            Departamento depto = departamentoRepository.findById(request.getDepartamentoId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Departamento", request.getDepartamentoId()));
            usuario.setDepartamento(depto);
        }

        usuarioRepository.save(usuario);
    }

    /**
     * Autentica un usuario y retorna la respuesta con token simulado.
     *
     * @param request DTO con email y password
     * @return AuthResponseDTO con token, nombre, email y rol
     * @throws BadRequestException si el usuario no existe o la contraseña es incorrecta
     */
    @Transactional(readOnly = true)
    public AuthResponseDTO login(LoginRequestDTO request) {

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException(AuthConstants.CREDENCIALES_INCORRECTAS));

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new BadRequestException(AuthConstants.CREDENCIALES_INCORRECTAS);
        }

        String token = AuthConstants.TOKEN_PREFIX + usuario.getId();
        String rolNombre = usuario.getRol().getNombre();

        return new AuthResponseDTO(token, usuario.getNombre(), usuario.getEmail(), rolNombre);
    }
}
