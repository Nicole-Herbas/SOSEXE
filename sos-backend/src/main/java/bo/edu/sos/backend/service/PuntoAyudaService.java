package bo.edu.sos.backend.service;

import bo.edu.sos.backend.dto.PuntoAyudaDTO;
import bo.edu.sos.backend.entity.Departamento;
import bo.edu.sos.backend.entity.Necesidad;
import bo.edu.sos.backend.entity.PuntoAyuda;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.NecesidadRepository;
import bo.edu.sos.backend.repository.PuntoAyudaRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class PuntoAyudaService {

    private final PuntoAyudaRepository puntoAyudaRepository;
    private final DepartamentoRepository departamentoRepository;
    private final UsuarioRepository usuarioRepository;
    private final NecesidadRepository necesidadRepository;

    public PuntoAyudaService(
            PuntoAyudaRepository puntoAyudaRepository,
            DepartamentoRepository departamentoRepository,
            UsuarioRepository usuarioRepository,
            NecesidadRepository necesidadRepository) {

        this.puntoAyudaRepository = puntoAyudaRepository;
        this.departamentoRepository = departamentoRepository;
        this.usuarioRepository = usuarioRepository;
        this.necesidadRepository = necesidadRepository;
    }

    @Transactional(readOnly = true)
    public List<PuntoAyudaDTO> listarTodos() {
        return puntoAyudaRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public PuntoAyudaDTO buscarPorId(Long id) {
        PuntoAyuda punto = puntoAyudaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Punto de ayuda", id));

        return convertirADTO(punto);
    }

    @Transactional(readOnly = true)
    public List<PuntoAyudaDTO> buscarPorDepartamento(Long departamentoId) {
        return puntoAyudaRepository.findByDepartamentoId(departamentoId)
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    @Transactional
    public PuntoAyudaDTO guardar(PuntoAyudaDTO dto) {

        PuntoAyuda punto = new PuntoAyuda();
        copiarDTOaEntidad(dto, punto);
        punto.setEstadoVerificacion("PENDIENTE");

        PuntoAyuda guardado = puntoAyudaRepository.save(punto);

        return convertirADTO(guardado);
    }

    @Transactional
    public PuntoAyudaDTO actualizar(Long id, PuntoAyudaDTO dto) {

        PuntoAyuda punto = puntoAyudaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Punto de ayuda", id));

        copiarDTOaEntidad(dto, punto);

        PuntoAyuda actualizado = puntoAyudaRepository.save(punto);

        return convertirADTO(actualizado);
    }

    @Transactional
    public void eliminar(Long id) {

        if (!puntoAyudaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Punto de ayuda", id);
        }

        puntoAyudaRepository.deleteById(id);
    }

    private void copiarDTOaEntidad(PuntoAyudaDTO dto, PuntoAyuda punto) {

        punto.setNombre(dto.getNombre());
        punto.setTipo(dto.getTipo());
        punto.setDescripcion(dto.getDescripcion());
        punto.setDireccion(dto.getDireccion());
        punto.setCiudad(dto.getCiudad());
        punto.setLatitud(dto.getLatitud());
        punto.setLongitud(dto.getLongitud());

        Departamento departamento = departamentoRepository
                .findById(dto.getDepartamentoId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Departamento", dto.getDepartamentoId()));
        punto.setDepartamento(departamento);

        Usuario creador = usuarioRepository
                .findById(dto.getCreadorId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Usuario", dto.getCreadorId()));
        punto.setCreador(creador);

        if (dto.getNecesidadIds() != null && !dto.getNecesidadIds().isEmpty()) {
            Set<Necesidad> necesidades = new HashSet<>(
                    necesidadRepository.findAllById(dto.getNecesidadIds()));
            punto.setNecesidades(necesidades);
        } else {
            punto.setNecesidades(new HashSet<>());
        }
    }

    private PuntoAyudaDTO convertirADTO(PuntoAyuda punto) {

        PuntoAyudaDTO dto = new PuntoAyudaDTO();

        dto.setId(punto.getId());
        dto.setNombre(punto.getNombre());
        dto.setTipo(punto.getTipo());
        dto.setDescripcion(punto.getDescripcion());
        dto.setDireccion(punto.getDireccion());
        dto.setCiudad(punto.getCiudad());
        dto.setLatitud(punto.getLatitud());
        dto.setLongitud(punto.getLongitud());
        dto.setEstadoVerificacion(punto.getEstadoVerificacion());

        if (punto.getDepartamento() != null) {
            dto.setDepartamentoId(punto.getDepartamento().getId());
        }

        if (punto.getCreador() != null) {
            dto.setCreadorId(punto.getCreador().getId());
        }

        if (punto.getNecesidades() != null) {
            dto.setNecesidadIds(
                    punto.getNecesidades().stream()
                            .map(Necesidad::getId)
                            .toList());
        }

        return dto;
    }
}
