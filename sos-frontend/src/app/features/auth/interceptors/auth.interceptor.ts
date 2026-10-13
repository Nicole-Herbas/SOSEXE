import { isPlatformBrowser } from '@angular/common';

import {
  HttpErrorResponse,
  HttpContextToken,
  HttpInterceptorFn
} from '@angular/common/http';

import {
  inject,
  PLATFORM_ID
} from '@angular/core';

import { Router } from '@angular/router';

import {
  catchError,
  switchMap,
  throwError
} from 'rxjs';

import { AuthService }
  from '../services/auth.service';

// Permite a flujos con retorno propio mostrar el 401 después de intentar renovar la sesión.
export const GESTIONAR_SESION_EN_COMPONENTE = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn =
  (req, next) => {

    const platformId =
      inject(PLATFORM_ID);

    const authService =
      inject(AuthService);

    const router =
      inject(Router);


    if (!isPlatformBrowser(platformId)) {
      return next(req);
    }


    const esEndpointAuthPublico =
      req.url.includes('/api/auth/login') ||
      req.url.includes('/api/auth/registro') ||
      req.url.includes('/api/auth/refresh')||
    req.url.includes('/api/auth/logout');

    if (esEndpointAuthPublico) {
      return next(req);
    }


    const token =
      localStorage.getItem('token');



    const requestConToken =
      token
        ? req.clone({
            setHeaders: {
              Authorization:
                `Bearer ${token}`
            }
          })
        : req;


    return next(requestConToken)
      .pipe(

        catchError(
          (error: HttpErrorResponse) => {


            if (error.status !== 401) {

              return throwError(
                () => error
              );
            }

            let sesionRenovada = false;


            return authService
              .refrescarToken()
              .pipe(

                switchMap(
                  respuesta => {

                    sesionRenovada = true;

                    localStorage.setItem(
                      'token',
                      respuesta.token
                    );

                    const reintento =
                      req.clone({

                        setHeaders: {

                          Authorization:
                            `Bearer ${respuesta.token}`

                        }

                      });



                    return next(
                      reintento
                    );
                  }
                ),


                catchError(
                  refreshError => {

                    // Un rechazo de negocio después de renovar sigue siendo 400/403/409/422,
                    // no un fallo de sesión. Conserva el comportamiento previo de los otros flujos.
                    if (req.context.get(GESTIONAR_SESION_EN_COMPONENTE)
                        && sesionRenovada && refreshError.status !== 401) {
                      return throwError(() => refreshError);
                    }

                    localStorage.removeItem(
                      'token'
                    );


                    if (!req.context.get(GESTIONAR_SESION_EN_COMPONENTE)) {
                      router.navigate(['/login']);
                    }


                    return throwError(
                      () => req.context.get(GESTIONAR_SESION_EN_COMPONENTE) ? error : refreshError
                    );
                  }
                )

              );
          }
        )

      );
  };
