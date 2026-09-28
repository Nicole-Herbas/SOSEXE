import { Component } from '@angular/core';
import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';

@Component({
  imports: [],
  selector: 'app-acerca-de',
  styleUrl: './acerca-de.scss',
  templateUrl: './acerca-de.html',
})
export class AcercaDe {

  readonly textos =
    APP_TEXTOS.acercaDe;
}