import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { PreferenciasComponent } from './preferencias';

describe('PreferenciasComponent', () => {
  let component: PreferenciasComponent;
  let fixture: ComponentFixture<PreferenciasComponent>;
  let httpMock: HttpTestingController;

  const departamentos = [
    { id: 27, nombre: 'Departamento de prueba' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreferenciasComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PreferenciasComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();

    httpMock.expectOne('/api/departamentos').flush({
      success: true,
      message: 'ok',
      data: departamentos,
      timestamp: ''
    });
    httpMock.expectOne('/api/suscripcion-sms/me').flush(
      { message: 'No hay suscripción' },
      { status: 404, statusText: 'Not Found' }
    );
  });

  afterEach(() => httpMock.verify());

  it('loads departments from the backend and enables the selector', () => {
    expect(component.departamentos).toEqual(departamentos);
    expect(component.formulario.get('departamentoId')?.enabled).toBe(true);
  });

  it('reports catalog loading errors and leaves the selector disabled', () => {
    const secondFixture = TestBed.createComponent(PreferenciasComponent);
    const secondComponent = secondFixture.componentInstance;
    secondFixture.detectChanges();

    httpMock.expectOne('/api/departamentos').flush(
      { message: 'Unavailable' },
      { status: 503, statusText: 'Service Unavailable' }
    );
    httpMock.expectOne('/api/suscripcion-sms/me').flush(
      { message: 'No hay suscripción' },
      { status: 404, statusText: 'Not Found' }
    );

    expect(secondComponent.errorDepartamentos()).toBeTruthy();
    expect(secondComponent.formulario.get('departamentoId')?.disabled).toBe(true);
    secondFixture.destroy();
  });

  it('cancels an active subscription and retains its record as inactive', () => {
    component.suscripcionActual.set({
      departamentoId: 27,
      telefono: '71234567',
      activa: true
    });

    component.solicitarCancelacion();
    component.confirmarCancelacion();

    const request = httpMock.expectOne('/api/suscripcion-sms/me');
    expect(request.request.method).toBe('DELETE');
    request.flush({
      success: true,
      message: 'Suscripción SMS cancelada exitosamente',
      data: null,
      timestamp: ''
    });

    expect(component.suscripcionActual()?.activa).toBe(false);
    expect(component.mensajeExito()).toBeTruthy();
  });
});
