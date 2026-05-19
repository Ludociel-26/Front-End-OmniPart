import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  AppLayout,
  Container,
  Header,
  SpaceBetween,
  Button,
  Form,
  FormField,
  Select,
  Box,
  ColumnLayout,
  Grid,
  SegmentedControl,
  Textarea,
  ExpandableSection,
  Checkbox,
  Flashbar,
  Modal,
} from '@cloudscape-design/components';

import { AppContent } from '@/context/AppContext';
import Navbar from '@/components/layouts/AppHeader';
import GlobalSidebar from '@/components/layouts/AppSidebar';
import SecondaryHeader from '@/components/layouts/BreadcrumbNavBar';
import { Footer } from '@/components/layouts/AppFooter';

const MAINTENANCE_API_URL =
  import.meta.env.VITE_MAINTENANCE_API_URL || 'http://localhost:4001';

// --- TIPOS DE DATOS LOCALES ---
interface SelectOption {
  label: string;
  value: string;
}

// --- ESQUEMA EXACTO: REPORTE DIARIO MAQUINARIA CONGELADOS (v3.0) ---
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
      label: 'INSPECCION DE FILTROS Y REJILLAS DE AIRE DE VENTILACION.',
      desc: 'A= Limpias | B= Requieren limpieza | C= Obstruidas o dañadas',
    },
    deshielo: {
      id: 'deshielo',
      label: 'VERIFICAR SECUENCIA OPERATIVA DEL CICLO DE DESHIELO',
      desc: 'A= (-26°C a -18°C) | B= (-17°C a -10°C) | C= Falla (Doble -d -d -)',
    },
    ecochiller: {
      id: 'ecochiller',
      label: 'REVISAR FUNCIONAMIENTO DEL SISTEMA DEL ECOCHILLER',
    },
  },
  fugas_drager: [
    {
      id: 'fuga_drager',
      label:
        'INSPECCIONAR PRESENCIA DE FUGAS DE AMONIACO EN EL SISTEMA CON DETECTOR DRAGER',
      desc: 'En caso de detección (Con Fuga), verificar con mecha de azufre.',
    },
  ],
  dosificadores: [
    {
      id: 'dosi_frick',
      label: 'CONDENSADOR FRICK: FUNCIONAMIENTO DE DOSIFICADORES',
    },
    {
      id: 'dosi_protec',
      label: 'TORRE PROTEC: FUNCIONAMIENTO DE DOSIFICADORES',
    },
  ],
  limpieza: {
    id: 'limpieza_area',
    label: 'REALIZAR LIMPIEZA DEL AREA Y MAQUINARIA (3 TURNOS)',
  },
};

// --- OPCIONES DE ESTADO PERSONALIZADAS ---
const OPCIONES_GENERALES_3 = [
  { text: '✓ Normal', id: 'NORMAL' },
  { text: '! Anormal', id: 'ANORMAL' },
  { text: '✕ Falla', id: 'FALLA' },
];
const OPCIONES_REJILLAS = [
  { text: '✓ Limpias', id: 'NORMAL' },
  { text: '! Req. Limpieza', id: 'ANORMAL' },
  { text: '✕ Obstruidas', id: 'FALLA' },
];
const OPCIONES_DESHIELO = [
  { text: '✓ -26° a -18°', id: 'NORMAL' },
  { text: '! -17° a -10°', id: 'ANORMAL' },
  { text: '✕ -d -d-', id: 'FALLA' },
];
const OPCIONES_FUGAS_DRAGER = [
  { text: '✓ Sin Fuga', id: 'SIN_FUGA' },
  { text: '✕ Con Fuga', id: 'CON_FUGA' },
];
const OPCIONES_DOSIFICADORES = [
  { text: 'SÍ', id: 'SI' },
  { text: 'NO', id: 'NO' },
];

export default function DailyReportCongelados() {
  const appContext = useContext(AppContent) as any;
  const alerts = appContext?.alerts || [];
  const addAlert = appContext?.addAlert;

  const [navigationOpen, setNavigationOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  const [turno, setTurno] = useState<SelectOption>({
    label: 'Turno A',
    value: 'A',
  });
  const [observacionesGlobales, setObservacionesGlobales] = useState('');
  const [evaluations, setEvaluations] = useState<Record<string, any>>({});

  // 🚩 ESTADO SGC TRAÍDO DE LA API
  const [sgcConfig, setSgcConfig] = useState<any>({
    codigo_documento: 'Cargando...',
    version: '--',
    fecha_revision: '--',
    fecha_reemplazo: '--',
    propietario: '--',
    aprobador: '--',
    estandar_calidad: '--',
    razon_cambio: '--',
  });

  // 🚩 CARGA DE CONFIGURACIÓN AUTOMÁTICA DESDE TU ENDPOINT ISO
  const loadActiveConfigs = async () => {
    try {
      const res = await axios.get(
        `${MAINTENANCE_API_URL}/api/document-configs`,
        { withCredentials: true },
      );
      if (res.data.success) {
        // Buscamos explícitamente la llave inyectada en el backend
        const configCongelados = res.data.data.find(
          (c: any) => c.area_key === 'reportes_diarios_congelados',
        );
        if (configCongelados) {
          setSgcConfig(configCongelados);
        }
      }
    } catch (e) {
      if (addAlert)
        addAlert(
          'error',
          'Fallo al sincronizar la matriz de control de versiones ISO.',
        );
    }
  };

  const initForm = () => {
    const initialState: Record<string, any> = {};
    [
      ...SCHEMA.maquinaria,
      ...SCHEMA.cuartos,
      ...SCHEMA.acondicionado,
      ...SCHEMA.amoniaco,
    ].forEach((item) => {
      initialState[item.id] = { status: 'NORMAL', comments: '' };
    });
    Object.values(SCHEMA.sistemas_aislados).forEach((item) => {
      initialState[item.id] = { status: 'NORMAL', comments: '' };
    });
    SCHEMA.fugas_drager.forEach((item) => {
      initialState[item.id] = { status: 'SIN_FUGA', comments: '' };
    });
    SCHEMA.dosificadores.forEach((item) => {
      initialState[item.id] = { status: 'SI', comments: '' };
    });
    initialState[SCHEMA.limpieza.id] = { status: false, comments: '' };

    setEvaluations(initialState);
    setObservacionesGlobales('');
    setShowErrorAlert(false);
  };

  useEffect(() => {
    initForm();
    loadActiveConfigs(); // Consultamos los datos máster de la API
  }, []);

  const handleStatusChange = (id: string, newStatus: any) => {
    setEvaluations((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        status: newStatus,
        comments:
          newStatus === 'NORMAL' ||
          newStatus === 'SI' ||
          newStatus === 'SIN_FUGA' ||
          newStatus === true
            ? ''
            : prev[id].comments,
      },
    }));
    setShowErrorAlert(false);
  };

  const handleCommentChange = (id: string, text: string) => {
    setEvaluations((prev) => ({
      ...prev,
      [id]: { ...prev[id], comments: text },
    }));
    setShowErrorAlert(false);
  };

  const handlePreSubmit = (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    setShowErrorAlert(false);

    const ruralErrors = Object.values(evaluations).some(
      (evalItem) =>
        (evalItem.status === 'ANORMAL' ||
          evalItem.status === 'FALLA' ||
          evalItem.status === 'CON_FUGA' ||
          evalItem.status === 'NO') &&
        evalItem.comments?.trim() === '',
    );

    if (ruralErrors) {
      setShowErrorAlert(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsConfirmModalVisible(true);
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);

    // 🚩 EL PAYLOAD SE SINCRONIZA CON LOS CAMPOS MAESTROS QUE TU CONTROLADOR ESPERA
    const payload = {
      reportType: 'congelados',
      turno: turno.value,
      evaluations,
      observacionesGlobales,
      // Metadatos dinámicos del SGC para auditorías cruzadas
      codigo_documento: sgcConfig.codigo_documento,
      version: sgcConfig.version,
      fecha_revision: sgcConfig.fecha_revision,
      fecha_reemplazo: sgcConfig.fecha_reemplazo,
      propietario: sgcConfig.propietario,
      aprobador: sgcConfig.aprobador,
      estandar_calidad: sgcConfig.estandar_calidad,
      razon_cambio: sgcConfig.razon_cambio,
    };

    try {
      const response = await axios.post(
        `${MAINTENANCE_API_URL}/api/congelados-report`,
        payload,
        { withCredentials: true },
      );

      if (response.data.success) {
        if (addAlert)
          addAlert(
            'success',
            `Reporte Diario de Congelados (Turno ${turno.value}) guardado exitosamente bajo versión ${sgcConfig.version}.`,
          );
        initForm();
        setIsConfirmModalVisible(false);
      }
    } catch (error: any) {
      setIsConfirmModalVisible(false);
      if (addAlert)
        addAlert(
          'error',
          error.response?.data?.message ||
            'Error al conectar con la base de datos de infraestructura.',
        );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRow = (item: any, options: any[]) => {
    const currentEval = evaluations[item.id];
    if (!currentEval) return null;

    const requiresComment =
      currentEval.status === 'ANORMAL' ||
      currentEval.status === 'FALLA' ||
      currentEval.status === 'CON_FUGA' ||
      currentEval.status === 'NO';
    const isMissingComment =
      showErrorAlert && requiresComment && currentEval.comments.trim() === '';

    let borderColor = '#ff9900';
    if (currentEval.status === 'FALLA' || currentEval.status === 'CON_FUGA')
      borderColor = '#d13212';

    return (
      <div
        key={item.id}
        style={{
          borderBottom: '1px solid #eaeded',
          paddingBottom: '12px',
          paddingTop: '12px',
        }}
      >
        <Grid
          gridDefinition={[
            { colspan: { default: 12, s: 7 } },
            { colspan: { default: 12, s: 5 } },
          ]}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <Box
              variant="span"
              fontSize="body-m"
              fontWeight={requiresComment ? 'bold' : 'normal'}
            >
              {item.label}
            </Box>
            {item.desc && (
              <span
                style={{ fontSize: '12px', color: '#545b64', marginTop: '4px' }}
              >
                {item.desc}
              </span>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            <SegmentedControl
              selectedId={currentEval.status}
              onChange={({ detail }) =>
                handleStatusChange(item.id, detail.selectedId)
              }
              options={options}
            />
          </div>
        </Grid>
        {requiresComment && (
          <div
            style={{
              marginTop: '12px',
              padding: '16px',
              backgroundColor: '#fafafa',
              borderRadius: '8px',
              borderLeft: `4px solid ${borderColor}`,
            }}
          >
            <FormField
              label={`Justificación obligatoria (${currentEval.status})`}
              errorText={
                isMissingComment
                  ? 'Debe describir la anomalía, fuga o acción tomada.'
                  : null
              }
            >
              <Textarea
                value={currentEval.comments}
                onChange={({ detail }) =>
                  handleCommentChange(item.id, detail.value)
                }
                placeholder={
                  item.id === 'fuga_drager'
                    ? 'Describa el resultado de la prueba con mecha de azufre...'
                    : 'Describa el problema o acción correctiva...'
                }
                rows={2}
              />
            </FormField>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--color-background-layout-main, #f2f3f3)',
      }}
    >
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
            { text: 'Maquinaria Congelados', href: '#' },
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
        toolsHide={true}
        notifications={
          alerts && alerts.length > 0 ? (
            <Flashbar items={alerts as any} stackItems={true} />
          ) : null
        }
        content={
          <div style={{ padding: '24px' }}>
            <form onSubmit={handlePreSubmit}>
              <Form
                actions={
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button formAction="none" variant="link" onClick={initForm}>
                      Descartar
                    </Button>
                    <Button variant="primary" onClick={handlePreSubmit}>
                      Revisar y Enviar
                    </Button>
                  </SpaceBetween>
                }
                errorText={
                  showErrorAlert
                    ? 'Requiere Atención: Faltan comentarios en las evaluaciones marcadas con incidencias.'
                    : null
                }
              >
                <SpaceBetween size="l">
                  {/* 🚩 TITULO INTEGRADO AL SGC */}
                  <Header
                    variant="h1"
                    description={`Formato SGC No. ${sgcConfig.codigo_documento} | Versión: ${sgcConfig.version}`}
                    actions={
                      <Box color="text-status-inactive">
                        Rev: {sgcConfig.fecha_revision}
                      </Box>
                    }
                  >
                    Reporte Diario: Maquinaria Congelados
                  </Header>

                  <Container>
                    <ColumnLayout columns={2}>
                      <FormField label="Turno a Reportar">
                        <Select
                          selectedOption={turno}
                          onChange={({ detail }) =>
                            setTurno(detail.selectedOption as SelectOption)
                          }
                          options={[
                            { label: 'Turno A', value: 'A' },
                            { label: 'Turno B', value: 'B' },
                            { label: 'Turno C', value: 'C' },
                          ]}
                        />
                      </FormField>
                      <FormField label="Fecha de Registro">
                        <div style={{ paddingTop: '8px', fontWeight: 'bold' }}>
                          {new Date().toLocaleDateString('es-MX', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                      </FormField>
                    </ColumnLayout>
                  </Container>

                  <ExpandableSection
                    headerText="1. FUNCIONAMIENTO DE MAQUINARIA"
                    variant="container"
                    defaultExpanded={true}
                  >
                    {SCHEMA.maquinaria.map((item) =>
                      renderRow(item, OPCIONES_GENERALES_3),
                    )}
                  </ExpandableSection>

                  <ExpandableSection
                    headerText="2. DIFUSORES EN CUARTOS FRÍOS"
                    variant="container"
                    defaultExpanded={true}
                  >
                    {SCHEMA.cuartos.map((item) =>
                      renderRow(item, OPCIONES_GENERALES_3),
                    )}
                  </ExpandableSection>

                  <Grid
                    gridDefinition={[
                      { colspan: { default: 12, l: 6 } },
                      { colspan: { default: 12, l: 6 } },
                    ]}
                  >
                    <ExpandableSection
                      headerText="CONDENSADOR FRICK"
                      variant="container"
                      defaultExpanded={true}
                    >
                      {renderRow(
                        SCHEMA.dosificadores[0],
                        OPCIONES_DOSIFICADORES,
                      )}
                    </ExpandableSection>
                    <ExpandableSection
                      headerText="TORRE PROTEC"
                      variant="container"
                      defaultExpanded={true}
                    >
                      {renderRow(
                        SCHEMA.dosificadores[1],
                        OPCIONES_DOSIFICADORES,
                      )}
                    </ExpandableSection>
                  </Grid>

                  <ExpandableSection
                    headerText="SISTEMA DE AIRE ACONDICIONADO"
                    variant="container"
                    defaultExpanded={true}
                  >
                    {SCHEMA.acondicionado.map((item) =>
                      renderRow(item, OPCIONES_GENERALES_3),
                    )}
                  </ExpandableSection>

                  <ExpandableSection
                    headerText="INSPECCIONES OPERATIVAS Y SISTEMAS"
                    variant="container"
                    defaultExpanded={true}
                  >
                    <SpaceBetween size="m">
                      {renderRow(
                        SCHEMA.sistemas_aislados.rejillas,
                        OPCIONES_REJILLAS,
                      )}
                      {renderRow(
                        SCHEMA.sistemas_aislados.deshielo,
                        OPCIONES_DESHIELO,
                      )}
                      {renderRow(
                        SCHEMA.sistemas_aislados.ecochiller,
                        OPCIONES_GENERALES_3,
                      )}
                    </SpaceBetween>
                  </ExpandableSection>

                  <ExpandableSection
                    headerText="DETECCIÓN Y FUGAS DE AMONIACO"
                    variant="container"
                    defaultExpanded={true}
                  >
                    <SpaceBetween size="m">
                      <Box variant="h4">SISTEMA DE DETECCIÓN (SENSORES)</Box>
                      {SCHEMA.amoniaco.map((item) =>
                        renderRow(item, OPCIONES_GENERALES_3),
                      )}
                      <Box variant="h4" margin={{ top: 'l' }}>
                        INSPECCIÓN DRAGER
                      </Box>
                      {SCHEMA.fugas_drager.map((item) =>
                        renderRow(item, OPCIONES_FUGAS_DRAGER),
                      )}
                    </SpaceBetween>
                  </ExpandableSection>

                  <Grid
                    gridDefinition={[
                      { colspan: { default: 12, m: 5 } },
                      { colspan: { default: 12, m: 7 } },
                    ]}
                  >
                    <Container
                      header={<Header variant="h3">LIMPIEZA DE ÁREA</Header>}
                    >
                      <FormField label={SCHEMA.limpieza.label}>
                        <Checkbox
                          checked={
                            evaluations[SCHEMA.limpieza.id]?.status || false
                          }
                          onChange={({ detail }) =>
                            handleStatusChange(
                              SCHEMA.limpieza.id,
                              detail.checked,
                            )
                          }
                        >
                          Limpieza Completada (Turno Actual)
                        </Checkbox>
                      </FormField>
                    </Container>
                    <Container
                      header={
                        <Header variant="h3">OBSERVACIONES FINALES</Header>
                      }
                    >
                      <Textarea
                        value={observacionesGlobales}
                        onChange={({ detail }) =>
                          setObservacionesGlobales(detail.value)
                        }
                        placeholder="Escriba aquí los comentarios generales..."
                        rows={3}
                      />
                    </Container>
                  </Grid>
                </SpaceBetween>
              </Form>
            </form>
          </div>
        }
      />
      <Footer />

      <Modal
        onDismiss={() => setIsConfirmModalVisible(false)}
        visible={isConfirmModalVisible}
        closeAriaLabel="Cerrar ventana"
        header="Confirmar Envío de Reporte Diario"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant="link"
                onClick={() => setIsConfirmModalVisible(false)}
              >
                Modificar Datos
              </Button>
              <Button
                variant="primary"
                loading={isSubmitting}
                onClick={confirmSubmit}
              >
                Firmar y Subir
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Box variant="p" padding={{ bottom: 'm' }}>
          Está a punto de registrar el reporte de maquinaria de congelados para
          el <b>{turno.label}</b>.
        </Box>
        <Box variant="p" color="text-status-info">
          <i>
            Este documento se auditará bajo el estándar de{' '}
            <b>{sgcConfig.estandar_calidad}</b>, siendo Propietario{' '}
            <b>{sgcConfig.propietario}</b> y Aprobador{' '}
            <b>{sgcConfig.aprobador}</b>.
          </i>
        </Box>
        <Box variant="p" color="text-body-secondary" margin={{ top: 'l' }}>
          Al enviar este documento, usted firma electrónicamente garantizando
          que los parámetros reportados son precisos y se adhieren a la versión{' '}
          {sgcConfig.version} del SGC.
        </Box>
      </Modal>
    </div>
  );
}
