import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface NewsItem {
  category: string;
  location: string;
  date: string;
  title: string;
  summary: string;
  image: string;
}

@Component({
  imports: [RouterLink],
  selector: 'app-inicio',
  styleUrl: './inicio.scss',
  templateUrl: './inicio.html',
})
export class Inicio {
  newsFilters = ['Todas', 'Incendios', 'Inundaciones', 'Sequías', 'Comunidad'];
  activeFilter = 'Todas';

  allNews: NewsItem[] = [
    {
      category: 'Incendios',
      location: 'Tarija, Bolivia',
      date: '16 may, 2024',
      title: 'Incendios forestales movilizan ayuda en Tarija',
      summary:
        'Brigadas y comunidades trabajan juntas para contener los incendios y proteger áreas naturales y poblaciones cercanas.',
      image:
        'https://images.unsplash.com/photo-1780607956296-8ce5efde9330?auto=format&fit=crop&w=1200&q=85',
    },
    {
      category: 'Inundaciones',
      location: 'La Paz, Bolivia',
      date: '15 may, 2024',
      title: 'Lluvias intensas afectan comunidades de La Paz',
      summary:
        'Las fuertes lluvias provocaron desbordes y afectaciones en varias zonas de la ciudad y el altiplano.',
      image:
        'https://images.pexels.com/photos/36829317/pexels-photo-36829317.jpeg?auto=compress&cs=tinysrgb&w=1200',
    },
    {
      category: 'Comunidad',
      location: 'Cochabamba, Bolivia',
      date: '14 may, 2024',
      title: 'Centros habilitan nuevos puntos de acopio',
      summary:
        'Nuevos puntos de acopio permiten canalizar donaciones y llegar a más familias que lo necesitan.',
      image:
        'https://images.pexels.com/photos/6647119/pexels-photo-6647119.jpeg?auto=compress&cs=tinysrgb&w=1200',
    },
  ];

  get filteredNews(): NewsItem[] {
    if (this.activeFilter === 'Todas') {
      return this.allNews;
    }
    return this.allNews.filter((n) => n.category === this.activeFilter);
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
  }
}
