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
  usuarioMenuAbierto = false;

  sesionActiva = false;
  nombreUsuario = '';

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

        // Cerramos el menú del usuario cuando cambia la sesión
        if (!activa) {
          this.usuarioMenuAbierto = false;
        }

      });

  }

  ngOnDestroy(): void {

    this.sub?.unsubscribe();

  }

  /**
   * Abre o cierra el menú del usuario.
   */
  toggleUsuarioMenu(): void {

    this.usuarioMenuAbierto =
      !this.usuarioMenuAbierto;

  }

  /**
   * Cierra los menús de navegación.
   */
  cerrarMenus(): void {

    this.menuAbierto = false;
    this.usuarioMenuAbierto = false;

  }

  /**
   * Cierra sesión y vuelve al inicio.
   */
  cerrarSesion(): void {

    this.usuarioMenuAbierto = false;

    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/inicio']);
      },
      error: () => {
        // Limpiar la sesión localmente aunque falle el backend
        this.router.navigate(['/inicio']);
      }
    });

  }

}