import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  const rol = localStorage.getItem('rol'); 

  if (rol === 'ADMINISTRADOR') {
    return true; 
  } else {
    alert('Acceso denegado. Solo administradores.');
    router.navigate(['/mapa']); 
    return false;
  }
};