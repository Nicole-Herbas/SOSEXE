import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';

const FRONTEND_URL = 'https://sosexe-frontend.onrender.com';
const BACKEND_URL = 'https://sosexe-backend.onrender.com';

export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (
    isPlatformBrowser(platformId) &&
    window.location.origin === FRONTEND_URL &&
    req.url.startsWith('/api/')
  ) {
    return next(
      req.clone({
        url: `${BACKEND_URL}${req.url}`
      })
    );
  }

  return next(req);
};
