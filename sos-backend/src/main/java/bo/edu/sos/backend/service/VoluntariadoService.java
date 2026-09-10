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
    public VoluntariadoDTO guardar(VoluntariadoDTO dto) {

        if (dto.getFechaFin().isBefore(dto.getFechaInicio())) {
            throw new BadRequestException(
                    "La fecha de fin no puede ser anterior a la fecha de inicio");
        }

        Voluntariado voluntariado = new Voluntariado();
        copiarDTOaEntidad(dto, voluntariado);
        voluntariado.setEstado("BORRADOR");

        Voluntariado guardado = voluntariadoRepository.save(voluntariado);

        return convertirADTO(guardado);
    }

    @Transactional
    public VoluntariadoDTO actualizar(Long id, VoluntariadoDTO dto) {

        Voluntariado voluntariado = voluntariadoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voluntariado", id));

        if (dto.getFechaFin().isBefore(dto.getFechaInicio())) {
            throw new BadRequestException(
                    "La fecha de fin no puede ser anterior a la fecha de inicio");
        }

        copiarDTOaEntidad(dto, voluntariado);

        Voluntariado actualizado = voluntariadoRepository.save(voluntariado);

        return convertirADTO(actualizado);
    }

    @Transactional
    public void eliminar(Long id) {

        if (!voluntariadoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Voluntariado", id);
        }

        voluntariadoRepository.deleteById(id);
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

        Usuario creador = usuarioRepository.findById(dto.getCreadoPorId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Usuario", dto.getCreadoPorId()));
        voluntariado.setCreadoPor(creador);
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
}
