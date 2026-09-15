import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { LoginComponent } from '../login';
import { LOGIN_STRINGS } from '../login.strings';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [provideRouter([])]
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('el formulario debería ser inválido cuando está vacío', () => {
    expect(component.loginForm.valid).toBe(false);
  });

  it('el campo email debería ser requerido', () => {
    const email = component.loginForm.get('email');
    email?.setValue('');
    expect(email?.hasError('required')).toBe(true);
  });

  it('el campo email debería validar formato', () => {
    const email = component.loginForm.get('email');
    email?.setValue('no-es-email');
    expect(email?.hasError('email')).toBe(true);
  });

  it('el campo password debería requerir al menos 6 caracteres', () => {
    const password = component.loginForm.get('password');
    password?.setValue('123');
    expect(password?.hasError('minlength')).toBe(true);
  });

  it('el formulario debería ser válido con datos correctos', () => {
    component.loginForm.setValue({ email: 'test@test.com', password: '123456' });
    expect(component.loginForm.valid).toBe(true);
  });

  it('debería exponer el objeto strings con LOGIN_STRINGS', () => {
    expect(component.strings).toBeTruthy();
    expect(component.strings).toEqual(LOGIN_STRINGS);
  });

  it('isLoading debería empezar en false', () => {
    expect(component.isLoading).toBe(false);
  });

  it('errorMessage debería empezar vacío', () => {
    expect(component.errorMessage).toBe('');
  });
});
