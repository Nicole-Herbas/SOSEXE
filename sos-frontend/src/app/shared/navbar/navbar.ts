import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../features/auth/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  imports: [RouterLink, RouterLinkActive, CommonModule],
  selector: 'app-navbar',
  styleUrl: './navbar.scss',
  templateUrl: './navbar.html',
})
export class Navbar implements OnInit {
  menuAbierto = false;
  isLoggedIn = false;
  nombreUsuario = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.checkAuthState();
    // Actualiza el estado al navegar entre rutas
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.checkAuthState());
  }

  checkAuthState(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.nombreUsuario = localStorage.getItem('nombre') || '';
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.nombreUsuario = '';
    this.router.navigate(['/login']);
  }
}