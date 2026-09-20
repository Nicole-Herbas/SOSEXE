import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }


  const token = localStorage.getItem('token');


  if (!token) {
    return next(req);
  }


  if (
    req.url.includes('/api/auth/login') ||
    req.url.includes('/api/auth/registro')
  ) {
    return next(req);
  }


  const requestConToken = req.clone({

    setHeaders: {

      Authorization: `Bearer ${token}`

    }

  });


  return next(requestConToken);
};