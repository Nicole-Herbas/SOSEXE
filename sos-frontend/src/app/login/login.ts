import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 
import { AuthService } from './auth.service'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
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
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (respuesta) => {
          console.log('¡Éxito total!', respuesta);
          
          localStorage.setItem('token', respuesta.token);
          localStorage.setItem('rol', respuesta.rol);
          
          if (respuesta.rol === 'ADMINISTRADOR') {
            alert('¡Bienvenido Administrador ' + respuesta.nombre + '!');
            this.router.navigate(['/admin']); 
          } else {
            alert('¡Bienvenido Ciudadano ' + respuesta.nombre + '!');
            this.router.navigate(['/centros']); 
          }
        },
        error: (err) => {
          console.error('Error al iniciar sesión', err);
          alert('¡Credenciales incorrectas o usuario no registrado!');
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}