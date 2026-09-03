package bo.edu.sos.backend.service;

import bo.edu.sos.backend.dto.AlertaDTO;
import bo.edu.sos.backend.entity.Alerta;
import bo.edu.sos.backend.entity.Departamento;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.repository.AlertaRepository;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AlertaService {

    private final AlertaRepository alertaRepository;
    private final DepartamentoRepository departamentoRepository;
    private final UsuarioRepository usuarioRepository;

    public AlertaService(
            AlertaRepository alertaRepository,
            DepartamentoRepository departamentoRepository,
            UsuarioRepository usuarioRepository) {

        this.alertaRepository = alertaRepository;
        this.departamentoRepository = departamentoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<AlertaDTO> listarTodas() {
        return alertaRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public AlertaDTO buscarPorId(Long id) {
        Alerta alerta = alertaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alerta", id));

        return convertirADTO(alerta);
    }

    @Transactional(readOnly = true)
    public List<AlertaDTO> buscarPorDepartamento(Long departamentoId) {
        return alertaRepository.findByDepartamentoId(departamentoId)
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    @Transactional
    public AlertaDTO guardar(AlertaDTO dto) {

        Alerta alerta = new Alerta();
        copiarDTOaEntidad(dto, alerta);
        alerta.setEstado("BORRADOR");

        Alerta guardada = alertaRepository.save(alerta);

        return convertirADTO(guardada);
    }

    @Transactional
    public AlertaDTO actualizar(Long id, AlertaDTO dto) {

        Alerta alerta = alertaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alerta", id));

        copiarDTOaEntidad(dto, alerta);

        Alerta actualizada = alertaRepository.save(alerta);

        return convertirADTO(actualizada);
    }

    @Transactional
    public void eliminar(Long id) {

        if (!alertaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Alerta", id);
        }

        alertaRepository.deleteById(id);
    }

    private void copiarDTOaEntidad(AlertaDTO dto, Alerta alerta) {

        alerta.setTitulo(dto.getTitulo());
        alerta.setMensaje(dto.getMensaje());
        alerta.setSeveridad(dto.getSeveridad());
        alerta.setFechaPublicacion(dto.getFechaPublicacion());
        alerta.setFechaExpiracion(dto.getFechaExpiracion());

        if (dto.getEstado() != null) {
            alerta.setEstado(dto.getEstado());
        }

        Departamento departamento = departamentoRepository
                .findById(dto.getDepartamentoId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Departamento", dto.getDepartamentoId()));
        alerta.setDepartamento(departamento);

        Usuario creador = usuarioRepository
                .findById(dto.getCreadoPorId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Usuario", dto.getCreadoPorId()));
        alerta.setCreadoPor(creador);
    }

    private AlertaDTO convertirADTO(Alerta alerta) {

        AlertaDTO dto = new AlertaDTO();

        dto.setId(alerta.getId());
        dto.setTitulo(alerta.getTitulo());
        dto.setMensaje(alerta.getMensaje());
        dto.setSeveridad(alerta.getSeveridad());
        dto.setFechaPublicacion(alerta.getFechaPublicacion());
        dto.setFechaExpiracion(alerta.getFechaExpiracion());
        dto.setEstado(alerta.getEstado());

        if (alerta.getDepartamento() != null) {
            dto.setDepartamentoId(alerta.getDepartamento().getId());
            dto.setDepartamentoNombre(alerta.getDepartamento().getNombre());
        }

        if (alerta.getCreadoPor() != null) {
            dto.setCreadoPorId(alerta.getCreadoPor().getId());
        }

        return dto;
    }
}
