package bo.edu.sos.backend.service;

import bo.edu.sos.backend.dto.VoluntariadoDTO;
import bo.edu.sos.backend.entity.Centro;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.entity.Voluntariado;
import bo.edu.sos.backend.exception.BadRequestException;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.repository.CentroRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import bo.edu.sos.backend.repository.VoluntariadoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import bo.edu.sos.backend.exception.ForbiddenException;

import java.util.List;

@Service
public class VoluntariadoService {

    private final VoluntariadoRepository voluntariadoRepository;
    private final CentroRepository centroRepository;
    private final UsuarioRepository usuarioRepository;

    public VoluntariadoService(
            VoluntariadoRepository voluntariadoRepository,
            CentroRepository centroRepository,
            UsuarioRepository usuarioRepository) {

        this.voluntariadoRepository = voluntariadoRepository;
        this.centroRepository = centroRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<VoluntariadoDTO> listarTodos() {
        return voluntariadoRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public VoluntariadoDTO buscarPorId(Long id) {
        Voluntariado voluntariado = voluntariadoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voluntariado", id));

        return convertirADTO(voluntariado);
    }

    @Transactional(readOnly = true)
    public List<VoluntariadoDTO> buscarPorCentro(Long centroId) {
        return voluntariadoRepository.findByCentroId(centroId)
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    @Transactional
    public VoluntariadoDTO guardar(
            VoluntariadoDTO dto,
            String emailAutenticado) {

        if (dto.getFechaFin().isBefore(
                dto.getFechaInicio())) {

            throw new BadRequestException(
                    "La fecha de fin no puede ser anterior a la fecha de inicio"
            );
        }


        Usuario usuario =
                usuarioRepository
                        .findByEmail(emailAutenticado)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No existe un usuario con email: "
                                                + emailAutenticado
                                )
                        );


        Centro centro =
                centroRepository
                        .findById(dto.getCentroId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Centro",
                                        dto.getCentroId()
                                )
                        );


        if (!puedeAdministrarCentro(
                usuario,
                centro)) {

            throw new ForbiddenException(
                    "No tienes permiso para crear voluntariados para este centro"
            );
        }


        Voluntariado voluntariado =
                new Voluntariado();


        copiarDTOaEntidad(
                dto,
                voluntariado
        );


        voluntariado.setCreadoPor(
                usuario
        );


        voluntariado.setEstado(
                "BORRADOR"
        );


        Voluntariado guardado =
                voluntariadoRepository.save(
                        voluntariado
                );


        return convertirADTO(
                guardado
        );
    }

    @Transactional
    public VoluntariadoDTO actualizar(
            Long id,
            VoluntariadoDTO dto,
            String emailAutenticado) {

        Voluntariado voluntariado = voluntariadoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voluntariado", id));

        Usuario usuario =
                usuarioRepository
                        .findByEmail(emailAutenticado)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No existe un usuario con email: "
                                                + emailAutenticado
                                )
                        );


        if (!puedeAdministrarCentro(
                usuario,
                voluntariado.getCentro())) {

            throw new ForbiddenException(
                    "No tienes permiso para modificar este voluntariado"
            );
        }

        if (dto.getFechaFin().isBefore(dto.getFechaInicio())) {
            throw new BadRequestException(
                    "La fecha de fin no puede ser anterior a la fecha de inicio");
        }

        copiarDTOaEntidad(dto, voluntariado);

        Voluntariado actualizado = voluntariadoRepository.save(voluntariado);

        return convertirADTO(actualizado);
    }

    @Transactional
    public void eliminar(
            Long id,
            String emailAutenticado) {

        Voluntariado voluntariado =
                voluntariadoRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Voluntariado",
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


        if (!puedeAdministrarCentro(
                usuario,
                voluntariado.getCentro())) {

            throw new ForbiddenException(
                    "No tienes permiso para eliminar este voluntariado"
            );
        }


        voluntariadoRepository.delete(
                voluntariado
        );
    }

    private void copiarDTOaEntidad(VoluntariadoDTO dto, Voluntariado voluntariado) {

        voluntariado.setTitulo(dto.getTitulo());
        voluntariado.setDescripcion(dto.getDescripcion());
        voluntariado.setFechaInicio(dto.getFechaInicio());
        voluntariado.setFechaFin(dto.getFechaFin());
        voluntariado.setHabilidadesRequeridas(dto.getHabilidadesRequeridas());

        if (dto.getEstado() != null) {
            voluntariado.setEstado(dto.getEstado());
        }

        Centro centro = centroRepository.findById(dto.getCentroId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Centro", dto.getCentroId()));
        voluntariado.setCentro(centro);


    }

    private VoluntariadoDTO convertirADTO(Voluntariado voluntariado) {

        VoluntariadoDTO dto = new VoluntariadoDTO();

        dto.setId(voluntariado.getId());
        dto.setTitulo(voluntariado.getTitulo());
        dto.setDescripcion(voluntariado.getDescripcion());
        dto.setFechaInicio(voluntariado.getFechaInicio());
        dto.setFechaFin(voluntariado.getFechaFin());
        dto.setHabilidadesRequeridas(voluntariado.getHabilidadesRequeridas());
        dto.setEstado(voluntariado.getEstado());

        if (voluntariado.getCentro() != null) {
            dto.setCentroId(voluntariado.getCentro().getId());
            dto.setCentroNombre(voluntariado.getCentro().getNombre());
        }

        if (voluntariado.getCreadoPor() != null) {
            dto.setCreadoPorId(voluntariado.getCreadoPor().getId());
        }

        return dto;
    }
    private boolean puedeAdministrarCentro(
            Usuario usuario,
            Centro centro) {

        boolean esAdmin =
                "ADMIN".equals(
                        usuario.getRol().getNombre()
                );


        boolean esResponsable =
                centro.getResponsable() != null
                        && centro.getResponsable()
                        .getId()
                        .equals(usuario.getId());


        return esAdmin || esResponsable;
    }
}
