import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit, Component, ElementRef, OnDestroy, Renderer2, inject, input, output, viewChild,
} from '@angular/core';

/** Diálogo de contenido proyectado: foco, teclado y scroll independientes del dominio. */
@Component({
  selector: 'app-dialogo',
  template: `
    <section #panel role="dialog" aria-modal="true" [attr.aria-labelledby]="tituloId()" tabindex="-1">
      <ng-content />
    </section>
  `,
  styleUrl: './dialogo.scss',
})
export class DialogoComponent implements AfterViewInit, OnDestroy {
  readonly tituloId = input.required<string>();
  readonly focoRetorno = input<HTMLElement | null>(null);
  readonly cerrar = output<void>();
  private readonly documento = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private focoAnterior: HTMLElement | null = null;
  private overflowAnterior = '';
  private readonly retirarEventos: (() => void)[] = [];

  ngAfterViewInit(): void {
    this.focoAnterior = this.documento.activeElement as HTMLElement | null;
    this.overflowAnterior = this.documento.body.style.overflow;
    this.documento.body.style.overflow = 'hidden';
    this.enfocarInicio();
    this.retirarEventos.push(
      this.renderer.listen(this.documento, 'keydown', (evento: KeyboardEvent) => this.controlarTeclado(evento)),
      this.renderer.listen(this.documento, 'focusin', (evento: FocusEvent) => {
        if (!this.panel().nativeElement.contains(evento.target as Node)) this.enfocarInicio();
      }),
    );
  }

  ngOnDestroy(): void {
    this.retirarEventos.forEach(retirar => retirar());
    this.documento.body.style.overflow = this.overflowAnterior;
    const destino = this.focoRetorno() ?? this.focoAnterior;
    if (destino?.isConnected) destino.focus({ preventScroll: true });
  }

  private enfocarInicio(): void {
    (this.elementosEnfocables()[0] ?? this.panel().nativeElement).focus();
  }

  private elementosEnfocables(): HTMLElement[] {
    const selector = 'button, a[href], input:not([type="hidden"]), select, textarea, [tabindex]';
    return Array.from(this.panel().nativeElement.querySelectorAll<HTMLElement>(selector))
      .filter(elemento => elemento.tabIndex >= 0 && !elemento.matches(':disabled') &&
        !elemento.closest('[hidden], [inert]'));
  }

  private controlarTeclado(evento: KeyboardEvent): void {
    if (evento.key === 'Escape') {
      evento.preventDefault();
      evento.stopPropagation();
      this.cerrar.emit();
      return;
    }
    if (evento.key !== 'Tab') return;
    const elementos = this.elementosEnfocables();
    const primero = elementos[0] ?? this.panel().nativeElement;
    const ultimo = elementos.at(-1) ?? primero;
    const activo = this.documento.activeElement;
    if (!elementos.length || !this.panel().nativeElement.contains(activo) ||
        (evento.shiftKey && activo === primero) || (!evento.shiftKey && activo === ultimo)) {
      evento.preventDefault();
      (evento.shiftKey ? ultimo : primero).focus();
    }
  }
}
