import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FeatureToggles,
  FEATURE_TOGGLES,
} from '../../../../shared/config/feature-toggles';
import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';


@Component({
  imports: [RouterLink],
  selector: 'app-acerca-de',
  styleUrl: './acerca-de.scss',
  templateUrl: './acerca-de.html',
})
export class AcercaDe {

  readonly textos = APP_TEXTOS.acercaDe;

  readonly featureToggles: Pick<FeatureToggles, 'acercaDe'> = {
    acercaDe: { ...FEATURE_TOGGLES.acercaDe },
  };

}