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
  Header,
} from '@cloudscape-design/components';

// ==========================================
// IMPORTACIONES
// ==========================================
import { Footer } from '@/components/layouts/AppFooter';
import logoSistema from '@/assets/icons/logo-2.svg';

// --- IMPORTACIONES DE IMÁGENES (Ajusta las rutas a tus archivos locales y descomenta) ---

// import imgMotor1 from '@/assets/cleaning-plan-page/general/motor1.png';
// import imgMotor2 from '@/assets/cleaning-plan-page/general/motor2.png';

// import imgTv1 from '@/assets/cleaning-plan-page/general/tv1.png';
// import imgTv2 from '@/assets/cleaning-plan-page/general/tv2.png';

// import imgLamp1 from '@/assets/cleaning-plan-page/general/lamp1.png';
// import imgLamp2 from '@/assets/cleaning-plan-page/general/lamp2.png';

// import imgMondini2_1 from '@/assets/cleaning-plan-page/general/mondini2_1.png';
// import imgMondini2_2 from '@/assets/cleaning-plan-page/general/mondini2_2.png';

// import imgMondini3_1 from '@/assets/cleaning-plan-page/general/mondini3_1.png';
// import imgMondini3_2 from '@/assets/cleaning-plan-page/general/mondini3_2.png';

// import imgMondini6_1 from '@/assets/cleaning-plan-page/general/mondini6_1.png';
// import imgMondini6_2 from '@/assets/cleaning-plan-page/general/mondini6_2.png';

// ==========================================
// DATOS DE INFRAESTRUCTURA GENERAL
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

// Arreglos de Imágenes (Descomenta la variable src cuando tengas el import activo)
const motorImages = [
  {
    src: null /* imgMotor1 */,
    title: 'Protección de Motores',
    desc: 'Cubrir totalmente la carcasa y ventilas antes de aplicar agua.',
  },
  {
    src: null /* imgMotor2 */,
    title: 'Sellado de Cables',
    desc: 'Asegurar que las conexiones eléctricas no queden expuestas.',
  },
];

const tvImages = [
  {
    src: null /* imgTv1 */,
    title: 'Monitores HMI',
    desc: 'Utilizar cubiertas rígidas si están expuestos a salpicaduras.',
  },
  {
    src: null /* imgTv2 */,
    title: 'Pantallas Informativas',
    desc: 'Desconectar energía antes de limpiar alrededores.',
  },
];

const lamparasImages = [
  {
    src: null /* imgLamp1 */,
    title: 'Iluminación Superior',
    desc: 'Las luminarias tienen protección contra salpicaduras, pero no resisten inyección directa de agua.',
  },
  {
    src: null /* imgLamp2 */,
    title: 'Cajas de Conexión',
    desc: 'Asegurar el uso de extensiones de caja y corroborar que los empalmes estén aislados.',
  },
];

const mondini2Images = [
  {
    src: null /* imgMondini2_1 */,
    title: 'Mondini 2 - Estructura',
    desc: 'Asegurar paro total antes de aislar el sensor amarillo y el tablero.',
  },
  {
    src: null /* imgMondini2_2 */,
    title: 'Zona de Dosificación',
    desc: 'Proteger panel de jarabe, torreta y botonera minuciosamente.',
  },
];

const mondini3Images = [
  {
    src: null /* imgMondini3_1 */,
    title: 'Mondini 3 - Puntos Críticos',
    desc: 'Identificar el sensor naranja principal y aislar conectores expuestos.',
  },
  {
    src: null /* imgMondini3_2 */,
    title: 'Tracción Principal',
    desc: 'Validar colores y sellar completamente las cajas de conexiones inferiores.',
  },
];

const mondini6Images = [
  {
    src: null /* imgMondini6_1 */,
    title: 'Mondini 6 - Arquitectura',
    desc: 'Validar diferencias estructurales respecto a las líneas 2 y 3.',
  },
  {
    src: null /* imgMondini6_2 */,
    title: 'Módulo de Sellado',
    desc: 'Evitar inyección directa de agua en los servomotores de salida y arneses.',
  },
];

// Menú de navegación
const SECTIONS = [
  { id: 'overview', text: 'Overview del Plan' },
  { id: 'motors', text: 'Motores Generales' },
  { id: 'televisions', text: 'Televisores y HMI' },
  { id: 'lamparas', text: 'Lámparas y Conectores' },
  { id: 'mondinis', text: 'Líneas de Producción' },
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
    className="section-title-container"
    style={{
      borderBottom: `2px solid ${isDark ? '#414d5c' : '#eaeded'}`,
      marginBottom: '24px',
      paddingBottom: '16px',
    }}
  >
    <h2
      className="section-title"
      style={{
        fontWeight: '900',
        color: isDark ? '#ffffff' : '#16191f',
        letterSpacing: '-0.5px',
        fontSize: '24px',
        margin: 0,
      }}
    >
      {title}
    </h2>
    {subtitle && (
      <p
        className="section-subtitle"
        style={{
          color: isDark ? '#aab7b8' : '#545b64',
          marginTop: '8px',
          fontSize: '14px',
        }}
      >
        {subtitle}
      </p>
    )}
  </div>
);

// Carrusel estilizado AWS
const CustomCarousel = ({
  images,
  isDark,
}: {
  images: any[];
  isDark: boolean;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images?.length]);

  if (!images || images.length === 0) return null;

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

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
        backgroundColor: isDark ? '#232f3e' : '#f8f8f8',
        border: `1px solid ${isDark ? '#414d5c' : '#eaeded'}`,
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
          {img.src ? (
            <img
              src={img.src}
              alt={img.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.9,
              }}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                color: isDark ? '#687078' : '#879596',
              }}
            >
              <SpaceBetween size="xs" direction="vertical" alignItems="center">
                {/* CORRECCIÓN: Agregado el cast a any para silenciar el error de TypeScript */}
                <Icon
                  name={'camera' as any}
                  size="large"
                  variant={isDark ? 'subtle' : 'normal'}
                />
                <span>Sin imagen disponible</span>
              </SpaceBetween>
            </div>
          )}
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

      {images.length > 1 && (
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
            backgroundColor: isDark
              ? 'rgba(22, 25, 31, 0.9)'
              : 'rgba(255, 255, 255, 0.95)',
            color: isDark ? '#ffffff' : '#16191f',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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
      )}
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
  const isDark = context ? context.isDark : false;

  const [activeSection, setActiveSection] = useState('overview');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [flashbarItems, setFlashbarItems] = useState<any[]>([
    {
      type: 'warning',
      dismissible: true,
      onDismiss: () => handleDismiss('msg_loto_main'),
      content: (
        <Box fontSize="body-s">
          <strong>Precaución (LOTO):</strong> Asegúrese de aplicar normativa
          LOTO antes de cualquier limpieza con agua.
        </Box>
      ),
      id: 'msg_loto_main',
    },
  ]);

  const handleDismiss = (idToRemove: string) => {
    setFlashbarItems((items) => items.filter((item) => item.id !== idToRemove));
  };

  const handleDownloadChecklist = () => {
    const newMsgId = `pdf-export-${Date.now()}`;
    setFlashbarItems((prev) => [
      {
        type: 'info',
        loading: true,
        content: 'Generando checklist general, por favor espere...',
        id: newMsgId,
        dismissible: false,
      },
      ...prev,
    ]);

    setTimeout(() => {
      setFlashbarItems((prev) =>
        prev.map((item) =>
          item.id === newMsgId
            ? {
                type: 'success',
                content: 'Checklist descargado con éxito.',
                id: newMsgId,
                dismissible: true,
                onDismiss: () => handleDismiss(newMsgId),
              }
            : item,
        ),
      );
    }, 2000);
  };

  const colors = {
    bgPage: isDark ? '#0f1b2a' : '#ffffff',
    bgHeader: '#16191f',
    textMain: isDark ? '#fbfbfb' : '#16191f',
    textSecondary: isDark ? '#aab7b8' : '#545b64',
    border: isDark ? '#414d5c' : '#eaeded',
    activeLink: '#0972d3',
    fabBg: isDark ? '#ffffff' : '#16191f',
    fabIcon: isDark ? '#16191f' : '#ffffff',
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 300;
      let currentSection = SECTIONS[0].id;
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition)
          currentSection = section.id;
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
      window.scrollTo({
        top: element.getBoundingClientRect().top + window.scrollY - 100,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.bgPage,
        color: colors.textMain,
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'clip',
        width: '100%',
        maxWidth: '100%',
      }}
    >
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes slowFadeIn { 0% { opacity: 0; transform: scale(0.98); } 100% { opacity: 1; transform: scale(1); } }
        .slow-transition-fade { animation: slowFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .flex-container { display: flex; flex-direction: row; max-width: 1400px; margin: 0 auto; padding: 60px 40px; gap: 60px; width: 100%; box-sizing: border-box; }
        .flex-content { flex: 1; min-width: 0; }
        .flex-sidebar { width: 280px; flex-shrink: 0; border-left: 1px solid ${colors.border}; padding-left: 40px; }
        .sticky-nav-inner { position: sticky; top: 120px; height: calc(100vh - 140px); overflow-y: auto; }
        .section-wrap { margin-bottom: 120px; width: 100%; }
        
        .hero-title { font-size: 40px !important; line-height: 1.3 !important; margin-bottom: 20px !important; }
        .hero-header-wrap { padding: 40px 40px 60px 40px; position: relative; }
        
        .mobile-fab { display: none !important; }
        .mobile-menu-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(10, 15, 20, 0.95); backdrop-filter: blur(16px); z-index: 10005; display: flex; flex-direction: column; padding: 50px 30px; opacity: 0; pointer-events: none; transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .mobile-menu-overlay.open { opacity: 1; pointer-events: auto; }
        .close-menu-btn { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff !important; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .close-menu-btn:hover { background: rgba(255, 255, 255, 0.25); transform: rotate(90deg); }
        .mobile-menu-item { opacity: 0; transform: translateY(-20px); transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .mobile-menu-overlay.open .mobile-menu-item { opacity: 1; transform: translateY(0); }
        .mobile-link { transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), color 0.3s ease; display: block; padding: 12px 0; }
        .mobile-link:hover { transform: translateX(12px); color: #ffffff !important; }

        @media screen and (max-width: 1080px) {
          .flex-sidebar { display: none !important; }
          .flex-container { padding: 30px 15px; flex-direction: column; gap: 0; overflow-x: hidden; }
          .section-wrap { margin-bottom: 80px; }
          .hero-header-wrap { padding: 30px 20px 40px 20px !important; }
          .hero-title { font-size: 28px !important; line-height: 1.4 !important; margin-bottom: 12px !important; display: block !important; }
          .section-title-container { margin-bottom: 30px !important; padding-bottom: 15px !important; }
          .section-title { font-size: 24px !important; line-height: 1.4 !important; margin-bottom: 8px !important; display: block !important; }
          
          .mobile-fab { display: flex !important; position: fixed !important; bottom: 80px !important; right: 24px !important; width: 52px !important; height: 52px !important; border-radius: 50% !important; background-color: ${colors.fabBg} !important; color: ${colors.fabIcon} !important; box-shadow: 0 4px 16px rgba(0,0,0,0.4) !important; z-index: 99999 !important; cursor: pointer !important; align-items: center !important; justify-content: center !important; border: 1px solid rgba(128,128,128,0.2) !important; transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s !important; }
          .mobile-fab.hidden { transform: scale(0) !important; opacity: 0 !important; pointer-events: none !important; }
        }
        .text-normal { font-size: 15px; line-height: 1.6; color: ${colors.textMain}; }
      `}</style>

      {/* MENÚ MÓVIL */}
      <div className={`mobile-menu-overlay ${showMobileMenu ? 'open' : ''}`}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '50px',
          }}
        >
          <h2
            style={{
              color: '#ffffff',
              margin: 0,
              fontSize: '26px',
              fontWeight: '900',
              letterSpacing: '-0.5px',
            }}
          >
            Menú Rápido
          </h2>
          <button
            className="close-menu-btn"
            onClick={() => setShowMobileMenu(false)}
            aria-label="Cerrar menú"
          >
            <Icon
              name={'close' as any}
              size="normal"
              variant={'inherit' as any}
            />
          </button>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, flexGrow: 1 }}>
          {SECTIONS.map((section) => (
            <li
              key={`mob-${section.id}`}
              className="mobile-menu-item"
              style={{ marginBottom: '16px' }}
            >
              <a
                href={`#${section.id}`}
                className="mobile-link"
                onClick={(e) => {
                  scrollToSection(e, section.id);
                  setShowMobileMenu(false);
                }}
                style={{
                  color: activeSection === section.id ? '#44b9d6' : '#aab7b8',
                  fontSize: '22px',
                  textDecoration: 'none',
                  fontWeight: activeSection === section.id ? '900' : '500',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                {section.text}
              </a>
            </li>
          ))}
        </ul>
        <div
          className="mobile-menu-item"
          style={{
            marginTop: 'auto',
            paddingBottom: '30px',
            transitionDelay: '0.4s',
          }}
        >
          <Button
            iconName={'status-warning' as any}
            variant={'primary' as any}
            fullWidth
          >
            Levantar Ticket de Falla
          </Button>
        </div>
      </div>

      <button
        className={`mobile-fab ${showMobileMenu ? 'hidden' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowMobileMenu(true);
        }}
      >
        <svg
          style={{ pointerEvents: 'none' }}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="4" y1="12" x2="20" y2="12"></line>
          <line x1="4" y1="6" x2="20" y2="6"></line>
          <line x1="4" y1="18" x2="20" y2="18"></line>
        </svg>
      </button>

      {/* TOP NAV */}
      <div style={{ position: 'sticky', top: 0, zIndex: 1002, width: '100%' }}>
        <TopNavigation
          identity={{
            href: '#',
            title: 'QuickFind System',
            logo: { src: logoSistema, alt: 'Logo' },
          }}
          utilities={[]}
        />
      </div>

      {/* HERO HEADER */}
      <div style={{ backgroundColor: colors.bgHeader, width: '100%' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* CONTENEDOR DINÁMICO DE NOTIFICACIONES */}
          {flashbarItems.length > 0 && (
            <div style={{ padding: '24px 40px 0 40px' }}>
              <Flashbar items={flashbarItems as any} stackItems={true} />
            </div>
          )}

          <div className="hero-header-wrap" style={{ color: '#ffffff' }}>
            <nav
              aria-label="Breadcrumb"
              style={{ marginBottom: '24px', fontSize: '15px' }}
            >
              <span style={{ color: '#879596' }}>Mantenimiento</span>{' '}
              <span style={{ margin: '0 12px', color: '#879596' }}>/</span>{' '}
              <span style={{ color: '#fbfbfb', fontWeight: 'bold' }}>
                Plan Maestro de Limpieza
              </span>
            </nav>

            <Grid
              gridDefinition={[
                { colspan: { default: 12, l: 9 } },
                { colspan: { default: 12, l: 3 } },
              ]}
            >
              <div>
                <h1
                  className="hero-title"
                  style={{
                    fontWeight: '900',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                  }}
                >
                  Plan de Limpieza: Puntos Críticos
                </h1>

                <p
                  style={{
                    fontSize: '18px',
                    color: '#d1d5db',
                    maxWidth: '800px',
                    lineHeight: '1.6',
                    marginTop: '16px',
                  }}
                >
                  Guía estandarizada para el resguardo de componentes
                  electrónicos y electromecánicos en planta.
                </p>
                <div
                  style={{
                    fontSize: '15px',
                    color: '#d1d5db',
                    marginTop: '16px',
                  }}
                >
                  Responsable:{' '}
                  <span style={{ color: '#44b9d6', fontWeight: 'bold' }}>
                    Equipo de Mantenimiento
                  </span>
                </div>
              </div>

              <div
                className="btn-download-wrap"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  alignItems: 'stretch',
                  justifyContent: 'flex-start',
                  paddingTop: '10px',
                }}
              >
                <Button
                  variant={'primary' as any}
                  iconName={'download' as any}
                  onClick={handleDownloadChecklist}
                  fullWidth
                >
                  Descargar Checklist PDF
                </Button>
                <Button iconName={'status-warning' as any} fullWidth>
                  Reportar Incidencia
                </Button>
              </div>
            </Grid>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-container">
        <div className="flex-content">
          <div id="overview" className="section-wrap">
            <SectionTitle
              title="Overview del Plan"
              subtitle="Principios fundamentales de prevención."
              isDark={isDark}
            />
            <p className="text-normal" style={{ marginBottom: '16px' }}>
              La limpieza profunda de los equipos industriales conlleva el uso
              de agua a presión y químicos desengrasantes. Sin embargo, la
              principal causa de paros no programados post-limpieza es la
              entrada de agua en componentes sensibles. Este catálogo detalla la
              forma correcta de aislar la infraestructura general y las líneas
              específicas.
            </p>
            <p className="text-normal">
              Este plan detalla{' '}
              <strong>
                la forma correcta de aislar todos los componentes eléctricos
                perimetrales
              </strong>{' '}
              (lámparas, televisores, motores, conectores), así como la
              estructura específica de protección para cada línea de envasado
              (Mondini). El objetivo es garantizar un arranque vertical sin
              incidencias y proteger la seguridad del personal.
            </p>
          </div>

          <div id="motors" className="section-wrap">
            <SectionTitle
              title="Motores y Chumaceras"
              subtitle="Aislamiento de actuadores de movimiento."
              isDark={isDark}
            />
            <SpaceBetween size="l">
              <Container>
                <Table
                  variant="embedded"
                  columnDefinitions={[
                    {
                      id: 'loc',
                      header: 'Ubicación',
                      cell: (e) => (
                        <strong style={{ color: colors.activeLink }}>
                          {e.location}
                        </strong>
                      ),
                    },
                    { id: 'typ', header: 'Tipo', cell: (e) => e.type },
                    {
                      id: 'pro',
                      header: 'Protección',
                      cell: (e) => e.protection,
                    },
                  ]}
                  items={motorsData}
                />
              </Container>
              <CustomCarousel images={motorImages} isDark={isDark} />
            </SpaceBetween>
            <ObservationContainer
              title="Procedimiento Crítico - Motores"
              content="Nunca utilice bolsas rotas. Asegúrese de hacer un 'nudo ciego' en la parte inferior del motor para evitar que el agua escurra hacia adentro. Si el motor tiene ventilador externo, cubra las rejillas con doble capa de plástico grueso."
              isDark={isDark}
            />
          </div>

          <div id="televisions" className="section-wrap">
            <SectionTitle
              title="Televisores y Monitores HMI"
              subtitle="Resguardo de interfaces de control."
              isDark={isDark}
            />
            <Container>
              <Table
                variant="embedded"
                columnDefinitions={[
                  {
                    id: 'loc',
                    header: 'Área',
                    cell: (e) => (
                      <strong style={{ color: colors.activeLink }}>
                        {e.location}
                      </strong>
                    ),
                  },
                  { id: 'typ', header: 'Dispositivo', cell: (e) => e.type },
                  {
                    id: 'pro',
                    header: 'Protección Requerida',
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

          <div id="lamparas" className="section-wrap">
            <SectionTitle
              title="Lámparas y Conectores"
              subtitle="Infraestructura eléctrica perimetral."
              isDark={isDark}
            />
            <Container>
              <Table
                variant="embedded"
                columnDefinitions={[
                  {
                    id: 'loc',
                    header: 'Ubicación',
                    cell: (e) => (
                      <strong style={{ color: colors.activeLink }}>
                        {e.location}
                      </strong>
                    ),
                  },
                  { id: 'typ', header: 'Componente', cell: (e) => e.type },
                  {
                    id: 'pro',
                    header: 'Instrucción',
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

          <div
            style={{
              height: '2px',
              backgroundColor: colors.border,
              marginBottom: '80px',
            }}
          ></div>

          <div id="mondinis" className="section-wrap">
            <SectionTitle
              title="Líneas de Producción (Mondinis)"
              subtitle="Acceso directo a protocolos de aislamiento por máquina."
              isDark={isDark}
            />

            <SpaceBetween size="xxl">
              <div>
                <Header variant="h2">Empacadora Mondini 2</Header>
                <p
                  className="text-normal"
                  style={{ marginBottom: '24px', color: colors.textSecondary }}
                >
                  Para la línea Mondini 2, se detalla la manera correcta de
                  aislar y cubrir cada componente crítico, como el banco de
                  sensores amarillos y el panel de dosificación.
                </p>
                <CustomCarousel images={mondini2Images} isDark={isDark} />
                <Box margin={{ top: 'm' }}>
                  <Button
                    variant="primary"
                    iconName="external"
                    iconAlign="right"
                    href="/cleaning-plan/mondini-2"
                  >
                    Ver Componentes - Mondini 2
                  </Button>
                </Box>
              </div>

              <div
                style={{
                  height: '1px',
                  backgroundColor: colors.border,
                  margin: '20px 0',
                }}
              ></div>

              <div>
                <Header variant="h2">Empacadora Mondini 3</Header>
                <p
                  className="text-normal"
                  style={{ marginBottom: '24px', color: colors.textSecondary }}
                >
                  Aunque es similar a la Mondini 2, presenta variaciones
                  específicas como el sensor de enclavamiento principal naranja
                  y la servotransmisión que requieren sellado hermético.
                </p>
                <CustomCarousel images={mondini3Images} isDark={isDark} />
                <Box margin={{ top: 'm' }}>
                  <Button
                    variant="primary"
                    iconName="external"
                    iconAlign="right"
                    href="/cleaning-plan/mondini-3"
                  >
                    Ver Componentes - Mondini 3
                  </Button>
                </Box>
              </div>

              <div
                style={{
                  height: '1px',
                  backgroundColor: colors.border,
                  margin: '20px 0',
                }}
              ></div>

              <div>
                <Header variant="h2">Empacadora Mondini 6</Header>
                <p
                  className="text-normal"
                  style={{ marginBottom: '24px', color: colors.textSecondary }}
                >
                  Esta empacadora opera con mayor capacidad de producción. Las
                  directrices aquí aseguran que toda su extensa instrumentación
                  y servomotores adicionales queden resguardados.
                </p>
                <CustomCarousel images={mondini6Images} isDark={isDark} />
                <Box margin={{ top: 'm' }}>
                  <Button
                    variant="primary"
                    iconName="external"
                    iconAlign="right"
                    href="/cleaning-plan/mondini-6"
                  >
                    Ver Componentes - Mondini 6
                  </Button>
                </Box>
              </div>
            </SpaceBetween>
          </div>
        </div>

        {/* SIDEBAR DESKTOP */}
        <div className="flex-sidebar">
          <div className="sticky-nav-inner">
            <SpaceBetween size="xxl">
              <div>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: '900',
                    marginBottom: '20px',
                    color: colors.textMain,
                    letterSpacing: '-0.5px',
                  }}
                >
                  Navegación
                </h3>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    borderLeft: `3px solid ${colors.border}`,
                  }}
                >
                  {SECTIONS.map((s) => (
                    <li key={s.id} style={{ margin: 0 }}>
                      <a
                        href={`#${s.id}`}
                        onClick={(e) => scrollToSection(e, s.id)}
                        style={{
                          display: 'block',
                          padding: '10px 20px',
                          textDecoration: 'none',
                          fontSize: '15px',
                          color:
                            activeSection === s.id
                              ? colors.activeLink
                              : colors.textSecondary,
                          fontWeight: activeSection === s.id ? '800' : '500',
                          borderLeft:
                            activeSection === s.id
                              ? `3px solid ${colors.activeLink}`
                              : '3px solid transparent',
                          marginLeft: '-3px',
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          backgroundColor:
                            activeSection === s.id
                              ? isDark
                                ? 'rgba(9, 114, 211, 0.1)'
                                : 'rgba(9, 114, 211, 0.05)'
                              : 'transparent',
                        }}
                      >
                        {s.text}
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
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    color: colors.textMain,
                  }}
                >
                  ¿Fue útil este plan?
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button iconName="thumbs-up">Sí</Button>
                  <Button iconName="thumbs-down">No</Button>
                </div>
              </div>
            </SpaceBetween>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
