import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { RegistrarPuntoComponent } from './registrar-punto';
import { RegistrarPuntoService } from '../../services/registrar-punto.service';
import { PuntoAyudaPropio } from '../../models/registrar-punto.model';
import { IdiomaService } from '../../../../shared/services/idioma.service';
import textosEs from '../../../../../../public/i18n/es.json';
import textosEn from '../../../../../../public/i18n/en.json';

const punto: PuntoAyudaPropio = {
  id: 5, nombre: 'Mi punto', tipo: 'EMERGENCIA', estadoVerificacion: 'PENDIENTE',
  descripcion: 'Descripción', direccion: 'Av. América', ciudad: 'Cochabamba',
  departamentoNombre: 'Cochabamba', latitud: -17.4, longitud: -66.2,
  necesidadNombres: [], nombreContacto: 'Ciudadano', telefonoContacto: '70700001', correoContacto: null,
};

describe('Mis puntos: decisión de revisión', () => {
  let fixture: ComponentFixture<RegistrarPuntoComponent>;
  let http: HttpTestingController;
  let lista: PuntoAyudaPropio[];

  beforeEach(async () => {
    localStorage.removeItem('idioma_preferido');
    lista = [punto];
    await TestBed.configureTestingModule({
      imports: [RegistrarPuntoComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), {
        provide: RegistrarPuntoService,
        useValue: {
          cargarCatalogos: () => of({ departamentos: [], necesidades: [] }),
          listarMisPuntos: () => of(lista),
        },
      }],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(RegistrarPuntoComponent);
    fixture.componentInstance.vista = 'mios';
    fixture.detectChanges();
    fixture.componentInstance.verMisPuntos();
    fixture.detectChanges();
    http.expectOne('/i18n/es.json').flush(textosEs);
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem('idioma_preferido');
  });

  it('muestra pendiente, verificado y rechazado al refrescar datos del servidor', () => {
    expect(fixture.nativeElement.textContent).toContain('Pendiente de verificación');
    lista = [{ ...punto, estadoVerificacion: 'VERIFICADO' }];
    fixture.componentInstance.verMisPuntos();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.estado-etiqueta').textContent).toContain('Verificado');
    lista = [{ ...punto, estadoVerificacion: 'RECHAZADO', motivoRevision: 'Falta información' }];
    fixture.componentInstance.verMisPuntos();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.estado-etiqueta').textContent).toContain('Rechazado');
    (fixture.nativeElement.querySelector('.ver-detalles') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.detalle-punto').textContent).toContain('Falta información');
  });

  it('informa de un rechazo sin motivo y oculta el motivo de puntos aprobados', () => {
    lista = [{ ...punto, estadoVerificacion: 'RECHAZADO', motivoRevision: null }];
    fixture.componentInstance.verMisPuntos();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.ver-detalles') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.detalle-punto').textContent).toContain('No se proporcionó un motivo.');
    lista = [{ ...punto, estadoVerificacion: 'VERIFICADO', motivoRevision: 'Privado' }];
    fixture.componentInstance.verMisPuntos();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.ver-detalles') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.detalle-punto').textContent).not.toContain('Privado');
  });

  it('traduce el estado y el mensaje del motivo sin recargar', () => {
    lista = [{ ...punto, estadoVerificacion: 'RECHAZADO', motivoRevision: null }];
    fixture.componentInstance.verMisPuntos();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.ver-detalles') as HTMLButtonElement).click();
    TestBed.inject(IdiomaService).setIdioma('en');
    http.expectOne('/i18n/en.json').flush(textosEn);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.estado-etiqueta').textContent).toContain('Rejected');
    expect(fixture.nativeElement.querySelector('.detalle-punto').textContent).toContain('No reason was provided.');
  });

  it('mantiene las claves nuevas de Mis puntos en ambos catálogos', () => {
    expect(Object.keys(textosEs.registrarPunto.misPuntos).sort())
      .toEqual(Object.keys(textosEn.registrarPunto.misPuntos).sort());
  });
});
