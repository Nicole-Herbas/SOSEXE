import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { Router } from '@angular/router';

import { PostulacionService }
  from '../voluntariado/services/postulacion.service';

import { Postulacion }
  from '../voluntariado/models/postulacion.model';

import { AuthService }
  from '../../../auth/services/auth.service';


@Component({
  selector: 'app-mis-postulaciones',
  standalone: true,
  imports: [],
  templateUrl: './mis-postulaciones.html',
  styleUrl: './mis-postulaciones.scss'
})
export class MisPostulaciones implements OnInit {

  private readonly postulacionService =
    inject(PostulacionService);

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);


  postulaciones: Postulacion[] = [];

  cargando = true;

  error = '';

  nombreUsuario = '';


  ngOnInit(): void {

    /*
     * SOS-59
     * Esta pantalla solo puede ser utilizada
     * por usuarios autenticados.
     */
    if (!this.authService.estaAutenticado()) {

      this.router.navigate([
        '/login'
      ]);

      return;
    }


    this.nombreUsuario =
      this.authService.obtenerNombreUsuario();


    this.cargarPostulaciones();

  }


  cargarPostulaciones(): void {

    this.cargando = true;

    this.error = '';


    this.postulacionService
      .listarMias()
      .subscribe({

        next: (postulaciones) => {

          this.postulaciones =
            postulaciones ?? [];

          this.cargando = false;

        },


        error: (error) => {

          console.error(
            'Error al cargar las postulaciones:',
            error
          );

          this.postulaciones = [];

          this.error =
            'No pudimos cargar tus postulaciones. Intenta nuevamente.';

          this.cargando = false;

        }

      });

  }


  cantidadPorEstado(
    estado: string
  ): number {

    return this.postulaciones.filter(
      postulacion =>
        (postulacion.estado ?? '')
          .toUpperCase() === estado
    ).length;

  }


  estadoTexto(
    estado: string | undefined
  ): string {

    switch (
      (estado ?? '').toUpperCase()
    ) {

      case 'APROBADO':
        return 'Aprobada';

      case 'RECHAZADO':
        return 'Rechazada';

      case 'PENDIENTE':
        return 'Pendiente';

      default:
        return estado || 'Sin estado';

    }

  }


  estadoClase(
    estado: string | undefined
  ): string {

    switch (
      (estado ?? '').toUpperCase()
    ) {

      case 'APROBADO':
        return 'estado-aprobado';

      case 'RECHAZADO':
        return 'estado-rechazado';

      case 'PENDIENTE':
        return 'estado-pendiente';

      default:
        return 'estado-desconocido';

    }

  }


  formatearFecha(
    fecha: string | undefined
  ): string {

    if (!fecha) {

      return 'Fecha no disponible';

    }


    const fechaConvertida =
      new Date(fecha);


    if (
      Number.isNaN(
        fechaConvertida.getTime()
      )
    ) {

      return fecha;

    }


    return new Intl.DateTimeFormat(
      'es-BO',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }
    ).format(fechaConvertida);

  }


  volverAVoluntariado(): void {

    this.router.navigate([
      '/voluntariado'
    ]);

  }

}