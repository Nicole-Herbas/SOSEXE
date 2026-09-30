import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FeatureToggles,
  FEATURE_TOGGLES,
} from '../../../../shared/config/feature-toggles';
import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';
import { Noticia } from '../../models/noticia.model';
import { NoticiaService } from '../../services/noticia.service';

@Component({
  imports: [RouterLink],
  selector: 'app-noticias',
  styleUrl: './noticias.scss',
  templateUrl: './noticias.html',
})
export class Noticias implements OnInit {
  private readonly noticiaService = inject(NoticiaService);

  readonly textos = APP_TEXTOS.noticias;
  readonly featureToggles: FeatureToggles = {
    mapa: { ...FEATURE_TOGGLES.mapa },
    noticias: { ...FEATURE_TOGGLES.noticias },
  };

  readonly noticias = signal<Noticia[]>([]);
  readonly cargando = signal(true);
  readonly error = signal(false);
  readonly noticiasDestacadas = computed(() => this.noticias().slice(0, 3));
  readonly noticiasSecundarias = computed(() => this.noticias().slice(3));

  ngOnInit(): void {
    this.cargarNoticias();
  }

  cargarNoticias(): void {
    this.cargando.set(true);
    this.error.set(false);

    this.noticiaService.listarNoticias().subscribe({
      next: (noticias) => {
        this.noticias.set(noticias);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }

  formatearFecha(fecha: string | null): string {
    if (!fecha) {
      return '';
    }

    const fechaParseada = new Date(fecha.replace(' ', 'T'));
    if (Number.isNaN(fechaParseada.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat('es-BO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(fechaParseada);
  }

  ocultarImagen(event: Event): void {
    (event.target as HTMLImageElement).classList.add('imagen-fallida');
  }
}