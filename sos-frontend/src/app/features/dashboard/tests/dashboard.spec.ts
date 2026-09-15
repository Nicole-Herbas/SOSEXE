import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { DashboardComponent } from '../dashboard.component';
import { DASHBOARD_STRINGS } from '../dashboard.strings';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule],
      providers: [provideRouter([])]
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('si no es admin, debería redirigir a /login en ngOnInit', () => {
    localStorage.removeItem('rol');
    component.ngOnInit();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('si es admin, debería cargar el nombre desde localStorage', () => {
    localStorage.setItem('rol', 'ADMIN');
    localStorage.setItem('nombre', 'Maria Admin');
    component.ngOnInit();
    expect(component.nombreAdmin).toBe('Maria Admin');
  });

  it('si es admin pero no hay nombre, usa "Administrador" por defecto', () => {
    localStorage.setItem('rol', 'ADMIN');
    localStorage.removeItem('nombre');
    component.ngOnInit();
    expect(component.nombreAdmin).toBe('Administrador');
  });

  it('debería exponer el objeto strings con DASHBOARD_STRINGS', () => {
    expect(component.strings).toBeTruthy();
    expect(component.strings).toEqual(DASHBOARD_STRINGS);
  });

  it('logout() debería navegar a /login', () => {
    component.logout();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
