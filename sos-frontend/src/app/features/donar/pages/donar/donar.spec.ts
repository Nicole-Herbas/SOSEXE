import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Donar } from './donar';
import { of } from 'rxjs';
import { CentroService } from '../../../centros/services/centro';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { IdiomaService } from '../../../../shared/services/idioma.service';
import { Centro } from '../../../centros/models/centro';
import catalogoEs from '../../../../../../public/i18n/es.json';
import catalogoEn from '../../../../../../public/i18n/en.json';

const centro: Centro = {
  id: 7, nombre: 'Centro de Apoyo San José', tipo: 'CENTRO', direccion: 'Calle 1',
  ciudad: 'Cochabamba', departamentoId: 1, departamentoNombre: 'Bolivia', latitud: 0, longitud: 0
};

describe('Donar', () => {
  it('mantiene paridad de claves Loco y las claves usadas por monto y administración', () => {
    function claves(objeto: Record<string, unknown>, prefijo = ''): string[] {
      return Object.entries(objeto).flatMap(([clave, valor]) => {
        const ruta = prefijo ? `${prefijo}.${clave}` : clave;
        return valor !== null && typeof valor === 'object' && !Array.isArray(valor)
          ? claves(valor as Record<string, unknown>, ruta)
          : [ruta];
      });
    }

    const es = claves(catalogoEs).sort();
    const en = claves(catalogoEn).sort();
    expect(es).toEqual(en);
    for (const clave of [
      'navbar.enlaces.administracion', 'donar.preguntaMonto', 'donar.minimoMonto',
      'donar.otroMonto', 'donar.errorFormatoMonto', 'donar.errorMontoVacio',
      'donar.errorMinimoMonto', 'donar.anonima', 'donar.atras', 'donar.continuarPago',
      'donar.donacion', 'donar.total', 'donar.pagoPrototipoTitulo', 'donar.pagoPrototipo',
      ...['centro', 'monto', 'pago', 'confirmacion'].map(paso => `donar.pasos.${paso}`),
      ...[1, 2, 3].map(paso => `donar.etapas.${paso}`)
    ]) expect(es).toContain(clave);
  });

  let component: Donar;
  let fixture: ComponentFixture<Donar>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Donar],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: CentroService,
          useValue: {
            listarVerificados: () => of([centro])
          }
        }
      ]
    })
      .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Donar);
    component = fixture.componentInstance;
    httpMock.match(req => req.url.startsWith('/i18n/')).forEach(req => req.flush({}));
    await fixture.whenStable();
  });

  afterEach(() => httpMock.verify());

  function pasoMonto(): void {
    component.seleccionarCentro(centro);
    component.confirmarSeleccion();
    fixture.detectChanges();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('conserva SOS-70: muestra centros verificados, selección y evita avanzar sin centro', () => {
    expect(fixture.nativeElement.textContent).toContain(centro.nombre);
    component.confirmarSeleccion();
    expect(component.pasoActual()).toBe(1);
    pasoMonto();
    expect(fixture.nativeElement.querySelector('.donar__resumen-centro').textContent).toContain('Cochabamba');
    expect(fixture.nativeElement.textContent).toContain('Paso 2 de 4');
  });

  it('actualiza el resumen para cada monto predefinido y solo continúa con selección válida', () => {
    pasoMonto();
    component.continuar();
    expect(component.pasoActual()).toBe(2);
    for (const monto of [2000, 5000, 10000, 20000]) {
      const boton: HTMLButtonElement = Array.from(fixture.nativeElement.querySelectorAll('.donar__monto') as NodeListOf<HTMLButtonElement>)
        .find(element => element.textContent?.includes(component.formatearMonto(monto)))!;
      boton.click();
      fixture.detectChanges();
      expect(component.montoCentavos()).toBe(monto);
      expect(fixture.nativeElement.querySelector('.donar__resumen-total').textContent)
        .toContain(component.formatearMonto(monto));
    }
    component.centroSeleccionado.set(null);
    component.continuar();
    expect(component.pasoActual()).toBe(2);
    component.seleccionarCentro(centro);
    component.continuar();
    expect(component.pasoActual()).toBe(3);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Pago no disponible');
  });

  it('acepta Bs 5 y dos decimales; rechaza valores inválidos y no avanza', () => {
    pasoMonto();
    for (const valor of ['', '0', '-5', '4.99', 'NaN', 'Infinity', '1e3', '5.001', 'abc', '999999999999999999']) {
      component.actualizarMontoPersonalizado(valor);
      expect(component.montoValido()).toBe(false);
      component.continuar();
      expect(component.pasoActual()).toBe(2);
    }
    component.actualizarMontoPersonalizado('5');
    expect(component.montoCentavos()).toBe(500);
    fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('.donar__confirmar') as HTMLButtonElement).disabled).toBe(false);
    component.actualizarMontoPersonalizado('5,25');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.donar__resumen-total').textContent).toContain(component.formatearMonto(525));
    expect(component.montoValido()).toBe(true);
    component.actualizarMontoPersonalizado('4.99');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('mínimo');
  });

  it('mantiene centro, monto personalizado y anonimato al retroceder y regresar', () => {
    pasoMonto();
    component.actualizarMontoPersonalizado('80.50');
    const checkbox: HTMLInputElement = fixture.nativeElement.querySelector('input[type="checkbox"]');
    checkbox.click();
    fixture.detectChanges();
    component.continuar();
    component.atras();
    component.atras();
    component.confirmarSeleccion();
    fixture.detectChanges();
    expect(component.centroSeleccionado()?.id).toBe(7);
    expect(component.montoCentavos()).toBe(8050);
    expect(component.anonima()).toBe(true);
    expect((fixture.nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement).checked).toBe(true);
  });

  it('traduce el paso de monto sin recargar la página', () => {
    pasoMonto();
    const idioma = TestBed.inject(IdiomaService);
    idioma.setIdioma('en');
    httpMock.expectOne('/i18n/en.json').flush({ donar: { preguntaMonto: 'How much would you like to donate?', continuarPago: 'Continue to payment' } });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('How much would you like to donate?');
    expect(fixture.nativeElement.textContent).toContain('Continue to payment');
  });
});
