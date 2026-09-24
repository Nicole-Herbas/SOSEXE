import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  mensajeError = '';
  loginForm!: FormGroup;

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

  this.mensajeError = '';


  if (this.loginForm.valid) {

    this.authService
      .login(this.loginForm.value)
      .subscribe({

        next: (respuesta) => {

          localStorage.setItem(
            'token',
            respuesta.token
          );

          if (respuesta.rol === 'ADMIN') {

            this.router.navigate([
              '/admin'
            ]);

          } else {

            this.router.navigate([
              '/centros'
            ]);

          }

        },

        error: (err) => {

          console.error(
            'Error al iniciar sesión',
            err
          );

          this.mensajeError =
            'Correo o contraseña incorrectos.';

        }

      });

  } else {

    this.loginForm.markAllAsTouched();

  }
}
}
