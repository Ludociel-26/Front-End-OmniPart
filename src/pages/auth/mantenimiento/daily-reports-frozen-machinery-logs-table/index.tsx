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
  .check-item-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--color-border-divider-default, #eaeded); }
  .check-item-row:last-child { border-bottom: none; }
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

// --- ESQUEMA DE DATOS Y DICCIONARIO ---
const SCHEMA = {
  maquinaria: [
    { id: 'maq_1', label: '1. VENTILADOR DE CONDENSADOR FRICK NO.1' },
    { id: 'maq_2', label: '2. VENTILADOR DE CONDENSADOR FRICK NO.2' },
    { id: 'maq_3', label: '3. VENTILADOR DE CONDENSADOR FRICK NO.3' },
    { id: 'maq_4', label: '4. BOMBA NO.1 DEL CONDENSADOR FRICK NO.1' },
    { id: 'maq_5', label: '5. BOMBA No. 1 DE TORRE PROTEC.' },
    { id: 'maq_6', label: '6. BOMBA No. 2 DE TORRE PROTEC.' },
    { id: 'maq_7', label: '7. VENTILADORES DE TORRE PROTEC' },
    { id: 'maq_8', label: '8. PRESION DE ACEITE DE COMPRESOR No. 1' },
    { id: 'maq_9', label: '9. REVISAR NIVEL DE ACEITE EN COMPRESOR No. 1' },
    { id: 'maq_10', label: '10. PRESION DE ACEITE DE COMPRESOR No. 2' },
    { id: 'maq_11', label: '11. REVISAR NIVEL DE ACEITE EN COMPRESOR No. 2' },
    { id: 'maq_12', label: '12. PRESION DE ACEITE DE COMPRESOR No. 3' },
    { id: 'maq_13', label: '13. REVISAR NIVEL DE ACEITE EN COMPRESOR No. 3' },
    { id: 'maq_14', label: '14. BOMBA NO. 1 RECIRCULADOR AMONIACO #1' },
    { id: 'maq_15', label: '15. BOMBA NO. 2 RECIRCULADOR AMONIACO #1' },
    { id: 'maq_16', label: '16. BOMBA NO. 1 RECIRCULADOR AMONIACO #2' },
    { id: 'maq_17', label: '17. BOMBA NO. 2 RECIRCULADOR AMONIACO #2' },
    { id: 'maq_18', label: '18. REVISION DE DISPOSITIVOS DE SEGURIDAD' },
  ],
  cuartos: [
    { id: 'cf_1', label: '1. VENTILADORES DIFUSOR NO.1 DE EMPAQUE' },
    { id: 'cf_2', label: '2. VENTILADORES DIFUSOR NO.2 DE EMPAQUE' },
    { id: 'cf_3', label: '3. VENTILADORES DIFUSOR NO.3 DE RAMPAS' },
    { id: 'cf_4', label: '4. VENTILADORES DIFUSOR NO.4 DE RAMPAS' },
    { id: 'cf_5', label: '5. VENTILADORES DIFUSOR NO.5 DE CUARTO REFRIGERADO' },
    { id: 'cf_6', label: '6. VENTILADORES DIFUSOR NO.6 DE CUARTO REFRIGERADO' },
    { id: 'cf_7', label: '7. VENTILADORES DIFUSOR NO.7 DE CUARTO SECO' },
    { id: 'cf_8', label: '8. VENTILADORES DIFUSOR NO.8 DE CUARTO CONGELADO' },
    { id: 'cf_9', label: '9. VENTILADORES DIFUSOR NO.9 DE CUARTO CONGELADO' },
    { id: 'cf_10', label: '10. VENTILADORES DIFUSOR NO.10 DE MONDINIS' },
    { id: 'cf_11', label: '11. VENTILADORES DIFUSOR NO.11 DE MONDINIS' },
    { id: 'cf_12', label: '12. VENTILADORES DIFUSOR NO.12 DE CUARTO SECO' },
    { id: 'cf_13', label: '13. VENTILADORES DIFUSOR NO.13 DE CONSERVACION' },
  ],
  acondicionado: [
    { id: 'ac_1', label: '1. CLIMA # 1 area de Corte' },
    { id: 'ac_2', label: '2. CLIMA # 2 area de Corte' },
    { id: 'ac_3', label: '3. CLIMA # 3 area pesado de Copas' },
    { id: 'ac_4', label: '4. CLIMA # 4 area pesado de Copas' },
    { id: 'ac_5', label: '5. AREA DE ENVAFLEX' },
    { id: 'ac_6', label: '6. CLIMA OFICINA DE SERVICIOS TECNICOS' },
  ],
  amoniaco: [
    { id: 'am_1', label: '1. SENSOR DE AMONIACO DE CUARTO DE MAQUINAS' },
    { id: 'am_2', label: '2. SENSOR DE AMONIACO DEL HIDROCHILLER' },
    { id: 'am_3', label: '3. SENSOR DE AMONIACO DEL DIFUSOR # 8' },
    { id: 'am_4', label: '4. SENSOR DE AMONIACO DEL DIFUSOR # 9' },
    { id: 'am_5', label: '5. SENSOR DE AMONIACO DEL I.Q.F.' },
  ],
  sistemas_aislados: {
    rejillas: {
      id: 'rejillas',
      label: 'INSPECCION DE FILTROS Y REJILLAS DE AIRE',
    },
    deshielo: {
      id: 'deshielo',
      label: 'VERIFICAR SECUENCIA OPERATIVA DEL CICLO DE DESHIELO',
    },
    ecochiller: {
      id: 'ecochiller',
      label: 'REVISAR FUNCIONAMIENTO DEL SISTEMA DEL ECOCHILLER',
    },
  },
  fugas_drager: [
    {
      id: 'fuga_drager',
      label: 'INSPECCIONAR FUGAS DE AMONIACO CON DETECTOR DRAGER',
    },
  ],
  dosificadores: [
    { id: 'dosi_frick', label: 'CONDENSADOR FRICK: DOSIFICADORES' },
    { id: 'dosi_protec', label: 'TORRE PROTEC: DOSIFICADORES' },
  ],
};

const TASK_DICTIONARY: Record<string, string> = {};
[
  ...SCHEMA.maquinaria,
  ...SCHEMA.cuartos,
  ...SCHEMA.acondicionado,
  ...SCHEMA.amoniaco,
  ...SCHEMA.fugas_drager,
  ...SCHEMA.dosificadores,
].forEach((t) => (TASK_DICTIONARY[t.id] = t.label));
Object.values(SCHEMA.sistemas_aislados).forEach(
  (t) => (TASK_DICTIONARY[t.id] = t.label),
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
    id: 'folio',
    header: 'Folio Maestro',
    cell: (item: any) => <Link href="#">#{item.logId}</Link>,
    sortingField: 'logId',
    minWidth: 120,
  },
  {
    id: 'fecha',
    header: 'Fecha Registrada',
    cell: (item: any) => item.fecha,
    sortingField: 'rawTimestamp',
    minWidth: 150,
  },
  {
    id: 'turno',
    header: 'Turno',
    cell: (item: any) => <Badge color="blue">Turno {item.turno}</Badge>,
    sortingField: 'turno',
    minWidth: 100,
  },
  {
    id: 'operador',
    header: 'Operador',
    cell: (item: any) => item.operador,
    sortingField: 'operador',
    minWidth: 180,
  },
  {
    id: 'estadoGeneral',
    header: 'Estado Global',
    sortingField: 'estadoGeneral',
    minWidth: 150,
    cell: (item: any) => {
      const statusMap: any = {
        success: { type: 'success', text: 'Operativo' },
        warning: { type: 'warning', text: 'Requiere Prog.' },
        error: { type: 'error', text: 'Crítico' },
      };
      const status = statusMap[item.estadoGeneral];
      return (
        <StatusIndicator type={status.type}>{status.text}</StatusIndicator>
      );
    },
  },
];

export default function CongeladosReportsTable() {
  const appContext = React.useContext(AppContent) as any;
  const alerts = appContext?.alerts || [];
  const addAlert = appContext?.addAlert;
  const user = appContext?.user;

  const [data, setData] = React.useState<any[]>([]);
  const [rawLogs, setRawLogs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);

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

  const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editItem, setEditItem] = React.useState<any>(null);
  const [editChecks, setEditChecks] = React.useState<
    Record<string, { status: string; comments: string }>
  >({});
  const [editGlobalObs, setEditGlobalObs] = React.useState('');

  const [isDeleteModalVisible, setIsDeleteModalVisible] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] =
    React.useState('');

  const [navigationOpen, setNavigationOpen] = React.useState(true);
  const [selectedItems, setSelectedItems] = React.useState<any[]>([]);
  const [splitPanelOpen, setSplitPanelOpen] = React.useState(false);

  const [turnoFilter, setTurnoFilter] = React.useState<any>({
    label: 'Todos',
    value: undefined,
  });
  const [estadoFilter, setEstadoFilter] = React.useState<any>({
    label: 'Todos',
    value: undefined,
  });
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  const [preferences, setPreferences] = React.useState<any>({
    pageSize: 50,
    visibleContent: ['folio', 'fecha', 'turno', 'operador', 'estadoGeneral'],
  });

  React.useEffect(() => {
    setSplitPanelOpen(selectedItems.length === 1);
  }, [selectedItems]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get(`${MAINTENANCE_API_URL}/api/congelados-report`);
      if (res.data.success) {
        setRawLogs(res.data.data);
        const flatData: any[] = [];
        res.data.data.forEach((log: any) => {
          ['A', 'B', 'C'].forEach((turno) => {
            const tasks = log.tasks.filter((t: any) => t.turno === turno);
            if (tasks.length > 0) {
              let estadoGeneral: 'success' | 'warning' | 'error' = 'success';
              let observaciones = '';
              const detalles = tasks.map((t: any) => {
                if (
                  t.status === 'ANORMAL' ||
                  t.status === 'NO' ||
                  t.status === 'CON_FUGA'
                ) {
                  estadoGeneral =
                    estadoGeneral === 'error' ? 'error' : 'warning';
                }
                if (t.status === 'FALLA') estadoGeneral = 'error';
                if (t.comments)
                  observaciones += `[${TASK_DICTIONARY[t.taskId] || t.taskId}]: ${t.comments}. \n`;
                return {
                  taskId: t.taskId,
                  tarea: TASK_DICTIONARY[t.taskId] || t.taskId,
                  status: t.status,
                  comments: t.comments,
                };
              });
              const operadorObj = log[`operator${turno}`];
              const operadorName = operadorObj
                ? `${operadorObj.name} ${operadorObj.surname}`
                : 'Operador no registrado';
              flatData.push({
                logId: log.id,
                fecha: log.productionDate,
                turno,
                operador: operadorName,
                estadoGeneral,
                observaciones: observaciones.trim(),
                detalles,
                rawTimestamp: new Date(
                  `${log.productionDate}T12:00:00`,
                ).getTime(),
                logMetadata: log,
              });
            }
          });
        });
        setData(flatData);
      }
    } catch (error) {
      if (addAlert) addAlert('error', 'Error al obtener datos de bitácoras.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReports();
  }, []);

  const handleOpenConfigModal = async () => {
    try {
      const res = await api.get(`${MAINTENANCE_API_URL}/api/document-configs`);
      if (res.data.success) {
        const current = res.data.data.find(
          (c: any) => c.area_key === 'reportes_diarios_congelados',
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
        `${MAINTENANCE_API_URL}/api/document-configs/reportes_diarios_congelados`,
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

  const openEditModal = () => {
    const item = selectedItems[0];
    setEditItem(item);
    const initialChecks: Record<string, any> = {};
    item.detalles.forEach((d: any) => {
      initialChecks[d.taskId] = { status: d.status, comments: d.comments };
    });
    setEditChecks(initialChecks);
    setEditGlobalObs('');
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    setIsEditing(true);
    try {
      const payload = {
        turno: editItem.turno,
        evaluations: editChecks,
        observacionesGlobales: editGlobalObs,
        codigo_documento: editItem.logMetadata.codigo_documento,
        version: editItem.logMetadata.version,
        fecha_revision: editItem.logMetadata.fecha_revision,
        fecha_reemplazo: editItem.logMetadata.fecha_reemplazo,
        propietario: editItem.logMetadata.propietario,
        aprobador: editItem.logMetadata.aprobador,
        estandar_calidad: editItem.logMetadata.estandar_calidad,
        razon_cambio: editItem.logMetadata.razon_cambio,
      };
      await api.post(`${MAINTENANCE_API_URL}/api/congelados-report`, payload);
      if (addAlert)
        addAlert(
          'success',
          `Inspección del Turno ${editItem.turno} rectificada exitosamente.`,
        );
      setIsEditModalVisible(false);
      setSelectedItems([]);
      fetchReports();
    } catch (error) {
      if (addAlert)
        addAlert('error', 'Error al actualizar el registro mediante Upsert.');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteSubmit = async () => {
    setIsDeleting(true);
    try {
      const uniqueLogIds = Array.from(
        new Set(selectedItems.map((item) => item.logId)),
      );
      for (const id of uniqueLogIds) {
        await api.delete(`${MAINTENANCE_API_URL}/api/congelados-report/${id}`);
      }
      if (addAlert)
        addAlert(
          'success',
          `Se inhabilitaron ${uniqueLogIds.length} hoja(s) completa(s) de la BD.`,
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

  // --- 🚩 GENERADOR DE PDF LANDSCAPE (UNIFICADO, SEGURO Y EXACTO) ---
  const handleExportPDF = async () => {
    if (selectedItems.length === 0) return;
    setIsExporting(true);
    try {
      const uniqueLogIds = Array.from(
        new Set(selectedItems.map((item) => item.logId)),
      );
      const doc = new jsPDF('l', 'pt', 'letter'); // Landscape: 792 x 612
      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const logoData = await getLogoData(logoDelMonte);

      for (let i = 0; i < uniqueLogIds.length; i++) {
        const logId = uniqueLogIds[i];
        const log = rawLogs.find((l) => l.id === logId);
        if (!log) continue;

        if (i > 0) doc.addPage();

        const safeTextCenter = (text: string, x: number, y: number) => {
          doc.text(text, x - doc.getTextWidth(text) / 2, y);
        };

        // --- 1. HEADER ESTATICO (DIBUJADO UNA VEZ POR HOJA) ---
        const headerH = 40;
        doc.setDrawColor(0);
        doc.setLineWidth(1);
        doc.rect(margin, margin, pageWidth - margin * 2, headerH);
        const col1W = 160;
        const col3W = 130;
        doc.line(margin + col1W, margin, margin + col1W, margin + headerH);
        doc.line(
          pageWidth - margin - col3W,
          margin,
          pageWidth - margin - col3W,
          margin + headerH,
        );
        doc.line(margin, margin + 25, margin + col1W, margin + 25);

        if (logoData) {
          const ratio = logoData.width / logoData.height;
          let finalH = 20;
          let finalW = finalH * ratio;
          doc.addImage(
            logoData.data,
            'PNG',
            margin + (col1W - finalW) / 2,
            margin + (25 - finalH) / 2,
            finalW,
            finalH,
          );
        }
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        safeTextCenter(
          'Formato Departamental',
          margin + col1W / 2,
          margin + 35,
        );
        doc.setFontSize(7);
        doc.text('Titulo:', margin + col1W + 5, margin + 10);
        doc.setFontSize(13);
        safeTextCenter(
          'Reportes Diarios Maquinaria Congelados',
          margin + col1W + (pageWidth - margin * 2 - col1W - col3W) / 2,
          margin + 28,
        );
        doc.setFontSize(7);
        doc.text('Numero:', pageWidth - margin - col3W + 5, margin + 10);
        doc.setFontSize(11);
        safeTextCenter(
          log.codigo_documento,
          pageWidth - margin - col3W / 2,
          margin + 28,
        );

        // --- 2. DATOS DEL REPORTE ---
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        safeTextCenter(
          'REPORTE DIARIO DE MAQUINARIA',
          pageWidth / 4,
          margin + 55,
        );
        safeTextCenter('COMPRESORES CONGELADOS', pageWidth / 4, margin + 65);

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `TURNO A. NOMBRE: ${log.operatorA ? log.operatorA.name + ' ' + log.operatorA.surname : '________________________'}`,
          margin,
          margin + 60,
        );
        doc.text(
          `TURNO B. NOMBRE: ${log.operatorB ? log.operatorB.name + ' ' + log.operatorB.surname : '________________________'}`,
          margin,
          margin + 70,
        );
        doc.text(
          `TURNO C. NOMBRE: ${log.operatorC ? log.operatorC.name + ' ' + log.operatorC.surname : '________________________'}`,
          margin,
          margin + 80,
        );

        doc.setFont('helvetica', 'bold');
        doc.text(
          `FECHA:  ${log.productionDate}`,
          pageWidth - margin - 150,
          margin + 70,
        );
        doc.line(
          pageWidth - margin - 110,
          margin + 72,
          pageWidth - margin,
          margin + 72,
        );

        // --- 3. PIE DE PÁGINA SGC (Asegurado al fondo de la hoja de 612 pt) ---
        const footerHeight = 30;
        const bY = pageHeight - margin - footerHeight; // 612 - 15 - 30 = 567
        const totalW = pageWidth - margin * 2;
        doc.setDrawColor(0);
        doc.setLineWidth(1);
        doc.rect(margin, bY, totalW, footerHeight);
        doc.line(margin, bY + 15, margin + totalW, bY + 15);

        const cWidths = [90, 90, 60, 160, 180, totalW - 580];
        let cX = margin;
        for (let j = 0; j < cWidths.length - 1; j++) {
          cX += cWidths[j];
          doc.line(cX, bY, cX, bY + 15);
        }

        doc.setFontSize(6);
        let txX = margin;
        const getC = (w: number) => {
          const c = txX + w / 2;
          txX += w;
          return c;
        };

        safeTextCenter(
          `Fecha de Revisión: ${log.fecha_revision}`,
          getC(cWidths[0]),
          bY + 10,
        );
        safeTextCenter(
          `Reemplaza a: ${log.fecha_reemplazo}`,
          getC(cWidths[1]),
          bY + 10,
        );
        safeTextCenter(`Versión: ${log.version}`, getC(cWidths[2]), bY + 10);
        safeTextCenter(
          `Propietario: ${log.propietario} | Aprobado: ${log.aprobador}`,
          getC(cWidths[3]),
          bY + 10,
        );
        safeTextCenter(
          `Estándar: ${log.estandar_calidad}`,
          getC(cWidths[4]),
          bY + 10,
        );
        safeTextCenter(`Página 1 de 1`, getC(cWidths[5]), bY + 10);

        doc.setFont('helvetica', 'bold');
        doc.text('Razón del cambio:', margin + 5, bY + 25);
        doc.setFont('helvetica', 'normal');
        doc.text(log.razon_cambio || '', margin + 75, bY + 25, {
          maxWidth: totalW - 80,
        });

        // --- 4. MOTOR DE TABLAS CUSTOM (Anti-Crash, sin configuraciones raras) ---
        const colW = (pageWidth - margin * 3) / 2; // (792 - 45) / 2 = 373.5
        const leftM = margin;
        const rightM = margin * 2 + colW; // 15 + 15 + 373.5 = 403.5

        const getCols = (taskId: string) => {
          const res = ['', '', ''];
          ['A', 'B', 'C'].forEach((turno, idx) => {
            const task = (log.tasks || []).find(
              (t: any) => t.taskId === taskId && t.turno === turno,
            );
            if (task) {
              if (
                task.status === 'NORMAL' ||
                task.status === 'SI' ||
                task.status === 'SIN_FUGA'
              )
                res[idx] = 'A';
              else if (
                task.status === 'ANORMAL' ||
                task.status === 'NO' ||
                task.status === 'CON_FUGA'
              )
                res[idx] = 'B';
              else if (task.status === 'FALLA') res[idx] = 'C';
            }
          });
          return res;
        };

        const buildSection = (schemaItems: any[]) =>
          schemaItems.map((item) => [item.label, ...getCols(item.id)]);

        // Función constructora limpia
        const drawCustomTable = (
          headTitle: string,
          bodyData: any[][],
          startY: number,
          xPos: number,
          isDrager: boolean = false,
        ) => {
          autoTable(doc, {
            startY,
            margin: { left: xPos, right: pageWidth - xPos - colW },
            head: isDrager
              ? [[headTitle, 'A', 'B']]
              : [[headTitle, 'A', 'B', 'C']],
            body: bodyData,
            theme: 'grid',
            styles: {
              fontSize: 5.5,
              cellPadding: 1.5,
              lineColor: 0,
              lineWidth: 0.5,
              textColor: 0,
            },
            headStyles: {
              fillColor: [230, 230, 230],
              textColor: 0,
              fontStyle: 'bold',
              halign: 'center',
            },
            columnStyles: isDrager
              ? {
                  0: { cellWidth: colW - 40, halign: 'left' },
                  1: { cellWidth: 20, halign: 'center' },
                  2: { cellWidth: 20, halign: 'center' },
                }
              : {
                  0: { cellWidth: colW - 60, halign: 'left' },
                  1: { cellWidth: 20, halign: 'center' },
                  2: { cellWidth: 20, halign: 'center' },
                  3: { cellWidth: 20, halign: 'center' },
                },
            didParseCell: function (data: any) {
              if (data.section === 'head' && data.column.index === 0) {
                data.cell.styles.halign = 'left';
              }
              if (data.section === 'body' && data.column.index > 0) {
                const val = data.cell.raw;
                if (val === 'B') {
                  data.cell.styles.fillColor = [255, 248, 225];
                  data.cell.styles.textColor = [180, 100, 0];
                  data.cell.styles.fontStyle = 'bold';
                } else if (val === 'C') {
                  data.cell.styles.fillColor = [255, 235, 238];
                  data.cell.styles.textColor = [209, 50, 18];
                  data.cell.styles.fontStyle = 'bold';
                }
              }
            },
          });
          return (doc as any).lastAutoTable.finalY;
        };

        const drawLegend = (
          text: string,
          x: number,
          y: number,
          width: number,
        ) => {
          doc.setFontSize(6);
          doc.setFont('helvetica', 'bold');
          const parts = text.split('  ');
          let currentX = x + 10;
          parts.forEach((p) => {
            doc.text(p, currentX, y);
            currentX += width / 3;
          });
        };

        // --- COLUMNA IZQUIERDA ---
        let currentLeftY = margin + 85;
        currentLeftY =
          drawCustomTable(
            'FUNCIONAMIENTO DE MAQUINARIA',
            buildSection(SCHEMA.maquinaria),
            currentLeftY,
            leftM,
          ) + 4;
        currentLeftY =
          drawCustomTable(
            'CUARTOS FRIOS',
            buildSection(SCHEMA.cuartos),
            currentLeftY,
            leftM,
          ) + 4;
        drawLegend(
          'A= NORMAL (En funcionamiento)  B= ANORMAL (Programar revision)  C= FALLA (Fuera de servicio)',
          leftM,
          currentLeftY + 4,
          colW,
        );
        currentLeftY += 10;
        currentLeftY =
          drawCustomTable(
            'INSPECCION DE FILTROS Y REJILLAS',
            buildSection([SCHEMA.sistemas_aislados.rejillas]),
            currentLeftY,
            leftM,
          ) + 4;
        drawLegend(
          'A= NORMAL (Limpias)  B= ANORMAL (Requieren limpieza)  C= FALLA (Obstruidas o dañadas)',
          leftM,
          currentLeftY + 4,
          colW,
        );
        currentLeftY += 10;
        currentLeftY = drawCustomTable(
          'VERIFICAR SECUENCIA OPERATIVA DEL CICLO DE DESHIELO',
          buildSection([SCHEMA.sistemas_aislados.deshielo]),
          currentLeftY,
          leftM,
        );

        // --- COLUMNA DERECHA ---
        let currentRightY = margin + 85;
        currentRightY =
          drawCustomTable(
            'CONDENSADOR FRICK',
            buildSection([SCHEMA.dosificadores[0]]),
            currentRightY,
            rightM,
          ) + 4;
        currentRightY =
          drawCustomTable(
            'TORRE PROTEC',
            buildSection([SCHEMA.dosificadores[1]]),
            currentRightY,
            rightM,
          ) + 4;
        currentRightY =
          drawCustomTable(
            'REVISAR FUNCIONAMIENTO AIRE ACONDICIONADO',
            buildSection(SCHEMA.acondicionado),
            currentRightY,
            rightM,
          ) + 4;
        currentRightY =
          drawCustomTable(
            'SISTEMA DEL ECOCHILLER',
            buildSection([SCHEMA.sistemas_aislados.ecochiller]),
            currentRightY,
            rightM,
          ) + 4;
        drawLegend(
          'A= NORMAL (En funcionamiento)  B= ANORMAL (Programar revision)  C= FALLA (Fuera de servicio)',
          rightM,
          currentRightY + 4,
          colW,
        );
        currentRightY += 10;

        currentRightY =
          drawCustomTable(
            'DETECCION DE AMONIACO',
            buildSection(SCHEMA.amoniaco),
            currentRightY,
            rightM,
          ) + 4;
        drawLegend(
          'A= NORMAL (En funcionamiento)  B= ANORMAL (Programar revision)  C= FALLA (Fuera de servicio)',
          rightM,
          currentRightY + 4,
          colW,
        );
        currentRightY += 10;

        const dragerVals = getCols('fuga_drager');
        currentRightY =
          drawCustomTable(
            'INSPECCION FUGAS DRAGER',
            [[SCHEMA.fugas_drager[0].label, dragerVals[0], dragerVals[1]]],
            currentRightY,
            rightM,
            true,
          ) + 4;
        drawLegend('A= SIN FUGA  B= CON FUGA', rightM, currentRightY + 4, colW);
        currentRightY += 10;

        const limpiezaBody = [
          [
            'REALIZAR LIMPIEZA DEL AREA Y MAQUINARIA (3 TURNOS)',
            log.limpieza_completada ? 'A' : '',
            log.limpieza_completada ? 'A' : '',
            log.limpieza_completada ? 'A' : '',
          ],
        ];
        currentRightY = drawCustomTable(
          'LIMPIEZA DEL AREA (3 TURNOS)',
          limpiezaBody,
          currentRightY,
          rightM,
        );

        // --- OBSERVACIONES MANUALES DERECHA ---
        currentRightY += 15;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('OBSERVACIONES:', rightM, currentRightY);
        doc.setFont('helvetica', 'normal');

        const obsText = log.observaciones_generales || '-';
        const splitObs = doc.splitTextToSize(obsText, colW - 80);
        doc.text(splitObs, rightM + 80, currentRightY);

        for (let k = 0; k < 4; k++) {
          doc.line(
            rightM + 80,
            currentRightY + 2 + k * 12,
            rightM + colW,
            currentRightY + 2 + k * 12,
          );
        }
      } // Fin Loop

      doc.save(
        selectedItems.length === 1
          ? `Congelados_Dia_${selectedItems[0].fecha}.pdf`
          : `Congelados_Lote.pdf`,
      );
      if (addAlert)
        addAlert(
          'success',
          `Exportación completada. Formato Landscape generado con éxito en una sola hoja.`,
        );
    } catch (error) {
      console.error(error);
      if (addAlert)
        addAlert('error', 'Error crítico al construir el documento PDF.');
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
            <Button variant="primary" href="/congelados/new">
              Nuevo Reporte
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
          const itemDate = item.rawTimestamp;
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
            { text: 'Reportes Diarios', href: '#' },
            { text: 'Gestión Congelados', href: '#' },
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
            header={(<Header variant="h2">Radiografía de Turno</Header>) as any}
          >
            {selectedItems.length === 1 ? (
              <div style={{ paddingBottom: '20px' }}>
                {selectedItems.map((item) => (
                  <div key={`${item.logId}-${item.turno}`}>
                    <div className="checklist-summary-card">
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <p className="summary-subtitle">
                            Folio Maestro: #{item.logId}
                          </p>
                          <h3 className="summary-title">
                            Maquinaria Congelados
                          </h3>
                        </div>
                        <StatusIndicator type={item.estadoGeneral as any} />
                      </div>
                      <div
                        style={{
                          marginTop: '12px',
                          fontSize: '13px',
                          color: '#cbd5e1',
                        }}
                      >
                        <Icon name={'calendar' as any} size="small" />{' '}
                        {item.fecha} | Turno {item.turno}
                      </div>
                    </div>
                    <ColumnLayout columns={1} variant="text-grid">
                      <div style={{ marginBottom: '16px' }}>
                        <Box
                          variant={'awsui-key-label' as any}
                          color="text-label"
                          fontSize="body-s"
                        >
                          Operador Responsable
                        </Box>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                          {item.operador}
                        </div>
                      </div>
                      {item.observaciones && (
                        <div style={{ marginBottom: '16px' }}>
                          <Box
                            variant={'awsui-key-label' as any}
                            color="text-label"
                            fontSize="body-s"
                          >
                            Observaciones del Turno
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
                      <div>
                        <Box
                          variant={'awsui-key-label' as any}
                          color="text-label"
                          fontSize="body-s"
                          margin={{ bottom: 'xs' }}
                        >
                          Control de Puntos ({item.detalles.length})
                        </Box>
                        <div style={{ borderTop: '1px solid #eaeded' }}>
                          {item.detalles.map((detalle: any, idx: number) => (
                            <div key={idx} className="check-item-row">
                              <span
                                style={{
                                  fontSize: '12px',
                                  width: '65%',
                                  lineHeight: '1.2',
                                  fontWeight:
                                    detalle.status !== 'NORMAL' &&
                                    detalle.status !== 'SI' &&
                                    detalle.status !== 'SIN_FUGA'
                                      ? 'bold'
                                      : 'normal',
                                }}
                              >
                                {detalle.tarea}
                              </span>
                              <Badge
                                color={
                                  detalle.status === 'NORMAL' ||
                                  detalle.status === 'SI' ||
                                  detalle.status === 'SIN_FUGA'
                                    ? 'green'
                                    : detalle.status === 'FALLA'
                                      ? 'red'
                                      : 'blue'
                                }
                              >
                                {detalle.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
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
                Selecciona un registro para ver su detalle.
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
              loadingText="Extrayendo bitácoras..."
              columnDefinitions={COLUMN_DEFINITIONS}
              visibleColumns={preferences.visibleContent}
              empty={
                <div style={{ padding: '40px 0' }}>{collectionProps.empty}</div>
              }
              header={
                <Header
                  variant={'awsui-h1-sticky' as any}
                  counter={!loading ? `(${items.length})` : ''}
                  description="Gestión histórica de Reportes de Maquinaria de Congelados."
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
                        href="/congelados/new"
                      >
                        Nuevo Reporte
                      </Button>
                    </SpaceBetween>
                  }
                >
                  Registros: Congelados
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
                      filteringPlaceholder="Buscar..."
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
                          { label: 'A', value: 'A' },
                          { label: 'B', value: 'B' },
                          { label: 'C', value: 'C' },
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
        header="Configuración de Plantilla SGC"
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
              rows={2}
            />
          </FormField>
        </SpaceBetween>
      </Modal>

      {/* MODAL EDICIÓN RÁPIDA (CON UPSERT) */}
      <Modal
        onDismiss={() => setIsEditModalVisible(false)}
        visible={isEditModalVisible}
        header={`Rectificar Turno ${editItem?.turno}`}
        size="large"
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
            <Icon name="status-warning" /> Modificando registro auditable. Use
            Segmented Controls para alterar estado.
          </Box>
          <div
            style={{
              maxHeight: '50vh',
              overflowY: 'auto',
              paddingRight: '12px',
            }}
          >
            <SpaceBetween size="m">
              {Object.entries(editChecks).map(([taskId, checkData]) => (
                <div
                  key={taskId}
                  style={{
                    borderBottom: '1px solid #eaeded',
                    paddingBottom: '10px',
                  }}
                >
                  <Grid gridDefinition={[{ colspan: 8 }, { colspan: 4 }]}>
                    <Box variant="span" fontWeight="bold">
                      {TASK_DICTIONARY[taskId] || taskId}
                    </Box>
                    <SegmentedControl
                      selectedId={checkData.status}
                      onChange={({ detail }) =>
                        setEditChecks((p) => ({
                          ...p,
                          [taskId]: { ...p[taskId], status: detail.selectedId },
                        }))
                      }
                      options={[
                        { text: 'A', id: 'NORMAL' },
                        { text: 'B', id: 'ANORMAL' },
                        { text: 'C', id: 'FALLA' },
                        { text: 'SI', id: 'SI' },
                        { text: 'NO', id: 'NO' },
                        { text: 'SIN F', id: 'SIN_FUGA' },
                        { text: 'CON F', id: 'CON_FUGA' },
                      ]}
                    />
                  </Grid>
                </div>
              ))}
            </SpaceBetween>
          </div>
          <FormField label="Agregar notas adicionales al Turno (Globales)">
            <Textarea
              value={editGlobalObs}
              onChange={({ detail }) => setEditGlobalObs(detail.value)}
              rows={2}
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
        header="Inhabilitar Día de Producción"
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
            ¡CUIDADO!
          </Box>
          <Box variant="p">
            Al eliminar una fila de la tabla, se eliminará el{' '}
            <b>DÍA DE PRODUCCIÓN MAESTRO completo</b> (Se borrarán los datos del
            Turno A, B y C de ese día). Esta acción impacta trazabilidad.
          </Box>
          <FormField label='Escriba "confirmar":'>
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
