import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FeatureToggles,
  FEATURE_TOGGLES,
} from '../../../../shared/config/feature-toggles';
import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';
import { Noticia } from '../../../noticias/models/noticia.model';
import { NoticiaService } from '../../../noticias/services/noticia.service';
import {
  CATEGORIAS_NOTICIAS,
  filtrarNoticiasPorCategoria,
} from '../../../noticias/utils/categoria-noticia';
import { recortarResumen } from '../../../noticias/utils/resumen-noticia';

@Component({
  imports: [RouterLink],
  selector: 'app-inicio',
  styleUrl: './inicio.scss',
  templateUrl: './inicio.html',
})
export class Inicio implements OnInit {
  private readonly noticiaService = inject(NoticiaService);

  readonly textos = APP_TEXTOS.inicio;
  readonly textosNoticias = APP_TEXTOS.noticias;
  readonly resumenVistaPrevia = recortarResumen;
  readonly featureToggles: Pick<FeatureToggles, 'inicio'> = {
    inicio: { ...FEATURE_TOGGLES.inicio },
  };

  readonly newsFilters = CATEGORIAS_NOTICIAS;
  readonly activeFilter = signal<string>(this.textosNoticias.filtroTodas);
  readonly allNews = signal<Noticia[]>([]);
  readonly filteredNews = computed(() =>
    filtrarNoticiasPorCategoria(this.allNews(), this.activeFilter()),
  );
  readonly cargandoNoticias = signal(true);
  readonly errorNoticias = signal(false);
  readonly apiNoDisponible = signal(false);
  readonly externasDesdeCache = signal(false);

  ngOnInit(): void {
    if (this.featureToggles.inicio.mostrarSeccionNoticias) {
      this.cargarNoticias();
    } else {
      this.cargandoNoticias.set(false);
    }
  }

  cargarNoticias(): void {
    this.cargandoNoticias.set(true);
    this.errorNoticias.set(false);
    this.apiNoDisponible.set(false);
    this.externasDesdeCache.set(false);

    this.noticiaService.listarNoticias({
      propias: this.featureToggles.inicio.mostrarNoticiasPropias,
      externas: this.featureToggles.inicio.mostrarNoticiasExternas,
    }).subscribe({
      next: (resultado) => {
        this.allNews.set(resultado.noticias);
        this.apiNoDisponible.set(resultado.apiExternaDisponible === false);
        this.externasDesdeCache.set(resultado.noticiasExternasDesdeCache);
        this.cargandoNoticias.set(false);
      },
      error: () => {
        this.errorNoticias.set(true);
        this.cargandoNoticias.set(false);
      },
    });
  }

  setFilter(filter: string): void {
    this.activeFilter.set(filter);
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
