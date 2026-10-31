import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ListaCentros } from './lista-centros';
import { IdiomaService } from '../../../../shared/services/idioma.service';
import textosEs from '../../../../../../public/i18n/es.json';
import textosEn from '../../../../../../public/i18n/en.json';

describe('Presentación de centros', () => {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.removeItem('idioma_preferido');
  });

  it.each(['predeterminada', 'admin'])('conserva los datos y una sola consulta en variante %s', async variante => {
    localStorage.removeItem('idioma_preferido');
    await TestBed.configureTestingModule({
      imports: [ListaCentros],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    const fixture = TestBed.createComponent(ListaCentros);
    if (variante === 'admin') fixture.componentRef.setInput('variante', variante);
    const http = TestBed.inject(HttpTestingController);
    http.match(req => req.url.startsWith('/i18n/')).forEach(req => req.flush(textosEs));
    fixture.detectChanges();
    http.match(req => req.url.startsWith('/i18n/')).forEach(req => req.flush(textosEs));
    http.expectOne('/api/centros').flush({ success: true, data: [
      { id: 1, nombre: 'Centro de prueba', tipo: 'REFUGIO', ciudad: 'La Paz', direccion: 'Dirección de prueba' },
    ] });
    fixture.detectChanges();
    const texto = fixture.nativeElement.textContent;
    for (const dato of ['Centro de prueba', 'La Paz', 'Dirección de prueba']) expect(texto).toContain(dato);
    if (variante === 'admin') {
      expect(fixture.nativeElement.querySelector('.centro-tarjeta h3').textContent).toBe('Centro de prueba');
      TestBed.inject(IdiomaService).setIdioma('en');
      http.expectOne('/i18n/en.json').flush(textosEn);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Shelter');
    } else {
      expect(fixture.nativeElement.querySelector('h2').textContent.trim()).toBe('Centro de prueba');
      expect(fixture.nativeElement.querySelector('.centros-admin')).toBeNull();
    }
  });
});
