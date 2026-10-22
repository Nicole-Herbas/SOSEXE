/**
 * SOS-114: Sube o actualiza los archivos de traducción en Loco (localise.biz).
 *
 * Uso: npm run i18n:push
 */
import { readFileSync } from 'fs';

const API_KEY  = 'a6EoMv9kbfbI06SinP-FYIC3YG3Qvn-0w';
const BASE_URL = 'https://localise.biz/api';

// 1. Subir/actualizar español (idioma origen)
console.log('📦 Subiendo traducciones en español (es) a Loco...');
const esBody = readFileSync('./public/i18n/es.json', 'utf-8');
const resEs = await fetch(`${BASE_URL}/import/json?locale=es&key=${API_KEY}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: esBody,
});
const dataEs = await resEs.json();
console.log('✔ Español:', dataEs.message || dataEs.status);

// 2. Subir/actualizar inglés
console.log('📦 Subiendo traducciones en inglés (en) a Loco...');
const enBody = readFileSync('./public/i18n/en.json', 'utf-8');
const resEn = await fetch(`${BASE_URL}/import/json?locale=en&key=${API_KEY}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: enBody,
});
const dataEn = await resEn.json();
console.log('✔ Inglés:', dataEn.message || dataEn.status);

console.log('\n✅ Sincronización con Loco completada.');
