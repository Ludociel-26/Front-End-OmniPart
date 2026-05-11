// ==========================================
// ARCHIVO: mondini3Data.ts
// Propósito: Almacenar la data estática y las rutas de imágenes para la línea Mondini 3
// Extraído 100% del "Catálogo de Puntos Críticos" (Excel Oficial)
// ==========================================

// --- IMPORTACIONES DE IMÁGENES: SECCIÓN 1 ---
import FRL from '@/assets/cleaning-plan-page/mondini-3/FRL.png';
import Chumaceras from '@/assets/cleaning-plan-page/mondini-3/Chumaceras.png';
import Selector from '@/assets/cleaning-plan-page/mondini-3/Selector.png';
import Lamparas from '@/assets/cleaning-plan-page/mondini-3/Lamparas.png';
import Motores from '@/assets/cleaning-plan-page/mondini-3/Motores.png';

// --- IMPORTACIONES DE IMÁGENES: SECCIÓN 2 ---
import Sensores from '@/assets/cleaning-plan-page/mondini-3/Sensores.png';
import Uniones_Neumáticas from '@/assets/cleaning-plan-page/mondini-3/Uniones_Neumáticas.png';
import Interlocks from '@/assets/cleaning-plan-page/mondini-3/Interlocks.png';
import Líneas_Dosificación from '@/assets/cleaning-plan-page/mondini-3/Líneas_Dosificación.png';
import Tableros_Control from '@/assets/cleaning-plan-page/mondini-3/Tableros_Control.png';
import Botones_Tableros from '@/assets/cleaning-plan-page/mondini-3/Botones_Tableros.png';
import Torretas from '@/assets/cleaning-plan-page/mondini-3/Torretas.png';
import Tableros_Electricos from '@/assets/cleaning-plan-page/mondini-3/Tableros_Electricos.png';
import Cableado_Electrico from '@/assets/cleaning-plan-page/mondini-3/Cableado_Electrico.png';
import Motores2 from '@/assets/cleaning-plan-page/mondini-3/Motores2.png';
import Chumaceras2 from '@/assets/cleaning-plan-page/mondini-3/Chumaceras2.png';
import Guardas_Motores from '@/assets/cleaning-plan-page/mondini-3/Guardas_Motores.png';

// --- IMPORTACIONES DE IMÁGENES: SECCIÓN 3 ---
import Botones_Paro from '@/assets/cleaning-plan-page/mondini-3/Botones_Paro.png';
import Inyectores_Agua from '@/assets/cleaning-plan-page/mondini-3/Inyectores_Agua.png';
import Glandulas_Cables from '@/assets/cleaning-plan-page/mondini-3/Glandulas_Cables.png';
import Registros_Electricos from '@/assets/cleaning-plan-page/mondini-3/Registros_Electricos.png';
import Sensores3 from '@/assets/cleaning-plan-page/mondini-3/Sensores3.png';
import Sensores_Seguridad from '@/assets/cleaning-plan-page/mondini-3/Sensores_Seguridad.png';
import Motores3 from '@/assets/cleaning-plan-page/mondini-3/Motores3.png';
import Manómetros from '@/assets/cleaning-plan-page/mondini-3/Manómetros.png';
import Tableros from '@/assets/cleaning-plan-page/mondini-3/Tableros.png';
import Botones_Tableros3 from '@/assets/cleaning-plan-page/mondini-3/Botones_Tableros3.png';
import Sensores_Rodillos from '@/assets/cleaning-plan-page/mondini-3/Sensores_Rodillos.png';
import Chumaceras3 from '@/assets/cleaning-plan-page/mondini-3/Chumaceras3.png';
import Cabezales_Impresion from '@/assets/cleaning-plan-page/mondini-3/Cabezales_Impresion.png';
import Impresoras from '@/assets/cleaning-plan-page/mondini-3/Impresoras.png';

// ==========================================
// DATA SECCION 1: ENTRADA
// ==========================================
export const m3Sec1Data = [
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
    name: 'Selector (Interruptor Rotativo)',
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

// ==========================================
// DATA SECCION 2: INYECCION DE JARABE
// ==========================================
export const m3Sec2Data = [
  {
    name: 'Sensores',
    desc: 'Aislar completamente con bolsa, asegurando sellar el lente y soporte sin afectar su posición.',
    image: { src: Sensores, label: 'Componente' },
  },
  {
    name: 'Uniones de líneas neumáticas',
    desc: 'Aislar completamente con bolsa las uniones y no aplicar agua a alta presión.',
    image: { src: Uniones_Neumáticas, label: 'Componente' },
  },
  {
    name: 'Interlocks',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: Interlocks, label: 'Componente' },
  },
  {
    name: 'Líneas de Dosificación (Líneas del jarabe)',
    desc: 'Aislar completamente con bolsa las uniones y no aplicar agua a alta presión.',
    image: { src: Líneas_Dosificación, label: 'Componente' },
  },
  {
    name: 'Tableros de control',
    desc: 'Asegurarse de que la puerta del gabinete se encuentre sellada y aislar con bolsa plástica.',
    image: { src: Tableros_Control, label: 'Componente' },
  },
  {
    name: 'Botones de tableros',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: Botones_Tableros, label: 'Componente' },
  },
  {
    name: 'Torretas',
    desc: 'Evitar dirigir agua directamente sobre el componente.',
    image: { src: Torretas, label: 'Componente' },
  },
  {
    name: 'Tableros eléctricos',
    desc: 'Asegurarse de que la puerta del gabinete se encuentre sellada y aislar con bolsa plástica.',
    image: { src: Tableros_Electricos, label: 'Componente' },
  },
  {
    name: 'Cableado eléctrico',
    desc: 'Evitar dirigir agua directamente sobre el componente.',
    image: { src: Cableado_Electrico, label: 'Componente' },
  },
  {
    name: 'Motores',
    desc: 'Evitar dirigir agua a presión directamente sobre el componente y cubrir con bolsa.',
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
    image: { src: Chumaceras2, label: 'Componente' },
  },
];

// ==========================================
// DATA SECCION 3: SELLADO, VACIO Y SALIDA
// ==========================================
export const m3Sec3Data = [
  {
    name: 'Botones de paro',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: Botones_Paro, label: 'Componente' },
  },
  {
    name: 'Inyectores de agua',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: Inyectores_Agua, label: 'Componente' },
  },
  {
    name: 'Glandulas de cables',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: Glandulas_Cables, label: 'Componente' },
  },
  {
    name: 'Registros eléctricos',
    desc: 'Asegurarse de que la puerta del gabinete se encuentre sellada y aislar con bolsa plástica.',
    image: { src: Registros_Electricos, label: 'Componente' },
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
    desc: 'Aislar completamente con bolsa las uniones y no aplicar agua a alta presión.',
    image: { src: Motores3, label: 'Componente' },
  },
  {
    name: 'Manómetros',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: Manómetros, label: 'Componente' },
  },
  {
    name: 'Tableros',
    desc: 'Asegurarse de que la puerta del gabinete se encuentre sellada y aislar con bolsa plástica.',
    image: { src: Tableros, label: 'Componente' },
  },
  {
    name: 'Botones de tableros',
    desc: 'Evitar dirigir agua a presión directamente sobre el componente y cubrir con bolsa',
    image: { src: Botones_Tableros3, label: 'Componente' },
  },
  {
    name: 'Sensores de rodillos',
    desc: 'Aislar completamente con bolsa, asegurando sellar el lente y soporte sin afectar su posición.',
    image: { src: Sensores_Rodillos, label: 'Componente' },
  },
  {
    name: 'Chumaceras',
    desc: 'Evitar dirigir agua directamente sobre el componente.',
    image: { src: Chumaceras3, label: 'Componente' },
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

export const SECTIONS = [
  { id: 'intro', text: 'Propósito del Protocolo' },
  { id: 'tabla', text: 'Inventario Completo' },
  { id: 'sec1', text: 'Sección 1 (Entrada)' },
  { id: 'sec2', text: 'Sección 2 (Sellado)' },
];
