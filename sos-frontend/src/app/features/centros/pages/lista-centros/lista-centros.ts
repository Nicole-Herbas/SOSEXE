import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CentroService } from '../../services/centro';
import { Centro } from '../../models/centro';
import { IdiomaService } from '../../../../shared/services/idioma.service';
import { TIPO_CLAVE_MAPA } from '../../../mapa/constants/mapa.constants';

import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-lista-centros',
  imports: [TranslatePipe],
  templateUrl: './lista-centros.html',
  styleUrl: './lista-centros.scss'
})
export class ListaCentros implements OnInit {

  readonly variante = input<'predeterminada' | 'admin'>('predeterminada');
  private readonly idioma = inject(IdiomaService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly centroService = inject(CentroService);

  centros = signal<Centro[]>([]);
  cargando = signal(true);
  error = signal(false);

  ngOnInit(): void {
    this.cargarCentros();
  }

  cargarCentros(): void {

    this.cargando.set(true);
    this.error.set(false);

    this.centroService.listarTodos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({

      next: (centros) => {
        this.centros.set(centros);
        this.cargando.set(false);
      },

      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      }

    });
  }

  etiquetaTipo(tipo: string): string {
    const clave = TIPO_CLAVE_MAPA[tipo];
    return clave ? this.idioma.t(clave) : tipo;
  }
}
