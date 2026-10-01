package bo.edu.sos.backend.service;

import bo.edu.sos.backend.constants.EstadoVerificacion;
import bo.edu.sos.backend.dto.SolicitudCentroDTO;
import bo.edu.sos.backend.entity.Departamento;
import bo.edu.sos.backend.entity.SolicitudCentro;
import bo.edu.sos.backend.exception.BadRequestException;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.SolicitudCentroRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.FileSystemUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class SolicitudCentroService {

    private static final long MAX_TAMANO_ARCHIVO = 10L * 1024 * 1024; // 10 MB

    // Tipo de archivo permitido -> extensión con la que se guarda
    private static final Map<String, String> TIPOS_PERMITIDOS = Map.of(
            "application/pdf", ".pdf",
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp"
    );

    private final SolicitudCentroRepository solicitudCentroRepository;
    private final DepartamentoRepository departamentoRepository;
    private final Path carpetaBase;

    public SolicitudCentroService(
            SolicitudCentroRepository solicitudCentroRepository,
            DepartamentoRepository departamentoRepository,
            @Value("${app.uploads.dir:uploads}") String uploadsDir) {

        this.solicitudCentroRepository = solicitudCentroRepository;
        this.departamentoRepository = departamentoRepository;
        this.carpetaBase = Paths.get(uploadsDir, "solicitudes-centro")
                .toAbsolutePath()
                .normalize();
    }

    // ==========================================
    // CREAR SOLICITUD (datos + documentos)
    // ==========================================

    @Transactional
    public SolicitudCentroDTO crear(
            SolicitudCentroDTO dto,
            MultipartFile personeria,
            MultipartFile nit,
            MultipartFile identidad,
            MultipartFile domicilio) {

        // 1. Validar los 4 documentos ANTES de guardar nada
        validarArchivo(personeria, "personería jurídica");
        validarArchivo(nit, "NIT");
        validarArchivo(identidad, "identidad del representante");
        validarArchivo(domicilio, "respaldo de domicilio");

        // 2. Guardar la solicitud para obtener su ID (siempre PENDIENTE)
        SolicitudCentro solicitud = new SolicitudCentro();
        copiarDTOaEntidad(dto, solicitud);
        solicitud.setEstado(EstadoVerificacion.PENDIENTE);

        SolicitudCentro guardada = solicitudCentroRepository.save(solicitud);
        Long id = guardada.getId();

        // 3. Guardar los archivos en disco y registrar sus rutas
        try {
            guardada.setPersoneriaArchivo(guardarArchivo(personeria, id, "personeria"));
            guardada.setNitArchivo(guardarArchivo(nit, id, "nit"));
            guardada.setIdentidadArchivo(guardarArchivo(identidad, id, "identidad"));
            guardada.setDomicilioArchivo(guardarArchivo(domicilio, id, "domicilio"));
        } catch (RuntimeException e) {
            // La BD hace rollback sola; aquí borramos los archivos que alcanzaron a guardarse
            eliminarCarpeta(id);
            throw e;
        }

        return convertirADTO(solicitudCentroRepository.save(guardada));
    }

    // ==========================================
    // CONSULTAS (solo ADMIN, ver SecurityConfig)
    // ==========================================

    @Transactional(readOnly = true)
    public List<SolicitudCentroDTO> listarTodas() {

        return solicitudCentroRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public SolicitudCentroDTO buscarPorId(Long id) {

        SolicitudCentro solicitud = solicitudCentroRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Solicitud de centro", id));

        return convertirADTO(solicitud);
    }

    @Transactional(readOnly = true)
    public List<SolicitudCentroDTO> listarPorEstado(String estado) {

        return solicitudCentroRepository
                .findByEstado(estado.toUpperCase())
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    // ==========================================
    // ARCHIVOS
    // ==========================================

    private void validarArchivo(MultipartFile archivo, String nombreDocumento) {

        if (archivo == null || archivo.isEmpty()) {
            throw new BadRequestException(
                    "Falta el documento: " + nombreDocumento);
        }

        if (!TIPOS_PERMITIDOS.containsKey(archivo.getContentType())) {
            throw new BadRequestException(
                    "Formato no válido en " + nombreDocumento
                            + ". Solo se permiten PDF, JPG, PNG o WEBP.");
        }

        if (archivo.getSize() > MAX_TAMANO_ARCHIVO) {
            throw new BadRequestException(
                    "El documento " + nombreDocumento + " supera los 10 MB.");
        }
    }

    private String guardarArchivo(MultipartFile archivo, Long solicitudId, String tipo) {

        try {
            Path carpeta = carpetaBase.resolve(String.valueOf(solicitudId));
            Files.createDirectories(carpeta);

            // Nombre generado por el servidor: evita choques de nombres
            // y que alguien mande nombres peligrosos como "../../archivo"
            String extension = TIPOS_PERMITIDOS.get(archivo.getContentType());
            String nombreArchivo = tipo + "_" + UUID.randomUUID() + extension;

            Path destino = carpeta.resolve(nombreArchivo).normalize();

            try (InputStream entrada = archivo.getInputStream()) {
                Files.copy(entrada, destino, StandardCopyOption.REPLACE_EXISTING);
            }

            // En BD se guarda la ruta relativa: solicitudes-centro/{id}/{archivo}
            return "solicitudes-centro/" + solicitudId + "/" + nombreArchivo;

        } catch (IOException e) {
            throw new IllegalStateException("No se pudo guardar el documento " + tipo, e);
        }
    }

    private void eliminarCarpeta(Long solicitudId) {
        try {
            FileSystemUtils.deleteRecursively(
                    carpetaBase.resolve(String.valueOf(solicitudId)));
        } catch (IOException ignored) {
            // Si no se puede borrar, no ocultamos el error original
        }
    }

    // ==========================================
    // CONVERSIONES
    // ==========================================

    private void copiarDTOaEntidad(SolicitudCentroDTO dto, SolicitudCentro solicitud) {

        solicitud.setNombreCentro(dto.getNombreCentro());
        solicitud.setTipoOrganizacion(dto.getTipoOrganizacion());

        solicitud.setNit(dto.getNit());
        solicitud.setPersoneriaJuridica(dto.getPersoneriaJuridica());
        solicitud.setFechaFundacion(dto.getFechaFundacion());
        solicitud.setPaginaWeb(dto.getPaginaWeb());
        solicitud.setDescripcion(dto.getDescripcion());
        solicitud.setPoblacionAtendida(dto.getPoblacionAtendida());

        solicitud.setNombreResponsable(dto.getNombreResponsable());
        solicitud.setCargoResponsable(dto.getCargoResponsable());
        solicitud.setDocumentoResponsable(dto.getDocumentoResponsable());
        solicitud.setCorreoResponsable(dto.getCorreoResponsable());
        solicitud.setTelefonoResponsable(dto.getTelefonoResponsable());

        solicitud.setCiudad(dto.getCiudad());
        solicitud.setDepartamentoUbicacion(dto.getDepartamentoUbicacion());
        solicitud.setDireccionExacta(dto.getDireccionExacta());
        solicitud.setReferencia(dto.getReferencia());

        // Las rutas de archivos y el estado NO se toman del DTO:
        // los define el servidor.

        solicitud.setNecesidades(unirLista(dto.getNecesidades()));
        solicitud.setDonaciones(unirLista(dto.getDonaciones()));

        solicitud.setSolicitaVoluntarios(dto.getSolicitaVoluntarios());
        solicitud.setActividadesVoluntariado(unirLista(dto.getActividadesVoluntariado()));
        solicitud.setDescripcionVoluntariado(dto.getDescripcionVoluntariado());

        Departamento departamento = departamentoRepository
                .findById(dto.getDepartamentoId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Departamento", dto.getDepartamentoId()));

        solicitud.setDepartamento(departamento);
    }

    private SolicitudCentroDTO convertirADTO(SolicitudCentro solicitud) {

        SolicitudCentroDTO dto = new SolicitudCentroDTO();

        dto.setId(solicitud.getId());
        dto.setNombreCentro(solicitud.getNombreCentro());
        dto.setTipoOrganizacion(solicitud.getTipoOrganizacion());

        if (solicitud.getDepartamento() != null) {
            dto.setDepartamentoId(solicitud.getDepartamento().getId());
        }

        dto.setNit(solicitud.getNit());
        dto.setPersoneriaJuridica(solicitud.getPersoneriaJuridica());
        dto.setFechaFundacion(solicitud.getFechaFundacion());
        dto.setPaginaWeb(solicitud.getPaginaWeb());
        dto.setDescripcion(solicitud.getDescripcion());
        dto.setPoblacionAtendida(solicitud.getPoblacionAtendida());

        dto.setNombreResponsable(solicitud.getNombreResponsable());
        dto.setCargoResponsable(solicitud.getCargoResponsable());
        dto.setDocumentoResponsable(solicitud.getDocumentoResponsable());
        dto.setCorreoResponsable(solicitud.getCorreoResponsable());
        dto.setTelefonoResponsable(solicitud.getTelefonoResponsable());

        dto.setCiudad(solicitud.getCiudad());
        dto.setDepartamentoUbicacion(solicitud.getDepartamentoUbicacion());
        dto.setDireccionExacta(solicitud.getDireccionExacta());
        dto.setReferencia(solicitud.getReferencia());

        dto.setPersoneriaArchivo(solicitud.getPersoneriaArchivo());
        dto.setNitArchivo(solicitud.getNitArchivo());
        dto.setIdentidadArchivo(solicitud.getIdentidadArchivo());
        dto.setDomicilioArchivo(solicitud.getDomicilioArchivo());

        dto.setNecesidades(separarTexto(solicitud.getNecesidades()));
        dto.setDonaciones(separarTexto(solicitud.getDonaciones()));

        dto.setSolicitaVoluntarios(solicitud.getSolicitaVoluntarios());
        dto.setActividadesVoluntariado(separarTexto(solicitud.getActividadesVoluntariado()));
        dto.setDescripcionVoluntariado(solicitud.getDescripcionVoluntariado());

        dto.setEstado(solicitud.getEstado());

        return dto;
    }

    private String unirLista(List<String> lista) {
        return (lista == null || lista.isEmpty()) ? null : String.join(",", lista);
    }

    private List<String> separarTexto(String texto) {
        return (texto == null || texto.isBlank()) ? List.of() : List.of(texto.split(","));
    }
}
