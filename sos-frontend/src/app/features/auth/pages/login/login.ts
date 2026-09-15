import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LOGIN_STRINGS } from './login.strings';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  /** Objeto de strings para usar en el template */
  readonly strings = LOGIN_STRINGS;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (respuesta) => {
          this.isLoading = false;
          localStorage.setItem('token', respuesta.token);
          localStorage.setItem('rol', respuesta.rol);
          localStorage.setItem('nombre', respuesta.nombre);

          if (respuesta.rol === 'ADMIN') {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/inicio']);
          }
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = this.strings.errorCredenciales;
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}