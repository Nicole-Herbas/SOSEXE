import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';

@Component({
  imports: [RouterLink],
  selector: 'app-voluntariado',
  styleUrl: './voluntariado.scss',
  templateUrl: './voluntariado.html',
})
export class Voluntariado {

  readonly textos =
    APP_TEXTOS.voluntariado;
}