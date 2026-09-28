package bo.edu.sos.backend.service;

import bo.edu.sos.backend.dto.SolicitudCentroDTO;
import bo.edu.sos.backend.entity.Departamento;
import bo.edu.sos.backend.entity.SolicitudCentro;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.SolicitudCentroRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SolicitudCentroService {

    private final SolicitudCentroRepository solicitudCentroRepository;
    private final DepartamentoRepository departamentoRepository;

    public SolicitudCentroService(
            SolicitudCentroRepository solicitudCentroRepository,
            DepartamentoRepository departamentoRepository) {

        this.solicitudCentroRepository = solicitudCentroRepository;
        this.departamentoRepository = departamentoRepository;
    }

    @Transactional
    public SolicitudCentroDTO crear(SolicitudCentroDTO dto) {

        SolicitudCentro solicitud = new SolicitudCentro();

        copiarDTOaEntidad(dto, solicitud);

        solicitud.setEstado("PENDIENTE");

        SolicitudCentro guardada =
                solicitudCentroRepository.save(solicitud);

        return convertirADTO(guardada);
    }

    @Transactional(readOnly = true)
    public List<SolicitudCentroDTO> listarTodas() {

        return solicitudCentroRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public SolicitudCentroDTO buscarPorId(Long id) {

        SolicitudCentro solicitud =
                solicitudCentroRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Solicitud de centro", id));

        return convertirADTO(solicitud);
    }

    @Transactional(readOnly = true)
    public List<SolicitudCentroDTO> listarPorEstado(
            String estado) {

        return solicitudCentroRepository
                .findByEstado(estado)
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    private void copiarDTOaEntidad(
            SolicitudCentroDTO dto,
            SolicitudCentro solicitud) {

        solicitud.setNombreCentro(dto.getNombreCentro());
        solicitud.setTipoOrganizacion(
                dto.getTipoOrganizacion());

        solicitud.setNit(dto.getNit());
        solicitud.setPersoneriaJuridica(
                dto.getPersoneriaJuridica());
        solicitud.setFechaFundacion(
                dto.getFechaFundacion());
        solicitud.setPaginaWeb(dto.getPaginaWeb());
        solicitud.setDescripcion(dto.getDescripcion());
        solicitud.setPoblacionAtendida(
                dto.getPoblacionAtendida());

        solicitud.setNombreResponsable(
                dto.getNombreResponsable());
        solicitud.setCargoResponsable(
                dto.getCargoResponsable());
        solicitud.setDocumentoResponsable(
                dto.getDocumentoResponsable());
        solicitud.setCorreoResponsable(
                dto.getCorreoResponsable());
        solicitud.setTelefonoResponsable(
                dto.getTelefonoResponsable());

        solicitud.setCiudad(dto.getCiudad());
        solicitud.setDepartamentoUbicacion(
                dto.getDepartamentoUbicacion());
        solicitud.setDireccionExacta(
                dto.getDireccionExacta());
        solicitud.setReferencia(dto.getReferencia());

        solicitud.setPersoneriaArchivo(
                dto.getPersoneriaArchivo());
        solicitud.setNitArchivo(
                dto.getNitArchivo());
        solicitud.setIdentidadArchivo(
                dto.getIdentidadArchivo());
        solicitud.setDomicilioArchivo(
                dto.getDomicilioArchivo());

        solicitud.setNecesidades(
                dto.getNecesidades() != null
                        ? String.join(",", dto.getNecesidades())
                        : null);

        solicitud.setDonaciones(
                dto.getDonaciones() != null
                        ? String.join(",", dto.getDonaciones())
                        : null);

        solicitud.setSolicitaVoluntarios(
                dto.getSolicitaVoluntarios());

        solicitud.setActividadesVoluntariado(
                dto.getActividadesVoluntariado() != null
                        ? String.join(
                                ",",
                                dto.getActividadesVoluntariado())
                        : null);

        solicitud.setDescripcionVoluntariado(
                dto.getDescripcionVoluntariado());

        Departamento departamento =
                departamentoRepository
                        .findById(dto.getDepartamentoId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Departamento",
                                        dto.getDepartamentoId()));

        solicitud.setDepartamento(departamento);
    }

    private SolicitudCentroDTO convertirADTO(
            SolicitudCentro solicitud) {

        SolicitudCentroDTO dto = new SolicitudCentroDTO();

        dto.setId(solicitud.getId());

        dto.setNombreCentro(
                solicitud.getNombreCentro());

        dto.setTipoOrganizacion(
                solicitud.getTipoOrganizacion());

        if (solicitud.getDepartamento() != null) {
            dto.setDepartamentoId(
                    solicitud.getDepartamento().getId());
        }

        dto.setNit(solicitud.getNit());
        dto.setPersoneriaJuridica(
                solicitud.getPersoneriaJuridica());
        dto.setFechaFundacion(
                solicitud.getFechaFundacion());
        dto.setPaginaWeb(
                solicitud.getPaginaWeb());
        dto.setDescripcion(
                solicitud.getDescripcion());
        dto.setPoblacionAtendida(
                solicitud.getPoblacionAtendida());

        dto.setNombreResponsable(
                solicitud.getNombreResponsable());
        dto.setCargoResponsable(
                solicitud.getCargoResponsable());
        dto.setDocumentoResponsable(
                solicitud.getDocumentoResponsable());
        dto.setCorreoResponsable(
                solicitud.getCorreoResponsable());
        dto.setTelefonoResponsable(
                solicitud.getTelefonoResponsable());

        dto.setCiudad(solicitud.getCiudad());
        dto.setDepartamentoUbicacion(
                solicitud.getDepartamentoUbicacion());
        dto.setDireccionExacta(
                solicitud.getDireccionExacta());
        dto.setReferencia(
                solicitud.getReferencia());

        dto.setPersoneriaArchivo(
                solicitud.getPersoneriaArchivo());
        dto.setNitArchivo(
                solicitud.getNitArchivo());
        dto.setIdentidadArchivo(
                solicitud.getIdentidadArchivo());
        dto.setDomicilioArchivo(
                solicitud.getDomicilioArchivo());

        dto.setNecesidades(
                convertirTextoALista(
                        solicitud.getNecesidades()));

        dto.setDonaciones(
                convertirTextoALista(
                        solicitud.getDonaciones()));

        dto.setSolicitaVoluntarios(
                solicitud.getSolicitaVoluntarios());

        dto.setActividadesVoluntariado(
                convertirTextoALista(
                        solicitud.getActividadesVoluntariado()));

        dto.setDescripcionVoluntariado(
                solicitud.getDescripcionVoluntariado());

        dto.setEstado(solicitud.getEstado());

        return dto;
    }

    private List<String> convertirTextoALista(
            String texto) {

        if (texto == null || texto.isBlank()) {
            return List.of();
        }

        return List.of(texto.split(","));
    }
}