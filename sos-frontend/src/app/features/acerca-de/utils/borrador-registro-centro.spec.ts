import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';

import {
  archivosVacios,
  borradorVencido,
  BORRADOR_VIGENCIA_DIAS,
  cargarArchivosBorrador,
  claveBorrador,
  eliminarBorradorDeUsuario,
  guardarArchivosBorrador
} from './borrador-registro-centro';

/**
 * SOS-42: pruebas con IndexedDB REAL (fake-indexeddb implementa la
 * especificación completa en memoria; no se simula ningún método).
 */
describe('borrador-registro-centro (IndexedDB real)', () => {

  const USUARIO_A = 'ana@sos.com';
  const USUARIO_B = 'beto@sos.com';

  const pdf = (nombre: string, contenido: string) =>
    new File([contenido], nombre, { type: 'application/pdf', lastModified: 1_700_000_000_000 });

  const imagen = (nombre: string) =>
    new File([new Uint8Array([137, 80, 78, 71])], nombre, { type: 'image/png' });

  beforeEach(() => {
    // Base de datos nueva y vacía en cada prueba
    (globalThis as any).indexedDB = new IDBFactory();
    localStorage.clear();
  });

  it('guarda y recupera los 4 documentos con nombre, tipo y contenido', async () => {

    await guardarArchivosBorrador(USUARIO_A, {
      personeria: pdf('personeria.pdf', 'contenido personeria'),
      nit: pdf('nit.pdf', 'contenido nit'),
      identidad: imagen('ci.png'),
      domicilio: pdf('domicilio.pdf', 'contenido domicilio')
    });

    const recuperados = await cargarArchivosBorrador(USUARIO_A);

    expect(recuperados.personeria?.name).toBe('personeria.pdf');
    expect(recuperados.personeria?.type).toBe('application/pdf');
    expect(recuperados.personeria?.lastModified).toBe(1_700_000_000_000);
    expect(await recuperados.personeria?.text()).toBe('contenido personeria');
    expect(await recuperados.nit?.text()).toBe('contenido nit');

    expect(recuperados.identidad?.type).toBe('image/png');
    expect(new Uint8Array(await recuperados.identidad!.arrayBuffer()))
      .toEqual(new Uint8Array([137, 80, 78, 71]));

    expect(await recuperados.domicilio?.text()).toBe('contenido domicilio');
  });

  it('al guardar de nuevo, quita los documentos que el usuario retiró', async () => {

    await guardarArchivosBorrador(USUARIO_A, {
      ...archivosVacios(),
      personeria: pdf('p.pdf', 'p'),
      nit: pdf('n.pdf', 'n')
    });

    await guardarArchivosBorrador(USUARIO_A, {
      ...archivosVacios(),
      personeria: pdf('p.pdf', 'p')
    });

    const recuperados = await cargarArchivosBorrador(USUARIO_A);

    expect(recuperados.personeria).not.toBeNull();
    expect(recuperados.nit).toBeNull();
  });

  it('aísla los documentos por usuario', async () => {

    await guardarArchivosBorrador(USUARIO_A, { ...archivosVacios(), nit: pdf('a.pdf', 'A') });

    const deB = await cargarArchivosBorrador(USUARIO_B);

    expect(deB).toEqual(archivosVacios());
  });

  it('eliminar borra texto y documentos solo del usuario indicado', async () => {

    localStorage.setItem(claveBorrador(USUARIO_A), '{"nombreCentro":"A"}');
    localStorage.setItem(claveBorrador(USUARIO_B), '{"nombreCentro":"B"}');

    await guardarArchivosBorrador(USUARIO_A, { ...archivosVacios(), nit: pdf('a.pdf', 'A') });
    await guardarArchivosBorrador(USUARIO_B, { ...archivosVacios(), nit: pdf('b.pdf', 'B') });

    await eliminarBorradorDeUsuario(USUARIO_A);

    expect(localStorage.getItem(claveBorrador(USUARIO_A))).toBeNull();
    expect(await cargarArchivosBorrador(USUARIO_A)).toEqual(archivosVacios());

    expect(localStorage.getItem(claveBorrador(USUARIO_B))).not.toBeNull();
    expect(await (await cargarArchivosBorrador(USUARIO_B)).nit?.text()).toBe('B');
  });

  it('la clave no distingue mayúsculas ni espacios del correo', () => {
    expect(claveBorrador('  Ana@SOS.com ')).toBe(claveBorrador('ana@sos.com'));
  });

  it('falla de forma controlada si IndexedDB no está disponible (bloqueado)', async () => {

    (globalThis as any).indexedDB = undefined;

    await expect(
      guardarArchivosBorrador(USUARIO_A, { ...archivosVacios(), nit: pdf('a.pdf', 'A') })
    ).rejects.toThrow('IndexedDB no está disponible');
  });

  it('propaga el error si se llena la cuota de almacenamiento', async () => {

    const factory = new IDBFactory();
    (globalThis as any).indexedDB = factory;

    // Primero se crea la base normalmente
    await guardarArchivosBorrador(USUARIO_A, archivosVacios());

    // Luego cualquier "put" falla como si el disco estuviera lleno
    const putOriginal = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function () {
      throw new DOMException('Cuota excedida', 'QuotaExceededError');
    };

    try {
      await expect(
        guardarArchivosBorrador(USUARIO_A, { ...archivosVacios(), nit: pdf('a.pdf', 'A') })
      ).rejects.toThrow('Cuota excedida');
    } finally {
      IDBObjectStore.prototype.put = putOriginal;
    }
  });

  it(`considera vencido un borrador de más de ${BORRADOR_VIGENCIA_DIAS} días`, () => {

    const ahora = Date.parse('2026-10-15T12:00:00Z');

    expect(borradorVencido('2026-10-14T12:00:00Z', ahora)).toBe(false);
    expect(borradorVencido('2026-10-07T12:00:00Z', ahora)).toBe(true);
    expect(borradorVencido(undefined, ahora)).toBe(true);
    expect(borradorVencido('fecha-rota', ahora)).toBe(true);
  });
});