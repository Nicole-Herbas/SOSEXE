import {
  CanActivateFn,
  Router
} from '@angular/router';

import { inject } from '@angular/core';

import {
  catchError,
  map,
  of
} from 'rxjs';

import { AuthService } from './features/auth/services/auth.service';

export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService
    .usuarioActual()
    .pipe(

      map(usuario => {

        if (usuario?.email) {
          return true;
        }

        return router.createUrlTree([
          '/login'
        ]);

      }),

      catchError(() => {

        return of(
          router.createUrlTree([
            '/login'
          ])
        );

      })

    );
};