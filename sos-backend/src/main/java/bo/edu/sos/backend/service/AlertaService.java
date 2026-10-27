package bo.edu.sos.backend.service;

import bo.edu.sos.backend.dto.AlertaDTO;
import bo.edu.sos.backend.dto.CrearAlertaDTO;
import bo.edu.sos.backend.dto.PublicarAlertaDTO;
import bo.edu.sos.backend.entity.EventoPublicacionAlerta;
import bo.edu.sos.backend.exception.BadRequestException;
import bo.edu.sos.backend.exception.ConflictException;
import bo.edu.sos.backend.repository.EventoPublicacionAlertaRepository;
import jakarta.validation.Validator;
import bo.edu.sos.backend.entity.Alerta;
import bo.edu.sos.backend.entity.Departamento;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.helper.LogHelper;
import bo.edu.sos.backend.repository.AlertaRepository;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.LocalDateTime;

import static bo.edu.sos.backend.constants.AlertaConstants.*;


@Service
public class AlertaService {

    private final AlertaRepository alertaRepository;
    private final DepartamentoRepository departamentoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EventoPublicacionAlertaRepository eventoRepository;
    private final Validator validator;


    public AlertaService(
            AlertaRepository alertaRepository,
            DepartamentoRepository departamentoRepository,
            UsuarioRepository usuarioRepository,
            EventoPublicacionAlertaRepository eventoRepository,
            Validator validator) {

        this.alertaRepository = alertaRepository;
        this.departamentoRepository = departamentoRepository;
        this.usuarioRepository = usuarioRepository;
        this.eventoRepository = eventoRepository;
        this.validator = validator;
    }


    @Transactional(readOnly = true)
    public List<AlertaDTO> listarTodas() {

        List<AlertaDTO> alertas = alertaRepository
                .findByEstado(ACTIVA)
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
    public AlertaDTO buscarPorId(Long id) {

        Alerta alerta = alertaRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Alerta",
                                id
                        )
                );

        if (!ACTIVA.equals(alerta.getEstado())) {
            throw new ResourceNotFoundException("Alerta", id);
        }


        LogHelper.debug(
                AlertaService.class,
                "Alerta consultada correctamente. id={}",
                id
        );


        return convertirADTO(alerta);
    }

    @Transactional(readOnly = true)
    public List<AlertaDTO> listarBorradores() {
        return alertaRepository.findByEstado(BORRADOR).stream().map(this::convertirADTO).toList();
    }

    @Transactional(readOnly = true)
    public AlertaDTO buscarParaRevision(Long id) {
        return convertirADTO(alertaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alerta", id)));
    }

    @Transactional
    public AlertaDTO publicar(Long id, PublicarAlertaDTO solicitud, String email) {
        Alerta alerta = alertaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alerta", id));
        if (!BORRADOR.equals(alerta.getEstado())) {
            throw new ConflictException("La alerta ya no es un borrador. Vuelve a consultarla.");
        }
        if (!alerta.getVersion().equals(solicitud.getVersion())) {
            throw new ConflictException("La alerta cambió después de la revisión. Revisa la versión actual.");
        }
        if (!validator.validate(convertirADTO(alerta)).isEmpty()) {
            throw new BadRequestException("Completa los datos obligatorios y la vigencia antes de publicar.");
        }
        Usuario administrador = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario autenticado no encontrado"));
        alerta.setEstado(ACTIVA);
        // El control optimista impide publicar dos veces o publicar una versión distinta.
        alertaRepository.saveAndFlush(alerta);

        EventoPublicacionAlerta evento = new EventoPublicacionAlerta();
        evento.setAlerta(alerta);
        evento.setAdministrador(administrador);
        evento.setFecha(LocalDateTime.now());
        evento.setEstadoAnterior(BORRADOR);
        evento.setEstadoNuevo(ACTIVA);
        // Misma transacción: si falla el evento, también se revierte la publicación.
        eventoRepository.saveAndFlush(evento);
        return convertirADTO(alerta);
    }


    @Transactional(readOnly = true)
    public List<AlertaDTO> buscarPorDepartamento(
            Long departamentoId) {

        List<AlertaDTO> alertas = alertaRepository
                .findByDepartamentoIdAndEstado(departamentoId, ACTIVA)
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


        alerta.setEstado(
                BORRADOR
        );


        Alerta guardada = alertaRepository.save(
                alerta
        );


        LogHelper.info(
                AlertaService.class,
                "Alerta creada correctamente. id={}, estado={}",
                guardada.getId(),
                guardada.getEstado()
        );


        return convertirADTO(
                guardada
        );
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

        if (!BORRADOR.equals(alerta.getEstado())) {
            throw new BadRequestException("Una alerta publicada no puede editarse sin una nueva revisión.");
        }
        if (dto.getEstado() != null && !BORRADOR.equals(dto.getEstado())) {
            throw new BadRequestException("Usa la confirmación de publicación para cambiar el estado.");
        }
        if (!alerta.getVersion().equals(dto.getVersion())) {
            throw new ConflictException("La alerta cambió. Consulta la versión actual antes de editar.");
        }
        if (!alerta.getCreadoPor().getId().equals(dto.getCreadoPorId())) {
            throw new BadRequestException("No se puede cambiar el creador de la alerta.");
        }

        copiarDTOaEntidad(
                dto,
                alerta
        );


        Alerta actualizada = alertaRepository.saveAndFlush(
                alerta
        );


        LogHelper.info(
                AlertaService.class,
                "Alerta actualizada correctamente. id={}, estado={}",
                id,
                actualizada.getEstado()
        );


        return convertirADTO(
                actualizada
        );
    }


    @Transactional
    public void eliminar(
            Long id) {

        Alerta alerta = alertaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alerta", id));
        if (!BORRADOR.equals(alerta.getEstado())) {
            throw new BadRequestException("No se puede eliminar una alerta publicada ni su registro de publicación.");
        }


        alertaRepository.delete(
                alerta
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

        alerta.setTitulo(
                dto.getTitulo().strip()
        );

        alerta.setMensaje(
                dto.getMensaje().strip()
        );

        if (dto.getFuente() != null) {
            alerta.setFuente(dto.getFuente().strip());
        }

        alerta.setSeveridad(
                dto.getSeveridad()
        );

        alerta.setFechaPublicacion(
                dto.getFechaPublicacion()
        );

        alerta.setFechaExpiracion(
                dto.getFechaExpiracion()
        );


        if (dto.getEstado() != null) {

            alerta.setEstado(
                    dto.getEstado()
            );
        }


        Departamento departamento = departamentoRepository
                .findById(
                        dto.getDepartamentoId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Departamento",
                                dto.getDepartamentoId()
                        )
                );


        alerta.setDepartamento(
                departamento
        );


    }


    private AlertaDTO convertirADTO(
            Alerta alerta) {

        AlertaDTO dto = new AlertaDTO();

        dto.setVersion(alerta.getVersion());


        dto.setId(
                alerta.getId()
        );

        dto.setTitulo(
                alerta.getTitulo()
        );

        dto.setMensaje(
                alerta.getMensaje()
        );

        dto.setFuente(alerta.getFuente());

        dto.setSeveridad(
                alerta.getSeveridad()
        );

        dto.setFechaPublicacion(
                alerta.getFechaPublicacion()
        );

        dto.setFechaExpiracion(
                alerta.getFechaExpiracion()
        );

        dto.setEstado(
                alerta.getEstado()
        );


        if (alerta.getDepartamento() != null) {

            dto.setDepartamentoId(
                    alerta
                            .getDepartamento()
                            .getId()
            );

            dto.setDepartamentoNombre(
                    alerta
                            .getDepartamento()
                            .getNombre()
            );
        }


        if (alerta.getCreadoPor() != null) {

            dto.setCreadoPorId(
                    alerta
                            .getCreadoPor()
                            .getId()
            );
        }


        return dto;
    }
}
