// ==========================================
// ARCHIVO: mondini3Data.ts
// Propósito: Almacenar la data estática y las rutas de imágenes para la línea Mondini 3
// Extraído 100% del "Catálogo de Puntos Críticos" (Excel Oficial)
// ==========================================

// --- IMPORTACIONES DE IMÁGENES: SECCIÓN 1 ---
import imgMedidorDeAire_Fisico from '@/assets/cleaning-plan-page/mondini-3/imgMedidorDeAire_Fisico.jpg';
import imgChumaseras2_Fisico from '@/assets/cleaning-plan-page/mondini-3/imgChumaseras2_Fisico.jpg';
import imgSelector_Fisico from '@/assets/cleaning-plan-page/mondini-3/imgSelector_Fisico.jpg';
import imgMotorLadoSelector_Fisico from '@/assets/cleaning-plan-page/mondini-3/imgMotorLadoSelector_Fisico.jpg';
import imgSensorNaranja_Fisico from '@/assets/cleaning-plan-page/mondini-3/imgSensorNaranja_Fisico.jpg';

// --- IMPORTACIONES DE IMÁGENES: SECCIÓN 2 ---
import imgBotonDeParo_Fisico from '@/assets/cleaning-plan-page/mondini-3/imgBotonDeParo_Fisico.jpg';
import imgBoquillaDeAire_Fisico from '@/assets/cleaning-plan-page/mondini-3/imgBoquillaDeAire_Fisico.jpg';
import imgMotoresBandasEntrada_Fisico from '@/assets/cleaning-plan-page/mondini-3/imgMotoresBandasEntrada_Fisico.jpg';
import imgSensoresEntradaSellado_Fisico from '@/assets/cleaning-plan-page/mondini-3/imgSensoresEntradaSellado_Fisico.jpg';

// ==========================================
// DATA SECCION 1: ENTRADA
// ==========================================
export const m3Sec1Data = [
  {
    name: 'FRL (Filtro-Regulador-Lubricador)',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: imgMedidorDeAire_Fisico, label: 'Componente' },
  },
  {
    name: 'Chumaceras',
    desc: 'Evitar dirigir agua directamente sobre el componente.',
    image: { src: imgChumaseras2_Fisico, label: 'Componente' },
  },
  {
    name: 'Selector (Interruptor Rotativo)',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: imgSelector_Fisico, label: 'Componente' },
  },
  {
    name: 'Lamparas',
    desc: 'Evitar dirigir agua directamente sobre el componente.',
    image: { src: imgMotorLadoSelector_Fisico, label: 'Componente' },
  },
  {
    name: 'Motores',
    desc: 'Evitar dirigir agua a presión directamente sobre el componente y cubrir con bolsa.',
    image: { src: imgSensorNaranja_Fisico, label: 'Componente' },
  },
];

// ==========================================
// DATA SECCION 2: INYECCION DE JARABE
// ==========================================
export const m3Sec2Data = [
  {
    name: 'Sensores',
    desc: 'Aislar completamente con bolsa, asegurando sellar el lente y soporte sin afectar su posición.',
    image: { src: imgBotonDeParo_Fisico, label: 'Componente' },
  },
  {
    name: 'Sensor',
    desc: 'a',
    image: { src: imgBoquillaDeAire_Fisico, label: 'Componente' },
  },
  {
    name: 'Uniones de lineas neumaticas',
    desc: 'Aislar completamente con bolsa las uniones y no aplicar agua a alta presión.',
    image: { src: imgMotoresBandasEntrada_Fisico, label: 'Componente' },
  },
  {
    name: 'Interlocks',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: null, label: 'Componente' },
  },
  {
    name: 'Líneas de Dosificación (Líneas del jarabe)',
    desc: 'Aislar completamente con bolsa las uniones y no aplicar agua a alta presión.',
    image: { src: null, label: 'Componente' },
  },
  {
    name: 'Tableros de control',
    desc: 'Asegurarse de que la puerta del gabinete se encuentre sellada y aislar con bolsa plástica.',
    image: { src: imgSensoresEntradaSellado_Fisico, label: 'Componente' },
  },
  {
    name: 'Botones de tableros',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: null, label: 'Componente' },
  },
  {
    name: 'Torretas',
    desc: 'Evitar dirigir agua directamente sobre el componente.',
    image: { src: null, label: 'Componente' },
  },
  {
    name: 'Tableros electricos',
    desc: 'Asegurarse de que la puerta del gabinete se encuentre sellada y aislar con bolsa plástica.',
    image: { src: null, label: 'Componente' },
  },
  {
    name: 'Cableado electrico',
    desc: 'Evitar dirigir agua directamente sobre el componente.',
    image: { src: null, label: 'Componente' },
  },
  {
    name: 'Motores',
    desc: 'Evitar dirigir agua a presión directamente sobre el componente y cubrir con bolsa.',
    image: { src: null, label: 'Componente' },
  },
  {
    name: 'Guardas de motores',
    desc: 'Evitar dirigir agua a presión directamente sobre el componente y cubrir con bolsa',
    image: { src: null, label: 'Componente' },
  },
  {
    name: 'Chumaceras',
    desc: 'Evitar dirigir agua directamente sobre el componente.',
    image: { src: null, label: 'Componente' },
  },
];

// ==========================================
// DATA SECCION 3: SELLADO, VACIO Y SALIDA
// ==========================================
export const m3Sec3Data = [
  {
    name: 'Botones de paro',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: imgBotonDeParo_Fisico, label: 'Componente' },
  },
  {
    name: 'Inyectores de agua',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: imgBoquillaDeAire_Fisico, label: 'Componente' },
  },
  {
    name: 'Glandulas de cables',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: imgMotoresBandasEntrada_Fisico, label: 'Componente' },
  },
  {
    name: 'Glandulas de cables',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: null, label: 'Componente' },
  },
  {
    name: 'Registros electricos',
    desc: 'Asegurarse de que la puerta del gabinete se encuentre sellada y aislar con bolsa plástica.',
    image: { src: null, label: 'Componente' },
  },
  {
    name: 'Sensores',
    desc: 'Aislar completamente con bolsa, asegurando sellar el lente y soporte sin afectar su posición.',
    image: { src: imgSensoresEntradaSellado_Fisico, label: 'Componente' },
  },
  {
    name: 'Sensores de Seguridad',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: null, label: 'Componente' },
  },
  {
    name: 'Motores',
    desc: 'Aislar completamente con bolsa las uniones y no aplicar agua a alta presión.',
    image: { src: null, label: 'Componente' },
  },
  {
    name: 'Manómetros',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: null, label: 'Componente' },
  },
  {
    name: 'Tableros',
    desc: 'Asegurarse de que la puerta del gabinete se encuentre sellada y aislar con bolsa plástica.',
    image: { src: null, label: 'Componente' },
  },
  {
    name: 'Botones de tableros',
    desc: 'Evitar dirigir agua a presión directamente sobre el componente y cubrir con bolsa',
    image: { src: null, label: 'Componente' },
  },
  {
    name: 'Botones de tableros',
    desc: 'Evitar dirigir agua a presión directamente sobre el componente y cubrir con bolsa',
    image: { src: null, label: 'Componente' },
  },
  {
    name: 'Sensores de rodillos',
    desc: 'Aislar completamente con bolsa, asegurando sellar el lente y soporte sin afectar su posición.',
    image: { src: null, label: 'Componente' },
  },
  {
    name: 'Chumaceras',
    desc: 'Evitar dirigir agua directamente sobre el componente.',
    image: { src: null, label: 'Componente' },
  },
  {
    name: 'Cabezales de impresion',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: null, label: 'Componente' },
  },
  {
    name: 'Impresoras',
    desc: 'Cubrir completamente con bolsa y asegurar para evitar humedad interna.',
    image: { src: null, label: 'Componente' },
  },
];

export const SECTIONS = [
  { id: 'intro', text: 'Propósito del Protocolo' },
  { id: 'tabla', text: 'Inventario Completo' },
  { id: 'sec1', text: 'Sección 1 (Entrada)' },
  { id: 'sec2', text: 'Sección 2 (Sellado)' },
];
