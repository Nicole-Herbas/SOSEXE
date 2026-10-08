package bo.edu.sos.backend.service;

import bo.edu.sos.backend.constants.EstadoSolicitudCentro;
import bo.edu.sos.backend.dto.CambiarEstadoSolicitudDTO;
import bo.edu.sos.backend.dto.SolicitudCentroDTO;
import bo.edu.sos.backend.entity.Departamento;
import bo.edu.sos.backend.entity.SolicitudCentro;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.exception.BadRequestException;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.helper.LogHelper;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.SolicitudCentroRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class SolicitudCentroService {

    private static final long MAX_TAMANO_ARCHIVO =
            10L * 1024 * 1024;

    private static final Map<String, String> TIPOS_PERMITIDOS =
            Map.of(
                    "application/pdf", ".pdf",
                    "image/jpeg", ".jpg",
                    "image/png", ".png",
                    "image/webp", ".webp"
            );

    // SOS-43: extensión -> tipo de contenido
    private static final Map<String, String> TIPO_POR_EXTENSION =
            Map.of(
                    ".pdf", "application/pdf",
                    ".jpg", "image/jpeg",
                    ".png", "image/png",
                    ".webp", "image/webp"
            );

    /**
     * SOS-43: documento listo para enviarlo al navegador.
     */
    public record DocumentoSolicitud(
            Resource recurso,
            String contentType,
            String nombre
    ) {}

    private final SolicitudCentroRepository solicitudCentroRepository;
    private final DepartamentoRepository departamentoRepository;
    private final UsuarioRepository usuarioRepository;

    private final Path carpetaUploads;
    private final Path carpetaBase;

    public SolicitudCentroService(
            SolicitudCentroRepository solicitudCentroRepository,
            DepartamentoRepository departamentoRepository,
            UsuarioRepository usuarioRepository,
            @Value("${app.uploads.dir:uploads}") String uploadsDir) {

        this.solicitudCentroRepository = solicitudCentroRepository;
        this.departamentoRepository = departamentoRepository;
        this.usuarioRepository = usuarioRepository;

        this.carpetaUploads =
                Paths.get(uploadsDir)
                        .toAbsolutePath()
                        .normalize();

        this.carpetaBase =
                carpetaUploads.resolve("solicitudes-centro");
    }

    // ==========================================
    // CREAR SOLICITUD (SOS-41)
    // ==========================================

    @Transactional
    public SolicitudCentroDTO crear(
            SolicitudCentroDTO dto,
            MultipartFile personeria,
            MultipartFile nit,
            MultipartFile identidad,
            MultipartFile domicilio) {

        validarArchivo(personeria, "personería jurídica");
        validarArchivo(nit, "NIT");
        validarArchivo(identidad, "identidad del representante");
        validarArchivo(domicilio, "respaldo de domicilio");

        SolicitudCentro solicitud = new SolicitudCentro();

        copiarDTOaEntidad(dto, solicitud);

        // El estado inicial siempre lo define el servidor.
        solicitud.setEstado(EstadoSolicitudCentro.PENDIENTE);

        SolicitudCentro guardada =
                solicitudCentroRepository.save(solicitud);

        Long id = guardada.getId();

        try {

            guardada.setPersoneriaArchivo(
                    guardarArchivo(
                            personeria,
                            id,
                            "personeria"
                    )
            );

            guardada.setNitArchivo(
                    guardarArchivo(
                            nit,
                            id,
                            "nit"
                    )
            );

            guardada.setIdentidadArchivo(
                    guardarArchivo(
                            identidad,
                            id,
                            "identidad"
                    )
            );

            guardada.setDomicilioArchivo(
                    guardarArchivo(
                            domicilio,
                            id,
                            "domicilio"
                    )
            );

        } catch (RuntimeException e) {

            LogHelper.warn(
                    SolicitudCentroService.class,
                    "Error durante el almacenamiento de documentos. solicitudId={}, tipoError={}",
                    id,
                    e.getClass().getSimpleName()
            );

            eliminarCarpeta(id);

            throw e;
        }

        SolicitudCentro completa =
                solicitudCentroRepository.save(guardada);

        LogHelper.info(
                SolicitudCentroService.class,
                "Solicitud de centro creada correctamente. id={}, estado={}",
                completa.getId(),
                completa.getEstado()
        );

        return convertirADTO(completa);
    }

    // ==========================================
    // LISTAR SOLICITUDES
    // ==========================================

    @Transactional(readOnly = true)
    public List<SolicitudCentroDTO> listarTodas() {

        List<SolicitudCentroDTO> solicitudes =
                solicitudCentroRepository
                        .findAllByOrderByFechaCreacionDesc()
                        .stream()
                        .map(this::convertirADTO)
                        .toList();

        LogHelper.debug(
                SolicitudCentroService.class,
                "Listado de solicitudes de centro obtenido. cantidad={}",
                solicitudes.size()
        );

        return solicitudes;
    }

    // ==========================================
    // BUSCAR POR ID
    // ==========================================

    @Transactional(readOnly = true)
    public SolicitudCentroDTO buscarPorId(Long id) {

        SolicitudCentro solicitud = obtenerSolicitud(id);

        LogHelper.debug(
                SolicitudCentroService.class,
                "Solicitud de centro consultada correctamente. id={}",
                id
        );

        return convertirADTO(solicitud);
    }

    // ==========================================
    // LISTAR POR ESTADO
    // ==========================================

    @Transactional(readOnly = true)
    public List<SolicitudCentroDTO> listarPorEstado(
            String estado) {

        String estadoNormalizado =
                estado.trim().toUpperCase();

        if (!EstadoSolicitudCentro.TODOS.contains(estadoNormalizado)) {
            throw new BadRequestException(
                    "Estado no válido: " + estado
            );
        }

        List<SolicitudCentroDTO> solicitudes =
                solicitudCentroRepository
                        .findByEstadoOrderByFechaCreacionDesc(
                                estadoNormalizado
                        )
                        .stream()
                        .map(this::convertirADTO)
                        .toList();

        LogHelper.debug(
                SolicitudCentroService.class,
                "Solicitudes de centro consultadas por estado. cantidad={}",
                solicitudes.size()
        );

        return solicitudes;
    }

    // ==========================================
    // SOS-43: CAMBIAR ESTADO
    // aprobar / rechazar / pedir cambios
    // ==========================================

    @Transactional
    public SolicitudCentroDTO cambiarEstado(
            Long id,
            CambiarEstadoSolicitudDTO dto,
            String emailAdmin) {

        SolicitudCentro solicitud =
                obtenerSolicitud(id);

        String nuevoEstado =
                dto.getEstado()
                        .trim()
                        .toUpperCase();

        String observacion =
                dto.getObservacion() == null
                        ? null
                        : dto.getObservacion().trim();

        // 1. Solo APROBADA, RECHAZADA o CAMBIOS_SOLICITADOS
        if (!EstadoSolicitudCentro.RESULTADOS_REVISION
                .contains(nuevoEstado)) {

            throw new BadRequestException(
                    "Estado no válido. Usa APROBADA, RECHAZADA o CAMBIOS_SOLICITADOS."
            );
        }

        // 2. Una solicitud aprobada o rechazada
        // ya no se puede volver a revisar
        String estadoActual =
                solicitud.getEstado();

        if (!EstadoSolicitudCentro.PENDIENTE.equals(estadoActual)
                && !EstadoSolicitudCentro.CAMBIOS_SOLICITADOS
                        .equals(estadoActual)) {

            throw new BadRequestException(
                    "La solicitud ya fue revisada (estado actual: "
                            + estadoActual
                            + ")."
            );
        }

        // 3. Rechazar o pedir cambios exige explicar el motivo
        if (EstadoSolicitudCentro.REQUIEREN_OBSERVACION
                .contains(nuevoEstado)
                && (observacion == null || observacion.isEmpty())) {

            throw new BadRequestException(
                    "Debes escribir una observación para rechazar o solicitar cambios."
            );
        }

        // 4. Quién revisó
        Usuario admin =
                usuarioRepository
                        .findByEmail(emailAdmin)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No se encontró el usuario administrador"
                                )
                        );

        // 5. Guardar el resultado de la revisión
        solicitud.setEstado(nuevoEstado);

        solicitud.setObservacionAdmin(
                (observacion == null || observacion.isEmpty())
                        ? null
                        : observacion
        );

        solicitud.setFechaRevision(
                LocalDateTime.now()
        );

        solicitud.setRevisadoPor(admin);

        SolicitudCentro actualizada =
                solicitudCentroRepository.save(solicitud);

        LogHelper.info(
                SolicitudCentroService.class,
                "Estado de solicitud actualizado. id={}, estado={}, administrador={}",
                id,
                nuevoEstado,
                emailAdmin
        );

        return convertirADTO(actualizada);
    }

    // ==========================================
    // SOS-43: VER DOCUMENTOS (solo ADMIN)
    // ==========================================

    @Transactional(readOnly = true)
    public DocumentoSolicitud obtenerDocumento(
            Long id,
            String tipo) {

        SolicitudCentro solicitud =
                obtenerSolicitud(id);

        String rutaRelativa =
                switch (tipo) {

                    case "personeria" ->
                            solicitud.getPersoneriaArchivo();

                    case "nit" ->
                            solicitud.getNitArchivo();

                    case "identidad" ->
                            solicitud.getIdentidadArchivo();

                    case "domicilio" ->
                            solicitud.getDomicilioArchivo();

                    default ->
                            throw new BadRequestException(
                                    "Tipo de documento no válido: "
                                            + tipo
                            );
                };

        if (rutaRelativa == null
                || rutaRelativa.isBlank()) {

            throw new ResourceNotFoundException(
                    "La solicitud no tiene el documento: "
                            + tipo
            );
        }

        Path archivo =
                carpetaUploads
                        .resolve(rutaRelativa)
                        .normalize();

        // Seguridad: nunca leer fuera de la carpeta uploads
        if (!archivo.startsWith(carpetaUploads)
                || !Files.exists(archivo)) {

            throw new ResourceNotFoundException(
                    "No se encontró el archivo del documento: "
                            + tipo
            );
        }

        String nombre =
                archivo.getFileName().toString();

        String extension =
                nombre.substring(
                        nombre.lastIndexOf('.')
                );

        String contentType =
                TIPO_POR_EXTENSION.getOrDefault(
                        extension,
                        "application/octet-stream"
                );

        return new DocumentoSolicitud(
                new FileSystemResource(archivo),
                contentType,
                nombre
        );
    }

    // ==========================================
    // ARCHIVOS
    // ==========================================

    private void validarArchivo(
            MultipartFile archivo,
            String nombreDocumento) {

        if (archivo == null || archivo.isEmpty()) {

            throw new BadRequestException(
                    "Falta el documento: "
                            + nombreDocumento
            );
        }

        if (!TIPOS_PERMITIDOS.containsKey(
                archivo.getContentType())) {

            throw new BadRequestException(
                    "Formato no válido en "
                            + nombreDocumento
                            + ". Solo se permiten PDF, JPG, PNG o WEBP."
            );
        }

        if (archivo.getSize() > MAX_TAMANO_ARCHIVO) {

            throw new BadRequestException(
                    "El documento "
                            + nombreDocumento
                            + " supera los 10 MB."
            );
        }
    }

    private String guardarArchivo(
            MultipartFile archivo,
            Long solicitudId,
            String tipo) {

        try {

            Path carpeta =
                    carpetaBase.resolve(
                            String.valueOf(solicitudId)
                    );

            Files.createDirectories(carpeta);

            String extension =
                    TIPOS_PERMITIDOS.get(
                            archivo.getContentType()
                    );

            String nombreArchivo =
                    tipo
                            + "_"
                            + UUID.randomUUID()
                            + extension;

            Path destino =
                    carpeta
                            .resolve(nombreArchivo)
                            .normalize();

            // Seguridad: el archivo siempre debe quedar
            // dentro de la carpeta de la solicitud.
            if (!destino.startsWith(carpetaBase)) {

                throw new IllegalStateException(
                        "Ruta de almacenamiento no válida."
                );
            }

            try (
                    InputStream entrada =
                            archivo.getInputStream()
            ) {

                Files.copy(
                        entrada,
                        destino,
                        StandardCopyOption.REPLACE_EXISTING
                );
            }

            LogHelper.debug(
                    SolicitudCentroService.class,
                    "Documento almacenado correctamente. solicitudId={}, tipo={}",
                    solicitudId,
                    tipo
            );

            return "solicitudes-centro/"
                    + solicitudId
                    + "/"
                    + nombreArchivo;

        } catch (IOException e) {

            throw new IllegalStateException(
                    "No se pudo guardar el documento "
                            + tipo,
                    e
            );
        }
    }

    private void eliminarCarpeta(
            Long solicitudId) {

        try {

            FileSystemUtils.deleteRecursively(
                    carpetaBase.resolve(
                            String.valueOf(solicitudId)
                    )
            );

        } catch (IOException e) {

            LogHelper.warn(
                    SolicitudCentroService.class,
                    "No se pudo limpiar la carpeta de documentos. solicitudId={}, tipoError={}",
                    solicitudId,
                    e.getClass().getSimpleName()
            );
        }
    }

    // ==========================================
    // UTILIDADES
    // ==========================================

    private SolicitudCentro obtenerSolicitud(Long id) {

        return solicitudCentroRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Solicitud de centro",
                                id
                        )
                );
    }

    private void copiarDTOaEntidad(
            SolicitudCentroDTO dto,
            SolicitudCentro solicitud) {

        solicitud.setNombreCentro(
                dto.getNombreCentro()
        );

        solicitud.setTipoOrganizacion(
                dto.getTipoOrganizacion()
        );

        solicitud.setNit(
                dto.getNit()
        );

        solicitud.setPersoneriaJuridica(
                dto.getPersoneriaJuridica()
        );

        solicitud.setFechaFundacion(
                dto.getFechaFundacion()
        );

        solicitud.setPaginaWeb(
                dto.getPaginaWeb()
        );

        solicitud.setDescripcion(
                dto.getDescripcion()
        );

        solicitud.setPoblacionAtendida(
                dto.getPoblacionAtendida()
        );

        solicitud.setNombreResponsable(
                dto.getNombreResponsable()
        );

        solicitud.setCargoResponsable(
                dto.getCargoResponsable()
        );

        solicitud.setDocumentoResponsable(
                dto.getDocumentoResponsable()
        );

        solicitud.setCorreoResponsable(
                dto.getCorreoResponsable()
        );

        solicitud.setTelefonoResponsable(
                dto.getTelefonoResponsable()
        );

        solicitud.setCiudad(
                dto.getCiudad()
        );

        solicitud.setDepartamentoUbicacion(
                dto.getDepartamentoUbicacion()
        );

        solicitud.setDireccionExacta(
                dto.getDireccionExacta()
        );

        solicitud.setReferencia(
                dto.getReferencia()
        );

        solicitud.setNecesidades(
                unirLista(
                        dto.getNecesidades()
                )
        );

        solicitud.setDonaciones(
                unirLista(
                        dto.getDonaciones()
                )
        );

        solicitud.setSolicitaVoluntarios(
                dto.getSolicitaVoluntarios()
        );

        solicitud.setActividadesVoluntariado(
                unirLista(
                        dto.getActividadesVoluntariado()
                )
        );

        solicitud.setDescripcionVoluntariado(
                dto.getDescripcionVoluntariado()
        );

        Departamento departamento =
                departamentoRepository
                        .findById(
                                dto.getDepartamentoId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Departamento",
                                        dto.getDepartamentoId()
                                )
                        );

        solicitud.setDepartamento(
                departamento
        );

        // Las rutas de archivos, estado y revisión
        // son definidos por el servidor.
    }

    private SolicitudCentroDTO convertirADTO(
            SolicitudCentro solicitud) {

        SolicitudCentroDTO dto =
                new SolicitudCentroDTO();

        dto.setId(
                solicitud.getId()
        );

        dto.setNombreCentro(
                solicitud.getNombreCentro()
        );

        dto.setTipoOrganizacion(
                solicitud.getTipoOrganizacion()
        );

        if (solicitud.getDepartamento() != null) {

            dto.setDepartamentoId(
                    solicitud
                            .getDepartamento()
                            .getId()
            );

            dto.setDepartamentoNombre(
                    solicitud
                            .getDepartamento()
                            .getNombre()
            );
        }

        dto.setNit(
                solicitud.getNit()
        );

        dto.setPersoneriaJuridica(
                solicitud.getPersoneriaJuridica()
        );

        dto.setFechaFundacion(
                solicitud.getFechaFundacion()
        );

        dto.setPaginaWeb(
                solicitud.getPaginaWeb()
        );

        dto.setDescripcion(
                solicitud.getDescripcion()
        );

        dto.setPoblacionAtendida(
                solicitud.getPoblacionAtendida()
        );

        dto.setNombreResponsable(
                solicitud.getNombreResponsable()
        );

        dto.setCargoResponsable(
                solicitud.getCargoResponsable()
        );

        dto.setDocumentoResponsable(
                solicitud.getDocumentoResponsable()
        );

        dto.setCorreoResponsable(
                solicitud.getCorreoResponsable()
        );

        dto.setTelefonoResponsable(
                solicitud.getTelefonoResponsable()
        );

        dto.setCiudad(
                solicitud.getCiudad()
        );

        dto.setDepartamentoUbicacion(
                solicitud.getDepartamentoUbicacion()
        );

        dto.setDireccionExacta(
                solicitud.getDireccionExacta()
        );

        dto.setReferencia(
                solicitud.getReferencia()
        );

        dto.setPersoneriaArchivo(
                solicitud.getPersoneriaArchivo()
        );

        dto.setNitArchivo(
                solicitud.getNitArchivo()
        );

        dto.setIdentidadArchivo(
                solicitud.getIdentidadArchivo()
        );

        dto.setDomicilioArchivo(
                solicitud.getDomicilioArchivo()
        );

        dto.setNecesidades(
                separarTexto(
                        solicitud.getNecesidades()
                )
        );

        dto.setDonaciones(
                separarTexto(
                        solicitud.getDonaciones()
                )
        );

        dto.setSolicitaVoluntarios(
                solicitud.getSolicitaVoluntarios()
        );

        dto.setActividadesVoluntariado(
                separarTexto(
                        solicitud.getActividadesVoluntariado()
                )
        );

        dto.setDescripcionVoluntariado(
                solicitud.getDescripcionVoluntariado()
        );

        dto.setEstado(
                solicitud.getEstado()
        );

        // SOS-43
        dto.setObservacionAdmin(
                solicitud.getObservacionAdmin()
        );

        dto.setFechaRevision(
                solicitud.getFechaRevision()
        );

        dto.setFechaCreacion(
                solicitud.getFechaCreacion()
        );

        if (solicitud.getRevisadoPor() != null) {

            dto.setRevisadoPor(
                    solicitud
                            .getRevisadoPor()
                            .getNombre()
            );
        }

        return dto;
    }

    private String unirLista(
            List<String> lista) {

        return (
                lista == null
                        || lista.isEmpty()
        )
                ? null
                : String.join(
                        ",",
                        lista
                );
    }

    private List<String> separarTexto(
            String texto) {

        return (
                texto == null
                        || texto.isBlank()
        )
                ? List.of()
                : List.of(
                        texto.split(",")
                );
    }
}