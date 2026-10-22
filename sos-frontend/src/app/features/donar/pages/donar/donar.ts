import { Component } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  imports: [TranslatePipe],
  selector: 'app-donar',
  styleUrl: './donar.scss',
  templateUrl: './donar.html',
})
export class Donar {}