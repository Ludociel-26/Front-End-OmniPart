import * as React from 'react';
import api from '@/services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Table,
  Box,
  SpaceBetween,
  Button,
  TextFilter,
  Header,
  Pagination,
  CollectionPreferences,
  Select,
  AppLayout,
  StatusIndicator,
  Grid,
  FormField,
  Link,
  SplitPanel,
  ColumnLayout,
  Badge,
  Icon,
  DatePicker,
  Flashbar,
  Modal,
  Input,
  Textarea,
} from '@cloudscape-design/components';
import { useCollection } from '@cloudscape-design/collection-hooks';

import { AppContent } from '@/context/AppContext';
import Navbar from '@/components/layouts/AppHeader';
import GlobalSidebar from '@/components/layouts/AppSidebar';
import SecondaryHeader from '@/components/layouts/BreadcrumbNavBar';
import { Footer } from '@/components/layouts/AppFooter';

import logoDelMonte from '@/assets/icons/logo-2.svg';
import emptyStateImage from '@/assets/table-items/robot-empty.svg';

const MAINTENANCE_API_URL =
  import.meta.env.VITE_MAINTENANCE_API_URL || 'http://localhost:4001';

// --- ESTILOS VISUALES ---
const styles = `
  div[class*="awsui_dropdown"], ul[class*="awsui_options-list"], div[class*="awsui_select-pane"] { scrollbar-width: none !important; -ms-overflow-style: none !important; }
  div[class*="awsui_dropdown"]::-webkit-scrollbar, ul[class*="awsui_options-list"]::-webkit-scrollbar, div[class*="awsui_select-pane"]::-webkit-scrollbar { display: none !important; }
  span[class*="awsui_option-content"] { white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; display: block !important; max-width: 100% !important; }
  .awsui-table-container { padding-bottom: 2px; }
  .checklist-summary-card { position: relative; width: 100%; padding: 20px; border-radius: 12px; background: linear-gradient(135deg, #1d2c3f 0%, #0f1b2a 100%); box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.1); color: white; display: flex; flex-direction: column; gap: 8px; }
  .summary-title { font-size: 18px; font-weight: 800; margin: 0; color: #fff; }
  .summary-subtitle { font-size: 12px; color: #aab7b8; }
  .floating-filter { position: relative; display: inline-block; margin-top: 6px; min-width: 140px; }
  .floating-filter label { position: absolute; top: -8px; left: 10px; background-color: var(--color-background-layout-main, #ffffff) !important; padding: 0 4px; font-size: 12px; font-weight: 700; color: var(--color-text-body-default, #000000) !important; z-index: 10; line-height: 1; pointer-events: none; border-radius: 2px; }
  html.dark .floating-filter label, [data-theme="dark"] .floating-filter label { background-color: var(--color-background-layout-main, #161d26) !important; color: var(--color-text-body-default, #ffffff) !important; }
`;

const EmptyState = ({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action: React.ReactNode;
}) => (
  <Box textAlign="center" color="inherit">
    <Box padding={{ bottom: 's' }} variant="p" color="inherit">
      <b>{title}</b>
    </Box>
    <Box padding={{ bottom: 's' }} variant="p" color="inherit">
      {subtitle}
    </Box>
    <Box padding={{ bottom: 'l' }}>
      <img
        src={emptyStateImage}
        alt="Estado vacío"
        style={{
          maxWidth: '250px',
          width: '100%',
          display: 'block',
          margin: '0 auto',
        }}
      />
    </Box>
    {action}
  </Box>
);

const getLogoData = async (
  url: string,
): Promise<{ data: string; width: number; height: number } | null> => {
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
};

const COLUMN_DEFINITIONS = [
  {
    id: 'id',
    header: 'ID Bitácora',
    cell: (item: any) => <Link href="#">#{item.id}</Link>,
    sortingField: 'id',
    minWidth: 120,
  },
  {
    id: 'fecha',
    header: 'Fecha de Producción',
    cell: (item: any) => item.productionDate,
    sortingField: 'productionDate',
    minWidth: 150,
  },
  {
    id: 'caldera',
    header: 'Caldera',
    cell: (item: any) => <b>{item.caldera}</b>,
    sortingField: 'caldera',
    minWidth: 150,
  },
  {
    id: 'lecturas',
    header: 'Horas Registradas',
    cell: (item: any) => (
      <Badge color="blue">{item.readings?.length || 0} / 24 hrs</Badge>
    ),
    minWidth: 140,
  },
  {
    id: 'estado',
    header: 'Estado Documento',
    minWidth: 150,
    cell: (item: any) => {
      const isComplete = item.readings?.length >= 24;
      return (
        <StatusIndicator type={isComplete ? 'success' : 'warning'}>
          {isComplete ? 'Completado' : 'En Progreso'}
        </StatusIndicator>
      );
    },
  },
];

export default function CentralVaporLogsTable() {
  const appContext = React.useContext(AppContent) as any;
  const alerts = appContext?.alerts || [];
  const addAlert = appContext?.addAlert;
  const user = appContext?.user;

  const [data, setData] = React.useState<any[]>([]);
  const [rawLogs, setRawLogs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);

  // Estados SGC
  const [isSavingConfig, setIsSavingConfig] = React.useState(false);
  const [isConfigModalVisible, setIsConfigModalVisible] = React.useState(false);
  const [formConfig, setFormConfig] = React.useState({
    codigo_documento: '',
    version: '',
    fecha_revision: '',
    fecha_reemplazo: '',
    propietario: '',
    aprobador: '',
    estandar_calidad: '',
    razon_cambio: '',
  });

  const [isDeleteModalVisible, setIsDeleteModalVisible] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] =
    React.useState('');

  const [navigationOpen, setNavigationOpen] = React.useState(true);
  const [selectedItems, setSelectedItems] = React.useState<any[]>([]);
  const [splitPanelOpen, setSplitPanelOpen] = React.useState(false);

  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  const [preferences, setPreferences] = React.useState<any>({
    pageSize: 50,
    visibleContent: ['id', 'fecha', 'caldera', 'lecturas', 'estado'],
  });

  React.useEffect(() => {
    setSplitPanelOpen(selectedItems.length === 1);
  }, [selectedItems]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get(`${MAINTENANCE_API_URL}/api/central-vapor`);
      if (res.data.success) {
        setRawLogs(res.data.data);
        setData(res.data.data);
      }
    } catch (error) {
      if (addAlert)
        addAlert('error', 'Error al obtener bitácoras de la Central de Vapor.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReports();
  }, []);

  // --- SGC ---
  const handleOpenConfigModal = async () => {
    try {
      const res = await api.get(`${MAINTENANCE_API_URL}/api/document-configs`);
      if (res.data.success) {
        const current = res.data.data.find(
          (c: any) => c.area_key === 'central_vapor_bitacora',
        );
        if (current) setFormConfig(current);
        setIsConfigModalVisible(true);
      }
    } catch (e) {
      if (addAlert) addAlert('error', 'Fallo al consultar plantilla maestra.');
    }
  };

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      const res = await api.put(
        `${MAINTENANCE_API_URL}/api/document-configs/central_vapor_bitacora`,
        formConfig,
      );
      if (res.data.success) {
        if (addAlert)
          addAlert(
            'success',
            `Formato SGC actualizado a la versión ${formConfig.version}.`,
          );
        setIsConfigModalVisible(false);
        fetchReports();
      }
    } catch (error) {
      if (addAlert) addAlert('error', 'Privilegios insuficientes.');
    } finally {
      setIsSavingConfig(false);
    }
  };

  // --- BORRAR ---
  const handleDeleteSubmit = async () => {
    setIsDeleting(true);
    try {
      for (const item of selectedItems) {
        await api.delete(`${MAINTENANCE_API_URL}/api/central-vapor/${item.id}`);
      }
      if (addAlert)
        addAlert(
          'success',
          `Se eliminaron ${selectedItems.length} bitácora(s).`,
        );
      setIsDeleteModalVisible(false);
      setDeleteConfirmationText('');
      setSelectedItems([]);
      fetchReports();
    } catch (error) {
      if (addAlert) addAlert('error', 'Rechazado: Error de privilegios.');
    } finally {
      setIsDeleting(false);
    }
  };

  // --- 🚩 GENERADOR DE PDF: BITÁCORA CENTRAL DE VAPOR 100% FIEL A LA IMAGEN ---
  const handleExportPDF = async () => {
    if (selectedItems.length === 0) return;
    setIsExporting(true);
    try {
      const doc = new jsPDF('l', 'pt', 'letter'); // Landscape
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth(); // 792
      const pageHeight = doc.internal.pageSize.getHeight(); // 612
      const logoData = await getLogoData(logoDelMonte);

      for (let i = 0; i < selectedItems.length; i++) {
        const log = selectedItems[i];
        if (i > 0) doc.addPage();

        const safeTextCenter = (text: string, x: number, y: number) => {
          doc.text(text, x - doc.getTextWidth(text) / 2, y);
        };

        // --- 1. HEADER (Idéntico a la foto) ---
        const headerH = 45;
        doc.setDrawColor(0);
        doc.setLineWidth(1);
        doc.rect(margin, margin, pageWidth - margin * 2, headerH);

        const col1W = 200;
        const col3W = 160;
        doc.line(margin + col1W, margin, margin + col1W, margin + headerH);
        doc.line(
          pageWidth - margin - col3W,
          margin,
          pageWidth - margin - col3W,
          margin + headerH,
        );
        doc.line(margin, margin + 30, margin + col1W, margin + 30);

        if (logoData) {
          const ratio = logoData.width / logoData.height;
          let finalH = 22;
          let finalW = finalH * ratio;
          doc.addImage(
            logoData.data,
            'PNG',
            margin + (col1W - finalW) / 2,
            margin + (30 - finalH) / 2,
            finalW,
            finalH,
          );
        }
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        safeTextCenter(
          'Formato Departamental',
          margin + col1W / 2,
          margin + 40,
        );

        doc.setFontSize(8);
        doc.text('Titulo:', margin + col1W + 5, margin + 12);
        doc.setFontSize(14);
        safeTextCenter(
          'Bitácora Central de Vapor',
          margin + col1W + (pageWidth - margin * 2 - col1W - col3W) / 2,
          margin + 32,
        );

        doc.setFontSize(8);
        doc.text('Numero:', pageWidth - margin - col3W + 5, margin + 12);
        doc.setFontSize(12);
        safeTextCenter(
          log.codigo_documento || '2.2-16-3-7',
          pageWidth - margin - col3W / 2,
          margin + 32,
        );

        // --- 2. SUB-HEADER (Caldera y Fecha) ---
        let currentY = margin + 65;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('CALDERA :', margin + 40, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(log.caldera || '', margin + 100, currentY);
        doc.line(margin + 95, currentY + 2, margin + 250, currentY + 2); // Linea de Caldera

        doc.setFont('helvetica', 'bold');
        doc.text('FECHA :', pageWidth - margin - 200, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(log.productionDate || '', pageWidth - margin - 150, currentY);
        doc.line(
          pageWidth - margin - 155,
          currentY + 2,
          pageWidth - margin - 50,
          currentY + 2,
        );

        // --- 3. TABLA PRINCIPAL (21 Columnas, 24 Filas) ---
        currentY += 15;

        // El arreglo estricto de las 24 horas del formato
        const hoursArray = [
          '7',
          '8',
          '9',
          '10',
          '11',
          '12',
          '13',
          '14',
          '15',
          '16',
          '17',
          '18',
          '19',
          '20',
          '21',
          '22',
          '23',
          '24',
          '1',
          '2',
          '3',
          '4',
          '5',
          '6',
        ];

        // Construimos el body buscando las lecturas
        const tableBody = hoursArray.map((hr) => {
          const r =
            (log.readings || []).find((rd: any) => rd.hora === hr) || {};
          return [
            hr, // HORA
            r.presion_comb || '',
            r.presion_vapor || '', // PRESION
            r.lbs_aire || '', // LBS
            r.temp_comb || '',
            r.temp_dia || '',
            r.temp_gases || '',
            r.temp_agua || '', // TEMPERATURAS
            r.operacion_comb || '',
            r.operacion_diesel || '', // OPERACION
            r.nivel_combustoleo_dia || '',
            r.disp_seguridad || '',
            r.bomba_alim_agua || '', // REVISIONES
            r.agua_suave || '',
            r.agua_cruda || '', // ALIM AGUA
            r.colum_h_agua || '',
            r.purga_fondo || '', // COLUM / PURGA
            r.consumo_dia || '',
            r.consumo_tarde || '',
            r.consumo_noche || '',
            r.consumo_total || '', // CONSUMOS
          ];
        });

        autoTable(doc, {
          startY: currentY,
          margin: { left: margin, right: margin },
          head: [
            [
              { content: 'HORA', rowSpan: 2, styles: { valign: 'middle' } },
              { content: 'PRESIÓN EN Kg.', colSpan: 2 },
              {
                content: 'LBS\nAIRE',
                rowSpan: 2,
                styles: { valign: 'middle' },
              },
              { content: 'TEMPERATURA EN °C', colSpan: 4 },
              { content: 'OPERACIÓN', colSpan: 2 },
              {
                content: 'REVISAR NIVEL DE\nCOMBUSTOLEO EN\nTANQUE DE DIA',
                rowSpan: 2,
                styles: { valign: 'middle', fontSize: 4.5 },
              },
              {
                content: 'REVISAR\nDISPOSITIVOS\nDE\nSEGURIDAD',
                rowSpan: 2,
                styles: { valign: 'middle', fontSize: 4.5 },
              },
              {
                content: 'REVISAR\nBOMBA DE\nALIMENTACION\nDE AGUA',
                rowSpan: 2,
                styles: { valign: 'middle', fontSize: 4.5 },
              },
              { content: 'ALIM. DE AGUA', colSpan: 2 },
              {
                content: 'COLUM.\nH.AGUA',
                rowSpan: 2,
                styles: { valign: 'middle', fontSize: 5 },
              },
              {
                content: 'PURGA\nFONDO',
                rowSpan: 2,
                styles: { valign: 'middle', fontSize: 5 },
              },
              { content: 'CONSUMOS DE COMBUSTIBLE', colSpan: 4 },
            ],
            [
              'COMB.',
              'VAPOR',
              'COMB.',
              'T. DIA',
              'GASES',
              'AGUA',
              'COMB.',
              'DIESEL',
              'SUAVE',
              'CRUDA',
              'DIA',
              'TARDE',
              'NOCHE',
              'TOTAL',
            ],
          ],
          body: tableBody,
          theme: 'grid',
          styles: {
            fontSize: 5.5,
            cellPadding: 1.5,
            halign: 'center',
            valign: 'middle',
            lineColor: 0,
            lineWidth: 0.5,
          },
          headStyles: {
            fillColor: [230, 230, 230],
            textColor: 0,
            fontStyle: 'bold',
            fontSize: 5,
          },
          columnStyles: {
            0: { cellWidth: 25, fontStyle: 'bold' }, // Hora
            1: { cellWidth: 30 },
            2: { cellWidth: 30 }, // Presion
            3: { cellWidth: 25 }, // Lbs
            4: { cellWidth: 30 },
            5: { cellWidth: 30 },
            6: { cellWidth: 30 },
            7: { cellWidth: 30 }, // Temp
            8: { cellWidth: 28 },
            9: { cellWidth: 28 }, // Operacion
            10: { cellWidth: 50 },
            11: { cellWidth: 50 },
            12: { cellWidth: 50 }, // Revisiones (más anchas)
            13: { cellWidth: 28 },
            14: { cellWidth: 28 }, // Alim agua
            15: { cellWidth: 32 },
            16: { cellWidth: 32 }, // Colum / Purga
            17: { cellWidth: 35 },
            18: { cellWidth: 35 },
            19: { cellWidth: 35 },
            20: { cellWidth: 35 }, // Consumos
          },
          didParseCell: function (data) {
            // Formato Condicional Leve: Amarillo si la celda numérica está vacía en horas clave (Opcional, lo dejamos limpio)
          },
        });

        // --- 4. ZONA INFERIOR (Cierre de Día) ---
        let finalY = (doc as any).lastAutoTable.finalY;

        // Dibujamos el recuadro que envuelve esta zona
        doc.setDrawColor(0);
        doc.setLineWidth(1);
        doc.rect(margin, finalY, pageWidth - margin * 2, 70);

        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('OBSERVACIONES :', margin + 5, finalY + 12);

        // Líneas de Observaciones
        doc.line(margin + 75, finalY + 12, margin + 300, finalY + 12);
        doc.line(margin + 5, finalY + 22, margin + 300, finalY + 22);

        // Bloque Izquierdo Inferior
        doc.text(
          'Rev. De bypass de Comb. Tanque de dia :',
          margin + 5,
          finalY + 35,
        );
        doc.setFont('helvetica', 'normal');
        doc.text(log.rev_bypass || '', margin + 175, finalY + 35);
        doc.line(margin + 170, finalY + 36, margin + 300, finalY + 36);

        doc.setFont('helvetica', 'bold');
        doc.text('Revisar nivel de combustoleo', margin + 5, finalY + 45);
        doc.text('Tanque de almacenamiento', margin + 5, finalY + 53);
        doc.text(
          'Principal. (Al Inicio del Turno "A"):',
          margin + 5,
          finalY + 61,
        );
        doc.setFont('helvetica', 'normal');
        doc.text(log.nivel_combustoleo_prin || '', margin + 150, finalY + 61);
        doc.line(margin + 145, finalY + 62, margin + 300, finalY + 62);

        // Bloque Central (Consumos)
        doc.setFont('helvetica', 'normal');
        doc.text('Consumo de agua', pageWidth / 2 - 40, finalY + 35);
        doc.text(log.consumo_agua || '', pageWidth / 2 + 35, finalY + 35);
        doc.line(
          pageWidth / 2 + 30,
          finalY + 36,
          pageWidth / 2 + 100,
          finalY + 36,
        );

        doc.text('Total Kg./vapor', pageWidth / 2 - 40, finalY + 43);
        doc.text(log.total_kg_vapor || '', pageWidth / 2 + 35, finalY + 43);
        doc.line(
          pageWidth / 2 + 30,
          finalY + 44,
          pageWidth / 2 + 100,
          finalY + 44,
        );

        doc.text('Sal', pageWidth / 2 - 40, finalY + 51);
        doc.text(log.sal || '', pageWidth / 2 + 35, finalY + 51);
        doc.line(
          pageWidth / 2 + 30,
          finalY + 52,
          pageWidth / 2 + 100,
          finalY + 52,
        );

        doc.text('Diesel', pageWidth / 2 - 40, finalY + 59);
        doc.text(log.diesel || '', pageWidth / 2 + 35, finalY + 59);
        doc.line(
          pageWidth / 2 + 30,
          finalY + 60,
          pageWidth / 2 + 100,
          finalY + 60,
        );

        // Bloque Derecho (Operadores)
        doc.setFont('helvetica', 'bold');
        doc.text('OPERADORES', pageWidth - margin - 150, finalY + 12);
        doc.text('TURNO A', pageWidth - margin - 150, finalY + 22);
        doc.setFont('helvetica', 'normal');
        doc.text(
          log.operatorA?.name
            ? `${log.operatorA.name} ${log.operatorA.surname}`
            : '',
          pageWidth - margin - 110,
          finalY + 22,
        );
        doc.line(
          pageWidth - margin - 115,
          finalY + 23,
          pageWidth - margin - 10,
          finalY + 23,
        );

        doc.setFont('helvetica', 'bold');
        doc.text('TURNO B', pageWidth - margin - 150, finalY + 32);
        doc.setFont('helvetica', 'normal');
        doc.text(
          log.operatorB?.name
            ? `${log.operatorB.name} ${log.operatorB.surname}`
            : '',
          pageWidth - margin - 110,
          finalY + 32,
        );
        doc.line(
          pageWidth - margin - 115,
          finalY + 33,
          pageWidth - margin - 10,
          finalY + 33,
        );

        doc.setFont('helvetica', 'bold');
        doc.text('TURNO C', pageWidth - margin - 150, finalY + 42);
        doc.setFont('helvetica', 'normal');
        doc.text(
          log.operatorC?.name
            ? `${log.operatorC.name} ${log.operatorC.surname}`
            : '',
          pageWidth - margin - 110,
          finalY + 42,
        );
        doc.line(
          pageWidth - margin - 115,
          finalY + 43,
          pageWidth - margin - 10,
          finalY + 43,
        );

        doc.setFont('helvetica', 'normal');
        doc.text('Firmas', pageWidth - margin - 50, finalY + 60);

        // --- 5. PIE DE PÁGINA SGC (Fijo abajo) ---
        const bY = pageHeight - margin - 35;
        const totalW = pageWidth - margin * 2;
        doc.setDrawColor(0);
        doc.setLineWidth(1);
        doc.rect(margin, bY, totalW, 35);
        doc.line(margin, bY + 18, margin + totalW, bY + 18);

        const cWidths = [100, 100, 70, 180, 200, totalW - 650];
        let cX = margin;
        for (let j = 0; j < cWidths.length - 1; j++) {
          cX += cWidths[j];
          doc.line(cX, bY, cX, bY + 18);
        }

        doc.setFontSize(7);
        let txX = margin;
        const getC = (w: number) => {
          const c = txX + w / 2;
          txX += w;
          return c;
        };

        safeTextCenter(
          `Fecha de Revisión:\n${log.fecha_revision}`,
          getC(cWidths[0]),
          bY + 8,
        );
        safeTextCenter(
          `Reemplaza a:\n${log.fecha_reemplazo}`,
          getC(cWidths[1]),
          bY + 8,
        );
        safeTextCenter(`Versión:\n${log.version}`, getC(cWidths[2]), bY + 10);
        safeTextCenter(
          `Propietario: ${log.propietario}\nAprobado: ${log.aprobador}`,
          getC(cWidths[3]),
          bY + 8,
        );
        safeTextCenter(
          `Estándar:\n${log.estandar_calidad}`,
          getC(cWidths[4]),
          bY + 8,
        );
        safeTextCenter(`Página 1 de 1`, getC(cWidths[5]), bY + 10);

        doc.setFont('helvetica', 'bold');
        doc.text('Razón del cambio:', margin + 5, bY + 28);
        doc.setFont('helvetica', 'normal');
        doc.text(log.razon_cambio || '', margin + 85, bY + 28, {
          maxWidth: totalW - 90,
        });
      }

      doc.save(
        selectedItems.length === 1
          ? `Central_Vapor_${selectedItems[0].productionDate}.pdf`
          : `Central_Vapor_Lote.pdf`,
      );
      if (addAlert)
        addAlert(
          'success',
          `Se exportaron ${selectedItems.length} bitácora(s) con el formato normativo.`,
        );
    } catch (error) {
      if (addAlert) addAlert('error', 'Error al generar el documento PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const {
    items,
    actions,
    filteredItemsCount,
    collectionProps,
    paginationProps,
    filterProps,
  } = useCollection(data, {
    pagination: { pageSize: preferences.pageSize },
    sorting: {
      defaultState: {
        sortingColumn: COLUMN_DEFINITIONS[1],
        isDescending: true,
      },
    },
    selection: {},
    filtering: {
      empty: (
        <EmptyState
          title="No hay registros"
          subtitle="No existen bitácoras en la BD."
          action={
            <Button variant="primary" href="/central-vapor/new">
              Nueva Captura
            </Button>
          }
        />
      ),
      noMatch: (
        <EmptyState
          title="Sin coincidencias"
          subtitle="Modifica los filtros."
          action={
            <Button
              onClick={() => {
                actions.setFiltering('');
                setStartDate('');
                setEndDate('');
              }}
            >
              Borrar filtros
            </Button>
          }
        />
      ),
      filteringFunction: (item, text) => {
        const matchText =
          item.id.toString().includes(text) ||
          item.caldera.toLowerCase().includes(text.toLowerCase());
        let matchFecha = true;
        if (startDate || endDate) {
          const itemDate = new Date(
            `${item.productionDate}T12:00:00`,
          ).getTime();
          if (
            startDate &&
            itemDate < new Date(`${startDate}T00:00:00`).getTime()
          )
            matchFecha = false;
          if (endDate && itemDate > new Date(`${endDate}T23:59:59`).getTime())
            matchFecha = false;
        }
        return matchText && matchFecha;
      },
    },
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#f2f3f3',
        paddingBottom: '24px',
      }}
    >
      <style>{styles}</style>
      <div
        id="sticky-nav-container"
        style={{ position: 'sticky', top: 0, zIndex: 1002, width: '100%' }}
      >
        <Navbar />
        {/* @ts-ignore */}
        <SecondaryHeader
          breadcrumbs={[
            { text: 'Mantenimiento', href: '/' },
            { text: 'Bitácoras Operativas', href: '#' },
            { text: 'Central de Vapor', href: '#' },
          ]}
          isMenuOpen={navigationOpen}
          onMenuClick={() => setNavigationOpen(!navigationOpen)}
        />
      </div>

      <AppLayout
        headerSelector="#sticky-nav-container"
        navigation={<GlobalSidebar />}
        navigationOpen={navigationOpen}
        onNavigationChange={({ detail }) => setNavigationOpen(detail.open)}
        contentType="table"
        notifications={
          alerts && alerts.length > 0 ? (
            <Flashbar items={alerts as any} stackItems={true} />
          ) : null
        }
        splitPanelOpen={splitPanelOpen}
        onSplitPanelToggle={({ detail }) => setSplitPanelOpen(detail.open)}
        splitPanelPreferences={{ position: 'side', size: 380 } as any}
        splitPanel={
          <SplitPanel
            header={(<Header variant="h2">Radiografía del Día</Header>) as any}
          >
            {selectedItems.length === 1 ? (
              <div style={{ paddingBottom: '20px' }}>
                {selectedItems.map((item) => (
                  <div key={item.id}>
                    <div className="checklist-summary-card">
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <p className="summary-subtitle">
                            ID Maestro: #{item.id}
                          </p>
                          <h3 className="summary-title">{item.caldera}</h3>
                        </div>
                        <StatusIndicator
                          type={
                            item.readings?.length >= 24 ? 'success' : 'warning'
                          }
                        />
                      </div>
                      <div
                        style={{
                          marginTop: '12px',
                          fontSize: '13px',
                          color: '#cbd5e1',
                        }}
                      >
                        <Icon name={'calendar' as any} size="small" />{' '}
                        {item.productionDate}
                      </div>
                    </div>
                    <ColumnLayout columns={1} variant="text-grid">
                      <div style={{ marginBottom: '16px' }}>
                        <Box
                          variant={'awsui-key-label' as any}
                          color="text-label"
                          fontSize="body-s"
                        >
                          Operadores en Turno
                        </Box>
                        <div style={{ fontSize: '13px' }}>
                          <b>Turno A:</b>{' '}
                          {item.operatorA?.name
                            ? `${item.operatorA.name} ${item.operatorA.surname}`
                            : 'Pendiente'}
                          <br />
                          <b>Turno B:</b>{' '}
                          {item.operatorB?.name
                            ? `${item.operatorB.name} ${item.operatorB.surname}`
                            : 'Pendiente'}
                          <br />
                          <b>Turno C:</b>{' '}
                          {item.operatorC?.name
                            ? `${item.operatorC.name} ${item.operatorC.surname}`
                            : 'Pendiente'}
                        </div>
                      </div>

                      <Box
                        variant={'awsui-key-label' as any}
                        color="text-label"
                        fontSize="body-s"
                      >
                        Consumos Totales
                      </Box>
                      <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                        <div
                          style={{
                            background: '#fff',
                            padding: '10px',
                            borderRadius: '6px',
                            border: '1px solid #eaeded',
                          }}
                        >
                          <span style={{ fontSize: '11px', color: '#545b64' }}>
                            AGUA (LTS)
                          </span>
                          <br />
                          <strong style={{ color: '#0972d3' }}>
                            {item.consumo_agua || '0'}
                          </strong>
                        </div>
                        <div
                          style={{
                            background: '#fff',
                            padding: '10px',
                            borderRadius: '6px',
                            border: '1px solid #eaeded',
                          }}
                        >
                          <span style={{ fontSize: '11px', color: '#545b64' }}>
                            VAPOR (KG)
                          </span>
                          <br />
                          <strong style={{ color: '#0972d3' }}>
                            {item.total_kg_vapor || '0'}
                          </strong>
                        </div>
                        <div
                          style={{
                            background: '#fff',
                            padding: '10px',
                            borderRadius: '6px',
                            border: '1px solid #eaeded',
                          }}
                        >
                          <span style={{ fontSize: '11px', color: '#545b64' }}>
                            DIÉSEL (LTS)
                          </span>
                          <br />
                          <strong style={{ color: '#0972d3' }}>
                            {item.diesel || '0'}
                          </strong>
                        </div>
                        <div
                          style={{
                            background: '#fff',
                            padding: '10px',
                            borderRadius: '6px',
                            border: '1px solid #eaeded',
                          }}
                        >
                          <span style={{ fontSize: '11px', color: '#545b64' }}>
                            SAL (KG)
                          </span>
                          <br />
                          <strong style={{ color: '#0972d3' }}>
                            {item.sal || '0'}
                          </strong>
                        </div>
                      </Grid>

                      {item.observaciones && (
                        <div style={{ marginTop: '16px' }}>
                          <Box
                            variant={'awsui-key-label' as any}
                            color="text-label"
                            fontSize="body-s"
                          >
                            Observaciones Globales
                          </Box>
                          <div
                            style={{
                              fontSize: '13px',
                              padding: '12px',
                              borderRadius: '4px',
                              border: '1px solid #eaeded',
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {item.observaciones}
                          </div>
                        </div>
                      )}
                    </ColumnLayout>
                  </div>
                ))}
              </div>
            ) : (
              <Box
                textAlign="center"
                color="text-body-secondary"
                margin={{ top: 'xl' }}
              >
                Selecciona un registro para ver su detalle operativo.
              </Box>
            )}
          </SplitPanel>
        }
        content={
          <div style={{ marginTop: '16px' }}>
            <Table
              {...collectionProps}
              items={items}
              selectedItems={selectedItems}
              onSelectionChange={({ detail }) =>
                setSelectedItems(detail.selectedItems as any)
              }
              selectionType="multi"
              variant="full-page"
              loading={loading}
              loadingText="Sincronizando telemetría..."
              columnDefinitions={COLUMN_DEFINITIONS}
              visibleColumns={preferences.visibleContent}
              empty={
                <div style={{ padding: '40px 0' }}>{collectionProps.empty}</div>
              }
              header={
                <Header
                  variant={'awsui-h1-sticky' as any}
                  counter={!loading ? `(${items.length})` : ''}
                  description="Gestión histórica del departamento de mantenimiento de la Central de Vapor."
                  actions={
                    <SpaceBetween direction="horizontal" size="xs">
                      <Button
                        iconName="refresh"
                        onClick={fetchReports}
                        loading={loading}
                      />
                      {(!user || user.rol_id === 3 || user.rol_id === 4) && (
                        <>
                          <Button
                            iconName="settings"
                            onClick={handleOpenConfigModal}
                          >
                            Matriz SGC
                          </Button>
                          <Button
                            iconName="remove"
                            disabled={selectedItems.length === 0}
                            onClick={() => {
                              setDeleteConfirmationText('');
                              setIsDeleteModalVisible(true);
                            }}
                          >
                            Eliminar Día
                          </Button>
                        </>
                      )}
                      <Button
                        iconName="download"
                        loading={isExporting}
                        disabled={selectedItems.length === 0}
                        onClick={handleExportPDF}
                      >
                        Exportar PDF
                      </Button>
                      <Button
                        variant="primary"
                        iconName="add-plus"
                        href="/central-vapor/new"
                      >
                        Captura de Hora
                      </Button>
                    </SpaceBetween>
                  }
                >
                  Registros: Central de Vapor
                </Header>
              }
              preferences={
                <CollectionPreferences
                  title="Preferencias"
                  confirmLabel="Confirmar"
                  cancelLabel="Cancelar"
                  preferences={preferences}
                  onConfirm={({ detail }) => setPreferences(detail as any)}
                  pageSizePreference={{
                    title: 'Registros',
                    options: [20, 50, 100].map((n) => ({
                      value: n,
                      label: `${n} registros`,
                    })),
                  }}
                  contentDisplayPreference={{
                    title: 'Columnas',
                    options: [
                      {
                        id: 'cols',
                        label: 'Datos',
                        options: COLUMN_DEFINITIONS.map((c) => ({
                          id: c.id,
                          label: c.header as string,
                        })),
                      },
                    ] as any,
                  }}
                />
              }
              filter={
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ flex: '1 1 auto', minWidth: '250px' }}>
                    <TextFilter
                      {...filterProps}
                      filteringPlaceholder="Buscar ID o Caldera..."
                      countText={`${filteredItemsCount} resultados`}
                    />
                  </div>
                  <div className="floating-filter">
                    <label>Desde</label>
                    <DatePicker
                      onChange={({ detail }) => setStartDate(detail.value)}
                      value={startDate}
                      placeholder="AAAA/MM/DD"
                    />
                  </div>
                  <div className="floating-filter">
                    <label>Hasta</label>
                    <DatePicker
                      onChange={({ detail }) => setEndDate(detail.value)}
                      value={endDate}
                      placeholder="AAAA/MM/DD"
                    />
                  </div>
                  {(startDate || endDate) && (
                    <Button
                      variant="inline-link"
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                      }}
                    >
                      Limpiar
                    </Button>
                  )}
                </div>
              }
              pagination={<Pagination {...paginationProps} />}
            />
          </div>
        }
      />
      <Footer />

      {/* MODAL CONFIG SGC */}
      <Modal
        onDismiss={() => setIsConfigModalVisible(false)}
        visible={isConfigModalVisible}
        header="Configuración Normativa SGC (Central Vapor)"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant="link"
                onClick={() => setIsConfigModalVisible(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                loading={isSavingConfig}
                onClick={handleSaveConfig}
              >
                Aprobar Cambios
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <Grid
            gridDefinition={[
              { colspan: 6 },
              { colspan: 6 },
              { colspan: 6 },
              { colspan: 6 },
            ]}
          >
            <FormField label="Código de Documento">
              <Input
                value={formConfig.codigo_documento}
                onChange={({ detail }) =>
                  setFormConfig((p) => ({
                    ...p,
                    codigo_documento: detail.value,
                  }))
                }
              />
            </FormField>
            <FormField label="Versión del Formato">
              <Input
                type="number"
                step={0.1}
                value={formConfig.version}
                onChange={({ detail }) =>
                  setFormConfig((p) => ({ ...p, version: detail.value }))
                }
              />
            </FormField>
            <FormField label="Fecha de Revisión">
              <DatePicker
                value={formConfig.fecha_revision}
                onChange={({ detail }) =>
                  setFormConfig((p) => ({ ...p, fecha_revision: detail.value }))
                }
                placeholder="AAAA/MM/DD"
                expandToViewport={true}
              />
            </FormField>
            <FormField label="Fecha de Reemplazo">
              <DatePicker
                value={formConfig.fecha_reemplazo}
                onChange={({ detail }) =>
                  setFormConfig((p) => ({
                    ...p,
                    fecha_reemplazo: detail.value,
                  }))
                }
                placeholder="AAAA/MM/DD"
                expandToViewport={true}
              />
            </FormField>
          </Grid>
          <ColumnLayout columns={2}>
            <FormField label="Propietario">
              <Input
                value={formConfig.propietario}
                onChange={({ detail }) =>
                  setFormConfig((p) => ({ ...p, propietario: detail.value }))
                }
              />
            </FormField>
            <FormField label="Aprobador">
              <Input
                value={formConfig.aprobador}
                onChange={({ detail }) =>
                  setFormConfig((p) => ({ ...p, aprobador: detail.value }))
                }
              />
            </FormField>
          </ColumnLayout>
          <FormField label="Estándar Aplicado">
            <Input
              value={formConfig.estandar_calidad}
              onChange={({ detail }) =>
                setFormConfig((p) => ({ ...p, estandar_calidad: detail.value }))
              }
            />
          </FormField>
          <FormField label="Razón del Cambio">
            <Textarea
              value={formConfig.razon_cambio}
              onChange={({ detail }) =>
                setFormConfig((p) => ({ ...p, razon_cambio: detail.value }))
              }
              rows={3}
            />
          </FormField>
        </SpaceBetween>
      </Modal>

      {/* MODAL ELIMINAR */}
      <Modal
        onDismiss={() => {
          setIsDeleteModalVisible(false);
          setDeleteConfirmationText('');
        }}
        visible={isDeleteModalVisible}
        header="Inhabilitar Registro de Vapor"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant="link"
                onClick={() => {
                  setIsDeleteModalVisible(false);
                  setDeleteConfirmationText('');
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                loading={isDeleting}
                onClick={handleDeleteSubmit}
                disabled={deleteConfirmationText.toLowerCase() !== 'confirmar'}
              >
                Confirmar
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <Box variant="h4" color="text-status-error">
            ¡Atención!
          </Box>
          <Box variant="p">
            Al eliminar el log seleccionado, se borrarán las{' '}
            <b>24 lecturas de telemetría</b> de ese día. Esto afectará el
            historial de consumos.
          </Box>
          <FormField label='Escriba "confirmar" para validar:'>
            <Input
              value={deleteConfirmationText}
              onChange={({ detail }) => setDeleteConfirmationText(detail.value)}
            />
          </FormField>
        </SpaceBetween>
      </Modal>
    </div>
  );
}
