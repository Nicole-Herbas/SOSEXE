import { isPlatformBrowser } from '@angular/common';

import {
  HttpErrorResponse,
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
      req.url.includes('/api/auth/refresh');

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


           
            return authService
              .refrescarToken()
              .pipe(

                switchMap(
                  respuesta => {

                    
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

                    
                    localStorage.removeItem(
                      'token'
                    );


                    router.navigate([
                      '/login'
                    ]);


                    return throwError(
                      () => refreshError
                    );
                  }
                )

              );
          }
        )

      );
  };