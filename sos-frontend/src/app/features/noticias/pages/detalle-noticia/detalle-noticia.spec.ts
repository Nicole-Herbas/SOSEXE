import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NavigationEnd, provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { filter, firstValueFrom } from 'rxjs';
import { routes } from '../../../../app.routes';
import { NoticiaPublicada } from '../../models/noticia.model';
import { Noticias } from '../noticias/noticias';
import { DetalleNoticia } from './detalle-noticia';

const NOTICIA: NoticiaPublicada = {
  id: 7,
  titulo: 'Campaña solidaria con un título completo',
  contenido: 'Primer párrafo.\n\n' + 'Contenido completo sin recortes. '.repeat(30),
  categoria: 'Comunidad',
  imagenUrl: 'https://example.com/noticia.jpg',
  fuente: 'Defensa Civil Bolivia',
  fechaPublicacion: '2026-10-12T09:30:00',
  estado: 'PUBLICADO',
  esExterna: false,
};

describe('DetalleNoticia público', () => {
  let http: HttpTestingController;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => http.verify());

  async function abrir(url = '/noticias/7'): Promise<DetalleNoticia> {
    const componente = await harness.navigateByUrl(url, DetalleNoticia);
    harness.detectChanges();
    return componente;
  }

  function responder(noticia: NoticiaPublicada = NOTICIA, id = 7): void {
    http.expectOne(`/api/noticias/publicas/${id}`).flush({
      success: true, message: 'OK', data: noticia, timestamp: '',
    });
    harness.detectChanges();
  }

  it('abre el detalle al seleccionar una tarjeta interna y permite volver al listado', async () => {
    await harness.navigateByUrl('/noticias', Noticias);
    http.expectOne('/api/noticias/publicas').flush({ success: true, data: [NOTICIA] });
    http.expectOne('/api/noticias/externas').flush({
      success: true, data: { noticias: [], apiDisponible: true, desdeCache: false },
    });
    harness.detectChanges();
    const router = TestBed.inject(Router);
    const navegacion = firstValueFrom(router.events.pipe(filter((evento) => evento instanceof NavigationEnd)));
    const enlace = harness.routeNativeElement!.querySelector<HTMLAnchorElement>('.noticia-tarjeta__enlace')!;
    enlace.click();
    await navegacion;
    responder();
    expect(router.url).toBe('/noticias/7');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe(NOTICIA.titulo);

    const regreso = firstValueFrom(router.events.pipe(filter((evento) => evento instanceof NavigationEnd)));
    harness.routeNativeElement!.querySelector<HTMLAnchorElement>('.detalle-noticia__volver')!.click();
    await regreso;
    harness.detectChanges();
    http.expectOne('/api/noticias/publicas').flush({ success: true, data: [] });
    http.expectOne('/api/noticias/externas').flush({
      success: true, data: { noticias: [], apiDisponible: true, desdeCache: false },
    });
    harness.detectChanges();
    expect(router.url).toBe('/noticias');
  });

  it('carga desde URL directa sin sesión ni datos previos del listado', async () => {
    const componente = await abrir();
    expect(componente.cargando()).toBe(true);
    expect(harness.routeNativeElement?.querySelector('[role="status"]')?.textContent)
      .toContain(componente.textos.cargando);
    const peticion = http.expectOne('/api/noticias/publicas/7');
    expect(peticion.request.method).toBe('GET');
    expect(peticion.request.headers.has('Authorization')).toBe(false);
    http.expectNone('/api/noticias/publicas');
    http.expectNone('/api/noticias/externas');
    peticion.flush({ success: true, data: NOTICIA });
    harness.detectChanges();
    expect(componente.noticia()?.id).toBe(7);
    expect(harness.routeNativeElement?.querySelector('[role="status"]')).toBeNull();
  });

  it('muestra título, contenido íntegro, fecha, fuente, imagen y enlace de regreso', async () => {
    await abrir();
    responder();
    const pagina = harness.routeNativeElement!;
    expect(pagina.querySelector('h1')?.textContent).toBe(NOTICIA.titulo);
    expect(pagina.querySelector('.detalle-noticia__contenido')?.textContent).toBe(NOTICIA.contenido);
    const fecha = pagina.querySelector('time');
    expect(fecha?.getAttribute('datetime')).toBe(NOTICIA.fechaPublicacion);
    expect(fecha?.textContent).toContain('12');
    expect(fecha?.textContent).toContain('oct');
    expect(fecha?.textContent).toContain('2026');
    expect(pagina.textContent).toContain(NOTICIA.fuente);
    expect(pagina.querySelector('img')?.getAttribute('src')).toBe(NOTICIA.imagenUrl);
    expect(pagina.querySelector('img')?.alt).toBe(NOTICIA.titulo);
    expect(pagina.querySelector('a')?.getAttribute('href')).toBe('/noticias');
  });

  it('representa el contenido como texto y conserva los saltos sin ejecutar HTML', async () => {
    await abrir();
    const contenido = '<script>alert("prueba")</script>\n\nSegundo párrafo';
    responder({ ...NOTICIA, contenido });
    expect(harness.routeNativeElement?.querySelector('.detalle-noticia__contenido')?.textContent)
      .toBe(contenido);
    expect(harness.routeNativeElement?.querySelector('script')).toBeNull();
  });

  it.each([null, '', '   '])('muestra No informado ante fecha y fuente ausentes (%s)', async (valor) => {
    await abrir();
    responder({ ...NOTICIA, fuente: valor, fechaPublicacion: valor, imagenUrl: null });
    const metadatos = harness.routeNativeElement!.querySelectorAll('dd');
    expect(metadatos[0].textContent?.trim()).toBe('No informado');
    expect(metadatos[1].textContent?.trim()).toBe('No informado');
    expect(harness.routeNativeElement?.querySelector('time')).toBeNull();
    expect(harness.routeNativeElement?.querySelector('img')).toBeNull();
  });

  it('no inventa una fecha cuando el valor recibido es inválido', async () => {
    await abrir();
    responder({ ...NOTICIA, fechaPublicacion: 'fecha-invalida' });
    expect(harness.routeNativeElement?.querySelector('time')).toBeNull();
    expect(harness.routeNativeElement?.querySelector('dd')?.textContent).toContain('No informado');
  });

  it.each(['javascript:alert(1)', 'imagen sin URL', 'https://', 'data:text/html,imagen'])
    ('omite URLs de imagen inválidas (%s)', async (imagenUrl) => {
      await abrir();
      responder({ ...NOTICIA, imagenUrl });
      expect(harness.routeNativeElement?.querySelector('img')).toBeNull();
    });

  it('oculta una imagen que no se puede cargar', async () => {
    await abrir();
    responder();
    harness.routeNativeElement?.querySelector('img')?.dispatchEvent(new Event('error'));
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('img')).toBeNull();
  });

  it.each(['abc', '0', '-1', '1.5', '1e3', '9007199254740992'])
    ('rechaza ID inválido sin peticiones HTTP (%s)', async (id) => {
      const componente = await abrir(`/noticias/${id}`);
      expect(componente.cargando()).toBe(false);
      expect(harness.routeNativeElement?.textContent).toContain(componente.textos.idInvalido);
      http.expectNone(() => true);
    });

  it('distingue noticia inexistente o no publicada de un error de conexión', async () => {
    const componente = await abrir();
    http.expectOne('/api/noticias/publicas/7').flush(
      { success: false, message: 'No encontrada' }, { status: 404, statusText: 'Not Found' },
    );
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('[role="alert"]')?.textContent)
      .toContain(componente.textos.noEncontrada);
    expect(harness.routeNativeElement?.querySelector('article')).toBeNull();
    expect(harness.routeNativeElement?.querySelector('button')).toBeNull();
  });

  it.each([0, 500])('permite reintentar después de un error (%s)', async (status) => {
    const componente = await abrir();
    const peticion = http.expectOne('/api/noticias/publicas/7');
    if (status === 0) peticion.error(new ProgressEvent('error'));
    else peticion.flush('Error', { status, statusText: 'Server Error' });
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain(componente.textos.errorCarga);
    harness.routeNativeElement?.querySelector('button')?.click();
    harness.detectChanges();
    expect(componente.cargando()).toBe(true);
    responder();
    expect(componente.error()).toBeNull();
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe(NOTICIA.titulo);
  });

  it('consulta un nuevo ID aunque se reutilice la misma pantalla', async () => {
    const inicial = await abrir();
    responder();
    const siguiente = await abrir('/noticias/8');
    expect(siguiente).toBe(inicial);
    expect(siguiente.noticia()).toBeNull();
    responder({ ...NOTICIA, id: 8, titulo: 'Otra noticia' }, 8);
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Otra noticia');
  });

  it('cancela la consulta anterior para evitar mostrar otra noticia al cambiar de ID', async () => {
    await abrir();
    const anterior = http.expectOne('/api/noticias/publicas/7');
    await abrir('/noticias/8');
    expect(anterior.cancelled).toBe(true);
    responder({ ...NOTICIA, id: 8 }, 8);
  });
});
