import { Component, ElementRef, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';

interface NewsItem {
  category: string;
  location: string;
  department: string;
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
  readonly textos = APP_TEXTOS.inicio;

  newsFilters = ['Todas', 'Incendios', 'Inundaciones', 'Sequías', 'Comunidad'];
  activeFilter = 'Todas';

  departments: string[] = [
    'Todos',
    'Beni',
    'Chuquisaca',
    'Cochabamba',
    'La Paz',
    'Oruro',
    'Pando',
    'Potosí',
    'Santa Cruz',
    'Tarija',
  ];
  selectedDepartment = 'Todos';
  isDepartmentDropdownOpen = false;

  constructor(private readonly elementRef: ElementRef) {}

  allNews: NewsItem[] = [
    {
      category: 'Incendios',
      location: 'Tarija, Bolivia',
      department: 'Tarija',
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
      department: 'La Paz',
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
      department: 'Cochabamba',
      date: '14 may, 2024',
      title: 'Centros habilitan nuevos puntos de acopio',
      summary:
        'Nuevos puntos de acopio permiten canalizar donaciones y llegar a más familias que lo necesitan.',
      image:
        'https://images.pexels.com/photos/6647119/pexels-photo-6647119.jpeg?auto=compress&cs=tinysrgb&w=1200',
    },
  ];

  get filteredNews(): NewsItem[] {
    return this.allNews.filter((n) => {
      const matchesCategory =
        this.activeFilter === 'Todas' || n.category === this.activeFilter;
      const matchesDept =
        this.selectedDepartment === 'Todos' ||
        n.department === this.selectedDepartment;
      return matchesCategory && matchesDept;
    });
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
  }

  toggleDepartmentDropdown(): void {
    this.isDepartmentDropdownOpen = !this.isDepartmentDropdownOpen;
  }

  closeDepartmentDropdown(): void {
    this.isDepartmentDropdownOpen = false;
  }

  selectDepartment(department: string): void {
    this.selectedDepartment = department;
    this.isDepartmentDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const dropdownEl = this.elementRef.nativeElement.querySelector('.dept-dropdown');
    if (dropdownEl && !dropdownEl.contains(event.target as Node)) {
      this.isDepartmentDropdownOpen = false;
    }
  }
}
