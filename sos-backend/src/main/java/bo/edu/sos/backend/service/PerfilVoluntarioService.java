package bo.edu.sos.backend.service;

import bo.edu.sos.backend.dto.PerfilVoluntarioDTO;
import bo.edu.sos.backend.entity.Departamento;
import bo.edu.sos.backend.entity.PerfilVoluntario;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.exception.DuplicateResourceException;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.helper.LogHelper;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.PerfilVoluntarioRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
public class PerfilVoluntarioService {

    private final PerfilVoluntarioRepository perfilRepository;
    private final UsuarioRepository usuarioRepository;
    private final DepartamentoRepository departamentoRepository;


    public PerfilVoluntarioService(
            PerfilVoluntarioRepository perfilRepository,
            UsuarioRepository usuarioRepository,
            DepartamentoRepository departamentoRepository) {

        this.perfilRepository = perfilRepository;
        this.usuarioRepository = usuarioRepository;
        this.departamentoRepository = departamentoRepository;
    }


    @Transactional
    public PerfilVoluntarioDTO crear(
            String emailUsuario,
            PerfilVoluntarioDTO dto) {

        Usuario usuario =
                usuarioRepository.findByEmail(emailUsuario)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No existe un usuario con email: "
                                                + emailUsuario
                                )
                        );

        if (perfilRepository.existsByUsuarioId(usuario.getId())) {
            LogHelper.warn(
                    PerfilVoluntarioService.class,
                    "Intento de registrar perfil de voluntario duplicado. usuarioId={}",
                    usuario.getId()
            );
            throw new DuplicateResourceException(
                    "El usuario ya tiene un perfil de voluntario"
            );
        }

        Departamento departamento =
                departamentoRepository
                        .findById(dto.getDepartamentoId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Departamento",
                                        dto.getDepartamentoId()
                                 )
                        );

        PerfilVoluntario perfil = new PerfilVoluntario();

        perfil.setUsuario(usuario);
        perfil.setTelefono(dto.getTelefono());
        perfil.setEmailContacto(dto.getEmailContacto());
        perfil.setDepartamento(departamento);
        perfil.setCiudad(dto.getCiudad());
        perfil.setHabilidades(
                String.join(",", dto.getHabilidades())
        );
        perfil.setDisponibilidad(
                String.join(",", dto.getDisponibilidad())
        );

        PerfilVoluntario guardado =
                perfilRepository.save(perfil);

        LogHelper.info(
                PerfilVoluntarioService.class,
                "Perfil de voluntario creado correctamente. id={}, usuarioId={}, departamentoId={}",
                guardado.getId(),
                usuario.getId(),
                departamento.getId()
        );

        return convertirADTO(guardado);
    }


    @Transactional(readOnly = true)
    public PerfilVoluntarioDTO obtenerPorUsuario(
            String emailUsuario) {

        Usuario usuario =
                usuarioRepository.findByEmail(emailUsuario)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No existe un usuario con email: "
                                                + emailUsuario
                                )
                        );

        PerfilVoluntario perfil =
                perfilRepository.findByUsuarioId(usuario.getId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "El usuario no tiene un perfil de voluntario"
                                )
                        );

        LogHelper.debug(
                PerfilVoluntarioService.class,
                "Perfil de voluntario consultado. usuarioId={}, perfilId={}",
                usuario.getId(),
                perfil.getId()
        );

        return convertirADTO(perfil);
    }


    @Transactional
    public PerfilVoluntarioDTO actualizar(
            String emailUsuario,
            PerfilVoluntarioDTO dto) {

        Usuario usuario =
                usuarioRepository.findByEmail(emailUsuario)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No existe un usuario con email: "
                                                + emailUsuario
                                )
                        );

        PerfilVoluntario perfil =
                perfilRepository.findByUsuarioId(usuario.getId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "El usuario no tiene un perfil de voluntario"
                                )
                        );

        Departamento departamento =
                departamentoRepository
                        .findById(dto.getDepartamentoId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Departamento",
                                        dto.getDepartamentoId()
                                )
                        );

        perfil.setTelefono(dto.getTelefono());
        perfil.setEmailContacto(dto.getEmailContacto());
        perfil.setDepartamento(departamento);
        perfil.setCiudad(dto.getCiudad());
        perfil.setHabilidades(
                String.join(",", dto.getHabilidades())
        );
        perfil.setDisponibilidad(
                String.join(",", dto.getDisponibilidad())
        );

        PerfilVoluntario actualizado =
                perfilRepository.save(perfil);

        LogHelper.info(
                PerfilVoluntarioService.class,
                "Perfil de voluntario actualizado correctamente. id={}, usuarioId={}, departamentoId={}",
                actualizado.getId(),
                usuario.getId(),
                departamento.getId()
        );

        return convertirADTO(actualizado);
    }


    @Transactional(readOnly = true)
    public boolean existePerfil(String emailUsuario) {

        Usuario usuario =
                usuarioRepository.findByEmail(emailUsuario)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No existe un usuario con email: "
                                                + emailUsuario
                                )
                        );

        boolean existe = perfilRepository.existsByUsuarioId(
                usuario.getId()
        );

        LogHelper.debug(
                PerfilVoluntarioService.class,
                "Verificación de perfil de voluntario. usuarioId={}, existe={}",
                usuario.getId(),
                existe
        );

        return existe;
    }


    private PerfilVoluntarioDTO convertirADTO(
            PerfilVoluntario perfil) {

        PerfilVoluntarioDTO dto = new PerfilVoluntarioDTO();

        dto.setId(perfil.getId());
        dto.setTelefono(perfil.getTelefono());
        dto.setEmailContacto(perfil.getEmailContacto());
        dto.setCiudad(perfil.getCiudad());

        dto.setHabilidades(
                csvALista(perfil.getHabilidades())
        );

        dto.setDisponibilidad(
                csvALista(perfil.getDisponibilidad())
        );

        if (perfil.getUsuario() != null) {
            dto.setNombreUsuario(
                    perfil.getUsuario().getNombre()
            );
            dto.setEmailUsuario(
                    perfil.getUsuario().getEmail()
            );
        }

        if (perfil.getDepartamento() != null) {
            dto.setDepartamentoId(
                    perfil.getDepartamento().getId()
            );
            dto.setDepartamentoNombre(
                    perfil.getDepartamento().getNombre()
            );
        }

        return dto;
    }


    private List<String> csvALista(String csv) {

        if (csv == null || csv.isBlank()) {
            return List.of();
        }

        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
