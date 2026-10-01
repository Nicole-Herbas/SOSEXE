import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FeatureToggles,
  FEATURE_TOGGLES,
} from '../../../../shared/config/feature-toggles';
import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';
import { Noticia } from '../../models/noticia.model';
import { NoticiaService } from '../../services/noticia.service';
import { CATEGORIAS_NOTICIAS, filtrarNoticiasPorCategoria } from '../../utils/categoria-noticia';

@Component({
  imports: [RouterLink],
  selector: 'app-noticias',
  styleUrl: './noticias.scss',
  templateUrl: './noticias.html',
})
export class Noticias implements OnInit {
  private readonly noticiaService = inject(NoticiaService);

  readonly textos = APP_TEXTOS.noticias;
  readonly featureToggles: Pick<FeatureToggles, 'noticias'> = {
    noticias: { ...FEATURE_TOGGLES.noticias },
  };

  readonly noticias = signal<Noticia[]>([]);
  readonly cargando = signal(true);
  readonly error = signal(false);
  readonly apiNoDisponible = signal(false);
  readonly externasDesdeCache = signal(false);
  readonly filtroActivo = signal<string>(APP_TEXTOS.noticias.filtroTodas);
  readonly categorias = CATEGORIAS_NOTICIAS;
  readonly noticiasFiltradas = computed(() =>
    filtrarNoticiasPorCategoria(this.noticias(), this.filtroActivo()),
  );
  readonly noticiasDestacadas = computed(() => this.noticiasFiltradas().slice(0, 3));
  readonly noticiasSecundarias = computed(() => this.noticiasFiltradas().slice(3));

  ngOnInit(): void {
    this.cargarNoticias();
  }

  cargarNoticias(): void {
    this.cargando.set(true);
    this.error.set(false);
    this.apiNoDisponible.set(false);
    this.externasDesdeCache.set(false);

    this.noticiaService.listarNoticias({
      propias: this.featureToggles.noticias.mostrarPropias,
      externas: this.featureToggles.noticias.mostrarExternas,
    }).subscribe({
      next: (resultado) => {
        this.noticias.set(resultado.noticias);
        this.apiNoDisponible.set(resultado.apiExternaDisponible === false);
        this.externasDesdeCache.set(resultado.noticiasExternasDesdeCache);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }

  seleccionarFiltro(categoria: string): void {
    this.filtroActivo.set(categoria);
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