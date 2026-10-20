package bo.edu.sos.backend.service;

import bo.edu.sos.backend.constants.EstadoAlerta;
import bo.edu.sos.backend.dto.AlertaDTO;
import bo.edu.sos.backend.dto.CrearAlertaDTO;
import bo.edu.sos.backend.entity.Alerta;
import bo.edu.sos.backend.entity.Departamento;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.exception.BadRequestException;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.helper.LogHelper;
import bo.edu.sos.backend.repository.AlertaRepository;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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

        List<AlertaDTO> alertas = alertaRepository
                .findAll()
                .stream()
                .map(this::convertirADTO)
                .toList();


        LogHelper.debug(
                AlertaService.class,
                "Listado de alertas obtenido. cantidad={}",
                alertas.size()
        );


        return alertas;
    }


    @Transactional(readOnly = true)
    public List<AlertaDTO> listarActivas() {

        List<AlertaDTO> alertas = alertaRepository
                .findByEstadoAndFechaExpiracionAfter(
                        EstadoAlerta.ACTIVA,
                        LocalDateTime.now())
                .stream()
                .map(this::convertirADTO)
                .toList();


        LogHelper.debug(
                AlertaService.class,
                "Listado de alertas activas y vigentes obtenido. cantidad={}",
                alertas.size()
        );


        return alertas;
    }


    @Transactional(readOnly = true)
    public AlertaDTO buscarPorId(Long id) {

        Alerta alerta = alertaRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Alerta",
                                id
                        )
                );


        LogHelper.debug(
                AlertaService.class,
                "Alerta consultada correctamente. id={}",
                id
        );


        return convertirADTO(alerta);
    }


    @Transactional(readOnly = true)
    public List<AlertaDTO> buscarPorDepartamento(
            Long departamentoId) {

        List<AlertaDTO> alertas = alertaRepository
                .findByDepartamentoId(departamentoId)
                .stream()
                .map(this::convertirADTO)
                .toList();


        LogHelper.debug(
                AlertaService.class,
                "Alertas consultadas por departamento. departamentoId={}, cantidad={}",
                departamentoId,
                alertas.size()
        );


        return alertas;
    }


    @Transactional
    public AlertaDTO guardar(
            CrearAlertaDTO dto, String email) {

        Alerta alerta = new Alerta();
        alerta.setTitulo(dto.getTitulo().strip());
        alerta.setMensaje(dto.getMensaje().strip());
        alerta.setFuente(dto.getFuente().strip());
        alerta.setSeveridad(dto.getSeveridad());
        alerta.setFechaPublicacion(dto.getFechaPublicacion());
        alerta.setFechaExpiracion(dto.getFechaExpiracion());
        alerta.setDepartamento(departamentoRepository.findById(dto.getDepartamentoId())
                .orElseThrow(() -> new ResourceNotFoundException("Departamento", dto.getDepartamentoId())));
        alerta.setCreadoPor(usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario autenticado no encontrado")));


        alerta.setEstado(EstadoAlerta.BORRADOR);


        Alerta guardada = alertaRepository.save(alerta);


        LogHelper.info(
                AlertaService.class,
                "Alerta creada correctamente. id={}, estado={}",
                guardada.getId(),
                guardada.getEstado()
        );


        return convertirADTO(guardada);
    }


    @Transactional
    public AlertaDTO cambiarEstado(
            Long id,
            String nuevoEstado) {

        if (!EstadoAlerta.esValido(nuevoEstado)) {
            throw new BadRequestException(
                    "Estado de alerta inválido: " + nuevoEstado
                            + ". Valores permitidos: "
                            + EstadoAlerta.VALORES);
        }

        Alerta alerta = alertaRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Alerta", id));

        String estadoActual = alerta.getEstado();

        if (!EstadoAlerta.transicionPermitida(estadoActual, nuevoEstado)) {
            throw new BadRequestException(
                    "Transición de estado no permitida: "
                            + estadoActual + " → " + nuevoEstado);
        }

        alerta.setEstado(nuevoEstado);

        Alerta actualizada = alertaRepository.save(alerta);

        LogHelper.info(
                AlertaService.class,
                "Estado de alerta actualizado. id={}, {} → {}",
                id,
                estadoActual,
                nuevoEstado
        );

        return convertirADTO(actualizada);
    }


    @Transactional
    public AlertaDTO actualizar(
            Long id,
            AlertaDTO dto) {

        Alerta alerta = alertaRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Alerta",
                                id
                        )
                );


        copiarDTOaEntidad(
                dto,
                alerta
        );


        Alerta actualizada = alertaRepository.save(
                alerta
        );


        LogHelper.info(
                AlertaService.class,
                "Alerta actualizada correctamente. id={}, estado={}",
                id,
                actualizada.getEstado()
        );


        return convertirADTO(actualizada);
    }


    @Transactional
    public void eliminar(
            Long id) {

        if (!alertaRepository.existsById(id)) {

            throw new ResourceNotFoundException(
                    "Alerta",
                    id
            );
        }


        alertaRepository.deleteById(
                id
        );


        LogHelper.info(
                AlertaService.class,
                "Alerta eliminada correctamente. id={}",
                id
        );
    }


    private void copiarDTOaEntidad(
            AlertaDTO dto,
            Alerta alerta) {

        alerta.setTitulo(dto.getTitulo());
        alerta.setMensaje(dto.getMensaje());

        if (dto.getFuente() != null) {
            alerta.setFuente(dto.getFuente());
        }

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
        dto.setFuente(alerta.getFuente());
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