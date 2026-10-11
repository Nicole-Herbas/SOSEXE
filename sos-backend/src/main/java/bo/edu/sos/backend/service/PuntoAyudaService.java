package bo.edu.sos.backend.service;

import bo.edu.sos.backend.constants.EstadoVerificacion;
import bo.edu.sos.backend.dto.PuntoAyudaDTO;
import bo.edu.sos.backend.entity.Departamento;
import bo.edu.sos.backend.entity.Necesidad;
import bo.edu.sos.backend.entity.PuntoAyuda;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.helper.LogHelper;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.NecesidadRepository;
import bo.edu.sos.backend.repository.PuntoAyudaRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import bo.edu.sos.backend.dto.RegistrarPuntoAyudaDTO;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;


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

        List<PuntoAyudaDTO> puntos =
                puntoAyudaRepository
                        .findAll()
                        .stream()
                        .filter(punto ->
                                EstadoVerificacion.VERIFICADO.equals(
                                        punto.getEstadoVerificacion()
                                )
                        )
                        .map(this::convertirADTOPublico)
                        .toList();


        LogHelper.debug(
                PuntoAyudaService.class,
                "Listado de puntos de ayuda obtenido. cantidad={}",
                puntos.size()
        );


        return puntos;
    }


    @Transactional(readOnly = true)
    public PuntoAyudaDTO buscarPorId(
            Long id) {

        PuntoAyuda punto =
                puntoAyudaRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Punto de ayuda",
                                        id
                                )
                        );


        LogHelper.debug(
                PuntoAyudaService.class,
                "Punto de ayuda consultado correctamente. id={}",
                id
        );


        if (
                !EstadoVerificacion.VERIFICADO.equals(
                        punto.getEstadoVerificacion()
                )
        ) {

            throw new ResourceNotFoundException(
                    "Punto de ayuda",
                    id
            );
        }


        return convertirADTOPublico(
                punto
        );
    }


    @Transactional(readOnly = true)
    public List<PuntoAyudaDTO> buscarPorDepartamento(
            Long departamentoId) {

        List<PuntoAyudaDTO> puntos =
                puntoAyudaRepository
                        .findByDepartamentoId(
                                departamentoId
                        )
                        .stream()
                        .filter(punto ->
                                EstadoVerificacion.VERIFICADO.equals(
                                        punto.getEstadoVerificacion()
                                )
                        )
                        .map(this::convertirADTOPublico)
                        .toList();


        LogHelper.debug(
                PuntoAyudaService.class,
                "Puntos de ayuda consultados por departamento. departamentoId={}, cantidad={}",
                departamentoId,
                puntos.size()
        );


        return puntos;
    }

    @Transactional(readOnly = true)
    public List<PuntoAyudaDTO> listarMisPuntos(String emailAutenticado) {

        Usuario usuario = usuarioRepository.findByEmail(emailAutenticado)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Usuario autenticado no encontrado"
                ));

        return puntoAyudaRepository
                .findByCreadorIdOrderByFechaCreacionDesc(usuario.getId())
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    @Transactional
    public PuntoAyudaDTO registrarComoCiudadano(
            RegistrarPuntoAyudaDTO dto,
            String emailAutenticado) {

        Usuario creador = usuarioRepository.findByEmail(emailAutenticado)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Usuario autenticado no encontrado"
                ));

        Departamento departamento = departamentoRepository
                .findById(dto.getDepartamentoId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El departamento seleccionado no existe"
                ));

        Set<Long> idsSolicitados = new HashSet<>(dto.getNecesidadIds());

        if (idsSolicitados.size() != dto.getNecesidadIds().size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No se permiten necesidades duplicadas"
            );
        }

        Set<Necesidad> necesidades = new HashSet<>(
                necesidadRepository.findAllById(idsSolicitados)
        );

        if (necesidades.size() != idsSolicitados.size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Una o más necesidades no existen"
            );
        }

        PuntoAyuda punto = new PuntoAyuda();

        punto.setNombre(dto.getNombre().trim());
        punto.setTipo(dto.getTipo().trim());
        punto.setDescripcion(dto.getDescripcion().trim());
        punto.setDireccion(dto.getDireccion().trim());
        punto.setCiudad(dto.getCiudad().trim());

        punto.setDepartamento(departamento);
        punto.setLatitud(dto.getLatitud());
        punto.setLongitud(dto.getLongitud());

        punto.setNombreContacto(dto.getNombreContacto().trim());
        punto.setTelefonoContacto(dto.getTelefonoContacto().trim());
        punto.setCorreoContacto(
                dto.getCorreoContacto() == null
                        || dto.getCorreoContacto().isBlank()
                        ? null
                        : dto.getCorreoContacto().trim()
        );

        // La identidad proviene del JWT, nunca del formulario.
        punto.setCreador(creador);

        // Todos los registros ciudadanos esperan revisión.
        punto.setEstadoVerificacion(EstadoVerificacion.PENDIENTE);

        punto.setNecesidades(necesidades);

        PuntoAyuda guardado = puntoAyudaRepository.save(punto);

        return convertirADTO(guardado);
    }


    @Transactional
    public PuntoAyudaDTO guardar(
            PuntoAyudaDTO dto) {

        PuntoAyuda punto =
                new PuntoAyuda();


        copiarDTOaEntidad(
                dto,
                punto
        );


        punto.setEstadoVerificacion(
                EstadoVerificacion.PENDIENTE
        );


        PuntoAyuda guardado =
                puntoAyudaRepository.save(
                        punto
                );


        LogHelper.info(
                PuntoAyudaService.class,
                "Punto de ayuda creado correctamente. id={}, estado={}",
                guardado.getId(),
                guardado.getEstadoVerificacion()
        );


        return convertirADTO(
                guardado
        );
    }


    @Transactional
    public PuntoAyudaDTO actualizar(
            Long id,
            PuntoAyudaDTO dto) {

        PuntoAyuda punto =
                puntoAyudaRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Punto de ayuda",
                                        id
                                )
                        );


        copiarDTOaEntidad(
                dto,
                punto
        );


        PuntoAyuda actualizado =
                puntoAyudaRepository.save(
                        punto
                );


        LogHelper.info(
                PuntoAyudaService.class,
                "Punto de ayuda actualizado correctamente. id={}",
                id
        );


        return convertirADTO(
                actualizado
        );
    }


    @Transactional
    public void eliminar(
            Long id) {

        if (!puntoAyudaRepository.existsById(id)) {

            throw new ResourceNotFoundException(
                    "Punto de ayuda",
                    id
            );
        }


        puntoAyudaRepository.deleteById(
                id
        );


        LogHelper.info(
                PuntoAyudaService.class,
                "Punto de ayuda eliminado correctamente. id={}",
                id
        );
    }


    private void copiarDTOaEntidad(
            PuntoAyudaDTO dto,
            PuntoAyuda punto) {

        punto.setNombre(
                dto.getNombre()
        );

        punto.setTipo(
                dto.getTipo()
        );

        punto.setDescripcion(
                dto.getDescripcion()
        );

        punto.setDireccion(
                dto.getDireccion()
        );

        punto.setCiudad(
                dto.getCiudad()
        );

        punto.setLatitud(
                dto.getLatitud()
        );

        punto.setLongitud(
                dto.getLongitud()
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


        punto.setDepartamento(
                departamento
        );


        Usuario creador =
                usuarioRepository
                        .findById(
                                dto.getCreadorId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Usuario",
                                        dto.getCreadorId()
                                )
                        );


        punto.setCreador(
                creador
        );


        if (
                dto.getNecesidadIds() != null
                        &&
                        !dto.getNecesidadIds().isEmpty()
        ) {

            Set<Necesidad> necesidades =
                    new HashSet<>(
                            necesidadRepository
                                    .findAllById(
                                            dto.getNecesidadIds()
                                    )
                    );


            punto.setNecesidades(
                    necesidades
            );

        } else {

            punto.setNecesidades(
                    new HashSet<>()
            );
        }
    }

    // ==========================================
    // CONVERSIÓN PARA CONSULTAS PÚBLICAS
    // ==========================================

    private PuntoAyudaDTO convertirADTOPublico(
            PuntoAyuda punto) {

        PuntoAyudaDTO dto =
                convertirADTO(punto);

        dto.setNombreContacto(null);
        dto.setTelefonoContacto(null);
        dto.setCorreoContacto(null);
        dto.setCreadorId(null);

        return dto;
    }


    private PuntoAyudaDTO convertirADTO(
            PuntoAyuda punto) {

        PuntoAyudaDTO dto =
                new PuntoAyudaDTO();


        dto.setId(
                punto.getId()
        );

        dto.setNombre(
                punto.getNombre()
        );

        dto.setTipo(
                punto.getTipo()
        );

        dto.setDescripcion(
                punto.getDescripcion()
        );

        dto.setDireccion(
                punto.getDireccion()
        );

        dto.setCiudad(
                punto.getCiudad()
        );

        dto.setNombreContacto(punto.getNombreContacto());
        dto.setTelefonoContacto(punto.getTelefonoContacto());
        dto.setCorreoContacto(punto.getCorreoContacto());

        dto.setLatitud(
                punto.getLatitud()
        );

        dto.setLongitud(
                punto.getLongitud()
        );

        dto.setEstadoVerificacion(
                punto.getEstadoVerificacion()
        );


        if (punto.getDepartamento() != null) {

            dto.setDepartamentoId(
                    punto.getDepartamento().getId()
            );

            dto.setDepartamentoNombre(
                    punto.getDepartamento().getNombre()
            );
        }


        if (punto.getCreador() != null) {

            dto.setCreadorId(
                    punto.getCreador().getId()
            );
        }


        if (punto.getNecesidades() != null) {

            dto.setNecesidadIds(
                    punto.getNecesidades()
                            .stream()
                            .map(Necesidad::getId)
                            .toList()
            );


            dto.setNecesidadNombres(
                    punto.getNecesidades()
                            .stream()
                            .map(Necesidad::getNombre)
                            .toList()
            );
        }


        return dto;
    }
}