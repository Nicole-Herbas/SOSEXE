package bo.edu.sos.backend.service;

import bo.edu.sos.backend.constants.NoticiaConstants;
import bo.edu.sos.backend.dto.NoticiaDTO;
import bo.edu.sos.backend.entity.Noticia;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.exception.BadRequestException;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.helper.LogHelper;
import bo.edu.sos.backend.repository.NoticiaRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
public class NoticiaService {

    private final NoticiaRepository noticiaRepository;
    private final UsuarioRepository usuarioRepository;


    public NoticiaService(
            NoticiaRepository noticiaRepository,
            UsuarioRepository usuarioRepository) {

        this.noticiaRepository = noticiaRepository;
        this.usuarioRepository = usuarioRepository;
    }


    @Transactional(readOnly = true)
    public List<NoticiaDTO> listarTodas() {
        return noticiaRepository.findAll().stream().map(this::convertirADTO).toList();
    }

    @Transactional(readOnly = true)
    public List<NoticiaDTO> listarPublicadas() {
        return noticiaRepository
                .findByEstadoOrderByFechaPublicacionDesc(NoticiaConstants.ESTADO_PUBLICADO)
                .stream().map(this::convertirADTO).toList();
    }

    @Transactional(readOnly = true)
    public List<NoticiaDTO> listarPublicadasPorCategoria(String categoria) {
        return noticiaRepository
                .findByCategoriaAndEstadoOrderByFechaPublicacionDesc(categoria, NoticiaConstants.ESTADO_PUBLICADO)
                .stream().map(this::convertirADTO).toList();
    }

    @Transactional(readOnly = true)
    public NoticiaDTO buscarPorId(Long id) {
        Noticia noticia = noticiaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Noticia", id));
        return convertirADTO(noticia);
    }

    @Transactional(readOnly = true)
    public List<NoticiaDTO> buscarPorCategoria(String categoria) {
        return noticiaRepository.findByCategoria(categoria)
                .stream().map(this::convertirADTO).toList();
    }

    @Transactional
    public NoticiaDTO guardar(NoticiaDTO dto, String emailAutor) {
        Usuario autor = usuarioRepository.findByEmail(emailAutor)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario autenticado no encontrado"));

        Noticia noticia = new Noticia();
        copiarDTOaEntidad(dto, noticia);
        noticia.setAutor(autor); // Asignación segura desde el token
        noticia.setEstado(NoticiaConstants.ESTADO_BORRADOR);

        Noticia guardada = noticiaRepository.save(noticia);
        LogHelper.info(NoticiaService.class, "Noticia creada. id={}", guardada.getId());
        return convertirADTO(guardada);
    }

    @Transactional
    public NoticiaDTO actualizar(Long id, NoticiaDTO dto) {
        Noticia noticia = noticiaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Noticia", id));

        // Regla SOS-76: Solo se editan borradores
        if (!NoticiaConstants.ESTADO_BORRADOR.equals(noticia.getEstado())) {
            throw new BadRequestException("Solo se pueden editar noticias en estado BORRADOR.");
        }

        copiarDTOaEntidad(dto, noticia);
        Noticia actualizada = noticiaRepository.save(noticia);
        LogHelper.info(NoticiaService.class, "Noticia actualizada. id={}", id);
        return convertirADTO(actualizada);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!noticiaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Noticia", id);
        }
        noticiaRepository.deleteById(id);
    }

    private void copiarDTOaEntidad(NoticiaDTO dto, Noticia noticia) {
        noticia.setTitulo(dto.getTitulo());
        noticia.setContenido(dto.getContenido());
        noticia.setCategoria(dto.getCategoria());
        noticia.setImagenUrl(dto.getImagenUrl());
        noticia.setFuente(dto.getFuente());
        noticia.setFechaPublicacion(dto.getFechaPublicacion());
    }

    private NoticiaDTO convertirADTO(Noticia noticia) {
        NoticiaDTO dto = new NoticiaDTO();
        dto.setId(noticia.getId());
        dto.setTitulo(noticia.getTitulo());
        dto.setContenido(noticia.getContenido());
        dto.setCategoria(noticia.getCategoria());
        dto.setImagenUrl(noticia.getImagenUrl());
        dto.setFuente(noticia.getFuente());
        dto.setFechaPublicacion(noticia.getFechaPublicacion());
        dto.setEstado(noticia.getEstado());

        if (noticia.getAutor() != null) {
            dto.setAutorId(noticia.getAutor().getId());
            dto.setAutorNombre(noticia.getAutor().getNombre());
        }
        return dto;
    }
}