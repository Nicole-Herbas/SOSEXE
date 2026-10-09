import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';
import { Voluntariado } from './voluntariado';
import { AuthService } from '../../../auth/services/auth.service';
import { PerfilVoluntarioService } from '../../services/perfil-voluntario.service';


describe('Voluntariado', () => {
  let component: Voluntariado;
  let fixture: ComponentFixture<Voluntariado>;

  const authServiceMock = {
    estaAutenticado: () => false,
    obtenerNombreUsuario: () => '',
  };

  const perfilServiceMock = {
    existeMiPerfil: () => of({ success: true, data: false, message: '', timestamp: '' }),
    obtenerMiPerfil: () => of({ success: true, data: null, message: '', timestamp: '' }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Voluntariado],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: PerfilVoluntarioService, useValue: perfilServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Voluntariado);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });


  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });


  it('debe mostrar el título principal del hero desde APP_TEXTOS', () => {
    const h1: HTMLElement = fixture.nativeElement.querySelector('.vol-hero__title');
    expect(h1).not.toBeNull();
    expect(h1.textContent?.trim()).toContain(APP_TEXTOS.voluntariado.hero.titulo);
  });


  it('debe mostrar el badge del hero con el texto correcto', () => {
    const badge: HTMLElement = fixture.nativeElement.querySelector('.vol-hero__badge');
    expect(badge).not.toBeNull();
    expect(badge.textContent).toContain(APP_TEXTOS.voluntariado.hero.badge);
  });


  it('debe mostrar el estado SIN_SESION cuando el usuario no está autenticado', () => {
    expect(component.estado()).toBe('SIN_SESION');
  });


  it('debe mostrar el enlace a /login cuando no hay sesión', () => {
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector(
      '.vol-hero__actions .btn--primary',
    );
    expect(link).not.toBeNull();
    expect(link.textContent?.trim()).toContain(APP_TEXTOS.voluntariado.hero.serVoluntario);
  });


  // ── Secciones estáticas ──────────────────────────────────────────────────

  it('debe renderizar las tres tarjetas de oportunidades', () => {
    const tarjetas = fixture.nativeElement.querySelectorAll('.vol-card');
    expect(tarjetas.length).toBe(3);
  });


  it('debe mostrar la sección ¿Cómo funciona? con los tres pasos', () => {
    const titulo: HTMLElement = fixture.nativeElement.querySelector('.vol-como__title');
    const pasos = fixture.nativeElement.querySelectorAll('.vol-como__step');

    expect(titulo).not.toBeNull();
    expect(titulo.textContent?.trim()).toContain(APP_TEXTOS.voluntariado.comoFunciona.titulo);
    expect(pasos.length).toBe(3);
  });


  // ── Feature toggles ──────────────────────────────────────────────────────

  it('debe ocultar la sección de oportunidades cuando mostrarSeccionOportunidades es false', async () => {
    const freshFixture = TestBed.createComponent(Voluntariado);
    freshFixture.componentInstance.featureToggles.voluntariado.mostrarSeccionOportunidades = false;
    freshFixture.detectChanges();
    await freshFixture.whenStable();

    expect(freshFixture.nativeElement.querySelector('.vol-oportunidades')).toBeNull();
    expect(freshFixture.nativeElement.querySelector('.vol-como')).not.toBeNull();
  });


  it('debe ocultar la sección ¿Cómo funciona? cuando mostrarSeccionComoFunciona es false', async () => {
    const freshFixture = TestBed.createComponent(Voluntariado);
    freshFixture.componentInstance.featureToggles.voluntariado.mostrarSeccionComoFunciona = false;
    freshFixture.detectChanges();
    await freshFixture.whenStable();

    expect(freshFixture.nativeElement.querySelector('.vol-como')).toBeNull();
    expect(freshFixture.nativeElement.querySelectorAll('.vol-card').length).toBe(3);
  });


  it('debe ocultar los badges de cupos cuando mostrarCupos es false', async () => {
    const freshFixture = TestBed.createComponent(Voluntariado);
    freshFixture.componentInstance.featureToggles.voluntariado.mostrarCupos = false;
    freshFixture.detectChanges();
    await freshFixture.whenStable();

    expect(freshFixture.nativeElement.querySelector('.vol-card__cupos')).toBeNull();
    expect(freshFixture.nativeElement.querySelectorAll('.vol-card').length).toBe(3);
  });
});
