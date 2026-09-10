package bo.edu.sos.backend.service;

import bo.edu.sos.backend.dto.DonacionDTO;
import bo.edu.sos.backend.entity.Centro;
import bo.edu.sos.backend.entity.Donacion;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.repository.CentroRepository;
import bo.edu.sos.backend.repository.DonacionRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class DonacionService {

    private final DonacionRepository donacionRepository;
    private final CentroRepository centroRepository;
    private final UsuarioRepository usuarioRepository;

    public DonacionService(
            DonacionRepository donacionRepository,
            CentroRepository centroRepository,
            UsuarioRepository usuarioRepository) {

        this.donacionRepository = donacionRepository;
        this.centroRepository = centroRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<DonacionDTO> listarTodas() {
        return donacionRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public DonacionDTO buscarPorId(Long id) {
        Donacion donacion = donacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donación", id));

        return convertirADTO(donacion);
    }

    @Transactional(readOnly = true)
    public List<DonacionDTO> buscarPorCentro(Long centroId) {
        return donacionRepository.findByCentroId(centroId)
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    @Transactional
    public DonacionDTO crear(DonacionDTO dto) {

        Donacion donacion = new Donacion();

        // Generar código único automáticamente
        donacion.setCodigo("DON-" + UUID.randomUUID().toString()
                .substring(0, 8).toUpperCase());

        donacion.setMonto(dto.getMonto());
        donacion.setMetodo(dto.getMetodo());
        donacion.setAnonima(dto.getAnonima() != null ? dto.getAnonima() : false);

        Centro centro = centroRepository.findById(dto.getCentroId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Centro", dto.getCentroId()));
        donacion.setCentro(centro);

        if (dto.getUsuarioId() != null && !donacion.getAnonima()) {
            Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Usuario", dto.getUsuarioId()));
            donacion.setUsuario(usuario);
        }

        Donacion guardada = donacionRepository.save(donacion);

        return convertirADTO(guardada);
    }

    private DonacionDTO convertirADTO(Donacion donacion) {

        DonacionDTO dto = new DonacionDTO();

        dto.setId(donacion.getId());
        dto.setCodigo(donacion.getCodigo());
        dto.setMonto(donacion.getMonto());
        dto.setMetodo(donacion.getMetodo());
        dto.setAnonima(donacion.getAnonima());
        dto.setFecha(donacion.getFecha());

        if (donacion.getCentro() != null) {
            dto.setCentroId(donacion.getCentro().getId());
            dto.setCentroNombre(donacion.getCentro().getNombre());
        }

        if (donacion.getUsuario() != null && !donacion.getAnonima()) {
            dto.setUsuarioId(donacion.getUsuario().getId());
        }

        return dto;
    }
}
