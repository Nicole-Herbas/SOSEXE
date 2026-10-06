import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SolicitudCentroService } from '../../services/solicitud-centro';
import { SolicitudCentro } from '../../models/solicitud-centro';

@Component({
  selector: 'app-lista-solicitudes',
  imports: [FormsModule],
  templateUrl: './lista-solicitudes.html',
  styleUrl: './lista-solicitudes.scss'
})
export class ListaSolicitudes implements OnInit {

  private solicitudService = inject(SolicitudCentroService);

  solicitudes = signal<SolicitudCentro[]>([]);
  cargando = signal(true);
  error = signal('');

  filtro = signal('TODAS');

  solicitudSeleccionada = signal<SolicitudCentro | null>(null);

  estadoSeleccionado = signal('');
  observacion = signal('');

  procesando = signal(false);

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {

    this.cargando.set(true);
    this.error.set('');

    this.solicitudService.listarTodas().subscribe({

      next: (solicitudes) => {

        console.log('Solicitudes recibidas:', solicitudes);

        this.solicitudes.set(solicitudes);
        this.cargando.set(false);
      },

      error: (error) => {

        console.error('Error cargando solicitudes:', error);

        this.error.set(
          'No se pudieron cargar las solicitudes.'
        );

        this.cargando.set(false);
      }
    });
  }

  solicitudesFiltradas(): SolicitudCentro[] {

    const filtroActual = this.filtro();

    if (filtroActual === 'TODAS') {
      return this.solicitudes();
    }

    return this.solicitudes().filter(
      solicitud => solicitud.estado === filtroActual
    );
  }

  cambiarFiltro(filtro: string): void {
    this.filtro.set(filtro);
  }

  abrirSolicitud(solicitud: SolicitudCentro): void {

    this.solicitudSeleccionada.set(solicitud);

    this.estadoSeleccionado.set('');
    this.observacion.set('');
  }

  cerrarSolicitud(): void {

    if (this.procesando()) {
      return;
    }

    this.solicitudSeleccionada.set(null);
  }

  seleccionarEstado(estado: string): void {
    this.estadoSeleccionado.set(estado);
  }

  actualizarObservacion(event: Event): void {

    const input = event.target as HTMLTextAreaElement;

    this.observacion.set(input.value);
  }

  confirmarCambio(): void {

    const solicitud = this.solicitudSeleccionada();
    const estado = this.estadoSeleccionado();

    if (!solicitud || !estado) {
      return;
    }

    this.procesando.set(true);

    this.solicitudService
      .cambiarEstado(
        solicitud.id,
        estado,
        this.observacion()
      )
      .subscribe({

        next: (solicitudActualizada) => {

          this.solicitudes.update(
            solicitudes =>
              solicitudes.map(s =>
                s.id === solicitudActualizada.id
                  ? solicitudActualizada
                  : s
              )
          );

          this.solicitudSeleccionada.set(null);
          this.estadoSeleccionado.set('');
          this.observacion.set('');
          this.procesando.set(false);
        },

        error: (error) => {

          console.error(
            'Error cambiando estado:',
            error
          );

          this.procesando.set(false);

          alert(
            'No se pudo cambiar el estado de la solicitud.'
          );
        }
      });
  }
}