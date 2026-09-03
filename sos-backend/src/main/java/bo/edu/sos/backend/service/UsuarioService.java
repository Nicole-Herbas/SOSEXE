package bo.edu.sos.backend.service;

import bo.edu.sos.backend.dto.UsuarioDTO;
import bo.edu.sos.backend.entity.Departamento;
import bo.edu.sos.backend.entity.Rol;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.exception.DuplicateResourceException;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.RolRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final DepartamentoRepository departamentoRepository;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            DepartamentoRepository departamentoRepository) {

        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.departamentoRepository = departamentoRepository;
    }

    @Transactional(readOnly = true)
    public List<UsuarioDTO> listarTodos() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public UsuarioDTO buscarPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));

        return convertirADTO(usuario);
    }

    @Transactional(readOnly = true)
    public UsuarioDTO buscarPorEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe un usuario con email: " + email));

        return convertirADTO(usuario);
    }

    @Transactional
    public UsuarioDTO guardar(UsuarioDTO dto) {

        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException(
                    "Ya existe un usuario con email: " + dto.getEmail());
        }

        Usuario usuario = new Usuario();
        copiarDTOaEntidad(dto, usuario);

        Usuario guardado = usuarioRepository.save(usuario);

        return convertirADTO(guardado);
    }

    @Transactional
    public UsuarioDTO actualizar(Long id, UsuarioDTO dto) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));

        // Verificar email duplicado si cambió
        if (!usuario.getEmail().equals(dto.getEmail())
                && usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException(
                    "Ya existe un usuario con email: " + dto.getEmail());
        }

        copiarDTOaEntidad(dto, usuario);

        Usuario actualizado = usuarioRepository.save(usuario);

        return convertirADTO(actualizado);
    }

    @Transactional
    public void eliminar(Long id) {

        if (!usuarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuario", id);
        }

        usuarioRepository.deleteById(id);
    }

    private void copiarDTOaEntidad(UsuarioDTO dto, Usuario usuario) {

        usuario.setNombre(dto.getNombre());
        usuario.setEmail(dto.getEmail());
        usuario.setTelefono(dto.getTelefono());

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            usuario.setPassword(dto.getPassword());
        }

        if (dto.getActivo() != null) {
            usuario.setActivo(dto.getActivo());
        }

        Rol rol = rolRepository.findById(dto.getRolId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Rol", dto.getRolId()));
        usuario.setRol(rol);

        if (dto.getDepartamentoId() != null) {
            Departamento departamento = departamentoRepository
                    .findById(dto.getDepartamentoId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Departamento", dto.getDepartamentoId()));
            usuario.setDepartamento(departamento);
        } else {
            usuario.setDepartamento(null);
        }
    }

    private UsuarioDTO convertirADTO(Usuario usuario) {

        UsuarioDTO dto = new UsuarioDTO();

        dto.setId(usuario.getId());
        dto.setNombre(usuario.getNombre());
        dto.setEmail(usuario.getEmail());
        dto.setTelefono(usuario.getTelefono());
        dto.setActivo(usuario.getActivo());

        if (usuario.getRol() != null) {
            dto.setRolId(usuario.getRol().getId());
            dto.setRolNombre(usuario.getRol().getNombre());
        }

        if (usuario.getDepartamento() != null) {
            dto.setDepartamentoId(usuario.getDepartamento().getId());
            dto.setDepartamentoNombre(usuario.getDepartamento().getNombre());
        }

        // No devolver password en respuestas
        return dto;
    }
}
