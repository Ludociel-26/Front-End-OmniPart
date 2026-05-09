import * as React from 'react';
import { useContext, useState, useEffect } from 'react';
import { AppContent } from '@/context/AppContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  TopNavigation,
  SpaceBetween,
  Cards,
  Icon,
  Button,
  Flashbar,
  Table,
  Container,
  Grid,
  Box,
  ColumnLayout,
  Header,
} from '@cloudscape-design/components';

// ==========================================
// IMPORTACIONES
// ==========================================
import { Footer } from '@/components/layouts/AppFooter';
import logoSistema from '@/assets/icons/logo.svg';

// Importa los datos de Mondini 6
import { m6Sec1Data, m6Sec2Data, m6Sec3Data } from './mondini6Data';

const SECTIONS = [
  { id: 'intro', text: 'Documento Normativo' },
  { id: 'tabla', text: 'Inventario Completo' },
  { id: 'sec1', text: 'Sección 1 (Entrada)' },
  { id: 'sec2', text: 'Sección 2 (Jarabe)' },
  { id: 'sec3', text: 'Sección 3 (Sellado)' },
];

// ==========================================
// COMPONENTES UI CLOUDSCAPE
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

// Carrusel integrado y blindado contra nulos
const CardCarousel = ({
  images,
  isDark,
  onExpand,
}: {
  images?: { src: string | null; label: string }[];
  isDark: boolean;
  onExpand: (imgSrc: string) => void;
}) => {
  const validImages =
    Array.isArray(images) && images.length > 0
      ? images
      : [{ src: null, label: 'Sin evidencia' }];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (validImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [validImages.length]);

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(
      (prev) => (prev - 1 + validImages.length) % validImages.length,
    );
  };

  const currentImage = validImages[currentIndex];

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
          key={currentIndex}
          src={currentImage.src}
          className="slow-transition-fade"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: '8px',
          }}
          alt={currentImage.label}
        />
      ) : (
        <SpaceBetween
          key={currentIndex}
          size="xs"
          direction="vertical"
          alignItems="center"
        >
          <Icon
            name={'camera' as any}
            size="large"
            variant={isDark ? 'subtle' : 'normal'}
          />
          <span
            style={{ fontSize: '13px', color: isDark ? '#687078' : '#879596' }}
          >
            Añadir Foto ({currentImage.label})
          </span>
        </SpaceBetween>
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

      {currentImage.src && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExpand(currentImage.src!);
          }}
          title="Ver imagen completa"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'rgba(0,0,0,0.65)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.4)',
            padding: '6px 10px',
            borderRadius: '8px',
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

      {validImages.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            display: 'flex',
            gap: '4px',
            backgroundColor: isDark
              ? 'rgba(22, 25, 31, 0.8)'
              : 'rgba(255, 255, 255, 0.9)',
            padding: '4px 8px',
            borderRadius: '16px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            zIndex: 5,
          }}
        >
          <button
            onClick={prevSlide}
            style={{
              background: 'transparent',
              border: 'none',
              color: isDark ? '#fff' : '#16191f',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
            }}
          >
            <Icon name={'angle-left' as any} size="small" variant="normal" />
          </button>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 'bold',
              color: isDark ? '#fff' : '#16191f',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {currentIndex + 1}/{validImages.length}
          </span>
          <button
            onClick={nextSlide}
            style={{
              background: 'transparent',
              border: 'none',
              color: isDark ? '#fff' : '#16191f',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
            }}
          >
            <Icon name={'angle-right' as any} size="small" variant="normal" />
          </button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// VISTA PRINCIPAL DE DETALLE
// ==========================================
export default function Mondini6Details() {
  const context = useContext(AppContent);
  const isDark = context ? context.isDark : false;

  const [activeSection, setActiveSection] = useState('intro');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [flashbarItems, setFlashbarItems] = useState<any[]>([
    {
      type: 'error',
      dismissible: true,
      onDismiss: () => handleDismiss('msg_loto'),
      content: (
        <Box fontSize="body-s">
          <strong>Normativa LOTO:</strong> Desconecte la energía eléctrica
          general de la Mondini 6 antes de iniciar lavado.
        </Box>
      ),
      id: 'msg_loto',
    },
    {
      type: 'error',
      dismissible: true,
      onDismiss: () => handleDismiss('msg_1'),
      content: (
        <Box fontSize="body-s">
          <strong>PRECAUCIÓN:</strong> NO dirigir agua a presión sobre
          componentes eléctricos o neumáticos.
        </Box>
      ),
      id: 'msg_1',
    },
    {
      type: 'error',
      dismissible: true,
      onDismiss: () => handleDismiss('msg_2'),
      content: (
        <Box fontSize="body-s">
          <strong>PRECAUCIÓN:</strong> NO aplicar químicos directamente sobre
          sensores o sellos.
        </Box>
      ),
      id: 'msg_2',
    },
    {
      type: 'warning',
      dismissible: true,
      onDismiss: () => handleDismiss('msg_3'),
      content: (
        <Box fontSize="body-s">
          <strong>PRECAUCIÓN:</strong> NO remover protecciones durante lavado.
        </Box>
      ),
      id: 'msg_3',
    },
    {
      type: 'warning',
      dismissible: true,
      onDismiss: () => handleDismiss('msg_4'),
      content: (
        <Box fontSize="body-s">
          <strong>PRECAUCIÓN:</strong> NO impactar sellos, chumaceras o
          conexiones con alta presión.
        </Box>
      ),
      id: 'msg_4',
    },
  ]);

  const handleDismiss = (idToRemove: string) => {
    setFlashbarItems((items) => items.filter((item) => item.id !== idToRemove));
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

  // ==========================================
  // GENERADOR DE PDF CORPORATIVO (TEMPLATE AWS - MONDINI 6)
  // ==========================================
  const getLogoData = async (
    url: string,
  ): Promise<{ data: string; width: number; height: number } | null> => {
    try {
      const response = await fetch(url);
      let svgText = await response.text();

      if (svgText.includes('<svg')) {
        svgText = svgText.replace(/currentColor/g, '#0972D3');
        svgText = svgText.replace(/var\(--[a-zA-Z0-9-]+\)/g, '#0972D3');

        const svgBlob = new Blob([svgText], {
          type: 'image/svg+xml;charset=utf-8',
        });
        const svgUrl = URL.createObjectURL(svgBlob);

        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width || 300;
            canvas.height = img.height || 100;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              resolve({
                data: canvas.toDataURL('image/png'),
                width: canvas.width,
                height: canvas.height,
              });
            } else resolve(null);
            URL.revokeObjectURL(svgUrl);
          };
          img.onerror = () => {
            URL.revokeObjectURL(svgUrl);
            resolve(null);
          };
          img.src = svgUrl;
        });
      }

      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve({
              data: canvas.toDataURL('image/png'),
              width: canvas.width,
              height: canvas.height,
            });
          } else resolve(null);
        };
        img.onerror = () => resolve(null);
        img.src = url;
      });
    } catch (e) {
      return null;
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);

    try {
      const doc = new jsPDF('p', 'pt', 'letter');
      const margin = 40;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentWidth = pageWidth - margin * 2;
      const colWidth = (contentWidth - 20) / 2;

      const safeTopMargin = 90;
      const safeBottomMargin = 90;

      const safeText = (
        text: string,
        x: number,
        y: number,
        align: 'left' | 'right' | 'center' = 'left',
      ) => {
        const validText = text ? String(text) : '';
        if (isNaN(x) || isNaN(y)) return;
        if (align === 'right') {
          const w = doc.getTextWidth(validText);
          doc.text(validText, x - w, y);
        } else if (align === 'center') {
          const w = doc.getTextWidth(validText);
          doc.text(validText, x - w / 2, y);
        } else {
          doc.text(validText, x, y);
        }
      };

      const logoData = await getLogoData(logoSistema);

      // --- HEADER GLOBAL MONDINI 6 ---
      const drawAWSHeader = () => {
        if (logoData) {
          // RESTAURACIÓN AL TAMAÑO ORIGINAL Y CORPORATIVO (160x45)
          const maxLogoW = 160;
          const maxLogoH = 45;
          const ratio = logoData.width / logoData.height;
          let w = maxLogoW;
          let h = w / ratio;
          if (h > maxLogoH) {
            h = maxLogoH;
            w = h * ratio;
          }
          doc.addImage(logoData.data, 'PNG', margin, 25, w, h);
        } else {
          doc.setFontSize(24);
          doc.setFont('helvetica', 'bold');
          safeText('QuickFind', margin, 50);
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(0, 0, 0);
        safeText(
          'Catálogo de Puntos Críticos Durante',
          pageWidth - margin,
          40,
          'right',
        );
        safeText(
          'Lavado de Equipos (Mondini 6)',
          pageWidth - margin,
          55,
          'right',
        );

        doc.setLineWidth(1.5);
        doc.setDrawColor(0, 0, 0);
        doc.line(margin, 75, pageWidth - margin, 75);
      };

      // --- FOOTER GLOBAL MONDINI 6 ---
      const drawAWSFooter = () => {
        const startY = pageHeight - 60;
        doc.setLineWidth(1);
        doc.setDrawColor(0, 0, 0);
        doc.line(margin, startY, pageWidth - margin, startY);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        safeText(
          'Este documento es una representación impresa para control de sanidad',
          pageWidth / 2,
          startY + 12,
          'center',
        );

        doc.setFont('helvetica', 'bold');
        safeText(
          'QUICKFIND SYSTEM - MONDINI 6',
          pageWidth / 2,
          startY + 22,
          'center',
        );

        doc.setFont('helvetica', 'normal');
        safeText(
          'Planta Congelados - Área de Mondinis',
          pageWidth / 2,
          startY + 32,
          'center',
        );
      };

      // ==========================================
      // HOJA 1: DATOS GENERALES
      // ==========================================
      let currentY = safeTopMargin + 20;

      const col2X = margin + colWidth + 20;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      safeText('DATOS DEL EQUIPO', margin, currentY);
      safeText('DATOS DE EMISIÓN', col2X, currentY);

      currentY += 6;
      doc.setLineWidth(1);
      doc.line(margin, currentY, margin + colWidth, currentY);
      doc.line(col2X, currentY, pageWidth - margin, currentY);

      currentY += 15;
      doc.setFontSize(7.5);

      const drawRow = (
        y: number,
        k1: string,
        v1: string,
        k2: string,
        v2: string,
      ) => {
        doc.setFont('helvetica', 'bold');
        safeText(k1, margin, y);
        safeText(k2, col2X, y);
        doc.setFont('helvetica', 'normal');
        safeText(v1, margin + colWidth, y, 'right');
        safeText(v2, pageWidth - margin, y, 'right');
      };

      drawRow(
        currentY,
        'Planta',
        'Congelados',
        'Realizado por',
        'Mantenimiento',
      );
      currentY += 14;
      drawRow(currentY, 'Área', 'Mondinis', 'Dirigido a', 'Sanidad');
      currentY += 14;
      drawRow(
        currentY,
        'Equipo',
        'Mondini #6',
        'Fecha y hora de emisión',
        new Date().toLocaleString(),
      );

      currentY += 10;
      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 25;

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1.2);
      const boxHeight = 85;

      doc.rect(margin, currentY, colWidth, boxHeight);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      safeText('Propósito', margin + 8, currentY + 16);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      const propText = doc.splitTextToSize(
        'Establecer los puntos críticos de protección durante las actividades de lavado sanitario en los equipos de proceso, con el fin de prevenir daños en componentes mecánicos, neumáticos y eléctricos sensibles al agua o químicos de limpieza, asegurando la integridad del equipo y la continuidad operativa.',
        colWidth - 16,
      );
      doc.text(propText, margin + 8, currentY + 30);

      doc.rect(col2X, currentY, colWidth, boxHeight);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      safeText('Alcance', col2X + 8, currentY + 16);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      const alcText = doc.splitTextToSize(
        'Este catálogo aplica al personal de Sanidad involucrado en actividades de limpieza de equipos en planta 2, incluyendo la identificación, protección y verificación de componentes críticos antes, durante y después del lavado. La instrucción aplica para todos los componentes.',
        colWidth - 16,
      );
      doc.text(alcText, col2X + 8, currentY + 30);

      currentY += boxHeight + 25;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      safeText('DETALLE DE PRECAUCIONES', margin, currentY);
      currentY += 8;

      doc.setLineWidth(1);
      const preBoxH = 80;
      doc.rect(margin, currentY, contentWidth, preBoxH);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');

      // SANITIZACIÓN: Solo texto plano sin emojis para garantizar renderizado perfecto
      const preText = doc.splitTextToSize(
        'NOTA DE SEGURIDAD\n\nEl lavado inadecuado de componentes críticos puede ocasionar fallas en el equipo y generar condiciones inseguras. Es obligatorio seguir las instrucciones de protección establecidas en este catálogo:\n\nX NO dirigir agua a presión sobre componentes eléctricos o neumáticos.\nX NO remover protecciones durante lavado.\nX NO aplicar químicos directamente sobre sensores o sellos.',
        contentWidth - 16,
      );
      doc.text(preText, margin + 8, currentY + 16);

      // ==========================================
      // HOJA 2: LISTADO DE COMPONENTES TEXTO
      // ==========================================
      doc.addPage();
      currentY = safeTopMargin + 10;

      const drawTextTable = (title: string, data: any[]) => {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        safeText(title, margin, currentY);

        const tableOptions: any = {
          startY: currentY + 6,
          head: [['No', 'Componente', 'Instrucción']],
          body: data.map((item, i) => [
            String(i + 1),
            `${item.name || item.tech || '---'}${item.raw ? `\nFísico: ${item.raw}` : ''}`,
            String(item.desc || ''),
          ]),
          theme: 'grid',
          headStyles: {
            fillColor: 255,
            textColor: 0,
            fontStyle: 'bold',
            lineWidth: 1,
            lineColor: 0,
          },
          styles: {
            fontSize: 7.5,
            textColor: 0,
            cellPadding: 5,
            lineWidth: 1,
            lineColor: 0,
          },
          columnStyles: {
            0: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
            1: { cellWidth: 160 },
            2: { cellWidth: 'auto' },
          },
          margin: {
            top: safeTopMargin,
            bottom: safeBottomMargin,
            left: margin,
            right: margin,
          },
          rowPageBreak: 'avoid',
        };

        autoTable(doc, tableOptions);
        currentY = (doc as any).lastAutoTable.finalY + 15;
      };

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      safeText('LISTADO DE COMPONENTES', margin, currentY);
      currentY += 15;

      drawTextTable('SECCIÓN 1: ENTRADA', m6Sec1Data);
      drawTextTable('SECCIÓN 2: INYECCIÓN DE JARABE', m6Sec2Data);
      drawTextTable('SECCIÓN 3: SELLADO, VACÍO Y SALIDA', m6Sec3Data);

      // ==========================================
      // HOJA 3+: EVIDENCIA VISUAL
      // ==========================================
      doc.addPage();
      currentY = safeTopMargin + 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      safeText('EVIDENCIA VISUAL DE AISLAMIENTO', margin, currentY);
      currentY += 15;

      const drawVisualTable = (title: string, data: any[]) => {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        safeText(title, margin, currentY);

        const visTableOptions: any = {
          startY: currentY + 6,
          head: [['Componente', 'Evidencia Física']],
          body: data.map((item) => [String(item.name || item.tech || ''), '']),
          theme: 'grid',
          headStyles: {
            fillColor: 255,
            textColor: 0,
            fontStyle: 'bold',
            lineWidth: 1,
            lineColor: 0,
          },
          bodyStyles: { minCellHeight: 100 },
          styles: {
            fontSize: 7.5,
            textColor: 0,
            cellPadding: 6,
            valign: 'middle',
            lineColor: 0,
            lineWidth: 1,
          },
          columnStyles: {
            0: { cellWidth: 180, fontStyle: 'bold' },
            1: { cellWidth: 'auto', halign: 'center' },
          },
          margin: {
            top: safeTopMargin,
            bottom: safeBottomMargin,
            left: margin,
            right: margin,
          },
          rowPageBreak: 'avoid',
          didDrawCell: function (dataHook: any) {
            if (dataHook.section === 'body' && dataHook.column.index === 1) {
              const rowIndex = dataHook.row.index;

              const imgSrc =
                data[rowIndex].image?.src ||
                (data[rowIndex].images && data[rowIndex].images[0]?.src);

              if (dataHook.cell && imgSrc) {
                try {
                  const imgProps = doc.getImageProperties(imgSrc);
                  const imgRatio = imgProps.width / imgProps.height;

                  const maxW = dataHook.cell.width - 8;
                  const maxH = dataHook.cell.height - 8;
                  const cellRatio = maxW / maxH;

                  let finalW = maxW;
                  let finalH = maxH;

                  if (imgRatio > cellRatio) {
                    finalH = maxW / imgRatio;
                  } else {
                    finalW = maxH * imgRatio;
                  }

                  const xOffset = dataHook.cell.x + 4 + (maxW - finalW) / 2;
                  const yOffset = dataHook.cell.y + 4 + (maxH - finalH) / 2;

                  doc.addImage(
                    imgSrc,
                    'JPEG',
                    xOffset,
                    yOffset,
                    finalW,
                    finalH,
                    undefined,
                    'FAST',
                  );
                } catch (e) {
                  // Fallback
                }
              } else if (dataHook.cell) {
                doc.setFontSize(7.5);
                doc.setTextColor(150, 150, 150);
                const txt = 'Fotografía no disponible';
                const w = doc.getTextWidth(txt);
                doc.text(
                  txt,
                  dataHook.cell.x + dataHook.cell.width / 2 - w / 2,
                  dataHook.cell.y + dataHook.cell.height / 2 + 3,
                );
                doc.setTextColor(0, 0, 0);
              }
            }
          },
        };
        autoTable(doc, visTableOptions);
        return (doc as any).lastAutoTable.finalY + 15;
      };

      currentY = drawVisualTable('SECCIÓN 1: ENTRADA', m6Sec1Data);

      doc.addPage();
      currentY = safeTopMargin + 10;
      currentY = drawVisualTable('SECCIÓN 2: INYECCIÓN DE JARABE', m6Sec2Data);

      doc.addPage();
      currentY = safeTopMargin + 10;
      drawVisualTable('SECCIÓN 3: SELLADO, VACÍO Y SALIDA', m6Sec3Data);

      // Inyección Global de Headers y Footers
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        drawAWSHeader();
        drawAWSFooter();
      }

      doc.save('Mondini6_Plan_Lavado.pdf');
    } catch (error) {
      console.error('Error crítico al generar PDF: ', error);
    } finally {
      setIsExporting(false);
    }
  };

  const renderCards = (data: any[]) => (
    <Cards
      cardsPerRow={[
        { cards: 1 },
        { minWidth: 700, cards: 2 },
        { minWidth: 1100, cards: 3 },
      ]}
      cardDefinition={{
        header: (item) => (
          <div
            className="card-title"
            style={{
              fontSize: '17px',
              fontWeight: '900',
              color: colors.activeLink,
            }}
          >
            {item.name || item.tech}
          </div>
        ),
        sections: [
          {
            id: 'carousel',
            content: (item) => (
              <CardCarousel
                images={
                  item.images
                    ? item.images
                    : [
                        {
                          src: item.image?.src || null,
                          label: item.image?.label || 'Componente',
                        },
                      ]
                }
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
                  fontWeight: '500',
                }}
              >
                {item.desc}
              </span>
            ),
          },
          {
            id: 'raw',
            content: (item) =>
              item.raw ? (
                <span
                  style={{
                    fontSize: '12px',
                    color: '#879596',
                    fontFamily: 'monospace',
                    display: 'block',
                    marginTop: '8px',
                  }}
                >
                  Físico: {item.raw}
                </span>
              ) : null,
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
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'clip',
        width: '100%',
        maxWidth: '100%',
      }}
    >
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes slowFadeIn { 0% { opacity: 0; filter: blur(4px); transform: scale(0.98); } 100% { opacity: 1; filter: blur(0); transform: scale(1); } }
        .slow-transition-fade { animation: slowFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .flex-container { display: flex; flex-direction: row; max-width: 1400px; margin: 0 auto; padding: 60px 40px; gap: 60px; align-items: stretch; flex-grow: 1; width: 100%; box-sizing: border-box; }
        .flex-content { flex: 1 1 0%; min-width: 0; width: 100%; max-width: 100%; box-sizing: border-box; }
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

      {/* Menú Móvil */}
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
              animation: 'slowFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
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
          {/* NOTIFICACIONES */}
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
              <span style={{ color: '#879596' }}>Plan de Limpieza</span>{' '}
              <span style={{ margin: '0 12px', color: '#879596' }}>/</span>{' '}
              <span style={{ color: '#fbfbfb', fontWeight: 'bold' }}>
                Línea Mondini 6
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
                  Catálogo de Puntos Críticos Durante Lavado de Equipos
                </h1>

                <div
                  style={{
                    marginTop: '30px',
                    borderTop: '1px solid rgba(255,255,255,0.15)',
                    paddingTop: '20px',
                  }}
                >
                  <ColumnLayout columns={5} variant="text-grid">
                    <div>
                      <div
                        style={{
                          color: '#aab7b8',
                          fontSize: '12px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          marginBottom: '4px',
                        }}
                      >
                        Planta
                      </div>
                      <div
                        style={{
                          color: '#ffffff',
                          fontSize: '14px',
                          fontWeight: 500,
                        }}
                      >
                        Congelados
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          color: '#aab7b8',
                          fontSize: '12px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          marginBottom: '4px',
                        }}
                      >
                        Área
                      </div>
                      <div
                        style={{
                          color: '#ffffff',
                          fontSize: '14px',
                          fontWeight: 500,
                        }}
                      >
                        Mondinis
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          color: '#aab7b8',
                          fontSize: '12px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          marginBottom: '4px',
                        }}
                      >
                        Equipo
                      </div>
                      <div
                        style={{
                          color: '#ffffff',
                          fontSize: '14px',
                          fontWeight: 500,
                        }}
                      >
                        Mondini #6
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          color: '#aab7b8',
                          fontSize: '12px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          marginBottom: '4px',
                        }}
                      >
                        Realizado por
                      </div>
                      <div
                        style={{
                          color: '#ffffff',
                          fontSize: '14px',
                          fontWeight: 500,
                        }}
                      >
                        Mantenimiento
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          color: '#aab7b8',
                          fontSize: '12px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          marginBottom: '4px',
                        }}
                      >
                        Dirigido a
                      </div>
                      <div
                        style={{
                          color: '#ffffff',
                          fontSize: '14px',
                          fontWeight: 500,
                        }}
                      >
                        Sanidad
                      </div>
                    </div>
                  </ColumnLayout>
                </div>
              </div>

              <div
                className="btn-download-wrap"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-end',
                  paddingTop: '10px',
                }}
              >
                <Button
                  variant={'primary' as any}
                  iconName={'download' as any}
                  loading={isExporting}
                  onClick={handleExportPDF}
                >
                  Descargar PDF
                </Button>
              </div>
            </Grid>
          </div>
        </div>
      </div>

      <div className="flex-container">
        <div className="flex-content">
          <div id="intro" className="section-wrap">
            <ColumnLayout columns={2} variant="text-grid">
              <SpaceBetween size="l">
                <div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: colors.textMain,
                      marginBottom: '6px',
                    }}
                  >
                    Propósito
                  </div>
                  <p className="text-normal">
                    Establecer los puntos críticos de protección durante las
                    actividades de lavado sanitario en los equipos de proceso,
                    con el fin de prevenir daños en componentes mecánicos,
                    neumáticos y eléctricos sensibles al agua o químicos de
                    limpieza, asegurando la integridad del equipo y la
                    continuidad operativa.
                  </p>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: colors.textMain,
                      marginBottom: '6px',
                    }}
                  >
                    Alcance
                  </div>
                  <p className="text-normal">
                    Este catálogo aplica al personal de Sanidad involucrado en
                    actividades de limpieza de equipos en planta 2, incluyendo
                    la identificación, protección y verificación de componentes
                    críticos antes, durante y después del lavado. La instrucción
                    aplica para todos los componentes equivalentes presentes en
                    el equipo o línea, aun cuando no se identifiquen
                    individualmente.
                  </p>
                </div>
              </SpaceBetween>

              <SpaceBetween size="l">
                <div
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(215, 43, 15, 0.1)'
                      : '#fdf3f1',
                    padding: '24px',
                    borderLeft: '4px solid #d13212',
                    borderRadius: '0 8px 8px 0',
                    height: '100%',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: '900',
                      color: '#d13212',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Icon name="status-warning" variant="error" /> Nota de
                    seguridad
                  </div>
                  <p
                    style={{
                      fontSize: '15px',
                      lineHeight: '1.6',
                      margin: 0,
                      color: isDark ? '#fbfbfb' : '#16191f',
                      fontWeight: '500',
                    }}
                  >
                    El lavado inadecuado de componentes críticos puede ocasionar
                    fallas en el equipo y generar condiciones inseguras. Es
                    obligatorio seguir las instrucciones de protección
                    establecidas en este catálogo.
                  </p>
                </div>
              </SpaceBetween>
            </ColumnLayout>
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
                      Sección 1: Entrada
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
                        id: 'component',
                        header: 'Componente',
                        cell: (e: any) => (
                          <div>
                            <span
                              style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: colors.activeLink,
                                display: 'block',
                              }}
                            >
                              {e.name || e.tech}
                            </span>
                            {e.raw && (
                              <span
                                style={{ fontSize: '12px', color: '#879596' }}
                              >
                                {e.raw}
                              </span>
                            )}
                          </div>
                        ),
                        minWidth: 250,
                      },
                      {
                        id: 'desc',
                        header: 'Instrucción de Aislamiento',
                        cell: (e: any) => (
                          <span style={{ fontSize: '14px', lineHeight: '1.5' }}>
                            {e.desc}
                          </span>
                        ),
                        minWidth: 350,
                      },
                    ]}
                    items={m6Sec1Data}
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
                      Sección 2: Inyección de Jarabe
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
                        id: 'component',
                        header: 'Componente',
                        cell: (e: any) => (
                          <div>
                            <span
                              style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: colors.activeLink,
                                display: 'block',
                              }}
                            >
                              {e.name || e.tech}
                            </span>
                            {e.raw && (
                              <span
                                style={{ fontSize: '12px', color: '#879596' }}
                              >
                                {e.raw}
                              </span>
                            )}
                          </div>
                        ),
                        minWidth: 250,
                      },
                      {
                        id: 'desc',
                        header: 'Instrucción de Aislamiento',
                        cell: (e: any) => (
                          <span style={{ fontSize: '14px', lineHeight: '1.5' }}>
                            {e.desc}
                          </span>
                        ),
                        minWidth: 350,
                      },
                    ]}
                    items={m6Sec2Data}
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
                      Sección 3: Sellado, Vacío y Salida
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
                        id: 'component',
                        header: 'Componente',
                        cell: (e: any) => (
                          <div>
                            <span
                              style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: colors.activeLink,
                                display: 'block',
                              }}
                            >
                              {e.name || e.tech}
                            </span>
                            {e.raw && (
                              <span
                                style={{ fontSize: '12px', color: '#879596' }}
                              >
                                {e.raw}
                              </span>
                            )}
                          </div>
                        ),
                        minWidth: 250,
                      },
                      {
                        id: 'desc',
                        header: 'Instrucción de Aislamiento',
                        cell: (e: any) => (
                          <span style={{ fontSize: '14px', lineHeight: '1.5' }}>
                            {e.desc}
                          </span>
                        ),
                        minWidth: 350,
                      },
                    ]}
                    items={m6Sec3Data}
                    stripedRows
                  />
                </div>
              </Container>
            </SpaceBetween>
          </div>

          <div id="sec1" className="section-wrap">
            <SectionTitle
              title="Mondini 6 - Sección 1"
              subtitle="Inspección visual detallada de Componentes de Entrada."
              isDark={isDark}
            />
            <div style={{ width: '100%', overflow: 'hidden' }}>
              {renderCards(m6Sec1Data)}
            </div>
          </div>
          <div id="sec2" className="section-wrap">
            <SectionTitle
              title="Mondini 6 - Sección 2"
              subtitle="Inspección visual de Componentes en Inyección de Jarabe."
              isDark={isDark}
            />
            <div style={{ width: '100%', overflow: 'hidden' }}>
              {renderCards(m6Sec2Data)}
            </div>
          </div>
          <div id="sec3" className="section-wrap">
            <SectionTitle
              title="Mondini 6 - Sección 3"
              subtitle="Inspección visual exhaustiva en la Zona de Sellado, Vacío y Salida de Producto."
              isDark={isDark}
            />
            <div style={{ width: '100%', overflow: 'hidden' }}>
              {renderCards(m6Sec3Data)}
            </div>
          </div>
        </div>

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
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
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
            </SpaceBetween>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
