import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subscription, finalize } from 'rxjs';
import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { DecisionRevisionPunto, EstadoPunto, FiltrosRevisionPuntos, ItemCatalogo, PuntoAyuda, TipoPuntoCiudadano } from '../../models/registrar-punto.model';
import { ESTADO_VERIFICACION_PUNTO } from '../../models/estado-punto.constants';
import { RegistrarPuntoService } from '../../services/registrar-punto.service';
import { DialogoComponent } from '../../../../shared/components/dialogo/dialogo';
import { MOTIVO_REVISION_MAX_CARACTERES } from '../../models/revision-punto.constants';

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
  readonly motivoRevision = signal('');
  readonly maxMotivo = MOTIVO_REVISION_MAX_CARACTERES;
  readonly decisionPendiente = signal<DecisionRevisionPunto | null>(null);
  readonly enviandoDecision = signal(false);
  readonly errorDecision = signal<string | null>(null);
  readonly exitoDecision = signal<string | null>(null);
  readonly puedeDecidir = computed(() => {
    const estado = this.detalle()?.estadoVerificacion;
    return estado === ESTADO_VERIFICACION_PUNTO.PENDIENTE || estado === ESTADO_VERIFICACION_PUNTO.EN_REVISION;
  });
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
    if (this.enviandoDecision()) return;
    if (evento?.currentTarget instanceof HTMLElement) this.botonOrigen = evento.currentTarget;
    this.solicitudDetalle?.unsubscribe();
    this.seleccionadoId.set(id);
    this.detalle.set(null);
    this.errorDetalle.set(null);
    this.motivoRevision.set('');
    this.decisionPendiente.set(null);
    this.errorDecision.set(null);
    this.exitoDecision.set(null);
    this.cargandoDetalle.set(true);
    this.solicitudDetalle = this.servicio.obtenerDetalleAdmin(id).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.cargandoDetalle.set(false)),
    ).subscribe({
      next: punto => this.detalle.set(punto),
      error: (error: unknown) => {
        const codigo = error instanceof HttpErrorResponse ? error.status : -1;
        this.errorDetalle.set(codigo === 401 ? 'adminPuntos.revision.errorSesion'
          : codigo === 403 ? 'adminPuntos.revision.errorPermiso'
          : codigo === 404 ? 'adminPuntos.puntoNoEncontrado' : 'adminPuntos.errorDetalle');
      },
    });
  }

  volverAlListado(): void {
    if (this.enviandoDecision()) return;
    this.cerrarDetalle();
  }

  prepararDecision(estado: DecisionRevisionPunto): void {
    if (this.enviandoDecision() || !this.puedeDecidir()) return;
    this.errorDecision.set(null);
    this.decisionPendiente.set(estado);
  }

  confirmarDecision(): void {
    const estado = this.decisionPendiente();
    const punto = this.detalle();
    if (this.enviandoDecision() || !punto || !this.puedeDecidir() ||
        (estado !== ESTADO_VERIFICACION_PUNTO.VERIFICADO && estado !== ESTADO_VERIFICACION_PUNTO.RECHAZADO)) return;
    const motivo = this.motivoRevision().trim();
    if (motivo.length > this.maxMotivo) {
      this.errorDecision.set('adminPuntos.revision.errorMotivo');
      return;
    }
    this.enviandoDecision.set(true);
    this.errorDecision.set(null);
    this.servicio.decidirRevision(punto.id, estado, motivo || null).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.enviandoDecision.set(false)),
    ).subscribe({
      next: () => {
        this.cerrarDetalle();
        this.exitoDecision.set(estado === ESTADO_VERIFICACION_PUNTO.VERIFICADO
          ? 'adminPuntos.revision.aprobado' : 'adminPuntos.revision.rechazado');
        this.cargarListado();
      },
      error: (error: unknown) => {
        const codigo = error instanceof HttpErrorResponse ? error.status : -1;
        const errores: Record<number, string> = {
          0: 'errorConexion', 400: 'errorEstado', 422: 'errorMotivo', 401: 'errorSesion', 403: 'errorPermiso',
          404: 'errorNoEncontrado', 409: 'errorConflicto', '-1': 'errorRespuesta',
        };
        this.errorDecision.set(`adminPuntos.revision.${errores[codigo] ?? 'errorServidor'}`);
      },
    });
  }

  claveTipo(tipo: string): string {
    return this.tipos.some(valor => valor === tipo) ? `adminPuntos.tipos.${tipo}` : 'adminPuntos.noInformado';
  }

  private cerrarDetalle(): void {
    this.solicitudDetalle?.unsubscribe();
    this.seleccionadoId.set(null);
    this.detalle.set(null);
    this.errorDetalle.set(null);
    this.decisionPendiente.set(null);
    this.errorDecision.set(null);
  }

  private nuevosFiltros(): FormularioFiltrosRevision {
    return { estado: ESTADO_VERIFICACION_PUNTO.PENDIENTE, tipo: '', departamentoId: null, buscar: '' };
  }
}
