import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { CentroService } from '../../services/centro';
import { ListaCentros } from './lista-centros';

describe('ListaCentros', () => {
  let component: ListaCentros;
  let fixture: ComponentFixture<ListaCentros>;
  let crearCentro: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    crearCentro = vi.fn().mockReturnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [ListaCentros],
      providers: [
        {
          provide: CentroService,
          useValue: {
            listarTodos: vi.fn().mockReturnValue(of([])),
            crear: crearCentro
          }
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { mostrarFormulario: true } } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListaCentros);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('marks all fields touched and does not create an invalid center', () => {
    component.crearCentro();

    expect(component.centroForm.invalid).toBe(true);
    expect(Object.values(component.centroForm.controls).every(control => control.touched)).toBe(true);
    expect(crearCentro).not.toHaveBeenCalled();
  });

  it('rejects a short name and a non-numeric phone', () => {
    component.centroForm.setValue({
      nombre: 'SOS',
      tipo: 'ALBERGUE',
      direccion: 'Calle Central',
      telefono: '123abc',
      ciudad: 'Cochabamba',
      departamentoId: 3,
      latitud: -17.39,
      longitud: -66.15
    });

    expect(component.centroForm.controls.nombre.hasError('minlength')).toBe(true);
    expect(component.centroForm.controls.telefono.hasError('pattern')).toBe(true);
    expect(component.centroForm.invalid).toBe(true);
    expect(crearCentro).not.toHaveBeenCalled();
  });
});