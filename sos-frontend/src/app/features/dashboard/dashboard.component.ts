import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { DASHBOARD_STRINGS } from './dashboard.strings';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  nombreAdmin = '';

  /** Objeto de strings para usar en el template */
  readonly strings = DASHBOARD_STRINGS;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/login']);
      return;
    }
    this.nombreAdmin = localStorage.getItem('nombre') || 'Administrador';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
