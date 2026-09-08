import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Necesario para usar *ngIf en tu HTML

@Component({
  selector: 'app-login',
  standalone: true, // Confirma que es arquitectura moderna
  imports: [ReactiveFormsModule, CommonModule], // ¡Aquí inyectamos las herramientas!
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Validaciones estrictas requeridas por Jira
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      console.log('Datos listos para enviar a Spring Boot:', this.loginForm.value);
    } else {
      this.loginForm.markAllAsTouched(); // Muestra los errores rojos
    }
  }
}