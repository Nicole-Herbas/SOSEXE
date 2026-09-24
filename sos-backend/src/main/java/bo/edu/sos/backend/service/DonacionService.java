@Transactional
public DonacionDTO crear(
        DonacionDTO dto,
        String emailAutenticado) {

    Donacion donacion =
            new Donacion();


    donacion.setCodigo(
            DonacionConstants.CODIGO_PREFIJO
                    + UUID.randomUUID()
                    .toString()
                    .substring(
                            0,
                            DonacionConstants.CODIGO_SUFIJO_LONGITUD
                    )
                    .toUpperCase()
    );


    donacion.setMonto(
            dto.getMonto()
    );

    donacion.setMetodo(
            dto.getMetodo()
    );

    donacion.setAnonima(
            dto.getAnonima() != null
                    ? dto.getAnonima()
                    : false
    );


    Centro centro =
            centroRepository
                    .findById(
                            dto.getCentroId()
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Centro",
                                    dto.getCentroId()
                            )
                    );


    donacion.setCentro(
            centro
    );


    if (!donacion.getAnonima()) {

        Usuario usuario =
                usuarioRepository
                        .findByEmail(
                                emailAutenticado
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No existe un usuario con email: "
                                                + emailAutenticado
                                )
                        );


        donacion.setUsuario(
                usuario
        );
    }


    Donacion guardada =
            donacionRepository.save(
                    donacion
            );


    return convertirADTO(
            guardada
    );

    @Transactional(readOnly = true)
public List<DonacionDTO> listarMias(
        String emailAutenticado) {

    Usuario usuario =
            usuarioRepository
                    .findByEmail(
                            emailAutenticado
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "No existe un usuario con email: "
                                            + emailAutenticado
                            )
                    );


    return donacionRepository
            .findByUsuarioId(
                    usuario.getId()
            )
            .stream()
            .map(this::convertirADTO)
            .toList();
}
}