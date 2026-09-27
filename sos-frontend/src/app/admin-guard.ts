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

import {
  AuthService
} from './features/auth/services/auth.service';


export const adminGuard: CanActivateFn = () => {

  const router = inject(Router);

  const authService =
    inject(AuthService);


  return authService
    .usuarioActual()
    .pipe(

      map(usuario => {

        if (usuario.rol === 'ADMIN') {
          return true;
        }

        return router.createUrlTree([
          '/mapa'
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
