import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';

interface Departamento {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent implements OnInit {

  readonly textos = APP_TEXTOS.registro;

  readonly departamentos: Departamento[] = [
    { id: 1, nombre: 'Chuquisaca' },
    { id: 2, nombre: 'La Paz' },
    { id: 3, nombre: 'Cochabamba' },
    { id: 4, nombre: 'Oruro' },
    { id: 5, nombre: 'Potosí' },
    { id: 6, nombre: 'Tarija' },
    { id: 7, nombre: 'Santa Cruz' },
    { id: 8, nombre: 'Beni' },
    { id: 9, nombre: 'Pando' },
  ];

  registroForm!: FormGroup;
  mensajeError = '';
  mensajeExito = '';
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.registroForm = this.fb.group({

      nombre: [
        '',
        [Validators.required, Validators.minLength(2)]
      ],

      email: [
        '',
        [Validators.required, Validators.email]
      ],

      password: [
        '',
        [Validators.required, Validators.minLength(6)]
      ],

      telefono: [''],

      departamentoId: [null],

    });

  }


  onSubmit(): void {

    this.mensajeError = '';
    this.mensajeExito = '';

    if (this.registroForm.valid) {

      this.cargando = true;

      const datos = {
        ...this.registroForm.value,
        departamentoId: this.registroForm.value.departamentoId
          ? Number(this.registroForm.value.departamentoId)
          : null,
      };

      this.authService
        .registrar(datos)
        .subscribe({

          next: () => {

            this.mensajeExito = this.textos.registroExitoso;
            this.cargando = false;

            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);

          },

          error: (err) => {

            this.cargando = false;

            if (err.status === 409) {
              this.mensajeError = this.textos.correoExistente;
            } else {
              this.mensajeError = this.textos.errorGeneral;
            }

          },

        });

    } else {

      this.registroForm.markAllAsTouched();

    }

  }

}
