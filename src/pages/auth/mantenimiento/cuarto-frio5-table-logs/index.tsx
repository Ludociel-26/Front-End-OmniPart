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
  Select,
  SegmentedControl,
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

// --- GLOBALES Y CONSTANTES ---
const HOURS_ORDER = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00',
  '00:00',
  '01:00',
  '02:00',
  '03:00',
  '04:00',
  '05:00',
  '06:00',
];
const HEAD_HOURS = [
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
];
const HOUR_OPTIONS = HOURS_ORDER.map((h) => ({ label: `${h} hrs`, value: h }));

const SCHEMA = {
  parametrosSistema: [
    { id: 'nivel_refrigerante', label: 'Nivel Refrig.', unit: '%' },
    { id: 'pres_succion', label: 'Pres. Suc.', unit: 'PSI', min: 45, max: 55 },
    {
      id: 'pres_descarga',
      label: 'Pres. Desc.',
      unit: 'PSI',
      min: 200,
      max: 240,
    },
    { id: 'pct_carga', label: '% de Carga', unit: '%' },
  ],
  evaporadores: [
    { id: 'evap_1', label: 'Evap 1', min: 9, max: 11 },
    { id: 'evap_2', label: 'Evap 2', min: 9, max: 11 },
    { id: 'evap_3', label: 'Evap 3', min: 0, max: 2 },
    { id: 'evap_4', label: 'Evap 4', min: 0, max: 2 },
    { id: 'evap_5', label: 'Evap 5', min: 0, max: 2 },
    { id: 'evap_6', label: 'Evap 6', min: 0, max: 2 },
    { id: 'evap_7', label: 'Evap 7', min: 0, max: 2 },
    { id: 'evap_8', label: 'Evap 8', min: 0, max: 2 },
  ],
  temperaturasAmbiente: [
    { id: 'temp_ambiente', label: 'Ambiente Ext.' },
    { id: 'temp_cuarto_1', label: 'Cuarto (T. 1)', min: 0, max: 3 },
    { id: 'temp_cuarto_2', label: 'Cuarto (T. 2)', min: 0, max: 3 },
    { id: 'temp_cuarto_3', label: 'Cuarto (T. 3)', min: 0, max: 3 },
  ],
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
        alt="Vacio"
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

const COLUMN_DEFINITIONS = [
  {
    id: 'id',
    header: 'Folio Maestro',
    cell: (item: any) => <Link href="#">#{item.id}</Link>,
    sortingField: 'id',
    minWidth: 120,
  },
  {
    id: 'fecha',
    header: 'Fecha de Producción',
    cell: (item: any) => item.productionDate,
    sortingField: 'productionDate',
    minWidth: 160,
  },
  {
    id: 'lecturas',
    header: 'Horas Registradas',
    cell: (item: any) => (
      <Badge color="blue">{item.readings?.length || 0} / 24 hrs</Badge>
    ),
    minWidth: 150,
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

const renderMetric = (val: any, min: number, max: number, tolerance = 2) => {
  if (val === undefined || val === null || val === '') return '-';
  const strVal = String(val).trim().toUpperCase();
  if (strVal === 'D') return <Badge color="grey">D</Badge>;

  const num = parseFloat(strVal);
  if (isNaN(num)) return strVal;

  if (num < min - tolerance || num > max + tolerance) {
    return <span style={{ color: '#d13212', fontWeight: 'bold' }}>{val}</span>;
  } else if (num < min || num > max) {
    return <span style={{ color: '#f57f0c', fontWeight: 'bold' }}>{val}</span>;
  }
  return val;
};

const DETAILS_COLUMNS = [
  {
    id: 'hora',
    header: 'Hora',
    cell: (item: any) => <b>{item.hora}</b>,
    minWidth: 80,
  },
  {
    id: 'turno',
    header: 'Turno',
    cell: (item: any) => item.turno,
    minWidth: 80,
  },
  {
    id: 'pres_suc',
    header: 'P. Suc.',
    cell: (item: any) => renderMetric(item.pres_succion, 45, 55, 10),
    minWidth: 90,
  },
  {
    id: 'pres_desc',
    header: 'P. Desc.',
    cell: (item: any) => renderMetric(item.pres_descarga, 200, 240, 20),
    minWidth: 90,
  },
  {
    id: 'aceite',
    header: 'Aceite',
    cell: (item: any) =>
      item.nivel_aceite === 'X' ? (
        <span style={{ color: '#d13212', fontWeight: 'bold' }}>X</span>
      ) : (
        'OK'
      ),
    minWidth: 80,
  },
  {
    id: 'e1',
    header: 'E1',
    cell: (item: any) => renderMetric(item.evap_1, 9, 11, 2),
    minWidth: 70,
  },
  {
    id: 'e2',
    header: 'E2',
    cell: (item: any) => renderMetric(item.evap_2, 9, 11, 2),
    minWidth: 70,
  },
  {
    id: 'e3',
    header: 'E3',
    cell: (item: any) => renderMetric(item.evap_3, 0, 2, 2),
    minWidth: 70,
  },
  {
    id: 'e4',
    header: 'E4',
    cell: (item: any) => renderMetric(item.evap_4, 0, 2, 2),
    minWidth: 70,
  },
  {
    id: 'e5',
    header: 'E5',
    cell: (item: any) => renderMetric(item.evap_5, 0, 2, 2),
    minWidth: 70,
  },
  {
    id: 'e6',
    header: 'E6',
    cell: (item: any) => renderMetric(item.evap_6, 0, 2, 2),
    minWidth: 70,
  },
  {
    id: 'e7',
    header: 'E7',
    cell: (item: any) => renderMetric(item.evap_7, 0, 2, 2),
    minWidth: 70,
  },
  {
    id: 'e8',
    header: 'E8',
    cell: (item: any) => renderMetric(item.evap_8, 0, 2, 2),
    minWidth: 70,
  },
  {
    id: 'c1',
    header: 'Cto 1',
    cell: (item: any) => renderMetric(item.temp_cuarto_1, 0, 3, 2),
    minWidth: 80,
  },
  {
    id: 'c2',
    header: 'Cto 2',
    cell: (item: any) => renderMetric(item.temp_cuarto_2, 0, 3, 2),
    minWidth: 80,
  },
  {
    id: 'c3',
    header: 'Cto 3',
    cell: (item: any) => renderMetric(item.temp_cuarto_3, 0, 3, 2),
    minWidth: 80,
  },
];

export default function ColdRoomLogsTable() {
  const appContext = React.useContext(AppContent) as any;
  const alerts = appContext?.alerts || [];
  const addAlert = appContext?.addAlert;
  const user = appContext?.user;

  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);

  // Estados Edición Maestra Renglones
  const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editLogId, setEditLogId] = React.useState<any>(null);
  const [selectedEditHour, setSelectedEditHour] = React.useState<any>(
    HOUR_OPTIONS[0],
  );
  const [editTelemetry, setEditTelemetry] = React.useState<Record<string, any>>(
    {},
  );
  const [editObservaciones, setEditObservaciones] = React.useState('');
  const [editTurno, setEditTurno] = React.useState<any>({
    label: 'Turno A',
    value: 'A',
  });

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

  // Estados Borrar
  const [isDeleteModalVisible, setIsDeleteModalVisible] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] =
    React.useState('');

  const [navigationOpen, setNavigationOpen] = React.useState(true);
  const [selectedItems, setSelectedItems] = React.useState<any[]>([]);
  const [splitPanelOpen, setSplitPanelOpen] = React.useState(false);

  // --- ESTADOS DE FILTROS ---
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [estadoFilter, setEstadoFilter] = React.useState<any>({
    label: 'Todos',
    value: undefined,
  });

  const [preferences, setPreferences] = React.useState<any>({
    pageSize: 50,
    visibleContent: ['id', 'fecha', 'lecturas', 'estado'],
  });

  React.useEffect(() => {
    setSplitPanelOpen(selectedItems.length === 1);
  }, [selectedItems]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get(`${MAINTENANCE_API_URL}/api/cuarto-frio-5`);
      if (res.data.success) setData(res.data.data);
    } catch (error) {
      if (addAlert) addAlert('error', 'Error al obtener bitácoras.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReports();
  }, []);

  const openEditModal = () => {
    const log = selectedItems[0];
    if (!log) return;
    setEditLogId(log.id);
    setEditObservaciones(log.observaciones || '');
    loadHourTelemetry(log, HOUR_OPTIONS[0].value);
    setSelectedEditHour(HOUR_OPTIONS[0]);
    setIsEditModalVisible(true);
  };

  const loadHourTelemetry = (log: any, hora: string) => {
    const reading = (log.readings || []).find((r: any) => r.hora === hora);
    setEditTurno({
      label: `Turno ${reading?.turno || 'A'}`,
      value: reading?.turno || 'A',
    });

    if (reading) {
      setEditTelemetry({
        nivel_refrigerante: reading.nivel_refrigerante || '',
        pres_succion: reading.pres_succion || '',
        pres_descarga: reading.pres_descarga || '',
        pct_carga: reading.pct_carga || '',
        nivel_aceite: reading.nivel_aceite || 'OK',
        evap_1: reading.evap_1 || '',
        evap_2: reading.evap_2 || '',
        evap_3: reading.evap_3 || '',
        evap_4: reading.evap_4 || '',
        evap_5: reading.evap_5 || '',
        evap_6: reading.evap_6 || '',
        evap_7: reading.evap_7 || '',
        evap_8: reading.evap_8 || '',
        temp_ambiente: reading.temp_ambiente || '',
        temp_cuarto_1: reading.temp_cuarto_1 || '',
        temp_cuarto_2: reading.temp_cuarto_2 || '',
        temp_cuarto_3: reading.temp_cuarto_3 || '',
        apagadores_encendidos: reading.apagadores_encendidos !== false,
      });
    } else {
      const empty: Record<string, any> = {
        nivel_aceite: 'OK',
        apagadores_encendidos: true,
      };
      [
        ...SCHEMA.parametrosSistema,
        ...SCHEMA.evaporadores,
        ...SCHEMA.temperaturasAmbiente,
      ].forEach((m) => (empty[m.id] = ''));
      setEditTelemetry(empty);
    }
  };

  const handleEditHourChange = (newHourOption: any) => {
    setSelectedEditHour(newHourOption);
    const log = data.find((l) => l.id === editLogId);
    if (log) loadHourTelemetry(log, newHourOption.value);
  };

  const handleEditInputChange = (id: string, val: any) => {
    setEditTelemetry((prev) => ({ ...prev, [id]: val }));
  };

  const handleEditSubmit = async () => {
    setIsEditing(true);
    try {
      const payload = {
        turno: editTurno.value,
        timestampHour: selectedEditHour.value,
        telemetry: editTelemetry,
        observaciones: editObservaciones,
        metadata: {
          codigo_documento: selectedItems[0].codigo_documento,
          version: selectedItems[0].version,
          fecha_revision: selectedItems[0].fecha_revision,
          fecha_reemplazo: selectedItems[0].fecha_reemplazo,
          propietario: selectedItems[0].propietario,
          aprobador: selectedItems[0].aprobador,
          estandar_calidad: selectedItems[0].estandar_calidad,
          razon_cambio: selectedItems[0].razon_cambio,
        },
      };
      await api.post(`${MAINTENANCE_API_URL}/api/cuarto-frio-5`, payload);
      if (addAlert)
        addAlert(
          'success',
          `Lectura de las ${selectedEditHour.label} actualizada/registrada con éxito.`,
        );
      setIsEditModalVisible(false);
      setSelectedItems([]);
      fetchReports();
    } catch (e) {
      if (addAlert) addAlert('error', 'Error al modificar los parámetros.');
    } finally {
      setIsEditing(false);
    }
  };

  const handleOpenConfigModal = async () => {
    try {
      const res = await api.get(`${MAINTENANCE_API_URL}/api/document-configs`);
      if (res.data.success) {
        const current = res.data.data.find(
          (c: any) => c.area_key === 'bitacora_cuarto_frio_5',
        );
        if (current) setFormConfig(current);
        setIsConfigModalVisible(true);
      }
    } catch (e) {
      if (addAlert) addAlert('error', 'Error SGC.');
    }
  };

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      await api.put(
        `${MAINTENANCE_API_URL}/api/document-configs/bitacora_cuarto_frio_5`,
        formConfig,
      );
      if (addAlert) addAlert('success', `SGC Actualizado.`);
      setIsConfigModalVisible(false);
      fetchReports();
    } catch (error) {
      if (addAlert) addAlert('error', 'Privilegios insuficientes.');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleDeleteSubmit = async () => {
    setIsDeleting(true);
    try {
      for (const item of selectedItems) {
        await api.delete(`${MAINTENANCE_API_URL}/api/cuarto-frio-5/${item.id}`);
      }
      if (addAlert) addAlert('success', `Eliminado correctamente.`);
      setIsDeleteModalVisible(false);
      setDeleteConfirmationText('');
      setSelectedItems([]);
      fetchReports();
    } catch (error) {
      if (addAlert) addAlert('error', 'Error al eliminar.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportPDF = async () => {
    if (selectedItems.length === 0) return;
    setIsExporting(true);
    try {
      const doc = new jsPDF('l', 'pt', 'letter');
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const logoData = await getLogoData(logoDelMonte);

      const safeTextCenter = (text: any, x: number, y: number) => {
        const str = text != null ? String(text) : '';
        doc.text(str, x, y, { align: 'center' });
      };

      for (let i = 0; i < selectedItems.length; i++) {
        const log = selectedItems[i];
        if (i > 0) doc.addPage();

        doc.setDrawColor(0);
        doc.setLineWidth(1);
        doc.rect(margin, margin, pageWidth - margin * 2, 45);
        doc.line(margin + 200, margin, margin + 200, margin + 45);
        doc.line(
          pageWidth - margin - 160,
          margin,
          pageWidth - margin - 160,
          margin + 45,
        );
        doc.line(margin, margin + 25, margin + 200, margin + 25);

        if (logoData)
          doc.addImage(logoData.data, 'PNG', margin + 65, margin + 3, 70, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        safeTextCenter('Formato Departamental', margin + 100, margin + 37);
        doc.setFontSize(14);
        safeTextCenter('Cuarto Frio # 5', pageWidth / 2, margin + 30);
        doc.setFontSize(12);
        safeTextCenter(
          log.codigo_documento || '2.2-16-3-16',
          pageWidth - margin - 80,
          margin + 30,
        );

        let currentY = margin + 65;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        safeTextCenter(
          'Industrias Citrícolas de Montemorelos, S.A. de C.V.',
          pageWidth / 2,
          currentY,
        );
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        safeTextCenter(
          'Bitacora de sala de compresores cuarto frío #5.',
          pageWidth / 2,
          currentY + 12,
        );

        doc.setFontSize(8);
        doc.text(
          `Fecha: ${log.productionDate}`,
          pageWidth - margin - 100,
          currentY,
        );

        const getVal = (hr: string, field: string) => {
          const r = (log.readings || []).find((x: any) => x.hora === hr);
          return r ? r[field] || '' : '';
        };
        const buildRow = (lbl: string, uni: string, fld: string) => [
          lbl,
          uni,
          ...HOURS_ORDER.map((hr) => getVal(hr, fld)),
        ];

        autoTable(doc, {
          startY: currentY + 20,
          margin: { left: margin, right: margin },
          head: [['Hora', '', ...HEAD_HOURS]],
          body: [
            buildRow('Nivel de refrigerante', '%', 'nivel_refrigerante'),
            buildRow('Nivel de aceite', 'x / ok', 'nivel_aceite'),
            buildRow('Pres succión', '50 psi', 'pres_succion'),
            buildRow('Pres descarga', '220 psi', 'pres_descarga'),
            buildRow('% de carga', '%', 'pct_carga'),
            buildRow('Temp evap 1', '10±1°C', 'evap_1'),
            buildRow('Temp evap 2', '10±1°C', 'evap_2'),
            buildRow('Temp evap 3', '1±1°C', 'evap_3'),
            buildRow('Temp evap 4', '1±1°C', 'evap_4'),
            buildRow('Temp evap 5', '1±1°C', 'evap_5'),
            buildRow('Temp evap 6', '1±1°C', 'evap_6'),
            buildRow('Temp evap 7', '1±1°C', 'evap_7'),
            buildRow('Temp evap 8', '1±1°C', 'evap_8'),
            buildRow('Temp ambiente', '°C', 'temp_ambiente'),
            buildRow('Temp cuarto', '0-3°C', 'temp_cuarto_1'),
            buildRow('Temp cuarto', '0-3°C', 'temp_cuarto_2'),
            buildRow('Temp cuarto', '0-3°C', 'temp_cuarto_3'),
          ],
          theme: 'grid',
          styles: { fontSize: 6, cellPadding: 2, halign: 'center' },
          columnStyles: {
            0: { halign: 'left', cellWidth: 90 },
            1: { cellWidth: 38 },
          },
        });

        let finalY = (doc as any).lastAutoTable.finalY + 15;
        doc.text(
          'La temperatura del cuarto debe ser leída en los termómetros interiores.',
          margin,
          finalY + 12,
        );

        const fY = finalY + 75;
        doc.line(margin + 50, fY, margin + 200, fY);
        safeTextCenter('Operador A', margin + 125, fY + 10);
        doc.line(pageWidth / 2 - 75, fY, pageWidth / 2 + 75, fY);
        safeTextCenter('Operador B', pageWidth / 2, fY + 10);
        doc.line(pageWidth - margin - 200, fY, pageWidth - margin - 50, fY);
        safeTextCenter('Operador C', pageWidth - margin - 125, fY + 10);

        const bY = pageHeight - margin - 35;
        doc.rect(margin, bY, pageWidth - margin * 2, 35);
        safeTextCenter(
          `Fecha de Revisión: ${log.fecha_revision || 'Abril/25/24'} | Versión: ${log.version || '3.0'} | Propietario: ${log.propietario || 'Jonathan Serrato'}`,
          pageWidth / 2,
          bY + 15,
        );
      }
      doc.save(
        selectedItems.length === 1
          ? `CuartoFrio5_${selectedItems[0].productionDate}.pdf`
          : `CuartoFrio5_Lote.pdf`,
      );
      if (addAlert)
        addAlert(
          'success',
          `Se exportaron ${selectedItems.length} bitácora(s) con el formato oficial.`,
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
          subtitle="Vacío."
          action={
            <Button variant="primary" href="/cuarto-frio-5/new">
              Capturar
            </Button>
          }
        />
      ),
      noMatch: (
        <EmptyState
          title="Sin coincidencias"
          subtitle="Ajustar filtros."
          action={
            <Button
              onClick={() => {
                actions.setFiltering('');
                setStartDate('');
                setEndDate('');
                setEstadoFilter({ label: 'Todos', value: undefined });
              }}
            >
              Limpiar
            </Button>
          }
        />
      ),
      filteringFunction: (item, text) => {
        const matchText = item.id.toString().includes(text);

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

        let matchEstado = true;
        if (estadoFilter.value) {
          const isComplete = item.readings?.length >= 24;
          if (estadoFilter.value === 'success' && !isComplete)
            matchEstado = false;
          if (estadoFilter.value === 'warning' && isComplete)
            matchEstado = false;
        }

        return matchText && matchFecha && matchEstado;
      },
    },
  });

  const getSortedReadings = (readings: any[]) => {
    if (!readings) return [];
    return [...readings].sort(
      (a, b) => HOURS_ORDER.indexOf(a.hora) - HOURS_ORDER.indexOf(b.hora),
    );
  };

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
            { text: 'Cuarto Frío #5', href: '#' },
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
        splitPanelPreferences={{ position: 'side', size: 520 } as any}
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
                            Folio Maestro: #{item.id}
                          </p>
                          <h3 className="summary-title">Cuarto Frío #5</h3>
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

                    <div style={{ marginBottom: '16px' }}>
                      <Box
                        variant={'awsui-key-label' as any}
                        color="text-label"
                        fontSize="body-s"
                        margin={{ bottom: 'xs' }}
                      >
                        Lecturas Registradas Horarias (
                        {item.readings?.length || 0})
                      </Box>
                      <Table
                        columnDefinitions={DETAILS_COLUMNS}
                        items={getSortedReadings(item.readings)}
                        variant="embedded"
                        empty={<Box textAlign="center">Sin registros.</Box>}
                      />
                    </div>

                    {item.observaciones && (
                      <div style={{ marginTop: '16px' }}>
                        <Box
                          variant={'awsui-key-label' as any}
                          color="text-label"
                          fontSize="body-s"
                        >
                          Notas de Observaciones (Reverso)
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
                  </div>
                ))}
              </div>
            ) : (
              <Box
                textAlign="center"
                color="text-body-secondary"
                margin={{ top: 'xl' }}
              >
                Selecciona una bitácora.
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
              loadingText="Sincronizando..."
              columnDefinitions={COLUMN_DEFINITIONS}
              visibleColumns={preferences.visibleContent}
              empty={
                <div style={{ padding: '40px 0' }}>{collectionProps.empty}</div>
              }
              header={
                <Header
                  variant={'awsui-h1-sticky' as any}
                  counter={!loading ? `(${items.length})` : ''}
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
                            iconName="edit"
                            disabled={selectedItems.length !== 1}
                            onClick={openEditModal}
                          >
                            Rectificar
                          </Button>
                          <Button
                            iconName="remove"
                            disabled={selectedItems.length === 0}
                            onClick={() => setIsDeleteModalVisible(true)}
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
                        href="/cuarto-frio-5/new"
                      >
                        Captura Hora
                      </Button>
                    </SpaceBetween>
                  }
                >
                  Registros: Cuarto Frío #5
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
              /* 🚩 BARRA DE FILTROS COMPLETA RESTAURADA */
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
                      filteringPlaceholder="Buscar Folio..."
                      countText={`${filteredItemsCount} resultados`}
                    />
                  </div>

                  <div className="floating-filter">
                    <label>Estado</label>
                    <Select
                      selectedOption={estadoFilter}
                      onChange={({ detail }) =>
                        setEstadoFilter(detail.selectedOption as any)
                      }
                      options={[
                        { label: 'Todos', value: undefined },
                        { label: 'Completado', value: 'success' },
                        { label: 'En Progreso', value: 'warning' },
                      ]}
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

                  {(startDate || endDate || estadoFilter.value) && (
                    <Button
                      variant="inline-link"
                      onClick={() => {
                        actions.setFiltering('');
                        setStartDate('');
                        setEndDate('');
                        setEstadoFilter({ label: 'Todos', value: undefined });
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

      {/* MODAL RECTIFICAR 24 HORAS CON AUDITORÍA RESPONSIVA */}
      <Modal
        onDismiss={() => setIsEditModalVisible(false)}
        visible={isEditModalVisible}
        size="large"
        header={`Rectificación de Telemetría: Folio #${selectedItems[0]?.id}`}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant="link"
                onClick={() => setIsEditModalVisible(false)}
              >
                Cerrar
              </Button>
              <Button
                variant="primary"
                loading={isEditing}
                onClick={handleEditSubmit}
              >
                Guardar Modificación
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <Box color="text-status-error" fontSize="body-s">
            <Icon name="status-warning" /> <b>Auditoría Activa:</b> La
            modificación quedará registrada con tu usuario.
          </Box>

          <ColumnLayout columns={2}>
            <FormField label="Hora a Rectificar o Llenar">
              <Select
                selectedOption={selectedEditHour}
                onChange={({ detail }) =>
                  handleEditHourChange(detail.selectedOption)
                }
                options={HOUR_OPTIONS}
              />
            </FormField>
            <FormField label="Turno de la Lectura">
              <Select
                selectedOption={editTurno}
                onChange={({ detail }) =>
                  setEditTurno(detail.selectedOption as any)
                }
                options={[
                  { label: 'Turno A', value: 'A' },
                  { label: 'Turno B', value: 'B' },
                  { label: 'Turno C', value: 'C' },
                ]}
              />
            </FormField>
          </ColumnLayout>

          <div
            style={{
              maxHeight: '45vh',
              overflowY: 'auto',
              paddingRight: '12px',
              marginTop: '10px',
            }}
          >
            <SpaceBetween size="l">
              <Header variant="h3">Sala de Compresores</Header>
              <Grid
                gridDefinition={[
                  { colspan: { default: 12, s: 6, m: 3 } },
                  { colspan: { default: 12, s: 6, m: 3 } },
                  { colspan: { default: 12, s: 6, m: 3 } },
                  { colspan: { default: 12, s: 6, m: 3 } },
                ]}
              >
                <FormField label="Nivel Refrig. (%)">
                  <Input
                    type="number"
                    value={editTelemetry.nivel_refrigerante || ''}
                    onChange={({ detail }) =>
                      handleEditInputChange('nivel_refrigerante', detail.value)
                    }
                  />
                </FormField>
                <FormField label="P. Succión (PSI)">
                  <Input
                    type="number"
                    value={editTelemetry.pres_succion || ''}
                    onChange={({ detail }) =>
                      handleEditInputChange('pres_succion', detail.value)
                    }
                  />
                </FormField>
                <FormField label="P. Descarga (PSI)">
                  <Input
                    type="number"
                    value={editTelemetry.pres_descarga || ''}
                    onChange={({ detail }) =>
                      handleEditInputChange('pres_descarga', detail.value)
                    }
                  />
                </FormField>
                <FormField label="% de Carga">
                  <Input
                    type="number"
                    value={editTelemetry.pct_carga || ''}
                    onChange={({ detail }) =>
                      handleEditInputChange('pct_carga', detail.value)
                    }
                  />
                </FormField>
              </Grid>

              <FormField label="Revisión de Nivel de Aceite">
                <SegmentedControl
                  selectedId={editTelemetry.nivel_aceite || 'OK'}
                  onChange={({ detail }) =>
                    handleEditInputChange('nivel_aceite', detail.selectedId)
                  }
                  options={[
                    { text: '✓ OK', id: 'OK' },
                    { text: '✕ X', id: 'X' },
                  ]}
                />
              </FormField>

              <Header variant="h3">Temperaturas de Evaporadores (°C)</Header>
              <Grid
                gridDefinition={Array(8).fill({
                  colspan: { default: 12, s: 6, m: 3 },
                })}
              >
                {SCHEMA.evaporadores.map((e) => (
                  <FormField
                    key={e.id}
                    label={e.label}
                    description={`Rango: ${e.min}-${e.max}°C`}
                  >
                    <Input
                      value={editTelemetry[e.id] || ''}
                      onChange={({ detail }) =>
                        handleEditInputChange(e.id, detail.value)
                      }
                    />
                  </FormField>
                ))}
              </Grid>

              <Header variant="h3">Temperaturas Interiores / Cámaras</Header>
              <Grid
                gridDefinition={[
                  { colspan: { default: 12, s: 6, m: 3 } },
                  { colspan: { default: 12, s: 6, m: 3 } },
                  { colspan: { default: 12, s: 6, m: 3 } },
                  { colspan: { default: 12, s: 6, m: 3 } },
                ]}
              >
                <FormField label="Ambiente Ext.">
                  <Input
                    type="number"
                    value={editTelemetry.temp_ambiente || ''}
                    onChange={({ detail }) =>
                      handleEditInputChange('temp_ambiente', detail.value)
                    }
                  />
                </FormField>
                <FormField label="Termómetro 1">
                  <Input
                    type="number"
                    value={editTelemetry.temp_cuarto_1 || ''}
                    onChange={({ detail }) =>
                      handleEditInputChange('temp_cuarto_1', detail.value)
                    }
                  />
                </FormField>
                <FormField label="Termómetro 2">
                  <Input
                    type="number"
                    value={editTelemetry.temp_cuarto_2 || ''}
                    onChange={({ detail }) =>
                      handleEditInputChange('temp_cuarto_2', detail.value)
                    }
                  />
                </FormField>
                <FormField label="Termómetro 3">
                  <Input
                    type="number"
                    value={editTelemetry.temp_cuarto_3 || ''}
                    onChange={({ detail }) =>
                      handleEditInputChange('temp_cuarto_3', detail.value)
                    }
                  />
                </FormField>
              </Grid>
            </SpaceBetween>
          </div>
          <FormField label="Notas Adicionales del Reverso (Consolidado)">
            <Textarea
              value={editObservaciones}
              onChange={({ detail }) => setEditObservaciones(detail.value)}
              rows={2}
            />
          </FormField>
        </SpaceBetween>
      </Modal>

      {/* MODAL CONFIG SGC */}
      <Modal
        onDismiss={() => setIsConfigModalVisible(false)}
        visible={isConfigModalVisible}
        header="Configuración Normativa SGC"
        footer={
          <Box float="right">
            <Button
              variant="primary"
              loading={isSavingConfig}
              onClick={handleSaveConfig}
            >
              Aprobar Cambios
            </Button>
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
            <FormField label="Código">
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
            <FormField label="Versión">
              <Input
                type="number"
                step={0.1}
                value={formConfig.version}
                onChange={({ detail }) =>
                  setFormConfig((p) => ({ ...p, version: detail.value }))
                }
              />
            </FormField>
            <FormField label="F. Revisión">
              <DatePicker
                value={formConfig.fecha_revision}
                onChange={({ detail }) =>
                  setFormConfig((p) => ({ ...p, fecha_revision: detail.value }))
                }
                expandToViewport={true}
              />
            </FormField>
            <FormField label="F. Reemplazo">
              <DatePicker
                value={formConfig.fecha_reemplazo}
                onChange={({ detail }) =>
                  setFormConfig((p) => ({
                    ...p,
                    fecha_reemplazo: detail.value,
                  }))
                }
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
          <FormField label="Estándar">
            <Input
              value={formConfig.estandar_calidad}
              onChange={({ detail }) =>
                setFormConfig((p) => ({ ...p, estandar_calidad: detail.value }))
              }
            />
          </FormField>
          <FormField label="Razón Cambio">
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

      {/* MODAL BORRAR */}
      <Modal
        onDismiss={() => setIsDeleteModalVisible(false)}
        visible={isDeleteModalVisible}
        header="Eliminar Registro"
        footer={
          <Box float="right">
            <Button
              variant="primary"
              loading={isDeleting}
              onClick={handleDeleteSubmit}
              disabled={deleteConfirmationText.toLowerCase() !== 'confirmar'}
            >
              Confirmar
            </Button>
          </Box>
        }
      >
        <FormField label='Escriba "confirmar":'>
          <Input
            value={deleteConfirmationText}
            onChange={({ detail }) => setDeleteConfirmationText(detail.value)}
          />
        </FormField>
      </Modal>
    </div>
  );
}
