import * as React from 'react';
import axios from 'axios';
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
  
  .log-summary-card {
    position: relative; width: 100%; padding: 20px; border-radius: 12px; background: linear-gradient(135deg, #1d2c3f 0%, #0f1b2a 100%);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.1); color: white;
  }
  .log-title { font-size: 18px; font-weight: 800; margin: 0; color: #fff; }
  .log-subtitle { font-size: 12px; color: #aab7b8; }
  
  .metric-box { background: #f8f8f8; border: 1px solid #eaeded; padding: 12px; border-radius: 8px; text-align: center; }
  .metric-value { font-size: 22px; font-weight: bold; color: #0972d3; }
  .metric-label { font-size: 11px; color: #545b64; text-transform: uppercase; }

  .floating-filter { position: relative; display: inline-block; margin-top: 6px; min-width: 140px; }
  .floating-filter label {
    position: absolute; top: -8px; left: 10px; background-color: var(--color-background-layout-main, #ffffff) !important;
    padding: 0 4px; font-size: 12px; font-weight: 700; color: var(--color-text-body-default, #000000) !important;
    z-index: 10; line-height: 1; pointer-events: none; border-radius: 2px;
  }
  html.dark .floating-filter label, body.dark .floating-filter label, [data-theme="dark"] .floating-filter label {
    background-color: var(--color-background-layout-main, #161d26) !important; color: var(--color-text-body-default, #ffffff) !important;
  }
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
        alt="Vacío"
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

const isPhValid = (ph: any) => parseFloat(ph) >= 10.5 && parseFloat(ph) <= 11.5;
const isDurezaValid = (dureza: any) => parseFloat(dureza) < 10;
const isSuavizadorValid = (suavizador: any) => parseFloat(suavizador) === 0;

const determineState = (telemetria: any) => {
  if (
    !isPhValid(telemetria.ph) ||
    !isDurezaValid(telemetria.dureza) ||
    !isSuavizadorValid(telemetria.suavizador)
  )
    return 'warning';
  return 'success';
};

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
    id: 'id_vista',
    header: 'Referencia',
    cell: (item: any) => (
      <Link href="#">
        #{item.logId}-{item.hora.replace(':', '')}
      </Link>
    ),
    sortingField: 'logId',
    minWidth: 120,
  },
  {
    id: 'fecha',
    header: 'Fecha Operativa',
    cell: (item: any) => item.fecha,
    sortingField: 'fecha',
    minWidth: 130,
  },
  {
    id: 'hora',
    header: 'Hora',
    cell: (item: any) => <strong>{item.hora}</strong>,
    sortingField: 'hora',
    minWidth: 100,
  },
  {
    id: 'turno',
    header: 'Turno',
    cell: (item: any) => <Badge color="blue">{item.turno}</Badge>,
    sortingField: 'turno',
    minWidth: 110,
  },
  {
    id: 'operador',
    header: 'Químico',
    cell: (item: any) => item.operador,
    sortingField: 'operador',
    minWidth: 170,
  },
  {
    id: 'ph',
    header: 'PH (10.5 - 11.5)',
    sortingField: 'ph',
    minWidth: 130,
    cell: (item: any) => (
      <span
        style={{
          color: isPhValid(item.telemetria.ph) ? 'inherit' : '#d13212',
          fontWeight: 'bold',
        }}
      >
        {item.telemetria.ph}
      </span>
    ),
  },
  {
    id: 'dureza',
    header: 'Dureza (< 10)',
    sortingField: 'dureza',
    minWidth: 120,
    cell: (item: any) => (
      <span
        style={{
          color: isDurezaValid(item.telemetria.dureza) ? 'inherit' : '#d13212',
          fontWeight: 'bold',
        }}
      >
        {item.telemetria.dureza}
      </span>
    ),
  },
  {
    id: 'suavizador',
    header: 'Suavizador (0)',
    sortingField: 'suavizador',
    minWidth: 130,
    cell: (item: any) => (
      <span
        style={{
          color: isSuavizadorValid(item.telemetria.suavizador)
            ? 'inherit'
            : '#d13212',
          fontWeight: 'bold',
        }}
      >
        {item.telemetria.suavizador}
      </span>
    ),
  },
  {
    id: 'estado',
    header: 'Estado',
    sortingField: 'estado',
    minWidth: 140,
    cell: (item: any) => (
      <StatusIndicator type={item.estado as any}>
        {item.estado === 'success' ? 'En Norma' : 'Precaución'}
      </StatusIndicator>
    ),
  },
];

export default function ChemicalAnalysisLogsTable() {
  const appContext = React.useContext(AppContent) as any;
  const alerts = appContext?.alerts || [];
  const addAlert = appContext?.addAlert;
  const user = appContext?.user;

  const [data, setData] = React.useState<any[]>([]);
  const [rawLogs, setRawLogs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);

  const [navigationOpen, setNavigationOpen] = React.useState(true);
  const [selectedItems, setSelectedItems] = React.useState<any[]>([]);
  const [splitPanelOpen, setSplitPanelOpen] = React.useState(false);

  // Estados de SGC
  const [isConfigModalVisible, setIsConfigModalVisible] = React.useState(false);
  const [isSavingConfig, setIsSavingConfig] = React.useState(false);
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

  // Estados de Edición
  const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editItem, setEditItem] = React.useState<any>(null);
  const [editReadings, setEditReadings] = React.useState({
    ph: '',
    dureza: '',
    suavizador: '',
  });
  const [editObservaciones, setEditObservaciones] = React.useState('');

  // Estados de Eliminación
  const [isDeleteModalVisible, setIsDeleteModalVisible] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] =
    React.useState('');

  const [turnoFilter, setTurnoFilter] = React.useState<any>({
    label: 'Todos',
    value: undefined,
  });
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  const [preferences, setPreferences] = React.useState<any>({
    pageSize: 50,
    visibleContent: [
      'id_vista',
      'fecha',
      'hora',
      'turno',
      'operador',
      'ph',
      'dureza',
      'suavizador',
      'estado',
    ],
  });

  React.useEffect(() => {
    setSplitPanelOpen(selectedItems.length === 1);
  }, [selectedItems]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${MAINTENANCE_API_URL}/api/chemical-analysis`,
        { withCredentials: true },
      );
      if (res.data.success) {
        setRawLogs(res.data.data);
        const flatData: any[] = [];
        res.data.data.forEach((log: any) => {
          (log.readings || []).forEach((reading: any) => {
            const telemetria = reading.resultados || {
              ph: 0,
              dureza: 0,
              suavizador: 0,
            };
            flatData.push({
              logId: log.id,
              readingId: reading.id,
              fecha: log.productionDate,
              hora: reading.timestampHour,
              turno: `Turno ${reading.turno}`,
              turnoRaw: reading.turno,
              operador: reading.operator
                ? `${reading.operator.name} ${reading.operator.surname}`
                : 'Operador',
              telemetria,
              observaciones: reading.observaciones,
              estado: determineState(telemetria),
              logMetadata: log,
            });
          });
        });
        setData(flatData);
      }
    } catch (error) {
      if (addAlert)
        addAlert(
          'error',
          'Error al obtener el historial de análisis químicos.',
        );
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLogs();
  }, []);

  // --- LÓGICA SGC ---
  const handleOpenConfigModal = async () => {
    try {
      const res = await axios.get(
        `${MAINTENANCE_API_URL}/api/document-configs`,
        { withCredentials: true },
      );
      if (res.data.success) {
        const current = res.data.data.find(
          (c: any) => c.area_key === 'analisis_quimicos_vapor',
        );
        if (current) {
          setFormConfig({
            codigo_documento: current.codigo_documento,
            version: current.version,
            fecha_revision: current.fecha_revision,
            fecha_reemplazo: current.fecha_reemplazo,
            propietario: current.propietario,
            aprobador: current.aprobador,
            estandar_calidad: current.estandar_calidad,
            razon_cambio: current.razon_cambio,
          });
        }
        setIsConfigModalVisible(true);
      }
    } catch (e) {
      if (addAlert) addAlert('error', 'Fallo al consultar plantilla maestra.');
    }
  };

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      const res = await axios.put(
        `${MAINTENANCE_API_URL}/api/document-configs/analisis_quimicos_vapor`,
        formConfig,
        { withCredentials: true },
      );
      if (res.data.success) {
        if (addAlert)
          addAlert(
            'success',
            `Formato SGC actualizado a la versión ${formConfig.version}.`,
          );
        setIsConfigModalVisible(false);
      }
    } catch (error) {
      if (addAlert)
        addAlert('error', 'Privilegios insuficientes o error de conexión.');
    } finally {
      setIsSavingConfig(false);
    }
  };

  // --- LÓGICA DE EDICIÓN ---
  const openEditModal = () => {
    const item = selectedItems[0];
    setEditItem(item);
    setEditReadings({
      ph: item.telemetria.ph,
      dureza: item.telemetria.dureza,
      suavizador: item.telemetria.suavizador,
    });
    setEditObservaciones(item.observaciones || '');
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    setIsEditing(true);
    const payload = {
      assetId: 'analisis_quimicos_vapor',
      turno: editItem.turnoRaw,
      timestampHour: editItem.hora,
      resultados: editReadings,
      observaciones: editObservaciones,
      codigo_documento: editItem.logMetadata.codigo_documento,
      version: editItem.logMetadata.version,
      fecha_revision: editItem.logMetadata.fecha_revision,
      fecha_reemplazo: editItem.logMetadata.fecha_reemplazo,
      propietario: editItem.logMetadata.propietario,
      aprobador: editItem.logMetadata.aprobador,
      estandar_calidad: editItem.logMetadata.estandar_calidad,
      razon_cambio: editItem.logMetadata.razon_cambio,
    };
    try {
      await axios.post(
        `${MAINTENANCE_API_URL}/api/chemical-analysis`,
        payload,
        { withCredentials: true },
      );
      if (addAlert)
        addAlert(
          'success',
          `Lectura de las ${editItem.hora} actualizada con éxito.`,
        );
      setIsEditModalVisible(false);
      setSelectedItems([]);
      fetchLogs();
    } catch (error) {
      if (addAlert) addAlert('error', 'Error al actualizar el registro.');
    } finally {
      setIsEditing(false);
    }
  };

  // --- LÓGICA DE ELIMINACIÓN ---
  const handleDeleteSubmit = async () => {
    setIsDeleting(true);
    try {
      const uniqueLogIds = Array.from(
        new Set(selectedItems.map((item) => item.logId)),
      );
      for (const id of uniqueLogIds) {
        await axios.delete(
          `${MAINTENANCE_API_URL}/api/chemical-analysis/${id}`,
          { withCredentials: true },
        );
      }
      if (addAlert)
        addAlert(
          'success',
          `Se han inhabilitado ${uniqueLogIds.length} hoja(s) de producción maestra.`,
        );
      setIsDeleteModalVisible(false);
      setDeleteConfirmationText('');
      setSelectedItems([]);
      fetchLogs();
    } catch (error) {
      if (addAlert)
        addAlert('error', 'Error de privilegios al eliminar el registro.');
    } finally {
      setIsDeleting(false);
    }
  };

  // --- 🚩 GENERADOR DE PDF PORTRAIT ---
  const handleExportPDF = async () => {
    if (selectedItems.length === 0) return;
    setIsExporting(true);
    try {
      const uniqueLogIds = Array.from(
        new Set(selectedItems.map((item) => item.logId)),
      );
      const doc = new jsPDF('p', 'pt', 'letter');
      const margin = 30;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const logoData = await getLogoData(logoDelMonte);

      const hourSlots = [
        '06:00',
        '08:00',
        '10:00',
        '12:00',
        '14:00',
        '16:00',
        '18:00',
        '20:00',
        '22:00',
        '00:00',
        '02:00',
        '04:00',
      ];
      const displayHours = [
        '6:00 a.m.',
        '8:00 a.m.',
        '10:00 a.m.',
        '12:00 p.m.',
        '2:00 p.m.',
        '4:00 p.m.',
        '6:00 p.m.',
        '8:00 p.m.',
        '10:00 p.m.',
        '12:00 a.m.',
        '2:00 a.m.',
        '4:00 a.m.',
      ];

      for (let i = 0; i < uniqueLogIds.length; i++) {
        const logId = uniqueLogIds[i];
        const log = rawLogs.find((l) => l.id === logId);
        if (!log) continue;

        if (i > 0) doc.addPage();

        const safeTextCenter = (text: string, x: number, y: number) => {
          doc.text(text, x - doc.getTextWidth(text) / 2, y);
        };

        // --- ENCABEZADO CUSTOM ---
        const renglon1H = 75;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(1);
        doc.rect(margin, margin, pageWidth - margin * 2, renglon1H);

        const colLogoW = 160;
        const colNumW = 120;
        doc.line(
          margin + colLogoW,
          margin,
          margin + colLogoW,
          margin + renglon1H,
        );
        doc.line(
          pageWidth - margin - colNumW,
          margin,
          pageWidth - margin - colNumW,
          margin + renglon1H,
        );

        doc.line(margin, margin + 55, margin + colLogoW, margin + 55);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        safeTextCenter(
          'Formato Departamental',
          margin + colLogoW / 2,
          margin + 68,
        );

        if (logoData) {
          const maxWidth = 145;
          const maxHeight = 45;
          const ratio = logoData.width / logoData.height;
          let finalW = maxWidth;
          let finalH = finalW / ratio;
          if (finalH > maxHeight) {
            finalH = maxHeight;
            finalW = finalH * ratio;
          }
          doc.addImage(
            logoData.data,
            'PNG',
            margin + (colLogoW - finalW) / 2,
            margin + (55 - finalH) / 2,
            finalW,
            finalH,
          );
        }

        doc.setFontSize(8);
        doc.text('Titulo:', margin + colLogoW + 5, margin + 12);
        doc.setFontSize(14);
        safeTextCenter(
          'Bitácora Análisis Químicos',
          margin + colLogoW + (pageWidth - margin * 2 - colLogoW - colNumW) / 2,
          margin + 42,
        );

        doc.setFontSize(8);
        doc.text('Numero:', pageWidth - margin - colNumW + 5, margin + 12);
        doc.setFontSize(11);
        safeTextCenter(
          log.codigo_documento,
          pageWidth - margin - colNumW / 2,
          margin + 42,
        );

        // --- TÍTULOS CENTRALES ---
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        let currentY = margin + 105;
        safeTextCenter(
          'DEPARTAMENTO DE MANTENIMIENTO',
          pageWidth / 2,
          currentY,
        );
        currentY += 12;
        safeTextCenter('ANALISIS QUIMICOS', pageWidth / 2, currentY);
        currentY += 12;
        safeTextCenter('BITACORA (CENTRAL DE VAPOR)', pageWidth / 2, currentY);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('2P - M = OH', pageWidth - margin - 100, currentY + 15);
        doc.text(log.codigo_documento, pageWidth - margin - 100, currentY + 35);

        currentY += 40;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Caldera: ___________________', margin, currentY);
        doc.text(`FECHA: ${log.productionDate}`, pageWidth / 2 - 50, currentY);

        // --- RECONSTRUCCIÓN DE LA TABLA ---
        const tableBody = hourSlots.map((h, idx) => {
          const reading = (log.readings || []).find(
            (r: any) => r.timestampHour === h,
          );
          if (reading)
            return [
              displayHours[idx],
              reading.resultados.ph,
              reading.resultados.dureza,
              reading.resultados.suavizador,
            ];
          return [displayHours[idx], '', '', ''];
        });

        // 🚩 APLICAMOS COLORES A LAS CELDAS FUERA DE NORMA
        autoTable(doc, {
          startY: currentY + 20,
          head: [['HORA', 'PH\n10.5-11.5', 'DUREZA < 10', 'SUAVIZADOR\n0 PPM']],
          body: tableBody,
          theme: 'grid',
          styles: {
            fontSize: 9,
            cellPadding: 8,
            lineColor: [0, 0, 0],
            lineWidth: 0.5,
            halign: 'center',
            valign: 'middle',
          },
          headStyles: {
            fillColor: [230, 230, 230],
            textColor: 0,
            fontStyle: 'bold',
          },
          columnStyles: { 0: { fontStyle: 'bold', halign: 'left' } },
          didParseCell: function (data) {
            if (data.section === 'body') {
              const val = data.cell.raw;
              // Si la celda tiene un valor, verificamos la columna para aplicar color
              if (val !== '' && val !== undefined) {
                // Columna 1 = PH
                if (data.column.index === 1 && !isPhValid(val)) {
                  data.cell.styles.fillColor = [253, 234, 233]; // Fondo rojo suave
                  data.cell.styles.textColor = [209, 50, 18]; // Texto rojo intenso
                  data.cell.styles.fontStyle = 'bold';
                }
                // Columna 2 = DUREZA
                if (data.column.index === 2 && !isDurezaValid(val)) {
                  data.cell.styles.fillColor = [253, 234, 233];
                  data.cell.styles.textColor = [209, 50, 18];
                  data.cell.styles.fontStyle = 'bold';
                }
                // Columna 3 = SUAVIZADOR
                if (data.column.index === 3 && !isSuavizadorValid(val)) {
                  data.cell.styles.fillColor = [253, 234, 233];
                  data.cell.styles.textColor = [209, 50, 18];
                  data.cell.styles.fontStyle = 'bold';
                }
              }
            }
          },
        });

        // --- FIRMAS DE OPERADORES ---
        let sigY = (doc as any).lastAutoTable.finalY + 40;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const opA = log.operatorA
          ? `${log.operatorA.name} ${log.operatorA.surname}`
          : '';
        const opB = log.operatorB
          ? `${log.operatorB.name} ${log.operatorB.surname}`
          : '';
        const opC = log.operatorC
          ? `${log.operatorC.name} ${log.operatorC.surname}`
          : '';

        doc.text(
          `Nombre Operador turno A: ${opA ? opA : '____________________________________'}`,
          margin + 20,
          sigY,
        );
        sigY += 20;
        doc.text(
          `Nombre Operador turno B: ${opB ? opB : '____________________________________'}`,
          margin + 20,
          sigY,
        );
        sigY += 20;
        doc.text(
          `Nombre Operador turno C: ${opC ? opC : '____________________________________'}`,
          margin + 20,
          sigY,
        );

        doc.line(pageWidth - margin - 200, sigY, pageWidth - margin, sigY);
        doc.setFont('helvetica', 'bold');
        safeTextCenter(
          'Supervisor de calderas',
          pageWidth - margin - 100,
          sigY + 12,
        );

        // --- PIE DE HOJA SGC ---
        const footerHeight = 45;
        const bY = pageHeight - margin - footerHeight;
        const totalW = pageWidth - margin * 2;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(1);
        doc.rect(margin, bY, totalW, footerHeight);
        doc.line(margin, bY + 28, margin + totalW, bY + 28);

        const colWidths = [80, 80, 50, 130, 140, 72];
        let currentX = margin;
        for (let j = 0; j < colWidths.length - 1; j++) {
          currentX += colWidths[j];
          doc.line(currentX, bY, currentX, bY + 28);
        }

        doc.setFontSize(6.5);

        const c1 = margin + colWidths[0] / 2;
        const c2 = margin + colWidths[0] + colWidths[1] / 2;
        const c3 = margin + colWidths[0] + colWidths[1] + colWidths[2] / 2;
        const c4 =
          margin +
          colWidths[0] +
          colWidths[1] +
          colWidths[2] +
          colWidths[3] / 2;
        const c5 =
          margin +
          colWidths[0] +
          colWidths[1] +
          colWidths[2] +
          colWidths[3] +
          colWidths[4] / 2;
        const c6 =
          margin +
          colWidths[0] +
          colWidths[1] +
          colWidths[2] +
          colWidths[3] +
          colWidths[4] +
          colWidths[5] / 2;

        doc.setFont('helvetica', 'normal');
        safeTextCenter('Fecha de Revisión:', c1, bY + 11);
        safeTextCenter(log.fecha_revision || '', c1, bY + 20);

        safeTextCenter('Fecha a la que', c2, bY + 8);
        safeTextCenter('Reemplaza:', c2, bY + 15);
        safeTextCenter(log.fecha_reemplazo || '', c2, bY + 22);

        safeTextCenter('Versión:', c3, bY + 11);
        safeTextCenter(log.version || '', c3, bY + 20);

        safeTextCenter('Propietario:', c4, bY + 7);
        safeTextCenter(log.propietario || '', c4, bY + 13);
        safeTextCenter('Aprobado:', c4, bY + 19);
        safeTextCenter(log.aprobador || '', c4, bY + 25);

        safeTextCenter('Estándar de Calidad:', c5, bY + 11);
        safeTextCenter(log.estandar_calidad || '', c5, bY + 20);

        safeTextCenter('Página 1 de 1', c6, bY + 15);

        doc.setFont('helvetica', 'bold');
        doc.text('Razón del cambio:', margin + 5, bY + 39);
        doc.setFont('helvetica', 'normal');
        doc.text(log.razon_cambio || '', margin + 80, bY + 39, {
          maxWidth: totalW - 85,
        });
      }

      doc.save(
        selectedItems.length === 1
          ? `Analisis_Quimicos_${selectedItems[0].fecha}.pdf`
          : `Analisis_Quimicos_Lote.pdf`,
      );
      if (addAlert) addAlert('success', `Exportación completada exitosamente.`);
    } catch (error) {
      if (addAlert) addAlert('error', 'Error al generar el PDF.');
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
          subtitle="No existen auditorías químicas en la BD."
          action={
            <Button variant="primary" href="/chemical/new">
              Registrar Lectura
            </Button>
          }
        />
      ),
      noMatch: (
        <EmptyState
          title="Sin coincidencias"
          subtitle="Ajusta los filtros para ver resultados."
          action={
            <Button
              onClick={() => {
                actions.setFiltering('');
                setTurnoFilter({ label: 'Todos', value: undefined });
              }}
            >
              Borrar filtros
            </Button>
          }
        />
      ),
      filteringFunction: (item, text) => {
        const matchText =
          item.logId.toString().includes(text) ||
          item.operador.toLowerCase().includes(text.toLowerCase());
        const matchTurno = turnoFilter.value
          ? item.turno === turnoFilter.value
          : true;
        let matchFecha = true;
        if (startDate || endDate) {
          const itemDate = new Date(`${item.fecha}T12:00:00`).getTime();
          if (
            startDate &&
            itemDate < new Date(`${startDate}T00:00:00`).getTime()
          )
            matchFecha = false;
          if (endDate && itemDate > new Date(`${endDate}T23:59:59`).getTime())
            matchFecha = false;
        }
        return matchText && matchTurno && matchFecha;
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
            { text: 'Consultas y Reportes', href: '#' },
            { text: 'Análisis Químicos', href: '#' },
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
            header={
              (<Header variant="h2">Detalle de Muestra de Agua</Header>) as any
            }
          >
            {selectedItems.length === 1 ? (
              <div style={{ paddingBottom: '20px' }}>
                {selectedItems.map((item) => (
                  <div key={item.readingId}>
                    <div className="log-summary-card">
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <p className="log-subtitle">
                            Hoja Maestro #{item.logId}
                          </p>
                          <h3 className="log-title">Lectura de {item.hora}</h3>
                        </div>
                        <StatusIndicator type={item.estado as any} />
                      </div>
                      <div
                        style={{
                          marginTop: '12px',
                          fontSize: '13px',
                          color: '#cbd5e1',
                        }}
                      >
                        <Icon name={'calendar' as any} size="small" />{' '}
                        {item.fecha} ({item.turno})
                      </div>
                      <div
                        style={{
                          marginTop: '4px',
                          fontSize: '13px',
                          color: '#cbd5e1',
                        }}
                      >
                        <Icon name={'user-profile' as any} size="small" />{' '}
                        Operador: {item.operador}
                      </div>
                    </div>

                    <ColumnLayout columns={1} variant="text-grid">
                      <Box
                        variant={'awsui-key-label' as any}
                        margin={{ bottom: 'xs' }}
                      >
                        Resultados Analíticos
                      </Box>
                      <Grid
                        gridDefinition={[
                          { colspan: 4 },
                          { colspan: 4 },
                          { colspan: 4 },
                        ]}
                      >
                        <div className="metric-box">
                          <div
                            className="metric-value"
                            style={{
                              color: isPhValid(item.telemetria.ph)
                                ? '#0972d3'
                                : '#d13212',
                            }}
                          >
                            {item.telemetria.ph}
                          </div>
                          <div className="metric-label">PH</div>
                        </div>
                        <div className="metric-box">
                          <div
                            className="metric-value"
                            style={{
                              color: isDurezaValid(item.telemetria.dureza)
                                ? '#0972d3'
                                : '#d13212',
                            }}
                          >
                            {item.telemetria.dureza}
                          </div>
                          <div className="metric-label">Dureza</div>
                        </div>
                        <div className="metric-box">
                          <div
                            className="metric-value"
                            style={{
                              color: isSuavizadorValid(
                                item.telemetria.suavizador,
                              )
                                ? '#0972d3'
                                : '#d13212',
                            }}
                          >
                            {item.telemetria.suavizador}
                          </div>
                          <div className="metric-label">Suavizador</div>
                        </div>
                      </Grid>

                      {item.observaciones && (
                        <>
                          <div
                            style={{
                              margin: '20px 0',
                              borderTop: '1px solid #eaeded',
                            }}
                          />
                          <Box
                            variant={'awsui-key-label' as any}
                            margin={{ bottom: 'xs' }}
                          >
                            Ajustes / Observaciones
                          </Box>
                          <div
                            style={{
                              fontSize: '13px',
                              backgroundColor: '#fff',
                              padding: '10px',
                              borderRadius: '4px',
                              border: '1px solid #eaeded',
                              borderLeft:
                                item.estado === 'error'
                                  ? '4px solid #d13212'
                                  : '4px solid #ff9900',
                            }}
                          >
                            {item.observaciones}
                          </div>
                        </>
                      )}
                    </ColumnLayout>
                  </div>
                ))}
              </div>
            ) : selectedItems.length > 1 ? (
              <Box
                textAlign="center"
                color="text-body-secondary"
                margin={{ top: 'xl' }}
              >
                Seleccionaste múltiples registros.
              </Box>
            ) : (
              <Box
                textAlign="center"
                color="text-body-secondary"
                margin={{ top: 'xl' }}
              >
                Selecciona una muestra para ver detalles.
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
              loadingText="Extrayendo bitácoras de la base de datos..."
              columnDefinitions={COLUMN_DEFINITIONS}
              visibleColumns={preferences.visibleContent}
              empty={
                <div style={{ padding: '40px 0' }}>{collectionProps.empty}</div>
              }
              header={
                <Header
                  variant={'awsui-h1-sticky' as any}
                  counter={!loading ? `(${items.length})` : ''}
                  description="Historial de lecturas químicas de vapor."
                  actions={
                    <SpaceBetween direction="horizontal" size="xs">
                      <Button
                        iconName="refresh"
                        onClick={fetchLogs}
                        loading={loading}
                      />
                      {(!user || user.rol_id === 3 || user.rol_id === 4) && (
                        <>
                          <Button
                            iconName="settings"
                            onClick={handleOpenConfigModal}
                          >
                            SGC
                          </Button>
                          <Button
                            iconName="edit"
                            disabled={selectedItems.length !== 1}
                            onClick={openEditModal}
                          >
                            Editar
                          </Button>
                          <Button
                            iconName="remove"
                            disabled={selectedItems.length === 0}
                            onClick={() => {
                              setDeleteConfirmationText('');
                              setIsDeleteModalVisible(true);
                            }}
                          >
                            Eliminar
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
                        href="/chemical/new"
                      >
                        Registrar Lectura
                      </Button>
                    </SpaceBetween>
                  }
                >
                  Registros: Análisis Químicos
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
                    title: 'Columnas visibles',
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
                      filteringPlaceholder="Buscar por Operador..."
                      countText={`${filteredItemsCount} resultados`}
                    />
                  </div>
                  <div className="floating-filter">
                    <label>Turno</label>
                    <Select
                      selectedOption={turnoFilter}
                      onChange={({ detail }) =>
                        setTurnoFilter(detail.selectedOption as any)
                      }
                      options={
                        [
                          { label: 'Todos', value: undefined },
                          { label: 'Turno A', value: 'Turno A' },
                          { label: 'Turno B', value: 'Turno B' },
                          { label: 'Turno C', value: 'Turno C' },
                        ] as any
                      }
                      placeholder="Todos"
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
                  {(startDate || endDate || turnoFilter.value) && (
                    <Button
                      variant="inline-link"
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                        setTurnoFilter({ label: 'Todos', value: undefined });
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
        closeAriaLabel="Cerrar modal"
        header="Gestión Normativa - Configuración de Plantilla SGC"
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
          <Box color="text-status-info" fontSize="body-s">
            <Icon name="status-info" /> Está modificando el estándar base para
            el documento de <b>Análisis Químicos (Central de Vapor)</b>.
          </Box>
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
            <FormField label="Fecha a la que Reemplaza">
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
            <FormField label="Propietario del Proceso">
              <Input
                value={formConfig.propietario}
                onChange={({ detail }) =>
                  setFormConfig((p) => ({ ...p, propietario: detail.value }))
                }
              />
            </FormField>
            <FormField label="Aprobador Oficial">
              <Input
                value={formConfig.aprobador}
                onChange={({ detail }) =>
                  setFormConfig((p) => ({ ...p, aprobador: detail.value }))
                }
              />
            </FormField>
          </ColumnLayout>
          <FormField label="Estándar de Calidad Aplicado">
            <Input
              value={formConfig.estandar_calidad}
              onChange={({ detail }) =>
                setFormConfig((p) => ({ ...p, estandar_calidad: detail.value }))
              }
            />
          </FormField>
          <FormField label="Justificación / Razón del Cambio">
            <Textarea
              value={formConfig.razon_cambio}
              onChange={({ detail }) =>
                setFormConfig((p) => ({ ...p, razon_cambio: detail.value }))
              }
              rows={2}
            />
          </FormField>
        </SpaceBetween>
      </Modal>

      {/* MODAL EDICIÓN */}
      <Modal
        onDismiss={() => setIsEditModalVisible(false)}
        visible={isEditModalVisible}
        closeAriaLabel="Cerrar modal"
        header="Editar Lectura Química"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant="link"
                onClick={() => setIsEditModalVisible(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                loading={isEditing}
                onClick={handleEditSubmit}
              >
                Guardar Corrección
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <Box color="text-status-warning" fontSize="body-s">
            <Icon name="status-warning" /> Se aplicará <b>Upsert</b>. Esto
            sobreescribirá los valores registrados a las {editItem?.hora}.
          </Box>
          <Grid
            gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}
          >
            <FormField label="PH">
              <Input
                type="number"
                step="any"
                value={editReadings.ph}
                onChange={({ detail }) =>
                  setEditReadings((p) => ({ ...p, ph: detail.value }))
                }
              />
            </FormField>
            <FormField label="Dureza">
              <Input
                type="number"
                step="any"
                value={editReadings.dureza}
                onChange={({ detail }) =>
                  setEditReadings((p) => ({ ...p, dureza: detail.value }))
                }
              />
            </FormField>
            <FormField label="Suavizador">
              <Input
                type="number"
                step="any"
                value={editReadings.suavizador}
                onChange={({ detail }) =>
                  setEditReadings((p) => ({ ...p, suavizador: detail.value }))
                }
              />
            </FormField>
          </Grid>
          <FormField label="Observaciones">
            <Textarea
              value={editObservaciones}
              onChange={({ detail }) => setEditObservaciones(detail.value)}
              rows={3}
            />
          </FormField>
        </SpaceBetween>
      </Modal>

      {/* MODAL ELIMINAR IDENTICO A PRE-OPERATIVOS */}
      <Modal
        onDismiss={() => {
          setIsDeleteModalVisible(false);
          setDeleteConfirmationText('');
        }}
        visible={isDeleteModalVisible}
        closeAriaLabel="Cerrar modal"
        header="Eliminar Registro de Inspección"
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
                Confirmar y Eliminar
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <Box variant="h4" color="text-status-error">
            ¿Está completamente seguro de proceder?
          </Box>
          <Box variant="p">
            Está a punto de borrar permanentemente{' '}
            <b>{selectedItems.length} registro(s)</b>. Esta acción removerá las
            filas del historial oficial de la planta y no podrán ser consultadas
            en futuras auditorías de certificación de calidad.
          </Box>
          <FormField label='Para confirmar la eliminación, escriba "confirmar" en el siguiente campo:'>
            <Input
              value={deleteConfirmationText}
              onChange={({ detail }) => setDeleteConfirmationText(detail.value)}
              placeholder="confirmar"
            />
          </FormField>
        </SpaceBetween>
      </Modal>
    </div>
  );
}
