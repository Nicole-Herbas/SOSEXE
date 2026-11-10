package bo.edu.sos.backend.service;

import bo.edu.sos.backend.entity.Alerta;
import bo.edu.sos.backend.helper.LogHelper;
import org.springframework.stereotype.Service;

@Service
public class NotificacionService {

    public void enviarAlertaSms(Alerta alerta) {
        // Aquí iría la integración real con Twilio o similar.
        // Por ahora simulamos el envío y dejamos el log para evidenciar la acción.
        
        String mensaje = "ALERTA " + alerta.getSeveridad() + ": " + alerta.getTitulo() + " - " + alerta.getMensaje();
        
        LogHelper.info(
                NotificacionService.class,
                "Enviando SMS a suscriptores del departamento {}. Mensaje: {}",
                alerta.getDepartamento().getNombre(),
                mensaje
        );
    }
}