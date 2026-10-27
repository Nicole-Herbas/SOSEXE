import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthService } from '../../auth/services/auth.service';

export const donarAuthGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const irLogin = router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });

  if (!authService.estaAutenticado()) {
    return irLogin;
  }

  // Verificar el JWT en el backend, no solo su presencia local.
  // El interceptor existente gestiona el refresh si recibe 401.
  return authService.usuarioActual().pipe(
    map(() => true),
    catchError(() => of(irLogin))
  );
};
