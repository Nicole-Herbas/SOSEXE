import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';
import { Subscription } from 'rxjs';

import {
  APP_TEXTOS
} from '../constants/app-textos.constants';

import { AuthService } from '../../features/auth/services/auth.service';


@Component({
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  selector: 'app-navbar',
  styleUrl: './navbar.scss',
  templateUrl: './navbar.html',
})
export class Navbar implements OnInit, OnDestroy {

  readonly textos = APP_TEXTOS.navbar;

  menuAbierto = false;
  configuracionAbierta = false;

  sesionActiva = false;
  nombreUsuario = '';

  // NUEVO
  esAdmin = false;

  private sub!: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.sub = this.authService.sesion$
      .subscribe(activa => {

        this.sesionActiva = activa;

        this.nombreUsuario =
          activa
            ? this.authService.obtenerNombreUsuario()
            : '';

        // Si hay sesión, verificamos el rol
        if (activa) {
          this.obtenerRolUsuario();
        } else {
          this.esAdmin = false;
          this.configuracionAbierta = false;
        }

      });

  }

  // NUEVO
  private obtenerRolUsuario(): void {

    this.authService.usuarioActual().subscribe({

      next: usuario => {

        this.esAdmin = usuario.rol === 'ADMIN';

        console.log('Rol del usuario:', usuario.rol);
        console.log('¿Es admin?', this.esAdmin);

      },

      error: error => {

        console.error(
          'No se pudo obtener el usuario actual:',
          error
        );

        this.esAdmin = false;

      }

    });

  }

  ngOnDestroy(): void {

    this.sub?.unsubscribe();

  }

  // NUEVO
  alternarConfiguracion(): void {
    this.configuracionAbierta =
      !this.configuracionAbierta;
  }

  // NUEVO
  irASolicitudes(): void {

    this.configuracionAbierta = false;

    this.router.navigate(['/admin']);

  }

  cerrarSesion(): void {

    this.authService.logout().subscribe({

      next: () => {

        this.esAdmin = false;

        this.router.navigate(['/inicio']);

      },

      error: () => {

        this.esAdmin = false;

        this.router.navigate(['/inicio']);

      }

    });

  }

}