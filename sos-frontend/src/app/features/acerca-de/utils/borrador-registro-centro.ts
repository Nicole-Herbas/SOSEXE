/**
 * SOS-42: almacenamiento LOCAL del borrador de registro de centro.
 *
 *  - Textos   -> localStorage  (una clave por usuario)
 *  - Archivos -> IndexedDB     (una clave por usuario y tipo de documento)
 *
 * El borrador vive solo en este navegador/dispositivo, se aísla por usuario
 * y vence a los BORRADOR_VIGENCIA_DIAS días. También se elimina al enviar
 * la solicitud (201) y al cerrar sesión.
 */

export const BORRADOR_VIGENCIA_DIAS = 7;

const VIGENCIA_MS = BORRADOR_VIGENCIA_DIAS * 24 * 60 * 60 * 1000;

const DB_NAME = 'SosExeDB';
const DB_VERSION = 1;
const STORE_ARCHIVOS = 'archivosBorrador';

export const TIPOS_DOCUMENTO = ['personeria', 'nit', 'identidad', 'domicilio'] as const;

export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number];

export type ArchivosBorrador = Record<TipoDocumento, File | null>;

/**
 * Se guarda el contenido como ArrayBuffer (y no el File directo) porque
 * así funciona igual en todos los navegadores y en las pruebas.
 */
interface ArchivoGuardado {
  nombre: string;
  tipo: string;
  ultimaModificacion: number;
  contenido: ArrayBuffer;
}

// ==========================================
// CLAVES (aislamiento por usuario)
// ==========================================

function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function claveBorrador(email: string): string {
  return `registroCentroBorrador_${normalizarEmail(email)}`;
}

function claveArchivo(email: string, tipo: TipoDocumento): string {
  return `${normalizarEmail(email)}_${tipo}`;
}

export function archivosVacios(): ArchivosBorrador {
  return { personeria: null, nit: null, identidad: null, domicilio: null };
}

// ==========================================
// VIGENCIA
// ==========================================

/** true si el borrador no tiene fecha válida o tiene más de 7 días. */
export function borradorVencido(guardadoEn: unknown, ahora = Date.now()): boolean {

  if (typeof guardadoEn !== 'string') {
    return true;
  }

  const fecha = Date.parse(guardadoEn);

  return Number.isNaN(fecha) || ahora - fecha > VIGENCIA_MS;
}

// ==========================================
// INDEXEDDB
// ==========================================

function indexedDbDisponible(): boolean {
  return typeof indexedDB !== 'undefined';
}

function abrirBaseDatos(): Promise<IDBDatabase> {

  return new Promise((resolve, reject) => {

    if (!indexedDbDisponible()) {
      reject(new Error('IndexedDB no está disponible en este navegador.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_ARCHIVOS)) {
        db.createObjectStore(STORE_ARCHIVOS);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('IndexedDB está bloqueado.'));
  });
}

function esperarTransaccion(tx: IDBTransaction): Promise<void> {

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () =>
      reject(tx.error ?? new Error('La transacción de IndexedDB fue abortada.'));
  });
}

function leerContenido(archivo: File): Promise<ArrayBuffer> {

  if (typeof archivo.arrayBuffer === 'function') {
    return archivo.arrayBuffer();
  }

  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result as ArrayBuffer);
    lector.onerror = () => reject(lector.error);
    lector.readAsArrayBuffer(archivo);
  });
}

function aArchivo(valor: unknown): File | null {

  if (!valor) {
    return null;
  }

  // Compatibilidad con borradores guardados como File por la versión anterior
  if (valor instanceof Blob) {
    return valor as File;
  }

  const guardado = valor as ArchivoGuardado;

  if (!guardado.contenido) {
    return null;
  }

  return new File([guardado.contenido], guardado.nombre, {
    type: guardado.tipo,
    lastModified: guardado.ultimaModificacion
  });
}

/** Reemplaza los documentos guardados del usuario por los actuales. */
export async function guardarArchivosBorrador(
  email: string,
  archivos: ArchivosBorrador
): Promise<void> {

  // Se leen ANTES de abrir la transacción:
  // IndexedDB cierra la transacción si se espera otra cosa en medio.
  const contenidos = await Promise.all(
    TIPOS_DOCUMENTO.map(async tipo => {
      const archivo = archivos[tipo];

      const guardado: ArchivoGuardado | null = archivo
        ? {
            nombre: archivo.name,
            tipo: archivo.type,
            ultimaModificacion: archivo.lastModified,
            contenido: await leerContenido(archivo)
          }
        : null;

      return { tipo, guardado };
    })
  );

  const db = await abrirBaseDatos();

  try {
    const tx = db.transaction(STORE_ARCHIVOS, 'readwrite');
    const store = tx.objectStore(STORE_ARCHIVOS);

    for (const { tipo, guardado } of contenidos) {
      const clave = claveArchivo(email, tipo);

      if (guardado) {
        store.put(guardado, clave);
      } else {
        store.delete(clave);
      }
    }

    await esperarTransaccion(tx);
  } finally {
    db.close();
  }
}

/** Devuelve los documentos guardados del usuario (null si no hay). */
export async function cargarArchivosBorrador(email: string): Promise<ArchivosBorrador> {

  const db = await abrirBaseDatos();

  try {
    const tx = db.transaction(STORE_ARCHIVOS, 'readonly');
    const store = tx.objectStore(STORE_ARCHIVOS);
    const archivos = archivosVacios();

    for (const tipo of TIPOS_DOCUMENTO) {
      const request = store.get(claveArchivo(email, tipo));
      request.onsuccess = () => {
        archivos[tipo] = aArchivo(request.result);
      };
    }

    await esperarTransaccion(tx);

    return archivos;
  } finally {
    db.close();
  }
}

/**
 * Elimina por completo el borrador (texto + documentos) SOLO del usuario indicado.
 * Primero borra los documentos; si eso falla, el texto se conserva para reintentar.
 */
export async function eliminarBorradorDeUsuario(email: string): Promise<void> {

  if (!email) {
    return;
  }

  if (indexedDbDisponible()) {

    const db = await abrirBaseDatos();

    try {
      const tx = db.transaction(STORE_ARCHIVOS, 'readwrite');
      const store = tx.objectStore(STORE_ARCHIVOS);

      for (const tipo of TIPOS_DOCUMENTO) {
        store.delete(claveArchivo(email, tipo));
      }

      await esperarTransaccion(tx);
    } finally {
      db.close();
    }
  }

  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(claveBorrador(email));
  }
}