import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { REGISTRO_STRINGS } from './registro.strings';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent implements OnInit {
  registroForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  /** Objeto de strings para usar en el template */
  readonly strings = REGISTRO_STRINGS;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registroForm = this.fb.group({
      nombre:   ['', [Validators.required, Validators.maxLength(120)]],
      email:    ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(255)]],
      telefono: ['', [Validators.maxLength(20)]],
    });
  }

  onSubmit(): void {
    if (this.registroForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const datos = {
        ...this.registroForm.value,
        rolId: 2  // Rol ciudadano por defecto (AuthConstants.ROL_CIUDADANO_ID)
      };

      this.authService.registro(datos).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.isLoading = false;
          if (err.status === 409 && err.error?.message) {
            // DuplicateResourceException → 409 Conflict
            this.errorMessage = err.error.message;
          } else if (err.status === 400 && typeof err.error === 'string') {
            this.errorMessage = err.error;
          } else {
            this.errorMessage = 'Ocurrió un error al registrarse. Intenta nuevamente.';
          }
        }
      });
    } else {
      this.registroForm.markAllAsTouched();
    }
  }
}
