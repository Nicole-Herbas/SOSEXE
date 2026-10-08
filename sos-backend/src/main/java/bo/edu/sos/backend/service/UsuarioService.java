package bo.edu.sos.backend.service;

import bo.edu.sos.backend.dto.UsuarioDTO;
import bo.edu.sos.backend.entity.Departamento;
import bo.edu.sos.backend.entity.Rol;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.exception.DuplicateResourceException;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.helper.LogHelper;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.RolRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final DepartamentoRepository departamentoRepository;
    private final PasswordEncoder passwordEncoder;


    public UsuarioService(
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            DepartamentoRepository departamentoRepository,
            PasswordEncoder passwordEncoder) {

        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.departamentoRepository = departamentoRepository;
        this.passwordEncoder = passwordEncoder;
    }


    @Transactional(readOnly = true)
    public List<UsuarioDTO> listarTodos() {

        List<UsuarioDTO> usuarios =
                usuarioRepository
                        .findAll()
                        .stream()
                        .map(this::convertirADTO)
                        .toList();


        LogHelper.debug(
                UsuarioService.class,
                "Listado de usuarios obtenido. cantidad={}",
                usuarios.size()
        );


        return usuarios;
    }


    @Transactional(readOnly = true)
    public UsuarioDTO buscarPorId(
            Long id) {

        Usuario usuario =
                usuarioRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Usuario",
                                        id
                                )
                        );


        LogHelper.debug(
                UsuarioService.class,
                "Usuario consultado correctamente. id={}",
                id
        );


        return convertirADTO(
                usuario
        );
    }


    @Transactional(readOnly = true)
    public UsuarioDTO buscarPorEmail(
            String email) {

        Usuario usuario =
                usuarioRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No existe un usuario con el email indicado"
                                )
                        );


        LogHelper.debug(
                UsuarioService.class,
                "Usuario consultado correctamente por email"
        );


        return convertirADTO(
                usuario
        );
    }


    @Transactional
    public UsuarioDTO guardar(
            UsuarioDTO dto) {

        if (usuarioRepository.existsByEmail(
                dto.getEmail()
        )) {

            throw new DuplicateResourceException(
                    "Ya existe un usuario con email: " + dto.getEmail()
            );
        }


        Usuario usuario =
                new Usuario();


        copiarDTOaEntidad(
                dto,
                usuario
        );


        Usuario guardado =
                usuarioRepository.save(
                        usuario
                );


        LogHelper.info(
                UsuarioService.class,
                "Usuario creado correctamente. id={}",
                guardado.getId()
        );


        return convertirADTO(
                guardado
        );
    }


    @Transactional
    public UsuarioDTO actualizar(
            Long id,
            UsuarioDTO dto) {

        Usuario usuario =
                usuarioRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Usuario",
                                        id
                                )
                        );


        if (
                !usuario
                        .getEmail()
                        .equals(
                                dto.getEmail()
                        )
                        &&
                        usuarioRepository.existsByEmail(
                                dto.getEmail()
                        )
        ) {

            throw new DuplicateResourceException(
                    "Ya existe un usuario con email: " + dto.getEmail()
            );
        }


        copiarDTOaEntidad(
                dto,
                usuario
        );


        Usuario actualizado =
                usuarioRepository.save(
                        usuario
                );


        LogHelper.info(
                UsuarioService.class,
                "Usuario actualizado correctamente. id={}",
                id
        );


        return convertirADTO(
                actualizado
        );
    }


    @Transactional
    public void eliminar(
            Long id) {

        if (!usuarioRepository.existsById(id)) {

            throw new ResourceNotFoundException(
                    "Usuario",
                    id
            );
        }


        usuarioRepository.deleteById(
                id
        );


        LogHelper.info(
                UsuarioService.class,
                "Usuario eliminado correctamente. id={}",
                id
        );
    }


    private void copiarDTOaEntidad(
            UsuarioDTO dto,
            Usuario usuario) {

        usuario.setNombre(
                dto.getNombre()
        );

        usuario.setEmail(
                dto.getEmail()
        );

        usuario.setTelefono(
                dto.getTelefono()
        );


        if (
                dto.getPassword() != null
                        &&
                        !dto.getPassword().isBlank()
        ) {

            usuario.setPassword(
                    passwordEncoder.encode(
                            dto.getPassword()
                    )
            );
        }


        if (dto.getActivo() != null) {

            usuario.setActivo(
                    dto.getActivo()
            );
        }


        Rol rol =
                rolRepository
                        .findById(
                                dto.getRolId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Rol",
                                        dto.getRolId()
                                )
                        );


        usuario.setRol(
                rol
        );


        if (dto.getDepartamentoId() != null) {

            Departamento departamento =
                    departamentoRepository
                            .findById(
                                    dto.getDepartamentoId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Departamento",
                                            dto.getDepartamentoId()
                                    )
                            );


            usuario.setDepartamento(
                    departamento
            );

        } else {

            usuario.setDepartamento(
                    null
            );
        }
    }


    private UsuarioDTO convertirADTO(
            Usuario usuario) {

        UsuarioDTO dto =
                new UsuarioDTO();


        dto.setId(
                usuario.getId()
        );

        dto.setNombre(
                usuario.getNombre()
        );

        dto.setEmail(
                usuario.getEmail()
        );

        dto.setTelefono(
                usuario.getTelefono()
        );

        dto.setActivo(
                usuario.getActivo()
        );


        if (usuario.getRol() != null) {

            dto.setRolId(
                    usuario
                            .getRol()
                            .getId()
            );

            dto.setRolNombre(
                    usuario
                            .getRol()
                            .getNombre()
            );
        }


        if (usuario.getDepartamento() != null) {

            dto.setDepartamentoId(
                    usuario
                            .getDepartamento()
                            .getId()
            );

            dto.setDepartamentoNombre(
                    usuario
                            .getDepartamento()
                            .getNombre()
            );
        }


        // Nunca devolver la contraseña.
        return dto;
    }
}