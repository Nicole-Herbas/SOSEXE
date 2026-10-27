import { Component, OnInit, OnDestroy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../features/auth/services/auth.service';
import { IdiomaService } from '../services/idioma.service';


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

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly idiomaService = inject(IdiomaService);

  /**
   * SOS-114 — Función de traducción reactiva.
   * La dependencia en `traducciones$` hace que el navbar se actualice
   * automáticamente cuando el usuario cambia el idioma.
   */
  readonly t = computed(() => {
    const _ = this.idiomaService.traducciones$();
    return (clave: string) => this.idiomaService.t(clave);
  });

  menuAbierto = false;
  sesionActiva = false;
  nombreUsuario = '';

  private sub!: Subscription;

  ngOnInit(): void {

    this.sub = this.authService.sesion$
      .subscribe(activa => {

        this.sesionActiva = activa;
        this.nombreUsuario =
          activa
            ? this.authService.obtenerNombreUsuario()
            : '';

      });

  }

  ngOnDestroy(): void {

    this.sub?.unsubscribe();

  }

  cerrarSesion(): void {

    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/inicio']),
      error: () => {
        // Limpiar la sesión localmente aunque falle el backend
        this.router.navigate(['/inicio']);
      }
    });

  }

}
