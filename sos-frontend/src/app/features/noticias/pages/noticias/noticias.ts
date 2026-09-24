import { Component } from '@angular/core';
import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';

@Component({
  imports: [],
  selector: 'app-noticias',
  styleUrl: './noticias.scss',
  templateUrl: './noticias.html',
})
export class Noticias {

  readonly textos =
    APP_TEXTOS.noticias;
}