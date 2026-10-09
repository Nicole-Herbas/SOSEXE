import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';
import { PerfilVoluntario } from '../../models/perfil-voluntario';

@Component({
  selector: 'app-tarjeta-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tarjeta-perfil.html',
  styleUrl: './tarjeta-perfil.scss'
})
export class TarjetaPerfilComponent {

  @Input() perfil!: PerfilVoluntario;
  @Output() editar = new EventEmitter<void>();

  readonly textos = APP_TEXTOS.voluntariado.perfilVoluntario;
}
