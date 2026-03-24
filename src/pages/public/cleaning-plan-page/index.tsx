import * as React from 'react';
import { useContext, useState, useEffect } from 'react';
import { AppContent } from '@/context/AppContext';

import {
  Button,
  Container,
  SpaceBetween,
  Box,
  Grid,
  Icon,
  TopNavigation,
  Flashbar,
  Table,
} from '@cloudscape-design/components';

// ==========================================
// DATOS MOCK
// ==========================================

const motorsData = [
  {
    location: 'Línea de Envasado A',
    type: 'Motor Trifásico 5HP',
    protection: 'Bolsa plástica calibre 6 + Cinta industrial',
  },
  {
    location: 'Banda Transportadora 2',
    type: 'Servomotor',
    protection: 'Película estirable (Playo) 3 capas',
  },
  {
    location: 'Mezcladora Principal',
    type: 'Motor 10HP',
    protection: 'Cubierta de lona impermeable a medida',
  },
];

const tvsData = [
  {
    location: 'Sala de Control',
    type: 'Pantalla 50"',
    protection: 'Funda acolchada anti-polvo',
  },
  {
    location: 'Pasillo de Producción',
    type: 'Monitor HMI',
    protection: 'Gabinete IP65 cerrado durante limpieza',
  },
];

const lamparasData = [
  {
    location: 'Techos y Pasillos',
    type: 'Lámparas IP65',
    protection: 'Limpieza con paño húmedo. Nunca dirigir chorro hacia arriba.',
  },
  {
    location: 'Columnas',
    type: 'Centros de Carga / Conectores',
    protection: 'Uso obligatorio de extensiones herméticas. Sellar bordes.',
  },
  {
    location: 'Paredes / Zonas Bajas',
    type: 'Tomacorrientes Industriales',
    protection: 'Bajar tapa de resorte y verificar empaque de goma interno.',
  },
];

const motorImages = [
  {
    src: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=1000&auto=format&fit=crop',
    title: 'Protección de Motores',
    desc: 'Cubrir totalmente la carcasa y ventilas antes de aplicar agua.',
  },
  {
    src: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=1000&auto=format&fit=crop',
    title: 'Sellado de Cables',
    desc: 'Asegurar que las conexiones eléctricas no queden expuestas.',
  },
  {
    src: 'https://plus.unsplash.com/premium_photo-1661963212517-830bbb12e31e?q=80&w=1000&auto=format&fit=crop',
    title: 'Inspección Final',
    desc: 'Verificar sellado antes de iniciar el lavado a presión.',
  },
];

const tvImages = [
  {
    src: 'https://images.unsplash.com/photo-1593784697956-141c03410c58?q=80&w=1000&auto=format&fit=crop',
    title: 'Monitores HMI',
    desc: 'Utilizar cubiertas rígidas si están expuestos a salpicaduras.',
  },
  {
    src: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop',
    title: 'Pantallas Informativas',
    desc: 'Desconectar energía antes de limpiar alrededores.',
  },
];

const lamparasImages = [
  {
    src: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b6?q=80&w=1000&auto=format&fit=crop',
    title: 'Iluminación Superior',
    desc: 'Las luminarias tienen protección contra salpicaduras, pero no resisten inyección directa de agua.',
  },
  {
    src: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop',
    title: 'Cajas de Conexión',
    desc: 'Asegurar el uso de extensiones de caja y corroborar que los empalmes estén aislados.',
  },
];

const mondini2Images = [
  {
    src: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop',
    title: 'Mondini 2 - Estructura',
    desc: 'Asegurar paro total antes de aislar el sensor amarillo y el tablero.',
  },
  {
    src: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?q=80&w=1000&auto=format&fit=crop',
    title: 'Zona de Dosificación',
    desc: 'Proteger panel de jarabe, torreta y botonera minuciosamente.',
  },
];

const mondini3Images = [
  {
    src: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=1000&auto=format&fit=crop',
    title: 'Mondini 3 - Puntos Críticos',
    desc: 'Identificar el sensor naranja principal y aislar conectores expuestos.',
  },
  {
    src: 'https://images.unsplash.com/photo-1611078485233-14eb02377b75?q=80&w=1000&auto=format&fit=crop',
    title: 'Tracción Principal',
    desc: 'Validar colores y sellar completamente las cajas de conexiones inferiores.',
  },
];

const mondini6Images = [
  {
    src: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=1000&auto=format&fit=crop',
    title: 'Mondini 6 - Arquitectura',
    desc: 'Validar diferencias estructurales respecto a las líneas 2 y 3.',
  },
  {
    src: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1000&auto=format&fit=crop',
    title: 'Módulo de Sellado',
    desc: 'Evitar inyección directa de agua en los servomotores de salida y arneses.',
  },
];

// Menú lateral
const SECTIONS = [
  { id: 'overview', text: 'Overview del Plan' },
  { id: 'motors', text: 'Motores Generales' },
  { id: 'televisions', text: 'Televisores y HMI' },
  { id: 'lamparas', text: 'Lámparas y Conectores' },
  { id: 'mondini2', text: 'Línea Mondini 2' },
  { id: 'mondini3', text: 'Línea Mondini 3' },
  { id: 'mondini6', text: 'Línea Mondini 6' },
];

// ==========================================
// COMPONENTES UI PERSONALIZADOS
// ==========================================

const SectionTitle = ({
  title,
  subtitle,
  isDark,
}: {
  title: string;
  subtitle?: string;
  isDark: boolean;
}) => (
  <div
    style={{
      marginBottom: '32px',
      borderBottom: `2px solid ${isDark ? '#414d5c' : '#eaeded'}`,
      paddingBottom: '16px',
    }}
  >
    <h2
      style={{
        fontSize: '38px',
        fontWeight: '900',
        color: isDark ? '#ffffff' : '#16191f',
        margin: '0 0 12px 0',
        letterSpacing: '-0.5px',
        fontFamily: '"Amazon Ember Display", "Helvetica Neue", sans-serif',
      }}
    >
      {title}
    </h2>
    {subtitle && (
      <p
        style={{
          fontSize: '18px',
          color: isDark ? '#aab7b8' : '#545b64',
          margin: 0,
          lineHeight: '1.5',
        }}
      >
        {subtitle}
      </p>
    )}
  </div>
);

const CustomCarousel = ({
  images,
  isDark,
}: {
  images: any[];
  isDark: boolean;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  const controlBarStyle = {
    backgroundColor: isDark
      ? 'rgba(22, 25, 31, 0.9)'
      : 'rgba(255, 255, 255, 0.95)',
    color: isDark ? '#ffffff' : '#16191f',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '450px',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        marginBottom: '32px',
      }}
    >
      {images.map((img, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: index === currentIndex ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
            zIndex: 1,
          }}
        >
          <img
            src={img.src}
            alt={img.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background:
                'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)',
            }}
          ></div>
        </div>
      ))}

      <div
        style={{
          position: 'absolute',
          bottom: '50px',
          left: '50px',
          zIndex: 10,
          color: '#fff',
          maxWidth: '600px',
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(4px)',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '13px',
            fontFamily: 'monospace',
            display: 'inline-block',
            marginBottom: '16px',
            fontWeight: 'bold',
          }}
        >
          VISTA {currentIndex + 1}
        </div>
        <h2
          style={{
            fontSize: '48px',
            fontWeight: '900',
            margin: '0 0 16px 0',
            textTransform: 'uppercase',
            fontFamily: 'Impact, sans-serif',
            lineHeight: '1',
          }}
        >
          {images[currentIndex].title}
        </h2>
        <p
          style={{
            fontSize: '18px',
            lineHeight: '1.5',
            margin: '0',
            fontWeight: '500',
            color: '#e2e8f0',
          }}
        >
          {images[currentIndex].desc}
        </p>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '40px',
          right: '50px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '10px 20px',
          borderRadius: '30px',
          ...controlBarStyle,
        }}
      >
        <button
          onClick={prevSlide}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            display: 'flex',
          }}
        >
          <Icon name={'angle-left' as any} variant="normal" />
        </button>
        <span style={{ fontSize: '15px', fontWeight: 'bold' }}>
          {currentIndex + 1} / {images.length}
        </span>
        <button
          onClick={nextSlide}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            display: 'flex',
          }}
        >
          <Icon name={'angle-right' as any} variant="normal" />
        </button>
      </div>
    </div>
  );
};

const ObservationContainer = ({
  title,
  content,
  isDark,
}: {
  title: string;
  content: string;
  isDark: boolean;
}) => (
  <div
    style={{
      borderLeft: `4px solid ${isDark ? '#44b9d6' : '#0073bb'}`,
      backgroundColor: isDark ? 'rgba(68, 185, 214, 0.1)' : '#f1faff',
      padding: '24px',
      borderRadius: '0 8px 8px 0',
      marginTop: '24px',
    }}
  >
    <h4
      style={{
        margin: '0 0 10px 0',
        color: isDark ? '#fff' : '#16191f',
        fontSize: '18px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <Icon
        name={'status-info' as any}
        variant={isDark ? 'inverted' : 'normal'}
      />{' '}
      {title}
    </h4>
    <p
      style={{
        margin: 0,
        color: isDark ? '#d1d5db' : '#545b64',
        fontSize: '15px',
        lineHeight: '1.6',
      }}
    >
      {content}
    </p>
  </div>
);

export default function CleaningPlanPage() {
  const context = useContext(AppContent);
  if (!context) return null;
  const { isDark } = context;

  const [activeSection, setActiveSection] = React.useState('overview');

  const colors = {
    bgPage: isDark ? '#0f1b2a' : '#ffffff',
    bgHeader: '#16191f',
    textMain: isDark ? '#fbfbfb' : '#16191f',
    textSecondary: isDark ? '#aab7b8' : '#545b64',
    border: isDark ? '#414d5c' : '#eaeded',
    activeLink: '#0972d3',
  };

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 250;
      let currentSection = SECTIONS[0].id;
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition) {
          currentSection = section.id;
        }
      }
      setActiveSection(currentSection);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 180;
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.bgPage,
        color: colors.textMain,
        fontFamily:
          '"Amazon Ember", "Helvetica Neue", Roboto, Arial, sans-serif',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      {/* 1. TOP NAVIGATION */}
      <div style={{ position: 'sticky', top: 0, zIndex: 1002, width: '100%' }}>
        <TopNavigation
          identity={{
            href: '#',
            title: 'QuickFind',
            logo: {
              src: 'https://d1.awsstatic.com/webteam/nav/global-nav-logos/aws-logo-white.png',
              alt: 'Logo',
            },
          }}
          utilities={[]}
        />
      </div>

      {/* 2. HEADER */}
      <div style={{ backgroundColor: colors.bgHeader, width: '100%' }}>
        <div
          style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}
        >
          <div style={{ paddingTop: '20px' }}>
            <Flashbar
              items={[
                {
                  type: 'warning',
                  dismissible: true,
                  content: (
                    <Box fontSize="body-s">
                      <strong>Precaución (LOTO):</strong> Asegúrese de
                      desconectar la energía eléctrica general antes de iniciar
                      cualquier procedimiento de limpieza con agua.
                    </Box>
                  ),
                  id: 'message_safety',
                },
              ]}
            />
          </div>

          <div style={{ padding: '30px 0 50px 0', color: '#ffffff' }}>
            <nav
              aria-label="Breadcrumb"
              style={{ marginBottom: '16px', fontSize: '14px' }}
            >
              <span style={{ color: '#879596' }}>Mantenimiento</span>{' '}
              <span style={{ margin: '0 8px', color: '#879596' }}>/</span>{' '}
              <span style={{ color: '#fbfbfb' }}>Protocolos de Limpieza</span>
            </nav>

            <Grid
              gridDefinition={[
                { colspan: { default: 12, s: 8 } },
                { colspan: { default: 12, s: 4 } },
              ]}
            >
              <div>
                <h1
                  style={{
                    fontSize: '40px',
                    fontWeight: '900',
                    margin: '0 0 16px 0',
                    color: '#ffffff',
                    letterSpacing: '-0.5px',
                  }}
                >
                  Plan de Limpieza: Puntos Críticos
                </h1>
                <p
                  style={{
                    fontSize: '18px',
                    lineHeight: '28px',
                    color: '#d1d5db',
                    maxWidth: '800px',
                    marginBottom: '24px',
                  }}
                >
                  Guía estandarizada para el cubrimiento y protección de
                  componentes sensibles (motores, paneles, pantallas) durante
                  las actividades de saneamiento para prevenir fallas por
                  humedad.
                </p>
                <div style={{ fontSize: '15px', color: '#d1d5db' }}>
                  Responsable:{' '}
                  <span style={{ color: '#44b9d6', fontWeight: 'bold' }}>
                    Equipo de Mantenimiento
                  </span>
                </div>
              </div>
              <Box float="right">
                <div style={{ width: '100%', maxWidth: '300px' }}>
                  <SpaceBetween size="m" direction="vertical">
                    <Button variant="primary" fullWidth>
                      Descargar Checklist PDF
                    </Button>
                    <button
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        backgroundColor: 'transparent',
                        border: '1px solid #ffffff',
                        borderRadius: '24px',
                        color: '#ffffff',
                        fontWeight: '700',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s',
                      }}
                    >
                      Reportar Incidencia
                    </button>
                  </SpaceBetween>
                </div>
              </Box>
            </Grid>
          </div>
        </div>
      </div>

      {/* 3. CONTENIDO PRINCIPAL */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '60px 40px',
          color: colors.textMain,
        }}
      >
        <Grid
          gridDefinition={[
            { colspan: { default: 12, s: 9, m: 10 } },
            { colspan: { default: 12, s: 3, m: 2 } },
          ]}
        >
          {/* --- COLUMNA IZQUIERDA (CONTENIDO) --- */}
          <div style={{ paddingRight: '40px' }}>
            {/* OVERVIEW */}
            <div id="overview" style={{ marginBottom: '100px' }}>
              <SectionTitle
                title="Overview General"
                subtitle="Principios básicos para la preservación de equipos durante el saneamiento."
                isDark={isDark}
              />
              <div
                style={{
                  fontSize: '18px',
                  lineHeight: '1.6',
                  color: colors.textMain,
                }}
              >
                <p>
                  La limpieza profunda de los equipos industriales conlleva el
                  uso de agua a presión y químicos desengrasantes. Sin embargo,
                  la principal causa de paros no programados post-limpieza es la
                  entrada de agua en componentes electrónicos o
                  electromecánicos.
                </p>
                <p>
                  Este plan detalla{' '}
                  <strong>
                    la forma correcta de aislar todos los componentes eléctricos
                    perimetrales
                  </strong>{' '}
                  (lámparas, televisores, motores, conectores), así como la
                  estructura específica de protección para cada línea de
                  envasado (Mondini). El objetivo es garantizar un arranque
                  vertical sin incidencias y proteger la seguridad del personal.
                </p>
              </div>
            </div>

            {/* MOTORES */}
            <div id="motors" style={{ marginBottom: '100px' }}>
              <SectionTitle
                title="Motores y Chumaceras"
                subtitle="Aislamiento obligatorio de actuadores de movimiento perimetrales e internos."
                isDark={isDark}
              />
              <Container>
                <Table
                  variant="embedded"
                  columnDefinitions={[
                    {
                      id: 'location',
                      header: 'Ubicación',
                      cell: (e) => e.location,
                      width: 250,
                      isRowHeader: true,
                    },
                    {
                      id: 'type',
                      header: 'Tipo de Equipo',
                      cell: (e) => e.type,
                      width: 250,
                    },
                    {
                      id: 'protection',
                      header: 'Método de Protección',
                      cell: (e) => e.protection,
                    },
                  ]}
                  items={motorsData}
                />
              </Container>
              <Box margin={{ top: 'xl' }}>
                <CustomCarousel images={motorImages} isDark={isDark} />
              </Box>
              <ObservationContainer
                title="Procedimiento Crítico - Motores"
                content="Nunca utilice bolsas rotas. Asegúrese de hacer un 'nudo ciego' en la parte inferior del motor para evitar que el agua escurra hacia adentro. Si el motor tiene ventilador externo, cubra las rejillas con doble capa de plástico grueso."
                isDark={isDark}
              />
            </div>

            {/* TELEVISORES */}
            <div id="televisions" style={{ marginBottom: '100px' }}>
              <SectionTitle
                title="Televisores y Monitores HMI"
                subtitle="Resguardo de interfaces visuales e indicadores de sala."
                isDark={isDark}
              />
              <Container>
                <Table
                  variant="embedded"
                  columnDefinitions={[
                    {
                      id: 'location',
                      header: 'Área',
                      cell: (e) => e.location,
                      width: 250,
                    },
                    {
                      id: 'type',
                      header: 'Dispositivo',
                      cell: (e) => e.type,
                      width: 250,
                    },
                    {
                      id: 'protection',
                      header: 'Protección',
                      cell: (e) => e.protection,
                    },
                  ]}
                  items={tvsData}
                />
              </Container>
              <Box margin={{ top: 'xl' }}>
                <CustomCarousel images={tvImages} isDark={isDark} />
              </Box>
              <ObservationContainer
                title="Protocolo HMI"
                content="Verifique que el gabinete de las pantallas esté perfectamente cerrado. Si el sello de goma de la puerta está dañado o reseco, no aplique agua a presión en esa zona y levante un ticket a mantenimiento. Use paños anti-estáticos y desengrasante manual."
                isDark={isDark}
              />
            </div>

            {/* LÁMPARAS Y CONECTORES */}
            <div id="lamparas" style={{ marginBottom: '100px' }}>
              <SectionTitle
                title="Lámparas y Conectores de Corriente"
                subtitle="Instalaciones eléctricas de infraestructura y pasillos."
                isDark={isDark}
              />
              <Container>
                <Table
                  variant="embedded"
                  columnDefinitions={[
                    {
                      id: 'location',
                      header: 'Ubicación',
                      cell: (e) => e.location,
                      width: 250,
                    },
                    {
                      id: 'type',
                      header: 'Componente',
                      cell: (e) => e.type,
                      width: 250,
                    },
                    {
                      id: 'protection',
                      header: 'Protección',
                      cell: (e) => e.protection,
                    },
                  ]}
                  items={lamparasData}
                />
              </Container>
              <Box margin={{ top: 'xl' }}>
                <CustomCarousel images={lamparasImages} isDark={isDark} />
              </Box>
              <ObservationContainer
                title="Precaución en Trabajos en Altura y Eléctricos"
                content="Es terminantemente prohibido dirigir la hidrolavadora en ángulo ascendente hacia las luminarias. Adicionalmente, todo centro de carga debe ser conectado utilizando extensiones herméticas industriales; el uso de conectores convencionales sin empaque provocará un cortocircuito inminente."
                isDark={isDark}
              />
            </div>

            {/* SEPARADOR VISUAL FUERTE PARA MÁQUINAS */}
            <div
              style={{
                height: '2px',
                backgroundColor: colors.border,
                marginBottom: '100px',
              }}
            ></div>

            {/* MONDINI 2 */}
            <div id="mondini2" style={{ marginBottom: '100px' }}>
              <SectionTitle
                title="Empacadora Mondini 2"
                subtitle="Protocolo de intervención segura y protección electromecánica."
                isDark={isDark}
              />
              <p
                style={{
                  fontSize: '18px',
                  lineHeight: '1.6',
                  marginBottom: '32px',
                  color: colors.textSecondary,
                }}
              >
                Este plan de limpieza tiene como propósito principal garantizar
                que, durante las labores de saneamiento o cualquier intervención
                operativa, se evite toda situación de riesgo eléctrico o
                mecánico. Para la línea <strong>Mondini 2</strong>, se detalla
                la manera correcta de aislar y cubrir cada componente crítico,
                como el banco de sensores (de carcasa amarilla) y el panel de
                dosificación. Cabe destacar que su arquitectura y distribución
                de componentes son casi idénticas a las de la Mondini 3, por lo
                que comparten la mayor parte de las directrices de protección en
                planta.
              </p>
              <CustomCarousel images={mondini2Images} isDark={isDark} />
              <Box margin={{ top: 'xl' }}>
                <Button
                  variant="primary"
                  iconName={'external' as any}
                  iconAlign="right"
                >
                  Ver Componentes - Mondini 2
                </Button>
              </Box>
            </div>

            {/* MONDINI 3 */}
            <div id="mondini3" style={{ marginBottom: '100px' }}>
              <SectionTitle
                title="Empacadora Mondini 3"
                subtitle="Protocolo de intervención segura y protección electromecánica."
                isDark={isDark}
              />
              <p
                style={{
                  fontSize: '18px',
                  lineHeight: '1.6',
                  marginBottom: '32px',
                  color: colors.textSecondary,
                }}
              >
                Al igual que su contraparte, el objetivo central de este
                protocolo en la <strong>Mondini 3</strong> es proveer las
                instrucciones exactas para cubrir adecuadamente cada elemento
                sensible y prevenir riesgos durante el lavado a presión y las
                tareas de saneamiento profundo. Aunque esta empacadora es casi
                idéntica en cantidad y tipo de componentes a la Mondini 2,
                presenta variaciones específicas, como el sensor de
                enclavamiento principal (color naranja) y la servotransmisión,
                los cuales requieren una técnica de sellado hermético
                particular.
              </p>
              <CustomCarousel images={mondini3Images} isDark={isDark} />
              <Box margin={{ top: 'xl' }}>
                <Button
                  variant="primary"
                  iconName={'external' as any}
                  iconAlign="right"
                >
                  Ver Componentes - Mondini 3
                </Button>
              </Box>
            </div>

            {/* MONDINI 6 */}
            <div id="mondini6" style={{ marginBottom: '40px' }}>
              <SectionTitle
                title="Empacadora Mondini 6"
                subtitle="Protocolo de intervención segura y protección electromecánica."
                isDark={isDark}
              />
              <p
                style={{
                  fontSize: '18px',
                  lineHeight: '1.6',
                  marginBottom: '32px',
                  color: colors.textSecondary,
                }}
              >
                El propósito de evitar situaciones de riesgo durante el
                saneamiento se mantiene inalterable para la línea{' '}
                <strong>Mondini 6</strong>. Es fundamental estandarizar la
                cobertura de los elementos mediante bolsas y empaques antes de
                inyectar agua. Esta empacadora opera con una mayor capacidad de
                producción, lo que se traduce en una distribución estructural
                ligeramente más extensa y un mayor número de actuadores. Las
                directrices dispuestas aquí aseguran que toda esa
                instrumentación y los servomotores adicionales queden
                perfectamente resguardados.
              </p>
              <CustomCarousel images={mondini6Images} isDark={isDark} />
              <Box margin={{ top: 'xl' }}>
                <Button
                  variant="primary"
                  iconName={'external' as any}
                  iconAlign="right"
                >
                  Ver Componentes - Mondini 6
                </Button>
              </Box>
            </div>
          </div>

          {/* --- COLUMNA DERECHA (STICKY NAV) --- */}
          <div
            style={{ height: '100%', borderLeft: `1px solid ${colors.border}` }}
          >
            <div
              style={{ position: 'sticky', top: '120px', paddingLeft: '20px' }}
            >
              <SpaceBetween size="l">
                <div>
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      marginBottom: '10px',
                      color: colors.textMain,
                    }}
                  >
                    On this page
                  </h3>
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      borderLeft: `2px solid ${colors.border}`,
                    }}
                  >
                    {SECTIONS.map((section) => (
                      <li key={section.id} style={{ margin: 0 }}>
                        <a
                          href={`#${section.id}`}
                          onClick={(e) => scrollToSection(e, section.id)}
                          style={{
                            display: 'block',
                            padding: '6px 16px',
                            textDecoration: 'none',
                            fontSize: '14px',
                            color:
                              activeSection === section.id
                                ? colors.activeLink
                                : colors.textSecondary,
                            fontWeight:
                              activeSection === section.id ? '700' : '400',
                            borderLeft:
                              activeSection === section.id
                                ? `2px solid ${colors.activeLink}`
                                : '2px solid transparent',
                            marginLeft: '-2px',
                            transition: 'all 0.1s',
                          }}
                        >
                          {section.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  style={{ height: '1px', backgroundColor: colors.border }}
                ></div>

                <div>
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      marginBottom: '10px',
                      color: colors.textMain,
                    }}
                  >
                    ¿Fue útil este plan?
                  </h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Button iconName={'thumbs-up' as any}>Sí</Button>
                    <Button iconName={'thumbs-down' as any}>No</Button>
                  </div>
                </div>
              </SpaceBetween>
            </div>
          </div>
        </Grid>
      </div>
    </div>
  );
}
