import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { RegistroComponent } from '../registro.component';
import { REGISTRO_STRINGS } from '../registro.strings';

describe('RegistroComponent', () => {
  let component: RegistroComponent;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [provideRouter([])]
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const fixture = TestBed.createComponent(RegistroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('el formulario debería ser inválido cuando está vacío', () => {
    expect(component.registroForm.valid).toBe(false);
  });

  it('el campo nombre debería ser requerido', () => {
    const nombre = component.registroForm.get('nombre');
    nombre?.setValue('');
    expect(nombre?.hasError('required')).toBe(true);
  });

  it('el campo email debería validar formato', () => {
    const email = component.registroForm.get('email');
    email?.setValue('invalido');
    expect(email?.hasError('email')).toBe(true);
  });

  it('el campo password debería requerir al menos 6 caracteres', () => {
    const password = component.registroForm.get('password');
    password?.setValue('12345');
    expect(password?.hasError('minlength')).toBe(true);
  });

  it('el formulario debería ser válido con todos los datos requeridos', () => {
    component.registroForm.setValue({
      nombre: 'Test User',
      email: 'test@test.com',
      password: '123456',
      telefono: ''
    });
    expect(component.registroForm.valid).toBe(true);
  });

  it('debería exponer el objeto strings con REGISTRO_STRINGS', () => {
    expect(component.strings).toBeTruthy();
    expect(component.strings).toEqual(REGISTRO_STRINGS);
  });

  it('isLoading debería empezar en false', () => {
    expect(component.isLoading).toBe(false);
  });

  it('errorMessage debería empezar vacío', () => {
    expect(component.errorMessage).toBe('');
  });
});
