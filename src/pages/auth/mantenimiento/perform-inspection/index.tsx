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
  SegmentedControl,
  Textarea,
  Box,
  ColumnLayout,
  Grid,
  Modal,
  Flashbar,
} from '@cloudscape-design/components';

import { AppContent } from '@/context/AppContext';
import Navbar from '@/components/layouts/AppHeader';
import GlobalSidebar from '@/components/layouts/AppSidebar';
import SecondaryHeader from '@/components/layouts/BreadcrumbNavBar';
import { Footer } from '@/components/layouts/AppFooter';

const MAINTENANCE_API_URL =
  import.meta.env.VITE_MAINTENANCE_API_URL || 'http://localhost:4001';

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

const formatLocalTime = (isoString: string) => {
  const date = isoString ? new Date(isoString) : new Date();
  return new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Monterrey',
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
};

export default function PerformInspection() {
  const { alerts, addAlert } = useContext(AppContent) || {};

  const [navigationOpen, setNavigationOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  const [area, setArea] = useState<any>({
    label: 'Calderas de Refrigeración',
    value: 'ref',
  });
  const [turno, setTurno] = useState<any>({ label: 'Turno A', value: 'A' });
  const [checks, setChecks] = useState<Record<string, any>>({});

  // 🚩 ESTADO NUEVO: Almacena las versiones ISO maestras traídas de la base de datos
  const [dbConfigs, setDbConfigs] = useState<Record<string, any>>({});

  // Carga inicial de configuraciones de calidad desde la BD
  const loadActiveConfigs = async () => {
    try {
      const res = await axios.get(
        `${MAINTENANCE_API_URL}/api/document-configs`,
        { withCredentials: true },
      );
      if (res.data.success) {
        // Reducimos el arreglo a un diccionario indexado por llave ('ref', 'conge')
        const configMap = res.data.data.reduce((acc: any, curr: any) => {
          acc[curr.area_key] = curr;
          return acc;
        }, {});
        setDbConfigs(configMap);
      }
    } catch (e) {
      if (addAlert)
        addAlert(
          'error',
          'Fallo al sincronizar matriz de control de versiones ISO.',
        );
    }
  };

  useEffect(() => {
    loadActiveConfigs();
  }, []);

  useEffect(() => {
    const tareasActuales = (CHECKLISTS_POR_AREA as any)[area.value] || [];
    const estadoInicial = tareasActuales.reduce(
      (acc: any, task: any) => ({
        ...acc,
        [task.id]: { status: 'NORMAL', comments: '' },
      }),
      {},
    );
    setChecks(estadoInicial);
    setShowErrorAlert(false);
  }, [area.value]);

  const handleStatusChange = (taskId: string, newStatus: any) => {
    setChecks((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        status: newStatus,
        comments: newStatus === 'NORMAL' ? '' : prev[taskId].comments,
      },
    }));
  };

  const handleCommentChange = (taskId: string, text: string) => {
    setChecks((prev) => ({
      ...prev,
      [taskId]: { ...prev[taskId], comments: text },
    }));
  };

  const handlePreSubmit = (e?: any) => {
    if (e) e.preventDefault();
    setShowErrorAlert(false);

    const hasErrors = Object.values(checks).some(
      (check) =>
        (check.status === 'ANORMAL' || check.status === 'FALLA') &&
        check.comments.trim() === '',
    );

    if (hasErrors) {
      setShowErrorAlert(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setIsConfirmModalVisible(true);
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);

    const payload = {
      area: area.label,
      turno: turno.value,
      checks: checks,
      // 🚩 ENVIAMOS LA CONFIGURACIÓN REAL ACTUAL DE LA BASE DE DATOS
      metadata: dbConfigs[area.value],
    };

    try {
      const response = await axios.post(
        `${MAINTENANCE_API_URL}/api/inspections`,
        payload,
        {
          withCredentials: true,
        },
      );

      if (response.data.success) {
        const serverTimestamp =
          response.data.data.createdAt || response.data.data.timestamp;
        const fechaFormateada = serverTimestamp
          ? formatLocalTime(serverTimestamp)
          : 'este momento';

        if (addAlert) {
          addAlert(
            'success',
            `Folio de Mantenimiento #${response.data.data.id} creado exitosamente el ${fechaFormateada}.`,
          );
        }

        setIsConfirmModalVisible(false);
        setArea({ label: 'Calderas de Refrigeración', value: 'ref' });
        setTurno({ label: 'Turno A', value: 'A' });
      }
    } catch (error: any) {
      setIsConfirmModalVisible(false);
      const errorMsg =
        error.response?.data?.message ||
        'Error de conexión con el servidor de infraestructura.';
      if (addAlert) addAlert('error', errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tareasDeLaVista = (CHECKLISTS_POR_AREA as any)[area.value] || [];

  // Respaldo de carga si la BD tarda en responder
  const currentMetadata = dbConfigs[area.value] || {
    codigo_documento: 'Cargando...',
    version: '--',
    fecha_revision: '--',
    estandar_calidad: '--',
    propietario: '--',
    aprobador: '--',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#f2f3f3',
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
            { text: 'Bitácoras Operativas', href: '/checklists' },
            { text: 'Nueva Inspección', href: '#' },
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
                    <Button formAction="none" variant="link">
                      Cancelar
                    </Button>
                    <Button variant="primary" onClick={handlePreSubmit}>
                      Revisar y Enviar
                    </Button>
                  </SpaceBetween>
                }
                errorText={
                  showErrorAlert
                    ? 'Requiere Atención: Por favor, justifique todas las anomalías o fallas detectadas en la sección de comentarios.'
                    : null
                }
              >
                <SpaceBetween size="l">
                  <Header
                    variant="h1"
                    description={`Formato SGC No. ${currentMetadata.codigo_documento} | Versión: ${currentMetadata.version}`}
                    actions={
                      <Box color="text-status-inactive">
                        Rev: {currentMetadata.fecha_revision}
                      </Box>
                    }
                  >
                    Check List Pre Operativo
                  </Header>

                  <Container
                    header={<Header variant="h2">Datos de Operación</Header>}
                  >
                    <ColumnLayout columns={2}>
                      <FormField
                        label="Área / Equipo"
                        description="Seleccione el sector a auditar"
                      >
                        <Select
                          selectedOption={area}
                          onChange={({ detail }) =>
                            setArea(detail.selectedOption as any)
                          }
                          options={[
                            {
                              label: 'Calderas de Refrigeración',
                              value: 'ref',
                            },
                            {
                              label: 'Calderas de Congelación',
                              value: 'conge',
                            },
                          ]}
                        />
                      </FormField>

                      <FormField label="Turno Asignado">
                        <Select
                          selectedOption={turno}
                          onChange={({ detail }) =>
                            setTurno(detail.selectedOption as any)
                          }
                          options={[
                            { label: 'Turno A', value: 'A' },
                            { label: 'Turno B', value: 'B' },
                            { label: 'Turno C', value: 'C' },
                          ]}
                        />
                      </FormField>
                    </ColumnLayout>
                  </Container>

                  <Container
                    header={
                      <Header
                        variant="h2"
                        counter={`(${tareasDeLaVista.length} puntos)`}
                      >
                        Puntos de Revisión
                      </Header>
                    }
                  >
                    {Object.keys(checks).length === tareasDeLaVista.length ? (
                      <SpaceBetween size="xl">
                        {tareasDeLaVista.map((task: any, index: number) => {
                          const currentCheck = checks[task.id];
                          if (!currentCheck) return null;

                          const requiresComment =
                            currentCheck.status === 'ANORMAL' ||
                            currentCheck.status === 'FALLA';
                          const isMissingComment =
                            showErrorAlert &&
                            requiresComment &&
                            currentCheck.comments.trim() === '';

                          return (
                            <div key={task.id}>
                              {index > 0 && (
                                <div
                                  style={{
                                    borderTop: '1px solid #eaeded',
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
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                  }}
                                >
                                  <SegmentedControl
                                    selectedId={currentCheck.status}
                                    onChange={({ detail }) =>
                                      handleStatusChange(
                                        task.id,
                                        detail.selectedId,
                                      )
                                    }
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
                                    backgroundColor: '#fafafa',
                                    borderRadius: '8px',
                                    borderLeft: `4px solid ${currentCheck.status === 'FALLA' ? '#d13212' : '#ff9900'}`,
                                  }}
                                >
                                  <FormField
                                    label="Observaciones Técnicas"
                                    description={`Detalle la anomalía para justificar el estado: ${currentCheck.status}`}
                                    errorText={
                                      isMissingComment
                                        ? 'Obligatorio: Ingrese un comentario describiendo la desviación operativa.'
                                        : null
                                    }
                                  >
                                    <Textarea
                                      value={currentCheck.comments}
                                      onChange={({ detail }) =>
                                        handleCommentChange(
                                          task.id,
                                          detail.value,
                                        )
                                      }
                                      placeholder="Describa los parámetros inestables observados..."
                                      rows={2}
                                    />
                                  </FormField>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </SpaceBetween>
                    ) : (
                      <Box textAlign="center" margin={{ top: 'xl' }}>
                        Inicializando checklist de operación...
                      </Box>
                    )}
                  </Container>
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
        header="Confirmar Envío de Bitácora Operativa"
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
          Está a punto de registrar la bitácora para la operación de{' '}
          <b>{area.label}</b> correspondiente al <b>{turno.label}</b>.
        </Box>
        <Box variant="p" color="text-status-info">
          <i>
            Este documento se auditará bajo el estándar de{' '}
            <b>{currentMetadata.estandar_calidad}</b>, siendo Propietario{' '}
            <b>{currentMetadata.propietario}</b> y Aprobador{' '}
            <b>{currentMetadata.aprobador}</b>.
          </i>
        </Box>
        <Box variant="p" color="text-body-secondary" margin={{ top: 'l' }}>
          Al enviar este documento, usted firma electrónicamente garantizando
          que los parámetros reportados son precisos y se adhieren a la versión{' '}
          {currentMetadata.version} del SGC.
        </Box>
      </Modal>
    </div>
  );
}
