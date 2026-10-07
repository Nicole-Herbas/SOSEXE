import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';
import { Voluntariado } from './voluntariado';

describe('Voluntariado', () => {
  let component: Voluntariado;
  let fixture: ComponentFixture<Voluntariado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Voluntariado],
      providers: [provideRouter([])],
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

  it('debe renderizar las tres tarjetas de oportunidades', () => {
    const tarjetas = fixture.nativeElement.querySelectorAll('.vol-card');
    expect(tarjetas.length).toBe(3);
  });

  it('debe mostrar el título de cada tarjeta de oportunidad desde APP_TEXTOS', () => {
    const titulos = fixture.nativeElement.querySelectorAll('.vol-card__title');
    const textos: string[] = Array.from(titulos).map(
      (el) => (el as HTMLElement).textContent?.trim() ?? '',
    );

    expect(textos).toContain(APP_TEXTOS.voluntariado.oportunidades.refugios.titulo);
    expect(textos).toContain(APP_TEXTOS.voluntariado.oportunidades.distribucion.titulo);
    expect(textos).toContain(APP_TEXTOS.voluntariado.oportunidades.emergencias.titulo);
  });

  it('debe mostrar la sección ¿Cómo funciona? con los tres pasos', () => {
    const titulo: HTMLElement = fixture.nativeElement.querySelector('.vol-como__title');
    const pasos = fixture.nativeElement.querySelectorAll('.vol-como__step');

    expect(titulo).not.toBeNull();
    expect(titulo.textContent?.trim()).toContain(APP_TEXTOS.voluntariado.comoFunciona.titulo);
    expect(pasos.length).toBe(3);
  });

  it('debe mostrar los números de paso 01, 02 y 03', () => {
    const nums: string[] = Array.from(
      fixture.nativeElement.querySelectorAll('.vol-como__step-num'),
    ).map((el) => (el as HTMLElement).textContent?.trim() ?? '');

    expect(nums).toEqual(['01', '02', '03']);
  });

  it('debe tener el botón "Ser voluntario" con routerLink hacia /login', () => {
    const btn: HTMLAnchorElement = fixture.nativeElement.querySelector(
      '.vol-hero__actions .btn--primary',
    );
    expect(btn).not.toBeNull();
    expect(btn.textContent?.trim()).toContain(APP_TEXTOS.voluntariado.hero.serVoluntario);
  });
});
