package bo.edu.sos.backend.service;

import bo.edu.sos.backend.constants.MapaConstants;
import bo.edu.sos.backend.dto.PuntoMapaDTO;
import bo.edu.sos.backend.entity.Centro;
import bo.edu.sos.backend.entity.Necesidad;
import bo.edu.sos.backend.entity.PuntoAyuda;
import bo.edu.sos.backend.exception.BadRequestException;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.repository.CentroRepository;
import bo.edu.sos.backend.repository.PuntoAyudaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

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
        return listarPuntosMapa(null, null, null, null);
    }

    @Transactional(readOnly = true)
    public List<PuntoMapaDTO> listarPuntosMapa(
            String tipo,
            String necesidad,
            String departamento,
            String buscar) {

        List<PuntoMapaDTO> puntos = new ArrayList<>();

        centroRepository.findAll().forEach(centro ->
                puntos.add(convertirCentro(centro)));

        puntoAyudaRepository.findAll().forEach(punto ->
                puntos.add(convertirPuntoAyuda(punto)));

        return puntos.stream()

                .filter(punto ->
                        tipo == null
                                || tipo.isBlank()
                                || normalizarTipo(punto.getTipo())
                                .equals(normalizarTipo(tipo))
                )

                .filter(punto ->
                        necesidad == null
                                || necesidad.isBlank()
                                || tieneNecesidad(punto, necesidad)
                )

                .filter(punto ->
                        departamento == null
                                || departamento.isBlank()
                                || sonIguales(
                                punto.getDepartamentoNombre(),
                                departamento
                        )
                )

                .filter(punto ->
                        buscar == null
                                || buscar.isBlank()
                                || contieneTexto(
                                punto.getNombre(),
                                buscar
                        )
                                || contieneTexto(
                                punto.getCiudad(),
                                buscar
                        )
                                || contieneTexto(
                                punto.getDepartamentoNombre(),
                                buscar
                        )
                )

                .toList();
    }

    @Transactional(readOnly = true)
    public PuntoMapaDTO buscarDetalle(
            String origen,
            Long id) {

        String origenNormalizado =
                normalizarOrigen(origen);

        return switch (origenNormalizado) {

            case MapaConstants.ORIGEN_CENTRO -> {

                Centro centro = centroRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Centro",
                                        id
                                )
                        );

                yield convertirCentro(centro);
            }

            case MapaConstants.ORIGEN_PUNTO_AYUDA -> {

                PuntoAyuda punto = puntoAyudaRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Punto de ayuda",
                                        id
                                )
                        );

                yield convertirPuntoAyuda(punto);
            }

            default -> throw new BadRequestException(
                    "Origen de punto inválido: " + origen
            );
        };
    }

    private PuntoMapaDTO convertirCentro(Centro centro) {

        PuntoMapaDTO dto = new PuntoMapaDTO();

        dto.setId(centro.getId());
        dto.setOrigen(MapaConstants.ORIGEN_CENTRO);
        dto.setNombre(centro.getNombre());
        dto.setTipo(normalizarTipo(centro.getTipo()));
        dto.setDescripcion(centro.getDescripcion());
        dto.setDireccion(centro.getDireccion());
        dto.setCiudad(centro.getCiudad());
        dto.setTelefono(centro.getTelefono());
        dto.setEmail(centro.getEmail());
        dto.setLatitud(centro.getLatitud());
        dto.setLongitud(centro.getLongitud());
        dto.setEstadoVerificacion(
                centro.getEstadoVerificacion()
        );
        dto.setFechaActualizacion(
                centro.getFechaActualizacion()
        );

        if (centro.getDepartamento() != null) {

            dto.setDepartamentoNombre(
                    centro.getDepartamento().getNombre()
            );
        }

        if (centro.getNecesidades() != null) {

            dto.setNecesidades(
                    centro.getNecesidades()
                            .stream()
                            .map(Necesidad::getNombre)
                            .toList()
            );
        }

        return dto;
    }

    private PuntoMapaDTO convertirPuntoAyuda(
            PuntoAyuda punto) {

        PuntoMapaDTO dto = new PuntoMapaDTO();

        dto.setId(punto.getId());
        dto.setOrigen(
                MapaConstants.ORIGEN_PUNTO_AYUDA
        );
        dto.setNombre(punto.getNombre());
        dto.setTipo(normalizarTipo(punto.getTipo()));
        dto.setDescripcion(punto.getDescripcion());
        dto.setDireccion(punto.getDireccion());
        dto.setCiudad(punto.getCiudad());
        dto.setLatitud(punto.getLatitud());
        dto.setLongitud(punto.getLongitud());
        dto.setEstadoVerificacion(
                punto.getEstadoVerificacion()
        );
        dto.setFechaActualizacion(
                punto.getFechaActualizacion()
        );

        if (punto.getDepartamento() != null) {

            dto.setDepartamentoNombre(
                    punto.getDepartamento().getNombre()
            );
        }

        if (punto.getNecesidades() != null) {

            dto.setNecesidades(
                    punto.getNecesidades()
                            .stream()
                            .map(Necesidad::getNombre)
                            .toList()
            );
        }

        return dto;
    }

    private boolean tieneNecesidad(
            PuntoMapaDTO punto,
            String necesidad) {

        if (punto.getNecesidades() == null) {
            return false;
        }

        return punto.getNecesidades()
                .stream()
                .anyMatch(valor ->
                        sonIguales(valor, necesidad)
                );
    }

    private boolean contieneTexto(
            String texto,
            String busqueda) {

        if (texto == null) {
            return false;
        }

        return normalizarTexto(texto)
                .contains(
                        normalizarTexto(busqueda)
                );
    }

    private boolean sonIguales(
            String texto1,
            String texto2) {

        if (texto1 == null || texto2 == null) {
            return false;
        }

        return normalizarTexto(texto1)
                .equals(
                        normalizarTexto(texto2)
                );
    }

    private String normalizarTexto(String texto) {

        if (texto == null) {
            return "";
        }

        return Normalizer
                .normalize(
                        texto,
                        Normalizer.Form.NFD
                )
                .replaceAll("\\p{M}", "")
                .trim()
                .toLowerCase(Locale.ROOT);
    }

    private String normalizarOrigen(String origen) {

        if (origen == null) {
            return "";
        }

        return normalizarTexto(origen)
                .toUpperCase(Locale.ROOT)
                .replace(" ", "_")
                .replace("-", "_");
    }

    private String normalizarTipo(String tipo) {

        if (tipo == null || tipo.isBlank()) {
            return "";
        }

        String normalizado =
                normalizarTexto(tipo)
                        .toUpperCase(Locale.ROOT)
                        .replace(" ", "_")
                        .replace("-", "_");

        return switch (normalizado) {

            case "CENTRO_APOYO",
                 "CENTRO_DE_APOYO"
                    -> MapaConstants.TIPO_CENTRO_APOYO;

            case "REFUGIO"
                    -> MapaConstants.TIPO_REFUGIO;

            case "PUNTO_DONACION",
                 "PUNTO_DE_DONACION",
                 "DONACION"
                    -> MapaConstants.TIPO_PUNTO_DONACION;

            case "EMERGENCIA"
                    -> MapaConstants.TIPO_EMERGENCIA;

            default -> normalizado;
        };
    }
}