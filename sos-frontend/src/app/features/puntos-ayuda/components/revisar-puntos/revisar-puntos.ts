import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subscription, finalize } from 'rxjs';
import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { EstadoPunto, FiltrosRevisionPuntos, ItemCatalogo, PuntoAyuda, TipoPuntoCiudadano } from '../../models/registrar-punto.model';
import { ESTADO_VERIFICACION_PUNTO } from '../../models/estado-punto.constants';
import { RegistrarPuntoService } from '../../services/registrar-punto.service';
import { DialogoComponent } from '../../../../shared/components/dialogo/dialogo';

interface FormularioFiltrosRevision {
  estado: EstadoPunto;
  tipo: TipoPuntoCiudadano | '';
  departamentoId: number | null;
  buscar: string;
}

@Component({
  selector: 'app-revisar-puntos',
  imports: [FormsModule, TranslatePipe, DialogoComponent],
  templateUrl: './revisar-puntos.html',
  styleUrl: './revisar-puntos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RevisarPuntosComponent implements OnInit {
  private readonly servicio = inject(RegistrarPuntoService);
  private readonly destroyRef = inject(DestroyRef);
  private solicitudListado?: Subscription;
  private solicitudDetalle?: Subscription;
  protected botonOrigen: HTMLElement | null = null;
  readonly estados = Object.values(ESTADO_VERIFICACION_PUNTO);
  readonly tipos = APP_TEXTOS.registrarPunto.tipos.map(tipo => tipo.valor);
  readonly puntos = signal<PuntoAyuda[]>([]);
  readonly departamentos = signal<ItemCatalogo[]>([]);
  readonly cargando = signal(false);
  readonly errorListado = signal(false);
  readonly errorDepartamentos = signal(false);
  readonly consultaPendientesInicial = signal(true);
  readonly seleccionadoId = signal<number | null>(null);
  readonly detalle = signal<PuntoAyuda | null>(null);
  readonly cargandoDetalle = signal(false);
  readonly errorDetalle = signal<string | null>(null);
  readonly puntoEnModal = computed(() => this.detalle() ??
    this.puntos().find(punto => punto.id === this.seleccionadoId()));
  filtros = this.nuevosFiltros();

  ngOnInit(): void {
    this.cargarDepartamentos();
    this.cargarListado();
  }

  cargarDepartamentos(): void {
    this.errorDepartamentos.set(false);
    this.servicio.cargarDepartamentos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: departamentos => this.departamentos.set(departamentos),
      error: () => this.errorDepartamentos.set(true),
    });
  }

  cargarListado(): void {
    this.solicitudListado?.unsubscribe();
    this.cerrarDetalle();
    const filtros: FiltrosRevisionPuntos = {
      estado: this.filtros.estado,
      tipo: this.filtros.tipo || undefined,
      departamentoId: this.filtros.departamentoId ?? undefined,
      buscar: this.filtros.buscar.trim() || undefined,
    };
    this.consultaPendientesInicial.set(
      filtros.estado === ESTADO_VERIFICACION_PUNTO.PENDIENTE &&
      !filtros.tipo && filtros.departamentoId == null && !filtros.buscar
    );
    this.puntos.set([]);
    this.cargando.set(true);
    this.errorListado.set(false);
    this.solicitudListado = this.servicio.listarParaRevision(filtros).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.cargando.set(false)),
    ).subscribe({
      next: puntos => this.puntos.set(puntos),
      error: () => this.errorListado.set(true),
    });
  }

  limpiarFiltros(): void {
    this.filtros = this.nuevosFiltros();
    this.cargarListado();
  }

  revisar(id: number, evento?: Event): void {
    if (evento?.currentTarget instanceof HTMLElement) this.botonOrigen = evento.currentTarget;
    this.solicitudDetalle?.unsubscribe();
    this.seleccionadoId.set(id);
    this.detalle.set(null);
    this.errorDetalle.set(null);
    this.cargandoDetalle.set(true);
    this.solicitudDetalle = this.servicio.obtenerDetalleAdmin(id).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.cargandoDetalle.set(false)),
    ).subscribe({
      next: punto => this.detalle.set(punto),
      error: (error: unknown) => this.errorDetalle.set(
        error instanceof HttpErrorResponse && error.status === 404
          ? 'adminPuntos.puntoNoEncontrado' : 'adminPuntos.errorDetalle'
      ),
    });
  }

  volverAlListado(): void {
    this.cerrarDetalle();
  }

  claveTipo(tipo: string): string {
    return this.tipos.some(valor => valor === tipo) ? `adminPuntos.tipos.${tipo}` : 'adminPuntos.noInformado';
  }

  private cerrarDetalle(): void {
    this.solicitudDetalle?.unsubscribe();
    this.seleccionadoId.set(null);
    this.detalle.set(null);
    this.errorDetalle.set(null);
  }

  private nuevosFiltros(): FormularioFiltrosRevision {
    return { estado: ESTADO_VERIFICACION_PUNTO.PENDIENTE, tipo: '', departamentoId: null, buscar: '' };
  }
}
