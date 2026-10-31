import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../../../app.routes';
import { AdminComponent } from './admin';
import { IdiomaService } from '../../../../shared/services/idioma.service';
import textosEs from '../../../../../../public/i18n/es.json';
import textosEn from '../../../../../../public/i18n/en.json';
import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';

@Component({ template: '' })
class DestinoComponent {}

describe('Panel de administrador con revisión de puntos', () => {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.removeItem('idioma_preferido');
  });

  it('conserva las rutas de las acciones y traduce el encabezado sin recargar', async () => {
    localStorage.removeItem('idioma_preferido');
    await TestBed.configureTestingModule({
      imports: [AdminComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    const fixture = TestBed.createComponent(AdminComponent);
    const http = TestBed.inject(HttpTestingController);
    http.match(req => req.url.startsWith('/i18n/')).forEach(req => req.flush(textosEs));
    fixture.detectChanges();
    http.expectOne('/api/centros').flush({ success: true, data: [] });
    http.expectOne('/api/departamentos').flush({ success: true, data: [] });
    http.expectOne('/api/puntos-ayuda/admin?estado=PENDIENTE').flush({ success: true, data: [] });
    fixture.detectChanges();
    const enlaces = fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;
    expect(Array.from(enlaces).map(enlace => enlace.getAttribute('href')))
      .toEqual(['/admin/alertas/crear', '/admin/alertas']);
    expect(fixture.nativeElement.textContent).toContain('Administración');
    TestBed.inject(IdiomaService).setIdioma('en');
    http.expectOne('/i18n/en.json').flush(textosEn);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Administration');
    expect(enlaces[0].textContent).toContain('Create emergency alert');
    expect(enlaces[1].textContent).toContain('Review alerts before publishing');
    expect(fixture.nativeElement.textContent).toContain('Registered centers');
    expect(Object.keys(textosEn.adminCentros).sort()).toEqual(Object.keys(textosEs.adminCentros).sort());
    expect(Object.keys(textosEs.adminCentros).sort()).toEqual(Object.keys(APP_TEXTOS.adminCentros).sort());
  });

  it.each(['ADMIN', 'USER', 'sin sesión'])('restringe la revisión a Admin: %s', async rol => {
    const rutaAdmin = routes.find(ruta => ruta.path === 'admin');
    if (!rutaAdmin) throw new Error('Falta la ruta de administración');
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([rutaAdmin, { path: 'mapa', component: DestinoComponent }, { path: 'login', component: DestinoComponent }]),
        provideHttpClient(), provideHttpClientTesting(),
      ],
    }).compileComponents();
    const http = TestBed.inject(HttpTestingController);
    const harness = await RouterTestingHarness.create();
    const navegacion = harness.navigateByUrl('/admin');
    const usuario = await vi.waitFor(() => http.expectOne('/api/auth/me'));
    if (rol === 'sin sesión') usuario.flush({}, { status: 401, statusText: 'Unauthorized' });
    else usuario.flush({ rol });
    const componente = await navegacion;
    http.match(req => req.url.startsWith('/i18n/')).forEach(req => req.flush({}));

    if (rol === 'ADMIN') {
      expect(componente).toBeInstanceOf(AdminComponent);
      http.expectOne('/api/centros').flush({ success: true, data: [] });
      http.expectOne('/api/departamentos').flush({ success: true, data: [] });
      http.expectOne('/api/puntos-ayuda/admin?estado=PENDIENTE').flush({ success: true, data: [] });
      harness.fixture.detectChanges();
      expect(harness.routeNativeElement?.textContent).toContain('Revisar puntos registrados');
    } else {
      expect(TestBed.inject(Router).url).toBe(rol === 'USER' ? '/mapa' : '/login');
      http.expectNone(req => req.url.startsWith('/api/puntos-ayuda/admin'));
    }
  });
});
