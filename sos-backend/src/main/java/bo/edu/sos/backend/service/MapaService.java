package bo.edu.sos.backend.service;

import bo.edu.sos.backend.dto.PuntoMapaDTO;
import bo.edu.sos.backend.entity.Centro;
import bo.edu.sos.backend.entity.Necesidad;
import bo.edu.sos.backend.entity.PuntoAyuda;
import bo.edu.sos.backend.repository.CentroRepository;
import bo.edu.sos.backend.repository.PuntoAyudaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class MapaService {

    private final CentroRepository centroRepository;
    private final PuntoAyudaRepository puntoAyudaRepository;

    public MapaService(
            CentroRepository centroRepository,
            PuntoAyudaRepository puntoAyudaRepository) {

        this.centroRepository = centroRepository;
        this.puntoAyudaRepository = puntoAyudaRepository;
    }

    @Transactional(readOnly = true)
    public List<PuntoMapaDTO> listarPuntosMapa() {

        List<PuntoMapaDTO> puntos = new ArrayList<>();

        centroRepository.findAll().forEach(centro ->
                puntos.add(convertirCentro(centro)));

        puntoAyudaRepository.findAll().forEach(punto ->
                puntos.add(convertirPuntoAyuda(punto)));

        return puntos;
    }

    private PuntoMapaDTO convertirCentro(Centro centro) {

        PuntoMapaDTO dto = new PuntoMapaDTO();

        dto.setId(centro.getId());
        dto.setOrigen("CENTRO");
        dto.setNombre(centro.getNombre());
        dto.setTipo(centro.getTipo());
        dto.setDescripcion(centro.getDescripcion());
        dto.setDireccion(centro.getDireccion());
        dto.setCiudad(centro.getCiudad());
        dto.setTelefono(centro.getTelefono());
        dto.setEmail(centro.getEmail());
        dto.setLatitud(centro.getLatitud());
        dto.setLongitud(centro.getLongitud());
        dto.setEstadoVerificacion(centro.getEstadoVerificacion());
        dto.setFechaActualizacion(centro.getFechaActualizacion());

        if (centro.getDepartamento() != null) {
            dto.setDepartamentoNombre(
                    centro.getDepartamento().getNombre());
        }

        if (centro.getNecesidades() != null) {
            dto.setNecesidades(
                    centro.getNecesidades().stream()
                            .map(Necesidad::getNombre)
                            .toList());
        }

        return dto;
    }

    private PuntoMapaDTO convertirPuntoAyuda(PuntoAyuda punto) {

        PuntoMapaDTO dto = new PuntoMapaDTO();

        dto.setId(punto.getId());
        dto.setOrigen("PUNTO_AYUDA");
        dto.setNombre(punto.getNombre());
        dto.setTipo(punto.getTipo());
        dto.setDescripcion(punto.getDescripcion());
        dto.setDireccion(punto.getDireccion());
        dto.setCiudad(punto.getCiudad());
        dto.setLatitud(punto.getLatitud());
        dto.setLongitud(punto.getLongitud());
        dto.setEstadoVerificacion(punto.getEstadoVerificacion());
        dto.setFechaActualizacion(punto.getFechaActualizacion());

        if (punto.getDepartamento() != null) {
            dto.setDepartamentoNombre(
                    punto.getDepartamento().getNombre());
        }

        if (punto.getNecesidades() != null) {
            dto.setNecesidades(
                    punto.getNecesidades().stream()
                            .map(Necesidad::getNombre)
                            .toList());
        }

        return dto;
    }
}
