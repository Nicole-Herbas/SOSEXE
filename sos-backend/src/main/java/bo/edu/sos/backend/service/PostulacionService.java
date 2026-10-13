package bo.edu.sos.backend.service;

import bo.edu.sos.backend.constants.EstadoPostulacion;
import bo.edu.sos.backend.dto.PostulacionDTO;
import bo.edu.sos.backend.entity.Postulacion;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.entity.Voluntariado;
import bo.edu.sos.backend.exception.BadRequestException;
import bo.edu.sos.backend.exception.DuplicateResourceException;
import bo.edu.sos.backend.exception.ForbiddenException;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.repository.PostulacionRepository;
import bo.edu.sos.backend.repository.PerfilVoluntarioRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import bo.edu.sos.backend.repository.VoluntariadoRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
public class PostulacionService {

    private final PostulacionRepository postulacionRepository;
    private final VoluntariadoRepository voluntariadoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PerfilVoluntarioRepository perfilVoluntarioRepository;
    private final Clock clock;

    @Autowired
    public PostulacionService(
            PostulacionRepository postulacionRepository,
            VoluntariadoRepository voluntariadoRepository,
            UsuarioRepository usuarioRepository,
            PerfilVoluntarioRepository perfilVoluntarioRepository) {

        this(postulacionRepository, voluntariadoRepository, usuarioRepository,
                perfilVoluntarioRepository, Clock.system(ZoneId.of("America/La_Paz")));
    }

    PostulacionService(
            PostulacionRepository postulacionRepository,
            VoluntariadoRepository voluntariadoRepository,
            UsuarioRepository usuarioRepository,
            PerfilVoluntarioRepository perfilVoluntarioRepository,
            Clock clock) {

        this.postulacionRepository = postulacionRepository;
        this.voluntariadoRepository = voluntariadoRepository;
        this.usuarioRepository = usuarioRepository;
        this.perfilVoluntarioRepository = perfilVoluntarioRepository;
        this.clock = clock;
    }

    @Transactional
    public PostulacionDTO crear(
            PostulacionDTO dto,
            String emailAutenticado) {

        if (emailAutenticado == null || emailAutenticado.isBlank()) {
            throw new BadCredentialsException("Se requiere una sesión válida para postularse");
        }

        Usuario usuario = usuarioRepository
                .findByEmail(emailAutenticado)
                .filter(encontrado -> Boolean.TRUE.equals(encontrado.getActivo()))
                .orElseThrow(() -> new BadCredentialsException(
                        "Se requiere una sesión válida para postularse"));

        if (perfilVoluntarioRepository.findByUsuarioId(usuario.getId()).isEmpty()) {
            throw new ForbiddenException("Debes registrar un perfil de voluntario antes de postularte");
        }

        if (dto == null || dto.getVoluntariadoId() == null) {
            throw new BadRequestException("El voluntariado es obligatorio");
        }
        if (dto.getDisponibilidad() == null || dto.getDisponibilidad().isBlank()
                || dto.getDisponibilidad().length() > 255) {
            throw new BadRequestException("La disponibilidad es obligatoria y no puede superar los 255 caracteres");
        }

        if (postulacionRepository.existsByVoluntariadoIdAndUsuarioId(
                dto.getVoluntariadoId(), usuario.getId())) {

            throw new DuplicateResourceException(
                    "El usuario ya se postuló a este voluntariado");
        }

        Voluntariado voluntariado = voluntariadoRepository
                .findById(dto.getVoluntariadoId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Voluntariado", dto.getVoluntariadoId()));

        if (!"PUBLICADO".equals(voluntariado.getEstado())) {
            throw new BadRequestException("La oportunidad no está publicada");
        }
        // DATETIME y LocalDateTime conservan la hora local del proyecto, incluso en servidores UTC.
        if (voluntariado.getFechaFin() == null) {
            throw new BadRequestException("La oportunidad no tiene una fecha de finalización informada");
        }
        if (voluntariado.getFechaFin().isBefore(LocalDateTime.now(clock))) {
            throw new BadRequestException("La oportunidad ya finalizó");
        }

        Postulacion postulacion = new Postulacion();
        postulacion.setVoluntariado(voluntariado);
        postulacion.setUsuario(usuario);
        postulacion.setEstado(EstadoPostulacion.PENDIENTE);
        postulacion.setDisponibilidad(dto.getDisponibilidad());
        postulacion.setComentario(dto.getComentario());

        try {
            // El UNIQUE es la garantía ante dos solicitudes que superen la comprobación previa.
            // El flush permite traducir la colisión antes de salir de la transacción, que se revierte.
            return convertirADTO(postulacionRepository.saveAndFlush(postulacion));
        } catch (DataIntegrityViolationException ex) {
            if (esPostulacionDuplicada(ex)) {
                throw new DuplicateResourceException("El usuario ya se postuló a este voluntariado");
            }
            throw ex;
        }
    }

    private boolean esPostulacionDuplicada(DataIntegrityViolationException ex) {
        for (Throwable causa = ex; causa != null; causa = causa.getCause()) {
            if (causa instanceof org.hibernate.exception.ConstraintViolationException violacion
                    && violacion.getConstraintName() != null) {
                String nombre = violacion.getConstraintName().replace("`", "").replace("'", "");
                if (nombre.equals("uk_postulacion_usuario_voluntariado")
                        || nombre.endsWith(".uk_postulacion_usuario_voluntariado")) {
                    return true;
                }
            }
        }
        return false;
    }

    @Transactional(readOnly = true)
    public List<PostulacionDTO> listarPorVoluntariado(
            Long voluntariadoId,
            String emailAutenticado) {

        Usuario usuario = usuarioRepository
                .findByEmail(emailAutenticado)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe un usuario con email: " + emailAutenticado));

        Voluntariado voluntariado = voluntariadoRepository
                .findById(voluntariadoId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Voluntariado", voluntariadoId));

        boolean esAdmin = "ADMIN".equals(usuario.getRol().getNombre());
        boolean esResponsable = voluntariado.getCentro().getResponsable() != null
                && voluntariado.getCentro().getResponsable().getId()
                        .equals(usuario.getId());

        if (!esAdmin && !esResponsable) {
            throw new ForbiddenException(
                    "No tienes permiso para ver las postulaciones de este voluntariado");
        }

        return postulacionRepository.findByVoluntariadoId(voluntariadoId)
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
    public List<PostulacionDTO> listarPorEmail(String email) {

        Usuario usuario = usuarioRepository
                .findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe un usuario con email: " + email));

        return postulacionRepository.findByUsuarioId(usuario.getId())
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    @Transactional
    public PostulacionDTO actualizarEstado(
            Long id,
            String nuevoEstado,
            String emailAutenticado) {

        if (!EstadoPostulacion.esValido(nuevoEstado)) {
            throw new BadRequestException(
                    "Estado de postulación inválido: " + nuevoEstado
                            + ". Valores permitidos: "
                            + EstadoPostulacion.VALORES);
        }

        Postulacion postulacion = postulacionRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Postulacion", id));

        Usuario usuario = usuarioRepository
                .findByEmail(emailAutenticado)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe un usuario con email: " + emailAutenticado));

        boolean esAdmin = "ADMIN".equals(usuario.getRol().getNombre());
        boolean esResponsable = postulacion.getVoluntariado()
                .getCentro().getResponsable() != null
                && postulacion.getVoluntariado().getCentro()
                        .getResponsable().getId().equals(usuario.getId());

        if (!esAdmin && !esResponsable) {
            throw new ForbiddenException(
                    "No tienes permiso para cambiar el estado de esta postulación");
        }

        postulacion.setEstado(nuevoEstado);

        Postulacion actualizada = postulacionRepository.save(postulacion);

        return convertirADTO(actualizada);
    }

    private PostulacionDTO convertirADTO(Postulacion postulacion) {

        PostulacionDTO dto = new PostulacionDTO();

        dto.setId(postulacion.getId());
        dto.setEstado(postulacion.getEstado());
        dto.setDisponibilidad(postulacion.getDisponibilidad());
        dto.setComentario(postulacion.getComentario());
        dto.setFechaPostulacion(postulacion.getFechaPostulacion());

        if (postulacion.getUsuario() != null) {
            dto.setUsuarioId(postulacion.getUsuario().getId());
            dto.setUsuarioNombre(postulacion.getUsuario().getNombre());
        }

        if (postulacion.getVoluntariado() != null) {
            dto.setVoluntariadoId(postulacion.getVoluntariado().getId());
            dto.setVoluntariadoTitulo(postulacion.getVoluntariado().getTitulo());
        }

        return dto;
    }
}
