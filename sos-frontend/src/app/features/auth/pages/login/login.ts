import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  readonly textos = APP_TEXTOS.login;

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

          if (respuesta.rol === 'ADMIN') {

            this.router.navigate([
              '/admin'
            ]);

          } else {

            this.router.navigate([
              '/inicio'
            ]);

          }

        },

        error: (err) => {

          console.error(
            'Error al iniciar sesión',
            err
          );

          this.mensajeError = this.textos.credencialesIncorrectas;
            

        }

      });

  } else {

    this.loginForm.markAllAsTouched();

  }
}
}
