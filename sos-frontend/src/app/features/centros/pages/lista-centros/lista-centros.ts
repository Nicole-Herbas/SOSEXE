import { Component, inject, OnInit, signal } from '@angular/core';

import { CentroService } from '../../services/centro';
import { Centro } from '../../models/centro';
import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';

@Component({
  selector: 'app-lista-centros',
  imports: [],
  templateUrl: './lista-centros.html',
  styleUrl: './lista-centros.scss'
})
export class ListaCentros implements OnInit {

  readonly textos = APP_TEXTOS.centros;

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

        this.error.set(
  this.textos.errorCarga
);
        this.cargando.set(false);
      }

    });
  }
}