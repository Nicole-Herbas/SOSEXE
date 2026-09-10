package bo.edu.sos.backend.service;

import bo.edu.sos.backend.dto.PostulacionDTO;
import bo.edu.sos.backend.entity.Postulacion;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.entity.Voluntariado;
import bo.edu.sos.backend.exception.DuplicateResourceException;
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
    public List<PostulacionDTO> listarPorVoluntariado(Long voluntariadoId) {
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

    @Transactional
    public PostulacionDTO crear(PostulacionDTO dto) {

        if (postulacionRepository.existsByVoluntariadoIdAndUsuarioId(
                dto.getVoluntariadoId(), dto.getUsuarioId())) {
            throw new DuplicateResourceException(
                    "El usuario ya se postuló a este voluntariado");
        }

        Postulacion postulacion = new Postulacion();

        Voluntariado voluntariado = voluntariadoRepository
                .findById(dto.getVoluntariadoId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Voluntariado", dto.getVoluntariadoId()));
        postulacion.setVoluntariado(voluntariado);

        Usuario usuario = usuarioRepository
                .findById(dto.getUsuarioId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Usuario", dto.getUsuarioId()));
        postulacion.setUsuario(usuario);

        postulacion.setEstado("PENDIENTE");
        postulacion.setDisponibilidad(dto.getDisponibilidad());
        postulacion.setComentario(dto.getComentario());

        Postulacion guardada = postulacionRepository.save(postulacion);

        return convertirADTO(guardada);
    }

    @Transactional
    public PostulacionDTO actualizarEstado(Long id, String nuevoEstado) {

        Postulacion postulacion = postulacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Postulación", id));

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
