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
});