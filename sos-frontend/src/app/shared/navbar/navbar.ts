import { Component } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import {
  APP_TEXTOS
} from '../constants/app-textos.constants';


@Component({
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  selector: 'app-navbar',
  styleUrl: './navbar.scss',
  templateUrl: './navbar.html',
})
export class Navbar {

  readonly textos =
    APP_TEXTOS.navbar;

  menuAbierto = false;
}