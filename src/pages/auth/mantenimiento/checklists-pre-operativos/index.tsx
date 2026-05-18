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
  SegmentedControl,
} from '@cloudscape-design/components';
import { useCollection } from '@cloudscape-design/collection-hooks';

// --- CONTEXTO Y COMPONENTES DE LAYOUT ---
import { AppContent } from '@/context/AppContext';
import Navbar from '@/components/layouts/AppHeader';
import GlobalSidebar from '@/components/layouts/AppSidebar';
import SecondaryHeader from '@/components/layouts/BreadcrumbNavBar';
import { Footer } from '@/components/layouts/AppFooter';

import logoDelMonte from '@/assets/icons/logo-2.svg';
// 🚩 IMPORTACIÓN DEL ESTADO VACÍO
import emptyStateImage from '@/assets/table-items/robot-empty.svg';

const MAINTENANCE_API_URL =
  import.meta.env.VITE_MAINTENANCE_API_URL || 'http://localhost:4001';

// 🚩 CSS DEFINITIVO
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
  
  /* FILTROS FLOTANTES */
  .floating-filter {
    position: relative;
    display: inline-block;
    margin-top: 6px;
    min-width: 140px;
  }
  .floating-filter label {
    position: absolute;
    top: -8px;
    left: 10px;
    background-color: var(--color-background-layout-main, #ffffff) !important;
    padding: 0 4px;
    font-size: 12px;
    font-weight: 700;
    color: var(--color-text-body-default, #000000) !important;
    z-index: 10;
    line-height: 1;
    pointer-events: none;
    border-radius: 2px;
  }

  /* OVERRIDE DE MODO OSCURO */
  html.dark .floating-filter label,
  body.dark .floating-filter label,
  html[data-awsui-color-mode="dark"] .floating-filter label,
  .awsui-dark-mode .floating-filter label,
  .awsui-polaris-dark-mode .floating-filter label,
  body.dark-mode .floating-filter label,
  [data-theme="dark"] .floating-filter label {
    background-color: var(--color-background-layout-main, #161d26) !important;
    color: var(--color-text-body-default, #ffffff) !important;
  }

  /* BORDES REDONDEADOS DEL ANILLO DE SELECCIÓN */
  tr[aria-selected="true"] > td:first-child,
  tr[aria-selected="true"] > td:first-child::before {
    border-top-left-radius: 8px !important;
    border-bottom-left-radius: 8px !important;
  }
  
  tr[aria-selected="true"] > td:last-child,
  tr[aria-selected="true"] > td:last-child::before {
    border-top-right-radius: 8px !important;
    border-bottom-right-radius: 8px !important;
  }
`;

// 🚩 COMPONENTE EMPTY STATE REUTILIZABLE
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

const CHECKLISTS_POR_AREA = {
  ref: [
    { id: 'termo_ref', label: 'CHECAR TERMODINAMICAS' },
    { id: 'etiq_ref', label: 'CHECAR VAPOR DE ETIQUETADORA' },
    { id: 'tolva_ref', label: 'CHECAR VAPOR EN TOLVA' },
    { id: 'ester_ref', label: 'CHECAR VAPOR EN CUARTO DE ESTERILIZACION' },
    { id: 'lin_mond_ref', label: 'CHECAR LINEAS DE VAPOR EN MONDINIS' },
    {
      id: 'val_alim_ref',
      label:
        'CHECAR VALVULAS DE ALIMENTACION DE VAPOR QUE ESTEN TOTALMENTE ABIERTAS',
    },
    {
      id: 'man_mond_ref',
      label: 'CHECAR CONDICIONES DE LOS MANOMETROS EN MONDINIS',
    },
    {
      id: 'man_cerr_ref',
      label: 'CHECAR CONDICIONES DE LOS MANOMETROS EN CERRADORA',
    },
    {
      id: 'man_cald_ref',
      label: 'CHECAR CONDICIONES DE LOS MANOMETROS EN CALDERAS',
    },
    {
      id: 'man_comp_ref',
      label: 'CHECAR CONDICIONES DE LOS MANOMETROS EN COMPRESORES DE AIRE',
    },
    {
      id: 'reg_mond_ref',
      label: 'CHECAR CONDICIONES DE REGULADORES EN MONDINIS',
    },
    {
      id: 'val_sel_ref',
      label: 'CHECAR FUNCIONAMIENTO DE VALVULAS SELENOIDE DE TANQUE DE DIA',
    },
    { id: 'alarma_ref', label: 'CHECAR ALARMA DE TANQUE DE DIA' },
    { id: 'mirilla_ref', label: 'CHECAR MIRILLA DE TANQUE DE COMBUSTOLEO' },
  ],
  conge: [
    { id: 'termo_conge', label: 'CHECAR TERMODINAMICAS' },
    { id: 'etiq_conge', label: 'CHECAR VAPOR DE ETIQUETADORA' },
    { id: 'tolva_conge', label: 'CHECAR VAPOR EN TOLVA' },
    { id: 'ester_conge', label: 'CHECAR VAPOR EN CUARTO DE ESTERILIZACION' },
    { id: 'lin_mond_conge', label: 'CHECAR LINEAS DE VAPOR EN MONDINIS' },
    {
      id: 'val_alim_conge',
      label:
        'CHECAR VALVULAS DE ALIMENTACION DE VAPOR QUE ESTEN TOTALMENTE ABIERTAS',
    },
    {
      id: 'man_mond_conge',
      label: 'CHECAR CONDICIONES DE LOS MANOMETROS EN MONDINIS',
    },
    {
      id: 'man_comp_conge',
      label: 'CHECAR CONDICIONES DE LOS MANOMETROS EN COMPRESORES DE AIRE',
    },
    {
      id: 'reg_mond_conge',
      label: 'CHECAR CONDICIONES DE REGULADORES EN MONDINIS',
    },
    {
      id: 'val_func_conge',
      label: 'CHECAR FUNCIONAMIENTO DE LAS VALVULAS EN MONDINIS',
    },
  ],
};

const TASK_DICTIONARY: Record<string, string> = {};
[...CHECKLISTS_POR_AREA.ref, ...CHECKLISTS_POR_AREA.conge].forEach(
  (t) => (TASK_DICTIONARY[t.id] = t.label),
);

export interface ChecklistExecution {
  id: string;
  area: string;
  fecha: string;
  hora: string;
  turno: string;
  operador: string;
  estadoGeneral: 'success' | 'warning' | 'error';
  observaciones: string;
  detalles: {
    taskId: string;
    valueString: string;
    tarea: string;
    estado: 'Trabajando normal' | 'Necesita Programar' | 'Reparacion Inmediata';
    comentarioIndiv: string;
  }[];
  rawTimestamp: number;
  metadata: {
    codigo_documento: string;
    version: string;
    fecha_revision: string;
    fecha_reemplazo: string;
    propietario: string;
    aprobador: string;
    estandar_calidad: string;
    razon_cambio: string;
  };
}

const COLUMN_DEFINITIONS = [
  {
    id: 'id',
    header: 'Folio (ID)',
    cell: (item: ChecklistExecution) => (
      <Link href="#">{item.id.split('-')[0]}</Link>
    ),
    sortingField: 'id',
    minWidth: 120,
  },
  {
    id: 'area',
    header: 'Área / Equipo',
    cell: (item: ChecklistExecution) => item.area,
    sortingField: 'area',
    minWidth: 150,
  },
  {
    id: 'fecha',
    header: 'Fecha Registrada',
    cell: (item: ChecklistExecution) => `${item.fecha} - ${item.hora}`,
    sortingField: 'rawTimestamp',
    minWidth: 180,
  },
  {
    id: 'turno',
    header: 'Turno',
    cell: (item: ChecklistExecution) => (
      <Badge color="blue">{item.turno}</Badge>
    ),
    sortingField: 'turno',
    minWidth: 100,
  },
  {
    id: 'operador',
    header: 'Operador',
    cell: (item: ChecklistExecution) => item.operador,
    sortingField: 'operador',
    minWidth: 180,
  },
  {
    id: 'estadoGeneral',
    header: 'Estado Global',
    sortingField: 'estadoGeneral',
    minWidth: 150,
    cell: (item: ChecklistExecution) => {
      const statusMap = {
        success: { type: 'success', text: 'Operativo' },
        warning: { type: 'warning', text: 'Requiere Prog.' },
        error: { type: 'error', text: 'Crítico' },
      };
      const status = statusMap[item.estadoGeneral];
      return (
        <StatusIndicator type={status.type as any}>
          {status.text}
        </StatusIndicator>
      );
    },
  },
];

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

export default function PreOperativeChecklists() {
  const appContext = React.useContext(AppContent) as any;
  const alerts = appContext?.alerts || [];
  const addAlert = appContext?.addAlert;
  const user = appContext?.user;

  const [data, setData] = React.useState<ChecklistExecution[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);

  const [isSavingConfig, setIsSavingConfig] = React.useState(false);
  const [isConfigModalVisible, setIsConfigModalVisible] = React.useState(false);
  const [configArea, setConfigArea] = React.useState<any>({
    label: 'Calderas Ref',
    value: 'ref',
  });
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
  const [editAreaSelect, setEditAreaSelect] = React.useState<any>({
    label: '',
    value: '',
  });
  const [editTurnoSelect, setEditTurnoSelect] = React.useState<any>({
    label: '',
    value: '',
  });
  const [editId, setEditId] = React.useState('');
  const [editOperador, setEditOperador] = React.useState('');
  const [editChecks, setEditChecks] = React.useState<
    Record<string, { status: string; comments: string }>
  >({});

  const [isDeleteModalVisible, setIsDeleteModalVisible] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] =
    React.useState('');

  const [navigationOpen, setNavigationOpen] = React.useState(true);
  const [selectedItems, setSelectedItems] = React.useState<
    ChecklistExecution[]
  >([]);
  const [splitPanelOpen, setSplitPanelOpen] = React.useState(false);
  const [splitPanelPreferences, setSplitPanelPreferences] = React.useState<any>(
    { position: 'side', size: 380 },
  );

  React.useEffect(() => {
    if (selectedItems.length === 1) {
      setSplitPanelOpen(true);
    } else {
      setSplitPanelOpen(false);
    }
  }, [selectedItems]);

  const [areaFilter, setAreaFilter] = React.useState<any>({
    label: 'Todas',
    value: undefined,
  });
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
    visibleContent: [
      'id',
      'area',
      'fecha',
      'turno',
      'operador',
      'estadoGeneral',
    ],
  });

  const getFilterOptions = (
    field: keyof ChecklistExecution,
    placeholder: string,
  ) => {
    const uniqueValues = Array.from(
      new Set(data.map((item) => item[field])),
    ).sort();
    return [
      { label: placeholder, value: undefined },
      ...uniqueValues.map((val) => ({
        label: String(val),
        value: String(val),
      })),
    ] as any[];
  };

  const areaOptions = React.useMemo(
    () => getFilterOptions('area', 'Todas'),
    [data],
  );
  const turnoOptions = React.useMemo(
    () => getFilterOptions('turno', 'Todos'),
    [data],
  );
  const estadoOptions: any[] = [
    { label: 'Todos', value: undefined },
    { label: 'Operativo', value: 'success' },
    { label: 'Requiere Programar', value: 'warning' },
    { label: 'Crítico (Falla)', value: 'error' },
  ];

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${MAINTENANCE_API_URL}/api/inspections`, {
        withCredentials: true,
      });
      if (res.data.success) {
        const mappedData: ChecklistExecution[] = res.data.data.map(
          (item: any) => {
            const dateObj = new Date(item.timestamp || item.createdAt);
            let estadoGeneral: 'success' | 'warning' | 'error' = 'success';
            let observacionesGlobales = '';

            const detalles = (item.tasks || []).map((t: any) => {
              let estado:
                | 'Trabajando normal'
                | 'Necesita Programar'
                | 'Reparacion Inmediata' = 'Trabajando normal';
              if (t.valueString === 'ANORMAL') {
                estado = 'Necesita Programar';
                estadoGeneral = estadoGeneral === 'error' ? 'error' : 'warning';
              }
              if (t.valueString === 'FALLA') {
                estado = 'Reparacion Inmediata';
                estadoGeneral = 'error';
              }
              if (t.comments)
                observacionesGlobales += `[${TASK_DICTIONARY[t.taskId] || t.taskId}]: ${t.comments}. \n`;

              return {
                taskId: t.taskId,
                valueString: t.valueString || 'NORMAL',
                tarea: TASK_DICTIONARY[t.taskId] || t.taskId,
                estado,
                comentarioIndiv: t.comments || '',
              };
            });

            return {
              id: item.id,
              area: item.area,
              fecha: dateObj.toLocaleDateString('es-MX', {
                timeZone: 'America/Monterrey',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              }),
              hora: dateObj.toLocaleTimeString('es-MX', {
                timeZone: 'America/Monterrey',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }),
              turno: `Turno ${item.shift}`,
              operador: item.operator
                ? `${item.operator.name} ${item.operator.surname}`.trim()
                : 'Usuario Desconocido',
              estadoGeneral,
              observaciones: observacionesGlobales.trim() || '',
              detalles,
              rawTimestamp: dateObj.getTime(),
              metadata: {
                codigo_documento: item.codigo_documento || '2.2-16-3-51',
                version: item.version || '3.0',
                fecha_revision: item.fecha_revision || 'Mayo/15/24',
                fecha_reemplazo: item.fecha_reemplazo || 'Mayo/11/22',
                propietario: item.propietario || 'Fernando Gaxiola',
                aprobador: item.aprobador || 'Gabriel González',
                estandar_calidad:
                  item.estandar_calidad || 'Mantenimiento Preventivo',
                razon_cambio:
                  item.razon_cambio ||
                  'Cambio de aprobador, propietario y logo',
              },
            };
          },
        );
        setData(mappedData);
      }
    } catch (error: any) {
      if (addAlert) addAlert('error', 'Error al obtener datos de bitácoras.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchInspections();
  }, []);

  const handleOpenConfigModal = async () => {
    try {
      const res = await axios.get(
        `${MAINTENANCE_API_URL}/api/document-configs`,
        { withCredentials: true },
      );
      if (res.data.success) {
        const current = res.data.data.find(
          (c: any) => c.area_key === configArea.value,
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

  React.useEffect(() => {
    if (isConfigModalVisible) {
      handleOpenConfigModal();
    }
  }, [configArea.value]);

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      const res = await axios.put(
        `${MAINTENANCE_API_URL}/api/document-configs/${configArea.value}`,
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
        fetchInspections();
      }
    } catch (error: any) {
      if (addAlert)
        addAlert(
          'error',
          error.response?.data?.message || 'Privilegios insuficientes.',
        );
    } finally {
      setIsSavingConfig(false);
    }
  };

  const openEditModal = () => {
    const item = selectedItems[0];
    const rawTurnoValue = item.turno.replace('Turno ', '');
    const areaKey = item.area === 'Calderas de Refrigeración' ? 'ref' : 'conge';

    setEditId(item.id);
    setEditOperador(item.operador);
    setEditAreaSelect({ label: item.area, value: areaKey });
    setEditTurnoSelect({ label: item.turno, value: rawTurnoValue });

    const savedChecksMap: Record<string, { status: string; comments: string }> =
      {};
    item.detalles.forEach((d) => {
      savedChecksMap[d.taskId] = {
        status: d.valueString || 'NORMAL',
        comments: d.comentarioIndiv || '',
      };
    });

    const initialChecks: Record<string, { status: string; comments: string }> =
      {};
    const tareasActuales = (CHECKLISTS_POR_AREA as any)[areaKey] || [];

    tareasActuales.forEach((task: any) => {
      const saved = savedChecksMap[task.id];
      initialChecks[task.id] = {
        status: saved ? saved.status : 'NORMAL',
        comments: saved ? saved.comments : '',
      };
    });

    setEditChecks(initialChecks);
    setIsEditModalVisible(true);
  };

  const handleEditAreaChange = (newArea: any) => {
    setEditAreaSelect(newArea);
    const tareasNuevas = (CHECKLISTS_POR_AREA as any)[newArea.value] || [];
    const newChecks = tareasNuevas.reduce(
      (acc: any, task: any) => ({
        ...acc,
        [task.id]: { status: 'NORMAL', comments: '' },
      }),
      {},
    );
    setEditChecks(newChecks);
  };

  const handleEditSubmit = async () => {
    setIsEditing(true);
    try {
      const payload = {
        area: editAreaSelect.label,
        turno: editTurnoSelect.value,
        operador: editOperador,
        checks: editChecks,
      };
      await axios.put(
        `${MAINTENANCE_API_URL}/api/inspections/${editId}`,
        payload,
        { withCredentials: true },
      );
      if (addAlert)
        addAlert(
          'success',
          `Inspección #${editId.split('-')[0]} rectificada exitosamente.`,
        );
      setIsEditModalVisible(false);
      setSelectedItems([]);
      fetchInspections();
    } catch (error: any) {
      if (addAlert)
        addAlert(
          'error',
          'Error al actualizar el registro en la BD de infraestructura.',
        );
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteSubmit = async () => {
    setIsDeleting(true);
    try {
      for (const item of selectedItems) {
        await axios.delete(
          `${MAINTENANCE_API_URL}/api/inspections/${item.id}`,
          { withCredentials: true },
        );
      }
      if (addAlert)
        addAlert(
          'success',
          `${selectedItems.length} registro(s) borrado(s) del registro maestro.`,
        );
      setIsDeleteModalVisible(false);
      setDeleteConfirmationText('');
      setSelectedItems([]);
      fetchInspections();
    } catch (error: any) {
      if (addAlert)
        addAlert('error', 'Rechazado por el servidor: Error de privilegios.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportPDF = async () => {
    if (selectedItems.length === 0) return;
    setIsExporting(true);
    try {
      const doc = new jsPDF('p', 'pt', 'letter');
      const margin = 30;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const totalPagesExp = '{tot}';
      const logoData = await getLogoData(logoDelMonte);

      for (let i = 0; i < selectedItems.length; i++) {
        const item = selectedItems[i];

        if (i > 0) {
          doc.addPage();
        }

        const tableBody = item.detalles.map((d) => {
          let normal = '',
            prog = '',
            inmed = '';
          if (d.estado === 'Trabajando normal') normal = 'X';
          else if (d.estado === 'Necesita Programar') prog = 'X';
          else if (d.estado === 'Reparacion Inmediata') inmed = 'X';
          return [d.tarea, normal, prog, inmed, d.comentarioIndiv];
        });

        const safeTextCenter = (text: string, x: number, y: number) => {
          const lines = text.split('\n');
          let currentY = y;
          lines.forEach((line) => {
            doc.text(line, x - doc.getTextWidth(line) / 2, currentY);
            currentY += 10;
          });
        };

        const drawISOHeadersAndFooters = (data: any) => {
          const renglon1H = 75;
          const renglon2H = 20;
          const totalHeaderH = renglon1H + renglon2H;
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(1);
          doc.rect(margin, margin, pageWidth - margin * 2, totalHeaderH);
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
          doc.line(
            margin,
            margin + renglon1H,
            pageWidth - margin,
            margin + renglon1H,
          );

          if (logoData) {
            const maxWidth = 145;
            const maxHeight = 65;
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
              margin + (renglon1H - finalH) / 2,
              finalW,
              finalH,
            );
          } else {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            safeTextCenter(
              'Del Monte',
              margin + colLogoW / 2,
              margin + renglon1H / 2 + 4,
            );
          }

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          safeTextCenter(
            'Título: Check List Pre Operativo',
            margin +
              colLogoW +
              (pageWidth - margin * 2 - colLogoW - colNumW) / 2,
            margin + renglon1H / 2 + 4,
          );
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          safeTextCenter(
            `Número:\n${item.metadata.codigo_documento}`,
            pageWidth - margin - colNumW / 2,
            margin + renglon1H / 2 - 4,
          );
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          safeTextCenter(
            'Industrias Citrícolas de Montemorelos - Check List de Pre Operativo',
            pageWidth / 2,
            margin + renglon1H + renglon2H / 2 + 4,
          );

          if (data.pageNumber === 1) {
            const infoY = margin + totalHeaderH + 25;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(`Área / Equipo:`, margin, infoY);
            doc.setFont('helvetica', 'normal');
            doc.text(item.area, margin + 70, infoY);
            doc.text(`Operador:`, pageWidth / 2 - 30, infoY);
            doc.setFont('helvetica', 'normal');
            doc.text(item.operador, pageWidth / 2 + 20, infoY);
            doc.setFont('helvetica', 'bold');
            doc.text(`Turno:`, margin, infoY + 15);
            doc.setFont('helvetica', 'normal');
            doc.text(item.turno, margin + 40, infoY + 15);
            doc.text(`Fecha y Hora:`, pageWidth / 2 - 30, infoY + 15);
            doc.setFont('helvetica', 'normal');
            doc.text(
              `${item.fecha} a las ${item.hora}`,
              pageWidth / 2 + 35,
              infoY + 15,
            );
          }

          const footerY = pageHeight - 110;
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(1);
          doc.line(
            pageWidth - margin - 180,
            footerY,
            pageWidth - margin,
            footerY,
          );
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text(
            'Firma / Nombre de Mantenimiento',
            pageWidth - margin - 170,
            footerY + 12,
          );
          doc.setFont('helvetica', 'normal');
          doc.text(item.operador, pageWidth - margin - 150, footerY - 5);

          const footerHeight = 45;
          const bY = pageHeight - margin - footerHeight;
          const totalW = pageWidth - margin * 2;
          doc.rect(margin, bY, totalW, footerHeight);
          doc.line(margin, bY + 28, margin + totalW, bY + 28);
          const colWidths = [70, 70, 50, 150, 140, totalW - 480];
          let currentX = margin;
          for (let j = 0; j < colWidths.length - 1; j++) {
            currentX += colWidths[j];
            doc.line(currentX, bY, currentX, bY + 28);
          }
          doc.setFontSize(6.5);
          let textCenterX = margin;
          const getCenter = (w: number) => {
            const c = textCenterX + w / 2;
            textCenterX += w;
            return c;
          };

          safeTextCenter(
            `Fecha de Revisión:\n${item.metadata.fecha_revision}`,
            getCenter(colWidths[0]),
            bY + 12,
          );
          safeTextCenter(
            `Reemplaza a:\n${item.metadata.fecha_reemplazo}`,
            getCenter(colWidths[1]),
            bY + 12,
          );
          safeTextCenter(
            `Versión:\n${item.metadata.version}`,
            getCenter(colWidths[2]),
            bY + 14,
          );
          safeTextCenter(
            `Propietario: ${item.metadata.propietario}\nAprobador: ${item.metadata.aprobador}`,
            getCenter(colWidths[3]),
            bY + 12,
          );
          safeTextCenter(
            `Estándar de Calidad:\n${item.metadata.estandar_calidad}`,
            getCenter(colWidths[4]),
            bY + 12,
          );

          const globalPageNum = (doc as any).internal.getNumberOfPages();
          safeTextCenter(
            `Página ${globalPageNum} de ${totalPagesExp}`,
            getCenter(colWidths[5]),
            bY + 14,
          );

          doc.setFont('helvetica', 'bold');
          doc.text('Razón del cambio:', margin + 5, bY + 39);
          doc.setFont('helvetica', 'normal');
          safeTextCenter(
            item.metadata.razon_cambio ||
              'Cambio de aprobador, propietario y logo',
            pageWidth / 2,
            bY + 39,
          );
        };

        autoTable(doc, {
          startY: 180,
          head: [
            [
              'Puntos de Revisión',
              'Trabajando\nNormal',
              'Necesita\nProgramar',
              'Reparación\nInmediata',
              'Observaciones Y/O Comentarios',
            ],
          ],
          body: tableBody,
          theme: 'grid',
          margin: { top: 140, bottom: 120 },
          headStyles: {
            fillColor: [230, 230, 230],
            textColor: 0,
            halign: 'center',
            valign: 'middle',
            fontSize: 8,
            fontStyle: 'bold',
            lineColor: [0, 0, 0],
            lineWidth: 1,
          },
          bodyStyles: { fontSize: 8, textColor: 0 },
          columnStyles: {
            0: { cellWidth: 200, fontStyle: 'bold' },
            1: { cellWidth: 50, halign: 'center', valign: 'middle' },
            2: { cellWidth: 50, halign: 'center', valign: 'middle' },
            3: { cellWidth: 55, halign: 'center', valign: 'middle' },
            4: { cellWidth: 'auto' },
          },
          styles: { cellPadding: 5, lineColor: [0, 0, 0], lineWidth: 0.5 },
          didParseCell: function (data) {
            if (data.section === 'body') {
              const rowIndex = data.row.index;
              const estado = item.detalles[rowIndex].estado;
              if (estado === 'Reparacion Inmediata')
                data.cell.styles.fillColor = [255, 235, 238];
              if (estado === 'Necesita Programar')
                data.cell.styles.fillColor = [255, 248, 225];
            }
          },
          didDrawPage: drawISOHeadersAndFooters,
        });
      }

      if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
      }

      const fileName =
        selectedItems.length === 1
          ? `Bitacora_PreOperativo_${selectedItems[0].id.split('-')[0]}.pdf`
          : `Bitacoras_PreOperativas_Lote_${selectedItems.length}_registros.pdf`;

      doc.save(fileName);
      if (addAlert)
        addAlert(
          'success',
          `Se han exportado ${selectedItems.length} registro(s) exitosamente.`,
        );
    } catch (error) {
      if (addAlert)
        addAlert('error', 'Hubo un error al generar el PDF múltiple.');
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
        sortingColumn: COLUMN_DEFINITIONS[2],
        isDescending: true,
      },
    },
    selection: {},
    filtering: {
      // 🚩 COMPONENTES EMPTY STATE IMPLEMENTADOS AQUÍ
      empty: (
        <EmptyState
          title="No hay registros de bitácoras"
          subtitle="No existen auditorías pre-operativas en la base de datos."
          action={
            <Button variant="primary" href="/checklists/new">
              Crear Inspección
            </Button>
          }
        />
      ),
      noMatch: (
        <EmptyState
          title="No hay coincidencias"
          subtitle="No se encontraron registros con los filtros actuales."
          action={
            <Button
              onClick={() => {
                actions.setFiltering('');
                setStartDate('');
                setEndDate('');
                setAreaFilter({ label: 'Todas', value: undefined });
                setTurnoFilter({ label: 'Todos', value: undefined });
                setEstadoFilter({ label: 'Todos', value: undefined });
              }}
            >
              Borrar filtros
            </Button>
          }
        />
      ),
      filteringFunction: (item, text) => {
        const matchText =
          item.id.toLowerCase().includes(text.toLowerCase()) ||
          item.operador.toLowerCase().includes(text.toLowerCase());
        const matchArea = areaFilter.value
          ? item.area === areaFilter.value
          : true;
        const matchTurno = turnoFilter.value
          ? item.turno === turnoFilter.value
          : true;
        const matchEstado = estadoFilter.value
          ? item.estadoGeneral === estadoFilter.value
          : true;
        let matchFecha = true;
        if (startDate || endDate) {
          const [d, m, y] = item.fecha.split('/');
          const itemDate = new Date(`${y}-${m}-${d}T12:00:00`).getTime();
          if (
            startDate &&
            itemDate < new Date(`${startDate}T00:00:00`).getTime()
          )
            matchFecha = false;
          if (endDate && itemDate > new Date(`${endDate}T23:59:59`).getTime())
            matchFecha = false;
        }
        return (
          matchText && matchArea && matchTurno && matchEstado && matchFecha
        );
      },
    },
  });

  const tareasDeLaVistaEdit =
    (CHECKLISTS_POR_AREA as any)[editAreaSelect.value] || [];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--color-background-layout-main, #f2f3f3)',
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
            { text: 'Reporte Consolidado', href: '#' },
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
        splitPanelPreferences={splitPanelPreferences}
        onSplitPanelPreferencesChange={({ detail }) =>
          setSplitPanelPreferences(detail as any)
        }
        splitPanel={
          <SplitPanel
            header={
              (<Header variant="h2">Radiografía de Inspección</Header>) as any
            }
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
                          alignItems: 'flex-start',
                        }}
                      >
                        <div>
                          <p className="summary-subtitle">Folio: {item.id}</p>
                          <h3 className="summary-title">{item.area}</h3>
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
                        {item.fecha} a las {item.hora} hrs | {item.turno}
                      </div>
                    </div>
                    <ColumnLayout columns={1} variant="text-grid">
                      <div style={{ marginBottom: '16px' }}>
                        <Box
                          variant={'awsui-key-label' as any}
                          color="text-label"
                          fontSize="body-s"
                        >
                          Auditor / Operador
                        </Box>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                          {item.operador}
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <Box
                          variant={'awsui-key-label' as any}
                          color="text-label"
                          fontSize="body-s"
                        >
                          Observaciones / Anomalías Detectadas
                        </Box>
                        <div
                          style={{
                            fontSize: '13px',
                            backgroundColor: 'transparent',
                            padding: '12px',
                            borderRadius: '4px',
                            border:
                              '1px solid var(--color-border-divider-default, #eaeded)',
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {item.observaciones ||
                            'Sin observaciones registradas.'}
                        </div>
                      </div>
                      <div>
                        <Box
                          variant={'awsui-key-label' as any}
                          color="text-label"
                          fontSize="body-s"
                          margin={{ bottom: 'xs' }}
                        >
                          Control de Puntos ({item.detalles.length})
                        </Box>
                        <div
                          style={{
                            borderTop:
                              '1px solid var(--color-border-divider-default, #eaeded)',
                          }}
                        >
                          {item.detalles.map((detalle, idx) => (
                            <div key={idx} className="check-item-row">
                              <span
                                style={{
                                  fontSize: '12px',
                                  width: '65%',
                                  lineHeight: '1.2',
                                  fontWeight:
                                    detalle.estado !== 'Trabajando normal'
                                      ? 'bold'
                                      : 'normal',
                                }}
                              >
                                {detalle.tarea}
                              </span>
                              <StatusIndicator
                                type={
                                  detalle.estado === 'Trabajando normal'
                                    ? 'success'
                                    : detalle.estado === 'Necesita Programar'
                                      ? 'warning'
                                      : 'error'
                                }
                              >
                                {detalle.estado}
                              </StatusIndicator>
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
                Se han seleccionado múltiples registros. Desmarque para ver el
                detalle de un solo registro.
              </Box>
            ) : (
              <Box
                textAlign="center"
                color="text-body-secondary"
                margin={{ top: 'xl' }}
              >
                Selecciona un registro en la tabla para ver su detalle.
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
                setSelectedItems(detail.selectedItems as ChecklistExecution[])
              }
              selectionType="multi"
              variant="full-page"
              loading={loading}
              loadingText="Extrayendo registros de la base de datos..."
              columnDefinitions={COLUMN_DEFINITIONS}
              visibleColumns={preferences.visibleContent}
              empty={
                <div style={{ padding: '40px 0' }}>{collectionProps.empty}</div>
              }
              header={
                <Header
                  variant={'awsui-h1-sticky' as any}
                  counter={!loading ? `(${items.length})` : ''}
                  description="Historial completo de auditorías pre-operativas de la planta."
                  actions={
                    <SpaceBetween direction="horizontal" size="xs">
                      <Button
                        iconName="refresh"
                        onClick={fetchInspections}
                        ariaLabel="Refrescar BD"
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
                        href="/checklists/new"
                      >
                        Crear Inspección
                      </Button>
                    </SpaceBetween>
                  }
                >
                  Registros Pre-Operativos
                </Header>
              }
              preferences={
                <CollectionPreferences
                  title="Preferencias de Tabla"
                  confirmLabel="Confirmar"
                  cancelLabel="Cancelar"
                  preferences={preferences}
                  onConfirm={({ detail }) => setPreferences(detail as any)}
                  pageSizePreference={{
                    title: 'Registros por página',
                    options: [20, 50, 100].map((n) => ({
                      value: n,
                      label: `${n} registros`,
                    })),
                  }}
                  contentDisplayPreference={{
                    title: 'Columnas visibles',
                    options: [
                      {
                        id: 'main-columns',
                        label: 'Información',
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
                      filteringPlaceholder="Buscar refacciones..."
                      countText={`${filteredItemsCount} resultados`}
                    />
                  </div>

                  <div className="floating-filter">
                    <label>Área / Equipo</label>
                    <Select
                      selectedOption={areaFilter}
                      onChange={({ detail }) =>
                        setAreaFilter(detail.selectedOption as any)
                      }
                      options={areaOptions}
                      placeholder="Todas"
                    />
                  </div>

                  <div className="floating-filter">
                    <label>Turno</label>
                    <Select
                      selectedOption={turnoFilter}
                      onChange={({ detail }) =>
                        setTurnoFilter(detail.selectedOption as any)
                      }
                      options={turnoOptions}
                      placeholder="Todos"
                    />
                  </div>

                  <div className="floating-filter">
                    <label>Estado</label>
                    <Select
                      selectedOption={estadoFilter}
                      onChange={({ detail }) =>
                        setEstadoFilter(detail.selectedOption as any)
                      }
                      options={estadoOptions}
                      placeholder="Todos"
                    />
                  </div>

                  <div className="floating-filter">
                    <label>Desde (AAAA/MM/DD)</label>
                    <DatePicker
                      onChange={({ detail }) => setStartDate(detail.value)}
                      value={startDate}
                      placeholder="AAAA/MM/DD"
                    />
                  </div>

                  <div className="floating-filter">
                    <label>Hasta (AAAA/MM/DD)</label>
                    <DatePicker
                      onChange={({ detail }) => setEndDate(detail.value)}
                      value={endDate}
                      placeholder="AAAA/MM/DD"
                    />
                  </div>

                  {(startDate ||
                    endDate ||
                    areaFilter.value ||
                    turnoFilter.value ||
                    estadoFilter.value) && (
                    <Button
                      variant="inline-link"
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                        setAreaFilter({ label: 'Todas', value: undefined });
                        setTurnoFilter({ label: 'Todos', value: undefined });
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
          <FormField label="Seleccionar Documento Normativo a Modificar">
            <Select
              selectedOption={configArea}
              onChange={({ detail }) =>
                setConfigArea(detail.selectedOption as any)
              }
              options={[
                { label: 'Calderas Ref', value: 'ref' },
                { label: 'Calderas Conge', value: 'conge' },
              ]}
              expandToViewport={true}
            />
          </FormField>
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

      {/* MODAL EDICIÓN RESPONSIVO */}
      <Modal
        onDismiss={() => setIsEditModalVisible(false)}
        visible={isEditModalVisible}
        closeAriaLabel="Cerrar modal de edición"
        header="Editar Registro de Inspección"
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
            <Icon name="status-warning" /> <b>Atención:</b> La alteración de
            registros auditables cerrados quedará documentada en el log del
            sistema.
          </Box>

          <Grid
            gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}
          >
            <FormField label="Folio del Documento">
              <Input value={editId} disabled={true} />
            </FormField>
            <FormField label="Área / Equipo Auditado">
              <Select
                selectedOption={editAreaSelect}
                onChange={({ detail }) =>
                  handleEditAreaChange(detail.selectedOption)
                }
                options={[
                  { label: 'Calderas de Refrigeración', value: 'ref' },
                  { label: 'Calderas de Congelación', value: 'conge' },
                ]}
                expandToViewport={true}
              />
            </FormField>
            <FormField label="Turno de Trabajo">
              <Select
                selectedOption={editTurnoSelect}
                onChange={({ detail }) =>
                  setEditTurnoSelect(detail.selectedOption as any)
                }
                options={[
                  { label: 'Turno A', value: 'A' },
                  { label: 'Turno B', value: 'B' },
                  { label: 'Turno C', value: 'C' },
                ]}
                expandToViewport={true}
              />
            </FormField>
          </Grid>

          <FormField label="Nombre Completo del Operador">
            <Input
              value={editOperador}
              onChange={({ detail }) => setEditOperador(detail.value)}
            />
          </FormField>

          <hr
            style={{
              borderTop:
                '1px solid var(--color-border-divider-default, #eaeded)',
              borderBottom: 'none',
              margin: '10px 0',
            }}
          />
          <Header variant="h3">Corrección de Puntos de Revisión</Header>

          <div
            style={{
              maxHeight: '40vh',
              overflowY: 'auto',
              paddingRight: '12px',
            }}
          >
            <SpaceBetween size="xl">
              {tareasDeLaVistaEdit.map((task: any, index: number) => {
                const currentCheck = editChecks[task.id] || {
                  status: 'NORMAL',
                  comments: '',
                };
                const requiresComment =
                  currentCheck.status === 'ANORMAL' ||
                  currentCheck.status === 'FALLA';

                return (
                  <div key={task.id}>
                    {index > 0 && (
                      <div
                        style={{
                          borderTop:
                            '1px solid var(--color-border-divider-default, #eaeded)',
                          margin: '20px 0',
                        }}
                      />
                    )}
                    <Grid
                      gridDefinition={[
                        { colspan: { default: 12, s: 7 } },
                        { colspan: { default: 12, s: 5 } },
                      ]}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          height: '100%',
                        }}
                      >
                        <Box
                          variant={'span' as any}
                          fontSize="body-m"
                          fontWeight="bold"
                        >
                          {task.label}
                        </Box>
                      </div>
                      <div
                        style={{ display: 'flex', justifyContent: 'flex-end' }}
                      >
                        <SegmentedControl
                          selectedId={currentCheck.status}
                          onChange={({ detail }) => {
                            setEditChecks((prev) => ({
                              ...prev,
                              [task.id]: {
                                status: detail.selectedId,
                                comments:
                                  detail.selectedId === 'NORMAL'
                                    ? ''
                                    : prev[task.id]?.comments || '',
                              },
                            }));
                          }}
                          options={[
                            { text: '✓ Normal', id: 'NORMAL' },
                            { text: '! Anormal', id: 'ANORMAL' },
                            { text: '✕ Falla', id: 'FALLA' },
                          ]}
                        />
                      </div>
                    </Grid>

                    {requiresComment && (
                      <div
                        style={{
                          marginTop: '16px',
                          padding: '16px',
                          backgroundColor: 'transparent',
                          borderRadius: '8px',
                          border:
                            '1px solid var(--color-border-divider-default, #eaeded)',
                          borderLeft: `4px solid ${currentCheck.status === 'FALLA' ? '#d13212' : '#ff9900'}`,
                        }}
                      >
                        <FormField
                          label="Observaciones Técnicas"
                          description={`Justifique la modificación al estado: ${currentCheck.status}`}
                        >
                          <Textarea
                            value={currentCheck.comments}
                            onChange={({ detail }) =>
                              setEditChecks((prev) => ({
                                ...prev,
                                [task.id]: {
                                  ...prev[task.id],
                                  comments: detail.value,
                                },
                              }))
                            }
                            rows={2}
                          />
                        </FormField>
                      </div>
                    )}
                  </div>
                );
              })}
            </SpaceBetween>
          </div>
        </SpaceBetween>
      </Modal>

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
