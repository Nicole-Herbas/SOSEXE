import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CentroService } from '../../services/centro';
import { Centro } from '../../models/centro';
import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';

@Component({
  selector: 'app-lista-centros',
  imports: [ReactiveFormsModule],
  templateUrl: './lista-centros.html',
  styleUrl: './lista-centros.scss'
})
export class ListaCentros implements OnInit {

  readonly textos = APP_TEXTOS.centros;

  private readonly centroService = inject(CentroService);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);

  readonly mostrarFormulario = this.route.snapshot.data['mostrarFormulario'] === true;
  readonly departamentos = [
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

  readonly centroForm = this.formBuilder.group({
    nombre: ['', [Validators.required, Validators.minLength(5)]],
    tipo: ['', Validators.required],
    direccion: ['', Validators.required],
    telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{8,15}$/)]],
    ciudad: ['', Validators.required],
    departamentoId: this.formBuilder.control<number | null>(null, Validators.required),
    latitud: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(-90),
      Validators.max(90)
    ]),
    longitud: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(-180),
      Validators.max(180)
    ])
  });

  centros = signal<Centro[]>([]);
  cargando = signal(true);
  error = signal('');
  creando = signal(false);
  mensajeFormulario = signal('');

  ngOnInit(): void {
    this.cargarCentros();
  }

  cargarCentros(): void {

    this.cargando.set(true);
    this.error.set('');

    this.centroService.listarTodos().subscribe({

      next: (centros) => {
        console.log('Centros recibidos:', centros);

        this.centros.set(centros);
        this.cargando.set(false);
      },

      error: (error) => {
        console.error('Error cargando centros:', error);

        this.error.set(
  this.textos.errorCarga
);
        this.cargando.set(false);
      }

    });
  }

  crearCentro(): void {
    this.mensajeFormulario.set('');

    if (this.centroForm.invalid) {
      this.centroForm.markAllAsTouched();
      return;
    }

    const valores = this.centroForm.getRawValue();
    const nuevoCentro: Centro = {
      nombre: valores.nombre ?? '',
      tipo: valores.tipo ?? '',
      direccion: valores.direccion ?? '',
      telefono: valores.telefono ?? '',
      ciudad: valores.ciudad ?? '',
      departamentoId: Number(valores.departamentoId),
      latitud: Number(valores.latitud),
      longitud: Number(valores.longitud)
    };

    this.creando.set(true);
    this.centroService.crear(nuevoCentro).subscribe({
      next: () => {
        this.mensajeFormulario.set('Centro registrado y pendiente de verificación.');
        this.centroForm.reset();
        this.creando.set(false);
        this.cargarCentros();
      },
      error: () => {
        this.mensajeFormulario.set('No se pudo registrar el centro.');
        this.creando.set(false);
      }
    });
  }
}