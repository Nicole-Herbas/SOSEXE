/**
 * SOS-114: Descarga los archivos de traducción desde Loco (localise.biz)
 * y los guarda como assets estáticos en public/i18n/.
 *
 * Uso: npm run i18n:pull
 *
 * La API key solo se usa en tiempo de build/desarrollo.
 * Los JSON resultantes se sirven como assets estáticos y no exponen la key.
 */

import { writeFileSync, mkdirSync } from 'fs';

const API_KEY  = 'a6EoMv9kbfbI06SinP-FYIC3YG3Qvn-0w';
const BASE_URL = 'https://localise.biz/api/export/locale';
const LOCALES  = ['es', 'en'];
const OUT_DIR  = './public/i18n';

mkdirSync(OUT_DIR, { recursive: true });

for (const locale of LOCALES) {
  const url = `${BASE_URL}/${locale}.json?key=${API_KEY}&format=simple&order=id&fallback=es`;

  console.log(`⬇  Descargando ${locale}.json desde Loco...`);

  const res = await fetch(url);

  if (!res.ok) {
    console.error(`✗ Error al descargar ${locale}.json: HTTP ${res.status}`);
    process.exit(1);
  }

  const json = await res.json();
  const path = `${OUT_DIR}/${locale}.json`;

  writeFileSync(path, JSON.stringify(json, null, 2), 'utf-8');
  console.log(`✔  Guardado: ${path} (${Object.keys(json).length} claves)`);
}

console.log('\n✅ Traducciones actualizadas correctamente.');
