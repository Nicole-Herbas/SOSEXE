import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapaLeaflet } from '../../components/mapa-leaflet/mapa-leaflet';
import { Mapa } from './mapa';

@Component({
  selector: 'app-mapa-leaflet',
  template: '',
})
class MapaLeafletStub {}

describe('Mapa', () => {
  let component: Mapa;
  let fixture: ComponentFixture<Mapa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mapa],
    })
      .overrideComponent(Mapa, {
        remove: { imports: [MapaLeaflet] },
        add: { imports: [MapaLeafletStub] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Mapa);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe mostrar el título y los cinco filtros de tipo', () => {
    const titulo = fixture.nativeElement.querySelector('h1');
    const filtros = fixture.nativeElement.querySelectorAll('[data-filtro-tipo]');

    expect(titulo.textContent).toContain('Mapa de ayuda y emergencias');
    expect(filtros.length).toBe(5);
  });

  it('debe activar el filtro de tipo seleccionado', () => {
    const botonRefugios: HTMLButtonElement =
      fixture.nativeElement.querySelector('[data-filtro-tipo="refugios"]');

    botonRefugios.click();
    fixture.detectChanges();

    expect(component.filtroTipoActivo).toBe('refugios');
    expect(botonRefugios.classList.contains('activo')).toBe(true);
  });

  it('debe activar el filtro de necesidad seleccionado', () => {
    const botonAgua: HTMLButtonElement =
      fixture.nativeElement.querySelector('[data-filtro-necesidad="agua"]');

    botonAgua.click();
    fixture.detectChanges();

    expect(component.filtroNecesidadActivo).toBe('agua');
    expect(botonAgua.classList.contains('activo')).toBe(true);
  });
});
