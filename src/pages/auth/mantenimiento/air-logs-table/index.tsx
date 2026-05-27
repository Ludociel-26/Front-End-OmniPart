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
      <Badge color="blue">{item.readings?.length || 0} / 12 hrs</Badge>
    ),
    minWidth: 150,
  },
  {
    id: 'estado',
    header: 'Estado Documento',
    minWidth: 150,
    cell: (item: any) => {
      const isComplete = item.readings?.length >= 12;
      return (
        <StatusIndicator type={isComplete ? 'success' : 'warning'}>
          {isComplete ? 'Completado' : 'En Progreso'}
        </StatusIndicator>
      );
    },
  },
];

// Columnas para la tabla anidada en el SplitPanel
const DETAILS_COLUMNS = [
  { id: 'hora', header: 'Hora', cell: (item: any) => item.hora },
  {
    id: 't_sull',
    header: 'T. Sull',
    cell: (item: any) => `${item.temp_sull || '-'} °C`,
  },
  {
    id: 'p_sull',
    header: 'P. Sull',
    cell: (item: any) => `${item.pres_sull || '-'} PSI`,
  },
  {
    id: 't_gd',
    header: 'T. GD',
    cell: (item: any) => `${item.temp_gd || '-'} °C`,
  },
  {
    id: 'p_gd',
    header: 'P. GD',
    cell: (item: any) => `${item.pres_gd || '-'} PSI`,
  },
  {
    id: 'fugas',
    header: 'Fugas (Aire/Aceite)',
    cell: (item: any) =>
      item.fuga_aire === 'SI' || item.fuga_aceite === 'SI' ? (
        <Badge color="red">Sí</Badge>
      ) : (
        <Badge color="green">No</Badge>
      ),
  },
];

export default function CompressorLogsTable() {
  const appContext = React.useContext(AppContent) as any;
  const alerts = appContext?.alerts || [];
  const addAlert = appContext?.addAlert;
  const user = appContext?.user;

  const [data, setData] = React.useState<any[]>([]);
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
    visibleContent: ['id', 'fecha', 'lecturas', 'estado'],
  });

  React.useEffect(() => {
    setSplitPanelOpen(selectedItems.length === 1);
  }, [selectedItems]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get(`${MAINTENANCE_API_URL}/api/compresores`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      if (addAlert)
        addAlert('error', 'Error al obtener bitácoras de Compresores.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReports();
  }, []);

  // --- SGC CONFIG ---
  const handleOpenConfigModal = async () => {
    try {
      const res = await api.get(`${MAINTENANCE_API_URL}/api/document-configs`);
      if (res.data.success) {
        const current = res.data.data.find(
          (c: any) => c.area_key === 'bitacora_compresor_aire',
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
        `${MAINTENANCE_API_URL}/api/document-configs/bitacora_compresor_aire`,
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
        await api.delete(`${MAINTENANCE_API_URL}/api/compresores/${item.id}`);
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

  // --- 🚩 MOTOR DE PDF: PERFECCIÓN DEL FORMATO Y ALINEACIÓN DE TEXTOS ---
  const handleExportPDF = async () => {
    if (selectedItems.length === 0) return;
    setIsExporting(true);
    try {
      const doc = new jsPDF('l', 'pt', 'letter'); // Landscape: 792 x 612 pts
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const logoData = await getLogoData(logoDelMonte);

      for (let i = 0; i < selectedItems.length; i++) {
        const log = selectedItems[i];
        if (i > 0) doc.addPage();

        // 1. ENCABEZADO SUPERIOR
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
        doc.text('Formato Departamental', margin + col1W / 2, margin + 40, {
          align: 'center',
        });

        doc.setFontSize(8);
        doc.text('Titulo:', margin + col1W + 5, margin + 12);
        doc.setFontSize(14);
        doc.text(
          'Bitácora Compresor de Aire',
          margin + col1W + (pageWidth - margin * 2 - col1W - col3W) / 2,
          margin + 32,
          { align: 'center' },
        );

        doc.setFontSize(8);
        doc.text('Numero:', pageWidth - margin - col3W + 5, margin + 12);
        doc.setFontSize(12);
        doc.text(
          log.codigo_documento || '2.2-16-3-8',
          pageWidth - margin - col3W / 2,
          margin + 32,
          { align: 'center' },
        );

        // 2. SUBTÍTULOS
        let currentY = margin + 60;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text('DEPARTAMENTO DE MANTENIMIENTO', pageWidth / 2, currentY, {
          align: 'center',
        });
        doc.text('BITACORA COMPRESOR DE AIRE', pageWidth / 2, currentY + 12, {
          align: 'center',
        });

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('FECHA: ', margin + 200, currentY + 30);
        doc.setFont('helvetica', 'normal');
        doc.text(log.productionDate || '', margin + 235, currentY + 30);
        doc.line(margin + 230, currentY + 32, margin + 380, currentY + 32);

        // 3. TABLA MONSTRUOSA (25 COLUMNAS EXACTAS)
        currentY += 40;
        const hoursArray = [
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
          '6',
          '8',
          '10',
          '12',
          '14',
          '16',
          '18',
          '20',
          '22',
          '24',
          '2',
          '4',
        ];

        const tableBody = hoursArray.map((hr, idx) => {
          const r =
            (log.readings || []).find((rd: any) => rd.hora === hr) || {};
          return [
            displayHours[idx], // HORA
            r.temp_1 || '',
            r.temp_2 || '',
            r.temp_3 || '',
            r.temp_4 || '',
            r.temp_5 || '',
            r.temp_6 || '',
            r.temp_7 || '',
            r.temp_sull || '',
            r.temp_gd || '',
            r.pres_1 || '',
            r.pres_2 || '',
            r.pres_3 || '',
            r.pres_4 || '',
            r.pres_5 || '',
            r.pres_6 || '',
            r.pres_7 || '',
            r.pres_sull || '',
            r.pres_gd || '',
            r.fuga_aire === 'SI' ? 'X' : '',
            r.fuga_aceite === 'SI' ? 'X' : '',
            r.purga_test === 'ON' ? 'X' : '',
            r.purga_test === 'ON' ? 'X' : '', // Dependiendo si tu DB guarda "ON", mapeamos.
            r.mirilla || '',
            r.ruido === 'SI' ? 'X' : '',
          ];
        });

        autoTable(doc, {
          startY: currentY,
          margin: { left: margin, right: margin },
          head: [
            [
              {
                content: 'HORA',
                rowSpan: 2,
                styles: { valign: 'middle', halign: 'center' },
              },
              {
                content: 'LECTURA DE TEMPERATURA',
                colSpan: 9,
                styles: { halign: 'center' },
              },
              {
                content: 'LECTURA DE PRESION',
                colSpan: 9,
                styles: { halign: 'center' },
              },
              {
                content: 'FUGA DE\nAIRE',
                rowSpan: 2,
                styles: { valign: 'middle', halign: 'center', fontSize: 5 },
              },
              {
                content: 'FUGA DE\nACEITE',
                rowSpan: 2,
                styles: { valign: 'middle', halign: 'center', fontSize: 5 },
              },
              {
                content: 'PURGA DE AIRE',
                colSpan: 2,
                styles: { halign: 'center', fontSize: 5 },
              },
              {
                content: 'MIRILLA NIVEL\nFILTRO PURGA',
                rowSpan: 2,
                styles: { valign: 'middle', halign: 'center', fontSize: 4.5 },
              },
              {
                content: 'RUIDOS\nEXTRAÑOS',
                rowSpan: 2,
                styles: { valign: 'middle', halign: 'center', fontSize: 4.5 },
              },
            ],
            [
              '1',
              '2',
              '3',
              '4',
              '5',
              '6',
              '7',
              'Sull',
              'GD',
              '1',
              '2',
              '3',
              '4',
              '5',
              '6',
              '7',
              'Sull',
              'GD',
              'ON',
              'TEST',
            ],
          ],
          body: tableBody,
          theme: 'grid',
          styles: {
            fontSize: 6,
            cellPadding: 2,
            halign: 'center',
            valign: 'middle',
            lineColor: 0,
            lineWidth: 0.5,
          },
          headStyles: {
            fillColor: [230, 230, 230],
            textColor: 0,
            fontStyle: 'bold',
          },
          columnStyles: { 0: { fontStyle: 'bold' } },
        });

        let finalY = (doc as any).lastAutoTable.finalY + 10;

        // 4. OBSERVACIONES Y CÍRCULOS
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');

        doc.text('LLENO', pageWidth - 260, finalY);
        doc.circle(pageWidth - 220, finalY - 3, 5, 'S');
        doc.text('VACIO', pageWidth - 260, finalY + 15);
        doc.circle(pageWidth - 220, finalY + 12, 5, 'S');

        finalY += 30;
        doc.text('OBSERVACIONES :', margin, finalY);
        for (let j = 0; j < 4; j++) {
          doc.line(
            margin + 80,
            finalY + j * 12,
            pageWidth / 2,
            finalY + j * 12,
          );
        }

        doc.setFont('helvetica', 'normal');
        doc.text(
          doc.splitTextToSize(log.observaciones || '', pageWidth / 2 - 80),
          margin + 80,
          finalY - 5,
        );

        // 5. FIRMAS DE TURNOS
        const fY = finalY + 30;
        doc.line(pageWidth / 2 + 20, fY, pageWidth / 2 + 130, fY);
        doc.text('TURNO A', pageWidth / 2 + 75, fY + 10, { align: 'center' });
        doc.text(
          log.operatorA?.name
            ? `${log.operatorA.name} ${log.operatorA.surname}`
            : '',
          pageWidth / 2 + 75,
          fY - 2,
          { align: 'center' },
        );

        doc.line(pageWidth / 2 + 150, fY, pageWidth / 2 + 260, fY);
        doc.text('TURNO B', pageWidth / 2 + 205, fY + 10, { align: 'center' });
        doc.text(
          log.operatorB?.name
            ? `${log.operatorB.name} ${log.operatorB.surname}`
            : '',
          pageWidth / 2 + 205,
          fY - 2,
          { align: 'center' },
        );

        doc.line(pageWidth / 2 + 280, fY, pageWidth / 2 + 390, fY);
        doc.text('TURNO C', pageWidth / 2 + 335, fY + 10, { align: 'center' });
        doc.text(
          log.operatorC?.name
            ? `${log.operatorC.name} ${log.operatorC.surname}`
            : '',
          pageWidth / 2 + 335,
          fY - 2,
          { align: 'center' },
        );

        // 6. HORAS TRABAJADAS
        finalY += 60;
        doc.setFont('helvetica', 'bold');
        doc.text('HORAS TRABAJADAS', margin, finalY);
        doc.setFont('helvetica', 'normal');

        doc.text('1.-', margin + 120, finalY);
        doc.line(margin + 135, finalY + 2, margin + 200, finalY + 2);
        doc.text('2.-', margin + 220, finalY);
        doc.line(margin + 235, finalY + 2, margin + 300, finalY + 2);
        doc.text('3.-', margin + 120, finalY + 15);
        doc.line(margin + 135, finalY + 17, margin + 200, finalY + 17);
        doc.text('4.-', margin + 220, finalY + 15);
        doc.line(margin + 235, finalY + 17, margin + 300, finalY + 17);
        doc.text('5.-', margin + 120, finalY + 30);
        doc.line(margin + 135, finalY + 32, margin + 200, finalY + 32);
        doc.text('6.-', margin + 220, finalY + 30);
        doc.line(margin + 235, finalY + 32, margin + 300, finalY + 32);
        doc.text('7.-', margin + 120, finalY + 45);
        doc.line(margin + 135, finalY + 47, margin + 200, finalY + 47);

        doc.text('Sull.-', margin + 220, finalY + 45);
        doc.text(log.horas_sull || '', margin + 265, finalY + 44, {
          align: 'center',
        });
        doc.line(margin + 245, finalY + 47, margin + 300, finalY + 47);

        doc.text('1G.D.-', margin + 320, finalY + 45);
        doc.text(log.horas_gd || '', margin + 380, finalY + 44, {
          align: 'center',
        });
        doc.line(margin + 355, finalY + 47, margin + 420, finalY + 47);

        doc.setFont('helvetica', 'bold');
        doc.text(
          'Nota: Las horas trabajadas se tomaran al final del turno "C"',
          margin,
          finalY + 65,
        );

        // 7. PIE DE PÁGINA SGC (Corregido alineación multilínea)
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

        let txX = margin;
        const getC = (w: number) => {
          const c = txX + w / 2;
          txX += w;
          return c;
        };

        // 🚩 SOLUCIÓN ALINEACIÓN: Usamos doc.text con align: center nativo para el SGC
        doc.text(
          `Fecha de Revisión:\n${log.fecha_revision}`,
          getC(cWidths[0]),
          bY + 6,
          { align: 'center' },
        );
        doc.text(
          `Reemplaza a:\n${log.fecha_reemplazo}`,
          getC(cWidths[1]),
          bY + 6,
          { align: 'center' },
        );
        doc.text(`Versión:\n${log.version}`, getC(cWidths[2]), bY + 6, {
          align: 'center',
        });
        doc.text(
          `Propietario: ${log.propietario}\nAprobado: ${log.aprobador}`,
          getC(cWidths[3]),
          bY + 6,
          { align: 'center' },
        );
        doc.text(
          `Estándar:\n${log.estandar_calidad}`,
          getC(cWidths[4]),
          bY + 6,
          { align: 'center' },
        );
        doc.text(`Página 1 de 1`, getC(cWidths[5]), bY + 12, {
          align: 'center',
        });
      }

      doc.save(
        selectedItems.length === 1
          ? `Compresores_${selectedItems[0].productionDate}.pdf`
          : `Compresores_Lote.pdf`,
      );
      if (addAlert)
        addAlert(
          'success',
          `Se exportaron ${selectedItems.length} bitácora(s) con el formato oficial.`,
        );
    } catch (error) {
      console.error(error);
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
          subtitle="No existen bitácoras."
          action={
            <Button variant="primary" href="/compresores/new">
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
            { text: 'Compresores de Aire', href: '#' },
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
        splitPanelPreferences={{ position: 'side', size: 450 } as any} // Hacemos el panel más ancho para las lecturas
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
                          <h3 className="summary-title">Compresor de Aire</h3>
                        </div>
                        <StatusIndicator
                          type={
                            item.readings?.length >= 12 ? 'success' : 'warning'
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

                      {/* 🚩 NUEVA TABLA ANIDADA EN EL PANEL PARA VER LAS LECTURAS */}
                      <div style={{ marginBottom: '16px' }}>
                        <Box
                          variant={'awsui-key-label' as any}
                          color="text-label"
                          fontSize="body-s"
                          margin={{ bottom: 'xs' }}
                        >
                          Lecturas Registradas ({item.readings?.length || 0})
                        </Box>
                        <Table
                          columnDefinitions={DETAILS_COLUMNS}
                          items={item.readings || []}
                          variant="embedded"
                          empty={
                            <Box textAlign="center" color="text-body-secondary">
                              Sin lecturas.
                            </Box>
                          }
                        />
                      </div>

                      <Box
                        variant={'awsui-key-label' as any}
                        color="text-label"
                        fontSize="body-s"
                      >
                        Horas Trabajadas (Fin de Día)
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
                            SULLAIR
                          </span>
                          <br />
                          <strong style={{ color: '#0972d3' }}>
                            {item.horas_sull || 'N/A'} hrs
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
                            GARDNER D.
                          </span>
                          <br />
                          <strong style={{ color: '#0972d3' }}>
                            {item.horas_gd || 'N/A'} hrs
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
                Selecciona un registro para ver el detalle operativo.
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
                  description="Gestión histórica del departamento de mantenimiento de Compresores."
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
                        href="/compresores/new"
                      >
                        Captura de Hora
                      </Button>
                    </SpaceBetween>
                  }
                >
                  Registros: Compresores
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
                      filteringPlaceholder="Buscar Folio..."
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

      <Modal
        onDismiss={() => setIsConfigModalVisible(false)}
        visible={isConfigModalVisible}
        header="Configuración Normativa SGC"
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

      <Modal
        onDismiss={() => {
          setIsDeleteModalVisible(false);
          setDeleteConfirmationText('');
        }}
        visible={isDeleteModalVisible}
        header="Inhabilitar Registro"
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
            Al eliminar el log, se borrarán permanentemente las{' '}
            <b>12 lecturas de telemetría</b> de ese día.
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
