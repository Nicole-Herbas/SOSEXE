import { Component } from '@angular/core';
import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';

@Component({
  imports: [],
  selector: 'app-donar',
  styleUrl: './donar.scss',
  templateUrl: './donar.html',
})
export class Donar {

  readonly textos =
    APP_TEXTOS.donar;
}