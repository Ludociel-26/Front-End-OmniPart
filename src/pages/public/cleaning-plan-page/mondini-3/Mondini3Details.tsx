import * as React from 'react';
import { useContext, useState, useEffect, useRef } from 'react';
import { AppContent } from '@/context/AppContext';

import {
  TopNavigation,
  Header,
  SpaceBetween,
  Cards,
  Icon,
  Button,
  Flashbar,
  Table,
  Container,
  Grid,
  Box,
} from '@cloudscape-design/components';

// ==========================================
// IMPORTA TU FOOTER AQUÍ
// ==========================================
import { Footer } from '@/components/layouts/AppFooter';

// ==========================================
// DATA IMPORTADA
// ==========================================
import { m3Sec1Data, m3Sec2Data, SECTIONS } from './mondini3Data';

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
    style={{ borderBottom: `2px solid ${isDark ? '#414d5c' : '#eaeded'}` }}
  >
    <h2
      className="section-title"
      style={{
        fontWeight: '900',
        color: isDark ? '#ffffff' : '#16191f',
        letterSpacing: '-0.5px',
      }}
    >
      {title}
    </h2>
    {subtitle && (
      <p
        className="section-subtitle"
        style={{ color: isDark ? '#aab7b8' : '#545b64' }}
      >
        {subtitle}
      </p>
    )}
  </div>
);

const CardCarousel = ({
  images,
  isDark,
  onExpand,
}: {
  images: { src: string | null; label: string }[];
  isDark: boolean;
  onExpand: (imgSrc: string) => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length === 0) return;
    const interval = setInterval(
      () => setCurrentIndex((prev) => (prev + 1) % images.length),
      Math.floor(Math.random() * 4000) + 8000,
    );
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) return null;
  const currentImage = images[currentIndex];

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '240px',
        backgroundColor: isDark ? '#232f3e' : '#f8f8f8',
        overflow: 'hidden',
        borderBottom: `1px solid ${isDark ? '#414d5c' : '#eaeded'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px 8px 0 0',
      }}
    >
      {currentImage.src ? (
        <img
          key={`img-${currentIndex}`}
          src={currentImage.src}
          className="slow-transition-fade"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          alt={currentImage.label}
        />
      ) : (
        <SpaceBetween size="xs" direction="vertical" alignItems="center">
          <Icon
            name={'camera' as any}
            size="large"
            variant={(isDark ? 'subtle' : 'normal') as any}
          />
          <span
            style={{ fontSize: '13px', color: isDark ? '#687078' : '#879596' }}
          >
            Añadir Foto ({currentImage.label})
          </span>
        </SpaceBetween>
      )}

      {currentImage.src && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExpand(currentImage.src!);
          }}
          title="Ver imagen completa"
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            backgroundColor: 'rgba(0,0,0,0.65)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.4)',
            padding: '8px 12px',
            borderRadius: '10px',
            cursor: 'pointer',
            zIndex: 10,
            backdropFilter: 'blur(6px)',
          }}
        >
          <Icon
            name={'zoom-in' as any}
            size="normal"
            variant={'inverted' as any}
          />
        </button>
      )}

      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          backgroundColor: 'rgba(0,0,0,0.75)',
          color: '#fff',
          padding: '6px 14px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        {currentImage.label}
      </div>

      {images.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            display: 'flex',
            gap: '6px',
            backgroundColor: isDark
              ? 'rgba(22, 25, 31, 0.85)'
              : 'rgba(255, 255, 255, 0.95)',
            padding: '6px 10px',
            borderRadius: '20px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(
                (prev) => (prev - 1 + images.length) % images.length,
              );
            }}
            className="nav-btn-clear"
            style={{ color: isDark ? '#fff' : '#16191f' }}
          >
            <Icon
              name={'angle-left' as any}
              size="small"
              variant={'normal' as any}
            />
          </button>
          <span
            style={{
              fontSize: '13px',
              fontWeight: '800',
              color: isDark ? '#fff' : '#16191f',
              padding: '0 4px',
            }}
          >
            {currentIndex + 1}/{images.length}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % images.length);
            }}
            className="nav-btn-clear"
            style={{ color: isDark ? '#fff' : '#16191f' }}
          >
            <Icon
              name={'angle-right' as any}
              size="small"
              variant={'normal' as any}
            />
          </button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// MOTOR PDF
// ==========================================
const PrintTemplate = React.forwardRef<
  HTMLDivElement,
  { dataSec1: any[]; dataSec2: any[] }
>(({ dataSec1, dataSec2 }, ref) => (
  <div
    ref={ref}
    style={{
      padding: '40px',
      fontFamily: 'Arial, sans-serif',
      color: '#000',
      backgroundColor: '#fff',
      width: '100%',
      maxWidth: '1200px',
    }}
  >
    <h1
      style={{
        fontSize: '32px',
        borderBottom: '2px solid #000',
        paddingBottom: '10px',
      }}
    >
      Inventario de Protección: Mondini 3
    </h1>
    <h2 style={{ fontSize: '24px', marginTop: '30px' }}>
      Sección 1: Entrada y Dosificación
    </h2>
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '40px',
      }}
    >
      <thead>
        <tr
          style={{ backgroundColor: '#f2f2f2', borderBottom: '2px solid #ccc' }}
        >
          <th style={{ padding: '10px', textAlign: 'left' }}>
            Componente Técnico
          </th>
          <th style={{ padding: '10px', textAlign: 'left' }}>Nombre Físico</th>
          <th style={{ padding: '10px', textAlign: 'left' }}>Instrucción</th>
        </tr>
      </thead>
      <tbody>
        {dataSec1.map((item, idx) => (
          <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '10px', fontWeight: 'bold' }}>{item.tech}</td>
            <td style={{ padding: '10px', color: '#555' }}>{item.raw}</td>
            <td style={{ padding: '10px' }}>{item.desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <h2 style={{ fontSize: '24px', marginTop: '30px' }}>
      Sección 2: Sellado, Vacío y Salida
    </h2>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr
          style={{ backgroundColor: '#f2f2f2', borderBottom: '2px solid #ccc' }}
        >
          <th style={{ padding: '10px', textAlign: 'left' }}>
            Componente Técnico
          </th>
          <th style={{ padding: '10px', textAlign: 'left' }}>Nombre Físico</th>
          <th style={{ padding: '10px', textAlign: 'left' }}>Instrucción</th>
        </tr>
      </thead>
      <tbody>
        {dataSec2.map((item, idx) => (
          <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '10px', fontWeight: 'bold' }}>{item.tech}</td>
            <td style={{ padding: '10px', color: '#555' }}>{item.raw}</td>
            <td style={{ padding: '10px' }}>{item.desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
));

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function Mondini3Details() {
  const context = useContext(AppContent);
  const isDark = context ? context.isDark : false;

  const [activeSection, setActiveSection] = useState('intro');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [flashbarItems, setFlashbarItems] = useState<any[]>([
    {
      type: 'warning',
      dismissible: true,
      onDismiss: () => setFlashbarItems([]),
      content: (
        <Box fontSize="body-s">
          <strong>Normativa LOTTO:</strong> Desconecte la energía eléctrica
          general de la Mondini 3 antes de iniciar lavado.
        </Box>
      ),
      id: 'msg_loto',
    },
  ]);

  const printContainerRef = useRef<HTMLDivElement>(null);

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
      let currentSection = SECTIONS[0]?.id || 'intro';
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

  const handleExportPDF = async () => {
    if (!printContainerRef.current) return;
    setIsExporting(true);
    try {
      const script = document.createElement('script');
      script.src =
        'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      document.body.appendChild(script);
      script.onload = () => {
        const opt = {
          margin: 0.5,
          filename: 'Mondini3_Inventario.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        };
        (window as any)
          .html2pdf()
          .set(opt)
          .from(printContainerRef.current)
          .save()
          .then(() => {
            setIsExporting(false);
            document.body.removeChild(script);
          });
      };
    } catch {
      setIsExporting(false);
    }
  };

  const renderCards = (data: any[]) => (
    <Cards
      // Ajuste drástico: Fuerza 1 tarjeta por fila en todo lo menor a 700px.
      cardsPerRow={[
        { cards: 1 },
        { minWidth: 700, cards: 2 },
        { minWidth: 1100, cards: 3 },
      ]}
      cardDefinition={{
        header: (item) => (
          <div
            className="card-title"
            style={{ fontSize: '17px', fontWeight: '900' }}
          >
            {item.tech}
          </div>
        ),
        sections: [
          {
            id: 'img',
            content: (item) => (
              <CardCarousel
                images={item.images}
                isDark={isDark}
                onExpand={setSelectedImage}
              />
            ),
          },
          {
            id: 'desc',
            content: (item) => (
              <span
                className="card-desc"
                style={{
                  fontSize: '14px',
                  display: 'block',
                  marginTop: '12px',
                }}
              >
                {item.desc}
              </span>
            ),
          },
          {
            id: 'raw',
            content: (item) => (
              <div
                style={{
                  marginTop: '8px',
                  paddingTop: '12px',
                  borderTop: `1px solid ${colors.border}`,
                }}
              >
                <span
                  style={{
                    fontSize: '13px',
                    color: '#879596',
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                  }}
                >
                  Físico: {item.raw}
                </span>
              </div>
            ),
          },
        ],
      }}
      items={data}
    />
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.bgPage,
        color: colors.textMain,
        overflowX: 'hidden' /* EVITAR OVERFLOW HORIZONTAL A NIVEL ROOT */,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{`
        @keyframes slowFadeIn { 0% { opacity: 0.3; filter: blur(4px); } 100% { opacity: 1; filter: blur(0); } }
        .slow-transition-fade { animation: slowFadeIn 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .nav-btn-clear { background: transparent; border: none; cursor: pointer; display: flex; align-items: center; padding: 4px; border-radius: 4px; }
        .nav-btn-clear:hover { background-color: rgba(0,0,0,0.1); }
        
        /* LAYOUT FLEXBOX ESTRICTO PARA PREVENIR QUE SE EXPANDAN LOS HIJOS (TABLAS) */
        .flex-container { 
          display: flex; flex-direction: row; max-width: 1400px; margin: 0 auto; 
          padding: 60px 40px; gap: 60px; align-items: flex-start; flex-grow: 1; 
          width: 100%; box-sizing: border-box; 
        }
        .flex-content { 
          flex: 1 1 0%; /* El 0% es magia para evitar el desborde flex */
          min-width: 0; /* Crucial para responsividad */
          width: 100%; 
          max-width: 100vw;
          box-sizing: border-box; 
        }
        .flex-sidebar { width: 280px; flex-shrink: 0; position: sticky; top: 120px; border-left: 1px solid ${colors.border}; padding-left: 40px; }
        
        .section-wrap { margin-bottom: 120px; width: 100%; }
        .hero-title { font-size: 40px !important; line-height: 1.3 !important; margin-bottom: 20px !important; }
        .hero-desc { font-size: 18px !important; line-height: 1.6 !important; margin-top: 12px !important; }
        .hero-header-wrap { padding: 50px 40px 60px 40px; position: relative; }
        
        .section-title-container { margin-bottom: 40px !important; padding-bottom: 20px !important; }
        .section-title { font-size: 34px !important; line-height: 1.3 !important; margin-bottom: 16px !important; }
        
        .mobile-fab { display: none !important; }

        /* =========================================
           ANIMACIONES ELEGANTES DEL MENÚ MÓVIL
        ========================================= */
        .mobile-menu-overlay { 
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
          background: rgba(10, 15, 20, 0.95); backdrop-filter: blur(16px); 
          z-index: 10005; display: flex; flex-direction: column; padding: 50px 30px; 
          opacity: 0; pointer-events: none; transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
        }
        .mobile-menu-overlay.open { opacity: 1; pointer-events: auto; }

        .close-menu-btn {
          background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2);
          width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          color: #ffffff !important; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .close-menu-btn:hover { background: rgba(255, 255, 255, 0.25); transform: rotate(90deg); }

        .mobile-menu-item { opacity: 0; transform: translateY(-20px); transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .mobile-menu-overlay.open .mobile-menu-item { opacity: 1; transform: translateY(0); }
        .mobile-menu-overlay.open .mobile-menu-item:nth-child(1) { transition-delay: 0.1s; }
        .mobile-menu-overlay.open .mobile-menu-item:nth-child(2) { transition-delay: 0.15s; }
        .mobile-menu-overlay.open .mobile-menu-item:nth-child(3) { transition-delay: 0.2s; }
        .mobile-menu-overlay.open .mobile-menu-item:nth-child(4) { transition-delay: 0.25s; }
        .mobile-menu-overlay.open .mobile-menu-item:nth-child(5) { transition-delay: 0.3s; }

        .mobile-link { transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), color 0.3s ease; display: block; padding: 12px 0; }
        .mobile-link:hover { transform: translateX(12px); color: #ffffff !important; }

        @media screen and (max-width: 1080px) {
          .flex-sidebar { display: none !important; }
          .flex-container { padding: 30px 15px; flex-direction: column; gap: 0; overflow-x: hidden; }
          .section-wrap { margin-bottom: 80px; }
          
          .hero-header-wrap { padding: 30px 20px 40px 20px !important; }
          .hero-title { font-size: 28px !important; line-height: 1.4 !important; margin-bottom: 12px !important; display: block !important; }
          .hero-desc { font-size: 15px !important; line-height: 1.6 !important; margin-top: 12px !important; margin-bottom: 24px !important; }
          
          .section-title-container { margin-bottom: 30px !important; padding-bottom: 15px !important; }
          .section-title { font-size: 24px !important; line-height: 1.4 !important; margin-bottom: 8px !important; display: block !important; }
          
          /* BOTÓN FLOTANTE DINÁMICO (Ocultable) */
          .mobile-fab { 
            display: flex !important; position: fixed !important; bottom: 80px !important; right: 24px !important;
            width: 52px !important; height: 52px !important; border-radius: 50% !important;
            background-color: ${colors.fabBg} !important; color: ${colors.fabIcon} !important; 
            box-shadow: 0 4px 16px rgba(0,0,0,0.4) !important; z-index: 99999 !important; 
            cursor: pointer !important; align-items: center !important; justify-content: center !important;
            border: 1px solid rgba(128,128,128,0.2) !important;
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s !important;
          }
          .mobile-fab.hidden { transform: scale(0) !important; opacity: 0 !important; pointer-events: none !important; }
        }
      `}</style>

      {/* Menú Móvil Modal Premium */}
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
          style={{ paddingBottom: '30px', transitionDelay: '0.4s' }}
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

      {/* BOTÓN FLOTANTE (FAB) */}
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

      {/* Lightbox */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100000,
            backgroundColor: 'rgba(10,15,20,0.95)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <button
            style={{
              position: 'absolute',
              top: '25px',
              right: '25px',
              background: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.4)',
              borderRadius: '50%',
              width: '56px',
              height: '56px',
              color: 'white',
              cursor: 'pointer',
              zIndex: 10001,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <Icon
              name={'close' as any}
              size="large"
              variant={'inherit' as any}
            />
          </button>
          <img
            src={selectedImage}
            alt="Expandida"
            style={{
              maxWidth: '95vw',
              maxHeight: '90vh',
              borderRadius: '20px',
              objectFit: 'contain',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Nav Superior */}
      <div style={{ position: 'sticky', top: 0, zIndex: 1002, width: '100%' }}>
        <TopNavigation
          identity={{ href: '/cleaning-plan', title: 'Atrás: Menú Principal' }}
          utilities={[]}
        />
      </div>

      <div style={{ backgroundColor: colors.bgHeader, width: '100%' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {flashbarItems.length > 0 && (
            <div
              style={{
                paddingTop: '24px',
                paddingLeft: '20px',
                paddingRight: '20px',
              }}
            >
              <Flashbar items={flashbarItems as any} />
            </div>
          )}
          <div className="hero-header-wrap" style={{ color: '#ffffff' }}>
            <nav
              aria-label="Breadcrumb"
              style={{ marginBottom: '24px', fontSize: '15px' }}
            >
              <span style={{ color: '#879596' }}>Plan de Limpieza</span>{' '}
              <span style={{ margin: '0 12px', color: '#879596' }}>/</span>{' '}
              <span style={{ color: '#fbfbfb', fontWeight: 'bold' }}>
                Línea Mondini 3
              </span>
            </nav>
            <Grid
              gridDefinition={[
                { colspan: { default: 12, l: 8 } },
                { colspan: { default: 12, l: 4 } },
              ]}
            >
              <div>
                <h1
                  className="hero-title"
                  style={{ fontWeight: '900', color: '#ffffff' }}
                >
                  Inventario de Protección: Mondini 3
                </h1>
                <p
                  className="hero-desc"
                  style={{ color: '#d1d5db', maxWidth: '850px' }}
                >
                  Catálogo visual detallado. Compare el estado físico de cada
                  componente con su correcto aislamiento antes de inyectar agua
                  a presión.
                </p>
              </div>
              <div className="btn-download-wrap">
                <Button
                  variant={'primary' as any}
                  iconName={'download' as any}
                  loading={isExporting}
                  onClick={handleExportPDF}
                >
                  Descargar PDF de Línea 3
                </Button>
              </div>
            </Grid>
          </div>
        </div>
      </div>

      <div className="flex-container">
        <div className="flex-content">
          <div id="intro" className="section-wrap">
            <SectionTitle
              title="Propósito de Intervención"
              subtitle="Minimización de riesgos operativos y eléctricos durante el saneamiento."
              isDark={isDark}
            />
            <div
              className="intro-text"
              style={{
                fontSize: '18px',
                lineHeight: '1.8',
                color: colors.textMain,
              }}
            >
              <p>
                La arquitectura de la empacadora <strong>Mondini 3</strong>{' '}
                presenta componentes de muy alta sensibilidad en su zona de
                tracción y en los sistemas de bloqueos de seguridad integrados.
              </p>
              <p style={{ color: colors.textSecondary }}>
                Este protocolo detalla paso a paso el procedimiento innegociable
                para proteger la instrumentación clave. El incumplimiento de
                estas directrices puede resultar en fallas de arranque
                catastróficas y retrasos severos en la línea de producción.
              </p>
            </div>
          </div>

          <div id="tabla" className="section-wrap">
            <SectionTitle
              title="Inventario Completo"
              subtitle="Checklist tabular para una revisión rápida."
              isDark={isDark}
            />
            <SpaceBetween size="xl">
              <Container
                header={
                  <Header variant="h2">
                    <span
                      style={{
                        fontSize: '20px',
                        padding: '10px 0',
                        display: 'block',
                      }}
                    >
                      Sección 1: Entrada y Dosificación
                    </span>
                  </Header>
                }
              >
                {/* ENVOLTORIO FLEXIBLE ESTRICTO PARA LAS TABLAS */}
                <div
                  style={{
                    overflowX: 'auto',
                    width: '100%',
                    maxWidth: '100%',
                    display: 'block',
                  }}
                >
                  <Table
                    variant="embedded"
                    columnDefinitions={[
                      {
                        id: 'tech',
                        header: 'Componente Técnico',
                        cell: (e) => (
                          <span
                            style={{ fontSize: '14px', fontWeight: 'bold' }}
                          >
                            {e.tech}
                          </span>
                        ),
                        minWidth: 200,
                      },
                      {
                        id: 'raw',
                        header: 'Nombre Físico',
                        cell: (e) => (
                          <span style={{ color: '#879596', fontSize: '13px' }}>
                            {e.raw}
                          </span>
                        ),
                        minWidth: 160,
                      },
                      {
                        id: 'desc',
                        header: 'Instrucción de Cuidado',
                        cell: (e) => (
                          <span style={{ fontSize: '14px', lineHeight: '1.5' }}>
                            {e.desc}
                          </span>
                        ),
                        minWidth: 280,
                      },
                    ]}
                    items={m3Sec1Data}
                    stripedRows
                  />
                </div>
              </Container>

              <Container
                header={
                  <Header variant="h2">
                    <span
                      style={{
                        fontSize: '20px',
                        padding: '10px 0',
                        display: 'block',
                      }}
                    >
                      Sección 2: Sellado, Vacío y Salida
                    </span>
                  </Header>
                }
              >
                <div
                  style={{
                    overflowX: 'auto',
                    width: '100%',
                    maxWidth: '100%',
                    display: 'block',
                  }}
                >
                  <Table
                    variant="embedded"
                    columnDefinitions={[
                      {
                        id: 'tech',
                        header: 'Componente Técnico',
                        cell: (e) => (
                          <span
                            style={{ fontSize: '14px', fontWeight: 'bold' }}
                          >
                            {e.tech}
                          </span>
                        ),
                        minWidth: 200,
                      },
                      {
                        id: 'raw',
                        header: 'Nombre Físico',
                        cell: (e) => (
                          <span style={{ color: '#879596', fontSize: '13px' }}>
                            {e.raw}
                          </span>
                        ),
                        minWidth: 160,
                      },
                      {
                        id: 'desc',
                        header: 'Instrucción de Cuidado',
                        cell: (e) => (
                          <span style={{ fontSize: '14px', lineHeight: '1.5' }}>
                            {e.desc}
                          </span>
                        ),
                        minWidth: 280,
                      },
                    ]}
                    items={m3Sec2Data}
                    stripedRows
                  />
                </div>
              </Container>
            </SpaceBetween>
          </div>

          <div id="sec1" className="section-wrap">
            <SectionTitle
              title="Mondini 3 - Sección 1"
              subtitle="Inspección detallada de Componentes de Entrada y Sistemas de Dosificación de Jarabe."
              isDark={isDark}
            />
            <div style={{ width: '100%', overflow: 'hidden' }}>
              {renderCards(m3Sec1Data)}
            </div>
          </div>

          <div id="sec2" className="section-wrap">
            <SectionTitle
              title="Mondini 3 - Sección 2"
              subtitle="Revisión exhaustiva de Componentes en la Zona de Sellado, Vacío y Salida de Producto."
              isDark={isDark}
            />
            <div style={{ width: '100%', overflow: 'hidden' }}>
              {renderCards(m3Sec2Data)}
            </div>
          </div>
        </div>

        <div className="flex-sidebar">
          <div
            className="sticky-nav-inner"
            style={{ position: 'sticky', top: '120px' }}
          >
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
                  {SECTIONS.map((section) => (
                    <li key={section.id} style={{ margin: 0 }}>
                      <a
                        href={`#${section.id}`}
                        onClick={(e) => scrollToSection(e, section.id)}
                        style={{
                          display: 'block',
                          padding: '10px 20px',
                          textDecoration: 'none',
                          fontSize: '15px',
                          color:
                            activeSection === section.id
                              ? colors.activeLink
                              : colors.textSecondary,
                          fontWeight:
                            activeSection === section.id ? '800' : '500',
                          borderLeft:
                            activeSection === section.id
                              ? `3px solid ${colors.activeLink}`
                              : '3px solid transparent',
                          marginLeft: '-3px',
                          transition: 'all 0.2s ease',
                          backgroundColor:
                            activeSection === section.id
                              ? isDark
                                ? 'rgba(9, 114, 211, 0.1)'
                                : 'rgba(9, 114, 211, 0.05)'
                              : 'transparent',
                        }}
                      >
                        {section.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div
                style={{
                  height: '2px',
                  backgroundColor: colors.border,
                  width: '50%',
                }}
              ></div>
              <div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: '800',
                    marginBottom: '16px',
                    color: colors.textMain,
                  }}
                >
                  ¿Problemas en el equipo?
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    color: colors.textSecondary,
                    marginBottom: '20px',
                    lineHeight: '1.5',
                  }}
                >
                  Si detecta sellos rotos, cables expuestos o humedad interna,
                  detenga el lavado de inmediato.
                </p>
                <Button iconName={'status-warning' as any} fullWidth>
                  Levantar Ticket Urgente
                </Button>
              </div>
            </SpaceBetween>
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          zIndex: -10,
        }}
      >
        <PrintTemplate
          ref={printContainerRef}
          dataSec1={m3Sec1Data}
          dataSec2={m3Sec2Data}
        />
      </div>

      <Footer />
    </div>
  );
}
