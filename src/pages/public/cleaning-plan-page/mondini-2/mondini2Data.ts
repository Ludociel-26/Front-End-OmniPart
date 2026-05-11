// ==========================================
// ARCHIVO: mondini2Data.ts
// Extraído de "Catálogo de mondinis lim.xlsx" - Hoja: MONDINI #2
// ==========================================

// --- IMPORTACIONES DE IMÁGENES: SECCIÓN 1 ---
import FRL from '@/assets/cleaning-plan-page/mondini-2/FRL.png';
import Chumaceras from '@/assets/cleaning-plan-page/mondini-2/Chumacera.png';
import Selector from '@/assets/cleaning-plan-page/mondini-2/Selector.png';
import Lamparas from '@/assets/cleaning-plan-page/mondini-2/Lamparas.png';
import Motores from '@/assets/cleaning-plan-page/mondini-2/Motores.png';

// --- IMPORTACIONES DE IMÁGENES: SECCIÓN 2 ---
import Sensores from '@/assets/cleaning-plan-page/mondini-2/Sensores.png';
import Uniones_Neumáticas from '@/assets/cleaning-plan-page/mondini-2/Uniones_Neumáticas.png';
import Interlocks from '@/assets/cleaning-plan-page/mondini-2/Interlocks.png';
import Líneas_Dosificación from '@/assets/cleaning-plan-page/mondini-2/Líneas_Dosificación.png';
import Tablero from '@/assets/cleaning-plan-page/mondini-2/Tablero.png';
import Botones_Tableros from '@/assets/cleaning-plan-page/mondini-2/Botones_Tableros.png';
import Torreta from '@/assets/cleaning-plan-page/mondini-2/Torreta.png';
import Tablero_Electrico from '@/assets/cleaning-plan-page/mondini-2/Tablero_Electrico.png';
import Cableado from '@/assets/cleaning-plan-page/mondini-2/Cableado.png';
import Motores2 from '@/assets/cleaning-plan-page/mondini-2/Motores2.png';
import Guardas_Motores from '@/assets/cleaning-plan-page/mondini-2/Guardas_Motores.png';
import Chumacera2 from '@/assets/cleaning-plan-page/mondini-2/Chumacera2.png';

// --- IMPORTACIONES DE IMÁGENES: SECCIÓN 3 ---
import Boton_Paro from '@/assets/cleaning-plan-page/mondini-2/Boton_Paro.png';
import Inyector_Agua from '@/assets/cleaning-plan-page/mondini-2/Inyector_Agua.png';
import Uniones_Neumáticas3 from '@/assets/cleaning-plan-page/mondini-2/Uniones_Neumáticas2.png';
import Glandulas_Cables from '@/assets/cleaning-plan-page/mondini-2/Glandulas_Cables.png';
import Registros_Eléctricos from '@/assets/cleaning-plan-page/mondini-2/Registros_Eléctricos.png';
import Sensores3 from '@/assets/cleaning-plan-page/mondini-2/Sensores3.png';
import Sensores_Seguridad from '@/assets/cleaning-plan-page/mondini-2/Sensores_Seguridad.png';
import Motores3 from '@/assets/cleaning-plan-page/mondini-2/Motores3.png';
import Manometros from '@/assets/cleaning-plan-page/mondini-2/Manómetros.png';
import Botones_Tableros3 from '@/assets/cleaning-plan-page/mondini-2/Botones_Tableros3.png';
import Tablero3 from '@/assets/cleaning-plan-page/mondini-2/Tablero3.png';
import Chumacera3 from '@/assets/cleaning-plan-page/mondini-2/Chumacera3.png';
import Impresoras from '@/assets/cleaning-plan-page/mondini-2/Impresoras.png';
import Cabezales_Impresion from '@/assets/cleaning-plan-page/mondini-2/Cabezales_Impresion.png';

export const m2Sec1Data = [
  {
    name: 'FRL (Filtro-Regulador-Lubricador)',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: FRL, label: 'Componente' },
  },
  {
    name: 'Chumaceras',
    desc: 'Evitar dirigir agua directamente sobre el componente.',
    image: { src: Chumaceras, label: 'Componente' },
  },
  {
    name: 'Selectores disconnect',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: Selector, label: 'Componente' },
  },
  {
    name: 'Lamparas',
    desc: 'Evitar dirigir agua directamente sobre el componente.',
    image: { src: Lamparas, label: 'Componente' },
  },
  {
    name: 'Motores',
    desc: 'Evitar dirigir agua a presión directamente sobre el componente y cubrir con bolsa.',
    image: { src: Motores, label: 'Componente' },
  },
];

export const m2Sec2Data = [
  {
    name: 'Sensores',
    desc: 'Aislar completamente con bolsa, asegurando sellar el lente y soporte sin afectar su posición.',
    image: { src: Sensores, label: 'Componente' },
  },
  {
    name: 'Uniones de líneas neumáticas',
    desc: 'Aislar completamente con bolsa las uniones y no aplicar agua a alta presión.',
    image: { src: Uniones_Neumáticas, label: 'Componente' },
  },
  {
    name: 'Interlocks',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: Interlocks, label: 'Componente' },
  },
  {
    name: 'Líneas de Dosificación (Líneas del jarabe)',
    desc: 'Evitar dirigir agua directamente sobre el componente.',
    image: { src: Líneas_Dosificación, label: 'Componente' },
  },
  {
    name: 'Tableros de control',
    desc: 'Asegurarse de que la puerta del gabinete se encuentre sellada y aislar con bolsa plástica.',
    image: { src: Tablero, label: 'Componente' },
  },
  {
    name: 'Botones de tableros',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: Botones_Tableros, label: 'Componente' },
  },
  {
    name: 'Torretas',
    desc: 'Evitar dirigir agua directamente sobre el componente.',
    image: { src: Torreta, label: 'Componente' },
  },
  {
    name: 'Tableros electricos',
    desc: 'Asegurarse de que la puerta del gabinete se encuentre sellada y aislar con bolsa plástica.',
    image: { src: Tablero_Electrico, label: 'Componente' },
  },
  {
    name: 'Cableado electrico',
    desc: 'Evitar dirigir agua directamente sobre el componente.',
    image: { src: Cableado, label: 'Componente' },
  },
  {
    name: 'Motores',
    desc: 'Evitar dirigir agua directamente sobre el componente.',
    image: { src: Motores2, label: 'Componente' },
  },
  {
    name: 'Guardas de motores',
    desc: 'Evitar dirigir agua a presión directamente sobre el componente y cubrir con bolsa',
    image: { src: Guardas_Motores, label: 'Componente' },
  },
  {
    name: 'Chumaceras',
    desc: 'Evitar dirigir agua directamente sobre el componente.',
    image: { src: Chumacera2, label: 'Componente' },
  },
];

export const m2Sec3Data = [
  {
    name: 'Botones de paro',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: Boton_Paro, label: 'Componente' },
  },
  {
    name: 'Inyectores de agua',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: Inyector_Agua, label: 'Componente' },
  },
  {
    name: 'Uniones de líneas neumáticas',
    desc: 'Aislar completamente con bolsa las uniones y no aplicar agua a alta presión.',
    image: { src: Uniones_Neumáticas3, label: 'Componente' },
  },
  {
    name: 'Glandulas de cable',
    desc: 'Evitar dirigir agua a presión directamente sobre el componente y cubrir con bolsa.',
    image: { src: Glandulas_Cables, label: 'Componente' },
  },
  {
    name: 'Registros eléctricos',
    desc: 'Asegurarse de que la puerta del gabinete se encuentre sellada y aislar con bolsa plástica.',
    image: { src: Registros_Eléctricos, label: 'Componente' },
  },
  {
    name: 'Sensores',
    desc: 'Aislar completamente con bolsa, asegurando sellar el lente y soporte sin afectar su posición.',
    image: { src: Sensores3, label: 'Componente' },
  },
  {
    name: 'Sensores de Seguridad',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: Sensores_Seguridad, label: 'Componente' },
  },
  {
    name: 'Motores',
    desc: 'Evitar dirigir agua a presión directamente sobre el componente y cubrir con bolsa.',
    image: { src: Motores3, label: 'Componente' },
  },
  {
    name: 'Manómetros',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: Manometros, label: 'Componente' },
  },
  {
    name: 'Tableros de control',
    desc: 'Asegurarse de que la puerta del gabinete se encuentre sellada y aislar con bolsa plástica.',
    image: { src: Tablero3, label: 'Componente' },
  },
  {
    name: 'Botones de tableros',
    desc: 'Asegurarse de que la puerta del gabinete se encuentre sellada y aislar con bolsa plástica.',
    image: { src: Botones_Tableros3, label: 'Componente' },
  },
  {
    name: 'Chumaceras',
    desc: 'Evitar dirigir agua directamente sobre el componente.',
    image: { src: Chumacera3, label: 'Componente' },
  },
  {
    name: 'Cabezales de impresión',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: Cabezales_Impresion, label: 'Componente' },
  },
  {
    name: 'Impresoras',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: Impresoras, label: 'Componente' },
  },
];
