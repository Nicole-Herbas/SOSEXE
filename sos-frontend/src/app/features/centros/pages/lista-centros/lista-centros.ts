import { Component, inject, OnInit, signal } from '@angular/core';

import { CentroService } from '../../services/centro';
import { Centro } from '../../models/centro';

@Component({
  selector: 'app-lista-centros',
  imports: [],
  templateUrl: './lista-centros.html',
  styleUrl: './lista-centros.scss'
})
export class ListaCentros implements OnInit {

  private centroService = inject(CentroService);

  centros = signal<Centro[]>([]);
  cargando = signal(true);
  error = signal('');

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

        this.error.set('No se pudieron cargar los centros');
        this.cargando.set(false);
      }

    });
  }
}