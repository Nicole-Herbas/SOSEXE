package bo.edu.sos.backend.service;

import bo.edu.sos.backend.constants.EstadoPostulacion;
import bo.edu.sos.backend.constants.Roles;
import bo.edu.sos.backend.dto.PostulacionDTO;
import bo.edu.sos.backend.entity.Postulacion;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.entity.Voluntariado;
import bo.edu.sos.backend.exception.DuplicateResourceException;
import bo.edu.sos.backend.exception.ForbiddenException;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.repository.PostulacionRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import bo.edu.sos.backend.repository.VoluntariadoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PostulacionService {

    private final PostulacionRepository postulacionRepository;
    private final VoluntariadoRepository voluntariadoRepository;
    private final UsuarioRepository usuarioRepository;

    public PostulacionService(
            PostulacionRepository postulacionRepository,
            VoluntariadoRepository voluntariadoRepository,
            UsuarioRepository usuarioRepository) {

        this.postulacionRepository = postulacionRepository;
        this.voluntariadoRepository = voluntariadoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<PostulacionDTO> listarPorVoluntariado(
            Long voluntariadoId,
            String emailAutenticado) {

        Usuario usuario =
                usuarioRepository
                        .findByEmail(emailAutenticado)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No existe un usuario con email: "
                                                + emailAutenticado
                                )
                        );


        Voluntariado voluntariado =
                voluntariadoRepository
                        .findById(voluntariadoId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Voluntariado",
                                        voluntariadoId
                                )
                        );


        boolean esAdmin =
                Roles.ADMIN.equals(
                        usuario.getRol().getNombre()
                );


        boolean esResponsable =
                voluntariado.getCentro()
                        .getResponsable() != null
                        &&
                        voluntariado.getCentro()
                                .getResponsable()
                                .getId()
                                .equals(usuario.getId());


        if (!esAdmin && !esResponsable) {

            throw new ForbiddenException(
                    "No tienes permiso para ver las postulaciones de este voluntariado"
            );
        }


        return postulacionRepository
                .findByVoluntariadoId(voluntariadoId)
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PostulacionDTO> listarPorUsuario(Long usuarioId) {
        return postulacionRepository.findByUsuarioId(usuarioId)
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PostulacionDTO> listarPorEmail(
            String email) {

        Usuario usuario =
                usuarioRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No existe un usuario con email: "
                                                + email
                                )
                        );

        return postulacionRepository
                .findByUsuarioId(usuario.getId())
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    @Transactional
    public PostulacionDTO crear(
            PostulacionDTO dto,
            String emailAutenticado) {

        Usuario usuario =
                usuarioRepository.findByEmail(
                        emailAutenticado
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No existe un usuario con email: "
                                        + emailAutenticado
                        )
                );


        if (postulacionRepository
                .existsByVoluntariadoIdAndUsuarioId(
                        dto.getVoluntariadoId(),
                        usuario.getId()
                )) {

            throw new DuplicateResourceException(
                    "El usuario ya se postuló a este voluntariado"
            );
        }


        Postulacion postulacion =
                new Postulacion();


        Voluntariado voluntariado =
                voluntariadoRepository
                        .findById(
                                dto.getVoluntariadoId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Voluntariado",
                                        dto.getVoluntariadoId()
                                )
                        );


        postulacion.setVoluntariado(
                voluntariado
        );

        postulacion.setUsuario(
                usuario
        );

        postulacion.setEstado(
                EstadoPostulacion.PENDIENTE
        );

        postulacion.setDisponibilidad(
                dto.getDisponibilidad()
        );

        postulacion.setComentario(
                dto.getComentario()
        );


        Postulacion guardada =
                postulacionRepository.save(
                        postulacion
                );


        return convertirADTO(
                guardada
        );
    }

    @Transactional
    public PostulacionDTO actualizarEstado(
            Long id,
            String nuevoEstado,
            String emailAutenticado) {

        Postulacion postulacion =
                postulacionRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Postulación",
                                        id
                                )
                        );


        Usuario usuario =
                usuarioRepository
                        .findByEmail(emailAutenticado)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No existe un usuario con email: "
                                                + emailAutenticado
                                )
                        );


        boolean esAdmin =
                Roles.ADMIN.equals(
                        usuario.getRol().getNombre()
                );


        boolean esResponsable =
                postulacion
                        .getVoluntariado()
                        .getCentro()
                        .getResponsable() != null

                        && postulacion
                        .getVoluntariado()
                        .getCentro()
                        .getResponsable()
                        .getId()
                        .equals(usuario.getId());


        if (!esAdmin && !esResponsable) {

            throw new ForbiddenException(
                    "No tienes permiso para cambiar el estado de esta postulación"
            );
        }


        postulacion.setEstado(
                nuevoEstado
        );


        Postulacion actualizada =
                postulacionRepository.save(
                        postulacion
                );


        return convertirADTO(
                actualizada
        );
    }

    private PostulacionDTO convertirADTO(Postulacion postulacion) {

        PostulacionDTO dto = new PostulacionDTO();

        dto.setId(postulacion.getId());
        dto.setEstado(postulacion.getEstado());
        dto.setDisponibilidad(postulacion.getDisponibilidad());
        dto.setComentario(postulacion.getComentario());
        dto.setFechaPostulacion(postulacion.getFechaPostulacion());

        if (postulacion.getVoluntariado() != null) {
            dto.setVoluntariadoId(postulacion.getVoluntariado().getId());
            dto.setVoluntariadoTitulo(postulacion.getVoluntariado().getTitulo());
        }

        if (postulacion.getUsuario() != null) {
            dto.setUsuarioId(postulacion.getUsuario().getId());
            dto.setUsuarioNombre(postulacion.getUsuario().getNombre());
        }

        return dto;
    }
}
