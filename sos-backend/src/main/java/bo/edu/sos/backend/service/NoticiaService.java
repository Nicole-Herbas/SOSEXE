package bo.edu.sos.backend.service;

import bo.edu.sos.backend.dto.NoticiaDTO;
import bo.edu.sos.backend.entity.Noticia;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
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
        return noticiaRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .toList();
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
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    @Transactional
    public NoticiaDTO guardar(NoticiaDTO dto) {

        Noticia noticia = new Noticia();
        copiarDTOaEntidad(dto, noticia);
        noticia.setEstado("BORRADOR");

        Noticia guardada = noticiaRepository.save(noticia);

        return convertirADTO(guardada);
    }

    @Transactional
    public NoticiaDTO actualizar(Long id, NoticiaDTO dto) {

        Noticia noticia = noticiaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Noticia", id));

        copiarDTOaEntidad(dto, noticia);

        Noticia actualizada = noticiaRepository.save(noticia);

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

        if (dto.getEstado() != null) {
            noticia.setEstado(dto.getEstado());
        }

        if (dto.getAutorId() != null) {
            Usuario autor = usuarioRepository.findById(dto.getAutorId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Usuario", dto.getAutorId()));
            noticia.setAutor(autor);
        }
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
