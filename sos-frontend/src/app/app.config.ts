import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import { authInterceptor } from './features/auth/interceptors/auth.interceptor';
import { apiUrlInterceptor } from './features/auth/interceptors/api-url.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
    withInterceptors([
    apiUrlInterceptor,
    authInterceptor
    ])
  )
  ]
};
