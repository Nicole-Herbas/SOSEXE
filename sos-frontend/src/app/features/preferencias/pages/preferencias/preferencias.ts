import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { SuscripcionSmsService } from '../../services/suscripcion-sms.service';
import { SuscripcionSms } from '../../models/suscripcion-sms.model';
import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';

interface Departamento {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-preferencias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './preferencias.html',
  styleUrl: './preferencias.scss'
})
export class PreferenciasComponent implements OnInit {

  private fb = inject(FormBuilder);
  private suscripcionService = inject(SuscripcionSmsService);

  readonly textos = APP_TEXTOS.preferencias;

  readonly departamentos: Departamento[] = [
    { id: 1, nombre: 'Chuquisaca' },
    { id: 2, nombre: 'La Paz' },
    { id: 3, nombre: 'Cochabamba' },
    { id: 4, nombre: 'Oruro' },
    { id: 5, nombre: 'Potosí' },
    { id: 6, nombre: 'Tarija' },
    { id: 7, nombre: 'Santa Cruz' },
    { id: 8, nombre: 'Beni' },
    { id: 9, nombre: 'Pando' }
  ];

  formulario!: FormGroup;

  cargando = signal<boolean>(true);
  guardando = signal<boolean>(false);
  mensajeExito = signal<string | null>(null);
  mensajeError = signal<string | null>(null);
  suscripcionActual = signal<SuscripcionSms | null>(null);

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarSuscripcion();
  }

  private inicializarFormulario(): void {
    this.formulario = this.fb.group({
      telefono: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\+?[0-9]{7,15}$/)
        ]
      ],
      departamentoId: [null, [Validators.required]],
      // Consentimiento explícito: sin marcar por defecto y requerido para enviar
      consentimiento: [false, [Validators.requiredTrue]]
    });
  }

  private cargarSuscripcion(): void {
    this.cargando.set(true);
    this.suscripcionService.obtenerSuscripcion().subscribe({
      next: (res) => {
        this.cargando.set(false);
        if (res?.data) {
          this.suscripcionActual.set(res.data);
          this.formulario.patchValue({
            telefono: res.data.telefono,
            departamentoId: res.data.departamentoId,
            consentimiento: false
          });
        }
      },
      error: () => {
        // No tiene suscripción o error al cargar, permitimos suscripción nueva
        this.cargando.set(false);
      }
    });
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.mensajeExito.set(null);
    this.mensajeError.set(null);

    const valor = this.formulario.value;
    const datos: SuscripcionSms = {
      telefono: valor.telefono.trim(),
      departamentoId: Number(valor.departamentoId)
    };

    this.suscripcionService.suscribir(datos).subscribe({
      next: (res) => {
        this.guardando.set(false);
        this.mensajeExito.set(this.textos.confirmacion);
        if (res?.data) {
          this.suscripcionActual.set(res.data);
        }
      },
      error: (err) => {
        this.guardando.set(false);
        this.mensajeError.set(err?.error?.mensaje || this.textos.errorGenerico);
      }
    });
  }

  get telefonoInvalido(): boolean {
    const control = this.formulario.get('telefono');
    return !!(control && control.touched && control.invalid);
  }

  get departamentoInvalido(): boolean {
    const control = this.formulario.get('departamentoId');
    return !!(control && control.touched && control.invalid);
  }

  get consentimientoInvalido(): boolean {
    const control = this.formulario.get('consentimiento');
    return !!(control && control.touched && control.invalid);
  }
}
