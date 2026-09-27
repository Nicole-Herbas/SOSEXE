import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrarCentroComponent } from './registrar-centro';

describe('RegistrarCentroComponent', () => {
  let component: RegistrarCentroComponent;
  let fixture: ComponentFixture<RegistrarCentroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarCentroComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarCentroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start in step 1', () => {
    expect(component.currentStep).toBe(1);
  });

  it('should not allow continuing with empty required fields', () => {
    expect(component.paso1Valido).toBeFalsy();
  });

  it('should validate step 4 when required options are selected', () => {
    component.necesidadesSeleccionadas = ['Alimentos'];
    component.donacionesSeleccionadas = ['Ropa'];
    component.solicitaVoluntarios = false;

    expect(component.paso4Valido).toBeTruthy();
  });

  it('should not validate step 4 when volunteer activities are missing', () => {
    component.necesidadesSeleccionadas = ['Alimentos'];
    component.donacionesSeleccionadas = ['Ropa'];
    component.solicitaVoluntarios = true;
    component.actividadesSeleccionadas = [];

    expect(component.paso4Valido).toBeFalsy();
  });

  it('should validate step 4 when volunteer activities are selected', () => {
    component.necesidadesSeleccionadas = ['Alimentos'];
    component.donacionesSeleccionadas = ['Ropa'];
    component.solicitaVoluntarios = true;
    component.actividadesSeleccionadas = ['Logística'];

    expect(component.paso4Valido).toBeTruthy();
  });
});