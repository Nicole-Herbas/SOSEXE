package bo.edu.sos.backend.service;

import bo.edu.sos.backend.constants.NoticiaConstants;
import bo.edu.sos.backend.dto.NoticiaDTO;
import bo.edu.sos.backend.entity.Noticia;
import bo.edu.sos.backend.entity.Usuario;
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

        List<NoticiaDTO> noticias =
                noticiaRepository
                        .findAll()
                        .stream()
                        .map(this::convertirADTO)
                        .toList();


        LogHelper.debug(
                NoticiaService.class,
                "Listado de noticias obtenido. cantidad={}",
                noticias.size()
        );


        return noticias;
    }


    @Transactional(readOnly = true)
    public List<NoticiaDTO> listarPublicadas() {

        List<NoticiaDTO> noticias =
                noticiaRepository
                        .findByEstadoOrderByFechaPublicacionDesc(
                                NoticiaConstants.ESTADO_PUBLICADO
                        )
                        .stream()
                        .map(this::convertirADTO)
                        .toList();


        LogHelper.debug(
                NoticiaService.class,
                "Listado de noticias publicadas obtenido. cantidad={}",
                noticias.size()
        );


        return noticias;
    }


    @Transactional(readOnly = true)
    public List<NoticiaDTO> listarPublicadasPorCategoria(
            String categoria) {

        List<NoticiaDTO> noticias =
                noticiaRepository
                        .findByCategoriaAndEstadoOrderByFechaPublicacionDesc(
                                categoria,
                                NoticiaConstants.ESTADO_PUBLICADO
                        )
                        .stream()
                        .map(this::convertirADTO)
                        .toList();


        LogHelper.debug(
                NoticiaService.class,
                "Noticias publicadas consultadas por categoría. cantidad={}",
                noticias.size()
        );


        return noticias;
    }


    @Transactional(readOnly = true)
    public NoticiaDTO buscarPorId(
            Long id) {

        Noticia noticia =
                noticiaRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Noticia",
                                        id
                                )
                        );


        LogHelper.debug(
                NoticiaService.class,
                "Noticia consultada correctamente. id={}",
                id
        );


        return convertirADTO(
                noticia
        );
    }


    @Transactional(readOnly = true)
    public List<NoticiaDTO> buscarPorCategoria(
            String categoria) {

        List<NoticiaDTO> noticias =
                noticiaRepository
                        .findByCategoria(
                                categoria
                        )
                        .stream()
                        .map(this::convertirADTO)
                        .toList();


        LogHelper.debug(
                NoticiaService.class,
                "Noticias consultadas por categoría. cantidad={}",
                noticias.size()
        );


        return noticias;
    }


    @Transactional
    public NoticiaDTO guardar(
            NoticiaDTO dto) {

        Noticia noticia =
                new Noticia();


        copiarDTOaEntidad(
                dto,
                noticia
        );


        noticia.setEstado(
                "BORRADOR"
        );


        Noticia guardada =
                noticiaRepository.save(
                        noticia
                );


        LogHelper.info(
                NoticiaService.class,
                "Noticia creada correctamente. id={}, estado={}",
                guardada.getId(),
                guardada.getEstado()
        );


        return convertirADTO(
                guardada
        );
    }


    @Transactional
    public NoticiaDTO actualizar(
            Long id,
            NoticiaDTO dto) {

        Noticia noticia =
                noticiaRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Noticia",
                                        id
                                )
                        );


        copiarDTOaEntidad(
                dto,
                noticia
        );


        Noticia actualizada =
                noticiaRepository.save(
                        noticia
                );


        LogHelper.info(
                NoticiaService.class,
                "Noticia actualizada correctamente. id={}, estado={}",
                id,
                actualizada.getEstado()
        );


        return convertirADTO(
                actualizada
        );
    }


    @Transactional
    public void eliminar(
            Long id) {

        if (!noticiaRepository.existsById(id)) {

            throw new ResourceNotFoundException(
                    "Noticia",
                    id
            );
        }


        noticiaRepository.deleteById(
                id
        );


        LogHelper.info(
                NoticiaService.class,
                "Noticia eliminada correctamente. id={}",
                id
        );
    }


    private void copiarDTOaEntidad(
            NoticiaDTO dto,
            Noticia noticia) {

        noticia.setTitulo(
                dto.getTitulo()
        );

        noticia.setContenido(
                dto.getContenido()
        );

        noticia.setCategoria(
                dto.getCategoria()
        );

        noticia.setImagenUrl(
                dto.getImagenUrl()
        );

        noticia.setFuente(
                dto.getFuente()
        );

        noticia.setFechaPublicacion(
                dto.getFechaPublicacion()
        );


        if (dto.getEstado() != null) {

            noticia.setEstado(
                    dto.getEstado()
            );
        }


        if (dto.getAutorId() != null) {

            Usuario autor =
                    usuarioRepository
                            .findById(
                                    dto.getAutorId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Usuario",
                                            dto.getAutorId()
                                    )
                            );


            noticia.setAutor(
                    autor
            );
        }
    }


    private NoticiaDTO convertirADTO(
            Noticia noticia) {

        NoticiaDTO dto =
                new NoticiaDTO();


        dto.setId(
                noticia.getId()
        );

        dto.setTitulo(
                noticia.getTitulo()
        );

        dto.setContenido(
                noticia.getContenido()
        );

        dto.setCategoria(
                noticia.getCategoria()
        );

        dto.setImagenUrl(
                noticia.getImagenUrl()
        );

        dto.setFuente(
                noticia.getFuente()
        );

        dto.setFechaPublicacion(
                noticia.getFechaPublicacion()
        );

        dto.setEstado(
                noticia.getEstado()
        );


        if (noticia.getAutor() != null) {

            dto.setAutorId(
                    noticia
                            .getAutor()
                            .getId()
            );

            dto.setAutorNombre(
                    noticia
                            .getAutor()
                            .getNombre()
            );
        }


        return dto;
    }
}