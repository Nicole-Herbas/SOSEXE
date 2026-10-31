import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ListaCentros } from '../../../centros/pages/lista-centros/lista-centros';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { RevisarPuntosComponent } from '../../../puntos-ayuda/components/revisar-puntos/revisar-puntos';

@Component({
  selector: 'app-admin',
  imports: [RouterLink, ListaCentros, RevisarPuntosComponent, TranslatePipe],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class AdminComponent {}
