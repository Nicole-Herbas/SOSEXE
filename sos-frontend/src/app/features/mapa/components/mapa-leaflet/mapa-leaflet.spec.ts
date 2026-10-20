import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PuntoMapa } from '../../models/punto-mapa.model';
import { MapaLeaflet } from './mapa-leaflet';

describe('MapaLeaflet', () => {
  let fixture: ComponentFixture<MapaLeaflet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaLeaflet],
    }).compileComponents();

    fixture = TestBed.createComponent(MapaLeaflet);
  });

  it.each([
    'Centro San José & Ayuda "Norte"',
    'Centro &lt;Norte&gt;',
    '<img src="x" onerror="alert(1)">',
  ])('muestra literalmente el nombre del punto en el tooltip: %s', (nombre) => {
    const punto: PuntoMapa = {
      id: 1,
      origen: 'PUNTO_AYUDA',
      nombre,
      tipo: 'CENTRO_APOYO',
      latitud: -17.3895,
      longitud: -66.1568,
      estadoVerificacion: 'VERIFICADO',
      necesidades: [],
    };
    fixture.componentRef.setInput('puntos', [punto]);
    fixture.detectChanges();

    const elemento: HTMLElement = fixture.nativeElement;
    const marcador = elemento.querySelector<HTMLElement>('.leaflet-marker-icon');
    expect(marcador).not.toBeNull();
    marcador!.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

    const tooltip = elemento.querySelector<HTMLElement>('.leaflet-tooltip');
    expect(tooltip).not.toBeNull();
    expect(tooltip!.textContent).toBe(nombre);
    expect(tooltip!.querySelector('img')).toBeNull();
  });
});
