package bo.edu.sos.backend.service;

import bo.edu.sos.backend.constants.EstadoVerificacion;
import bo.edu.sos.backend.dto.CentroDTO;
import bo.edu.sos.backend.entity.Centro;
import bo.edu.sos.backend.entity.Departamento;
import bo.edu.sos.backend.entity.Necesidad;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.helper.LogHelper;
import bo.edu.sos.backend.repository.CentroRepository;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
public class CentroService {

    private final CentroRepository centroRepository;
    private final DepartamentoRepository departamentoRepository;
    private final UsuarioRepository usuarioRepository;


    public CentroService(
            CentroRepository centroRepository,
            DepartamentoRepository departamentoRepository,
            UsuarioRepository usuarioRepository) {

        this.centroRepository = centroRepository;
        this.departamentoRepository = departamentoRepository;
        this.usuarioRepository = usuarioRepository;
    }


    @Transactional(readOnly = true)
    public List<CentroDTO> listarTodos() {

        List<CentroDTO> centros =
                centroRepository
                        .findAll()
                        .stream()
                        .map(this::convertirADTO)
                        .toList();


        LogHelper.debug(
                CentroService.class,
                "Listado de centros obtenido. cantidad={}",
                centros.size()
        );


        return centros;
    }


    @Transactional(readOnly = true)
    public CentroDTO buscarPorId(
            Long id) {

        Centro centro =
                centroRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Centro",
                                        id
                                )
                        );


        LogHelper.debug(
                CentroService.class,
                "Centro consultado correctamente. id={}",
                id
        );


        return convertirADTO(
                centro
        );
    }


    @Transactional
    public CentroDTO guardar(
            CentroDTO dto) {

        Centro centro =
                new Centro();


        copiarDTOaEntidad(
                dto,
                centro
        );


        centro.setEstadoVerificacion(
                EstadoVerificacion.PENDIENTE
        );


        Centro guardado =
                centroRepository.save(
                        centro
                );


        LogHelper.info(
                CentroService.class,
                "Centro creado correctamente. id={}",
                guardado.getId()
        );


        return convertirADTO(
                guardado
        );
    }


    @Transactional
    public CentroDTO actualizar(
            Long id,
            CentroDTO dto) {

        Centro centro =
                centroRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Centro",
                                        id
                                )
                        );


        copiarDTOaEntidad(
                dto,
                centro
        );


        Centro actualizado =
                centroRepository.save(
                        centro
                );


        LogHelper.info(
                CentroService.class,
                "Centro actualizado correctamente. id={}",
                id
        );


        return convertirADTO(
                actualizado
        );
    }


    @Transactional
    public void eliminar(
            Long id) {

        if (!centroRepository.existsById(id)) {

            throw new ResourceNotFoundException(
                    "Centro",
                    id
            );
        }


        centroRepository.deleteById(
                id
        );


        LogHelper.info(
                CentroService.class,
                "Centro eliminado correctamente. id={}",
                id
        );
    }


    private void copiarDTOaEntidad(
            CentroDTO dto,
            Centro centro) {

        centro.setNombre(
                dto.getNombre()
        );

        centro.setTipo(
                dto.getTipo()
        );

        centro.setDescripcion(
                dto.getDescripcion()
        );

        centro.setDireccion(
                dto.getDireccion()
        );

        centro.setCiudad(
                dto.getCiudad()
        );

        centro.setTelefono(
                dto.getTelefono()
        );

        centro.setEmail(
                dto.getEmail()
        );

        centro.setLatitud(
                dto.getLatitud()
        );

        centro.setLongitud(
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


        centro.setDepartamento(
                departamento
        );


        if (dto.getResponsableId() != null) {

            Usuario responsable =
                    usuarioRepository
                            .findById(
                                    dto.getResponsableId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Usuario",
                                            dto.getResponsableId()
                                    )
                            );


            centro.setResponsable(
                    responsable
            );

        } else {

            centro.setResponsable(
                    null
            );
        }
    }


    private CentroDTO convertirADTO(
            Centro centro) {

        CentroDTO dto =
                new CentroDTO();


        dto.setId(
                centro.getId()
        );

        dto.setNombre(
                centro.getNombre()
        );

        dto.setTipo(
                centro.getTipo()
        );

        dto.setDescripcion(
                centro.getDescripcion()
        );

        dto.setDireccion(
                centro.getDireccion()
        );

        dto.setCiudad(
                centro.getCiudad()
        );

        dto.setTelefono(
                centro.getTelefono()
        );

        dto.setEmail(
                centro.getEmail()
        );

        dto.setLatitud(
                centro.getLatitud()
        );

        dto.setLongitud(
                centro.getLongitud()
        );

        dto.setEstadoVerificacion(
                centro.getEstadoVerificacion()
        );


        if (centro.getDepartamento() != null) {

            dto.setDepartamentoId(
                    centro
                            .getDepartamento()
                            .getId()
            );

            dto.setDepartamentoNombre(
                    centro
                            .getDepartamento()
                            .getNombre()
            );
        }


        if (centro.getResponsable() != null) {

            dto.setResponsableId(
                    centro
                            .getResponsable()
                            .getId()
            );
        }


        if (centro.getNecesidades() != null) {

            dto.setNecesidadIds(
                    centro
                            .getNecesidades()
                            .stream()
                            .map(
                                    Necesidad::getId
                            )
                            .toList()
            );


            dto.setNecesidadNombres(
                    centro
                            .getNecesidades()
                            .stream()
                            .map(
                                    Necesidad::getNombre
                            )
                            .toList()
            );
        }


        return dto;
    }
}