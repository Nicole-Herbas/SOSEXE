import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ListaCentros } from '../../../centros/pages/lista-centros/lista-centros';
import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';

@Component({
  selector: 'app-admin',
  imports: [RouterLink, ListaCentros],
  template: `
    <section class="admin">
      <h1>{{ textos.admin }}</h1>
      <a routerLink="/admin/alertas/crear">{{ textos.encabezado }}</a>
      <app-lista-centros />
    </section>
  `,
  styles: `
    .admin {
      margin: 24px;
    }
    a {
      display: inline-block;
      margin: 16px 0;
      color: #07847e;
      text-decoration: underline;
    }
  `,
})
export class AdminComponent {
  readonly textos = APP_TEXTOS.alertas;
}
