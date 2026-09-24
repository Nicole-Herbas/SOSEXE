import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Inicio } from './inicio';

describe('Inicio', () => {
  let component: Inicio;
  let fixture: ComponentFixture<Inicio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Inicio],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Inicio);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Filtro por Departamento', () => {
    it('debe tener "Todos" como departamento seleccionado por defecto y dropdown cerrado', () => {
      expect(component.selectedDepartment).toBe('Todos');
      expect(component.isDepartmentDropdownOpen).toBe(false);
      expect(component.departments).toContain('Todos');
      expect(component.departments).toContain('La Paz');
      expect(component.departments).toContain('Cochabamba');
      expect(component.departments).toContain('Santa Cruz');
      expect(component.departments).toContain('Tarija');
    });

    it('debe alternar y cerrar el estado del desplegable', () => {
      expect(component.isDepartmentDropdownOpen).toBe(false);

      component.toggleDepartmentDropdown();
      expect(component.isDepartmentDropdownOpen).toBe(true);

      component.toggleDepartmentDropdown();
      expect(component.isDepartmentDropdownOpen).toBe(false);

      component.toggleDepartmentDropdown();
      component.closeDepartmentDropdown();
      expect(component.isDepartmentDropdownOpen).toBe(false);
    });

    it('debe seleccionar un departamento y cerrar el desplegable', () => {
      component.isDepartmentDropdownOpen = true;

      component.selectDepartment('La Paz');

      expect(component.selectedDepartment).toBe('La Paz');
      expect(component.isDepartmentDropdownOpen).toBe(false);
    });

    it('debe filtrar las noticias por el departamento seleccionado', () => {
      component.selectDepartment('Tarija');

      const filtered = component.filteredNews;
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every((n) => n.department === 'Tarija')).toBe(true);
    });

    it('debe combinar el filtro de categoría y departamento correctamente', () => {
      component.setFilter('Incendios');
      component.selectDepartment('Tarija');

      const filtered = component.filteredNews;
      expect(filtered.length).toBe(1);
      expect(filtered[0].department).toBe('Tarija');
      expect(filtered[0].category).toBe('Incendios');
    });

    it('debe retornar lista vacía si la combinación de categoría y departamento no coincide', () => {
      component.setFilter('Inundaciones');
      component.selectDepartment('Tarija');

      const filtered = component.filteredNews;
      expect(filtered.length).toBe(0);
    });

    it('debe restaurar todas las noticias al seleccionar "Todos"', () => {
      component.selectDepartment('Tarija');
      expect(component.filteredNews.length).toBe(1);

      component.selectDepartment('Todos');
      expect(component.filteredNews.length).toBe(component.allNews.length);
    });

    it('debe interactuar con el DOM al hacer click en el trigger del dropdown y seleccionar una opción', async () => {
      fixture.detectChanges();

      const triggerBtn: HTMLButtonElement | null =
        fixture.nativeElement.querySelector('#dept-filter-trigger');
      expect(triggerBtn).toBeTruthy();

      // Abrir dropdown
      triggerBtn?.click();
      fixture.detectChanges();

      expect(component.isDepartmentDropdownOpen).toBe(true);

      const menuList = fixture.nativeElement.querySelector('.dept-dropdown__menu');
      expect(menuList).toBeTruthy();

      const items: NodeListOf<HTMLLIElement> =
        fixture.nativeElement.querySelectorAll('.dept-dropdown__item');
      expect(items.length).toBe(component.departments.length);

      // Click en 'Cochabamba'
      const cbbaItem = Array.from(items).find(
        (el) => el.textContent?.includes('Cochabamba')
      );
      expect(cbbaItem).toBeTruthy();
      cbbaItem?.click();
      fixture.detectChanges();

      expect(component.selectedDepartment).toBe('Cochabamba');
      expect(component.isDepartmentDropdownOpen).toBe(false);

      // Botón para quitar filtro debe estar visible
      const clearBtn = fixture.nativeElement.querySelector('.dept-dropdown__clear-btn');
      expect(clearBtn).toBeTruthy();

      clearBtn.click();
      fixture.detectChanges();

      expect(component.selectedDepartment).toBe('Todos');
    });

    it('debe cerrar el dropdown al hacer click fuera', () => {
      component.isDepartmentDropdownOpen = true;

      // Evento de click en un elemento fuera del dropdown
      const outsideEvent = new MouseEvent('click', { bubbles: true });
      document.body.dispatchEvent(outsideEvent);

      expect(component.isDepartmentDropdownOpen).toBe(false);
    });
  });
});