import * as React from 'react';
// 🚩 IMPORTAMOS NUESTRA INSTANCIA PROTEGIDA
import api from '@/services/api';
import {
  AppLayout,
  Container,
  Header,
  SpaceBetween,
  Button,
  Form,
  FormField,
  Select,
  Input,
  Box,
  ColumnLayout,
  Alert,
  Textarea,
  Flashbar,
  Modal,
} from '@cloudscape-design/components';

import Navbar from '@/components/layouts/AppHeader';
import GlobalSidebar from '@/components/layouts/AppSidebar';
import SecondaryHeader from '@/components/layouts/BreadcrumbNavBar';
import { Footer } from '@/components/layouts/AppFooter';
import { AppContent } from '@/context/AppContext';

const MAINTENANCE_API_URL =
  import.meta.env.VITE_MAINTENANCE_API_URL || 'http://localhost:4001';

// --- ESQUEMA MAESTRO: ANÁLISIS QUÍMICOS ---
const CHEMICAL_SCHEMA = {
  name: 'Bitácora Análisis Químicos (Central de Vapor)',
  metrics: [
    {
      id: 'ph',
      label: 'Nivel de PH',
      unit: 'Escala PH',
      min: 10.5,
      max: 11.5,
      desc: 'Rango esperado: 10.5 a 11.5',
    },
    {
      id: 'dureza',
      label: 'Dureza',
      unit: 'PPM',
      max: 9.99,
      desc: 'Debe ser menor a 10 (< 10)',
    },
    {
      id: 'suavizador',
      label: 'Suavizador',
      unit: 'PPM',
      exact: 0,
      desc: 'Debe ser exactamente 0 PPM',
    },
  ],
};

const generateBiHourlyOptions = () => {
  const options: any[] = [];
  for (let i = 0; i < 24; i += 2) {
    const hourString = i.toString().padStart(2, '0') + ':00';
    options.push({ label: hourString, value: hourString });
  }
  return options;
};

// 🚩 FUNCIÓN UX: Calcula la hora y turno actual automáticamente
const getInitialTimeAndShift = () => {
  const currentHour = new Date().getHours();
  // Redondear hacia abajo al bloque de 2 horas más cercano (ej. 15 -> 14)
  const evenHour = currentHour % 2 === 0 ? currentHour : currentHour - 1;
  const hourString = evenHour.toString().padStart(2, '0') + ':00';

  let turnoValue = 'A';
  let turnoLabel = 'Turno A (Día)';

  if (currentHour >= 6 && currentHour < 14) {
    turnoValue = 'A';
    turnoLabel = 'Turno A (Día)';
  } else if (currentHour >= 14 && currentHour < 22) {
    turnoValue = 'B';
    turnoLabel = 'Turno B (Tarde)';
  } else {
    turnoValue = 'C';
    turnoLabel = 'Turno C (Noche)';
  }

  return {
    initialHour: { label: hourString, value: hourString },
    initialTurno: { label: turnoLabel, value: turnoValue },
  };
};

export default function ChemicalAnalysisEntry() {
  const appContext = React.useContext(AppContent) as any;
  const alerts = appContext?.alerts || [];
  const addAlert = appContext?.addAlert;

  const [navigationOpen, setNavigationOpen] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showErrorAlert, setShowErrorAlert] = React.useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] =
    React.useState(false);

  // 🚩 APLICAMOS LA FUNCIÓN UX A LOS ESTADOS INICIALES
  const initialContext = React.useMemo(() => getInitialTimeAndShift(), []);

  const [turno, setTurno] = React.useState<any>(initialContext.initialTurno);
  const [hour, setHour] = React.useState<any>(initialContext.initialHour);

  const [observaciones, setObservaciones] = React.useState('');
  const [readings, setReadings] = React.useState<Record<string, any>>({});

  // METADATOS SGC
  const [sgcConfig, setSgcConfig] = React.useState<any>({
    codigo_documento: 'Cargando...',
    version: '--',
    fecha_revision: '--',
    fecha_reemplazo: '--',
    propietario: '--',
    aprobador: '--',
    estandar_calidad: '--',
    razon_cambio: '--',
  });

  const loadActiveConfigs = async () => {
    try {
      // 🚩 USANDO LA INSTANCIA api PROTEGIDA
      const res = await api.get(`${MAINTENANCE_API_URL}/api/document-configs`);
      if (res.data.success) {
        const configQuimicos = res.data.data.find(
          (c: any) => c.area_key === 'analisis_quimicos_vapor',
        );
        if (configQuimicos) {
          setSgcConfig(configQuimicos);
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

  React.useEffect(() => {
    const initialReadings: Record<string, any> = {};
    CHEMICAL_SCHEMA.metrics.forEach((metric) => {
      initialReadings[metric.id] = '';
    });
    setReadings(initialReadings);
    setObservaciones('');
    loadActiveConfigs();
  }, []);

  const handleInputChange = (id: string, value: any) => {
    setReadings((prev) => ({ ...prev, [id]: value }));
    setShowErrorAlert(false);
  };

  const getValidationError = (metric: any, value: any) => {
    if (value === '' || value === undefined) return null;
    const num = parseFloat(value);
    if (isNaN(num)) return 'Debe ser un valor numérico.';

    if (metric.exact !== undefined && num !== metric.exact) {
      return `Fuera de norma. Debe ser ${metric.exact} ${metric.unit}.`;
    }
    if (metric.min !== undefined && num < metric.min)
      return `Valor bajo (Min: ${metric.min}).`;
    if (metric.max !== undefined && num > metric.max)
      return `Valor alto (Max: ${metric.max}).`;

    return null;
  };

  const handlePreSubmit = (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    setShowErrorAlert(false);

    const hasEmptyFields = CHEMICAL_SCHEMA.metrics.some(
      (m) => readings[m.id] === '' || readings[m.id] === undefined,
    );

    if (hasEmptyFields) {
      if (addAlert) {
        addAlert(
          'warning',
          'Por favor complete todos los parámetros químicos (PH, Dureza y Suavizador).',
        );
      }
      return;
    }

    const hasValidationErrors = CHEMICAL_SCHEMA.metrics.some(
      (m) => getValidationError(m, readings[m.id]) !== null,
    );

    if (hasValidationErrors && observaciones.trim() === '') {
      setShowErrorAlert(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsConfirmModalVisible(true);
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);

    const payload = {
      assetId: 'analisis_quimicos_vapor',
      turno: turno.value,
      timestampHour: hour.value,
      resultados: readings,
      observaciones,
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
      // 🚩 USANDO LA INSTANCIA api PROTEGIDA
      const response = await api.post(
        `${MAINTENANCE_API_URL}/api/chemical-analysis`,
        payload,
      );

      if (
        response.data.success ||
        response.status === 200 ||
        response.status === 201
      ) {
        if (addAlert) {
          addAlert(
            'success',
            `Análisis químico de las ${hour.value} hrs (Turno ${turno.value}) guardado correctamente bajo la versión ${sgcConfig.version} del SGC.`,
          );
        }

        const clearedReadings: Record<string, any> = {};
        CHEMICAL_SCHEMA.metrics.forEach((metric) => {
          clearedReadings[metric.id] = '';
        });
        setReadings(clearedReadings);
        setObservaciones('');
        setIsConfirmModalVisible(false);

        const currentHourIdx = generateBiHourlyOptions().findIndex(
          (opt) => opt.value === hour.value,
        );
        const nextHourOpt =
          generateBiHourlyOptions()[(currentHourIdx + 1) % 12];
        if (nextHourOpt) setHour(nextHourOpt);
      }
    } catch (error: any) {
      setIsConfirmModalVisible(false);
      if (addAlert) {
        addAlert(
          'error',
          error.response?.data?.message ||
            'Error de conexión. No se pudo guardar el análisis en la base de datos.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
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
            { text: 'Análisis y Muestras', href: '#' },
            { text: 'Registro de Análisis Químico', href: '#' },
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
                    <Button
                      formAction="none"
                      variant="link"
                      onClick={() => {
                        const clearedReadings: Record<string, any> = {};
                        CHEMICAL_SCHEMA.metrics.forEach(
                          (m) => (clearedReadings[m.id] = ''),
                        );
                        setReadings(clearedReadings);
                        setObservaciones('');
                        setShowErrorAlert(false);
                      }}
                    >
                      Descartar
                    </Button>
                    <Button variant="primary" onClick={handlePreSubmit}>
                      Revisar y Enviar
                    </Button>
                  </SpaceBetween>
                }
                errorText={
                  showErrorAlert
                    ? 'Requiere Atención: Hay parámetros fuera de norma. Por favor, justifique las desviaciones en la sección de comentarios.'
                    : null
                }
              >
                <SpaceBetween size="l">
                  <Header
                    variant="h1"
                    description={`Formato SGC No. ${sgcConfig.codigo_documento} | Versión: ${sgcConfig.version}`}
                    actions={
                      <Box color="text-status-inactive">
                        Rev: {sgcConfig.fecha_revision}
                      </Box>
                    }
                  >
                    Registro de Análisis Químico
                  </Header>

                  {/* 1. SELECCIÓN DE TURNO Y HORA */}
                  <Container
                    header={<Header variant="h2">Contexto Operativo</Header>}
                  >
                    <ColumnLayout columns={2}>
                      <FormField label="Turno de Operación">
                        <Select
                          selectedOption={turno}
                          onChange={({ detail }) =>
                            setTurno(detail.selectedOption as any)
                          }
                          options={[
                            { label: 'Turno A (Día)', value: 'A' },
                            { label: 'Turno B (Tarde)', value: 'B' },
                            { label: 'Turno C (Noche)', value: 'C' },
                          ]}
                          expandToViewport={true}
                        />
                      </FormField>
                      <FormField label="Hora de Toma de Muestra (CST)">
                        <Select
                          selectedOption={hour}
                          onChange={({ detail }) =>
                            setHour(detail.selectedOption as any)
                          }
                          options={generateBiHourlyOptions()}
                          expandToViewport={true}
                        />
                      </FormField>
                    </ColumnLayout>
                  </Container>

                  {/* 2. PARÁMETROS QUÍMICOS */}
                  <Container
                    header={
                      <Header variant="h2">Lecturas de Calidad de Agua</Header>
                    }
                  >
                    <Box margin={{ bottom: 'l' }}>
                      <Alert type="info">
                        El sistema validará automáticamente que la Dureza sea
                        menor a 10 y que el Suavizador se mantenga en 0 PPM,
                        según la norma de calidad{' '}
                        <b>{sgcConfig.codigo_documento}</b>.
                      </Alert>
                    </Box>
                    <ColumnLayout columns={3} variant="text-grid">
                      {CHEMICAL_SCHEMA.metrics.map((metric) => (
                        <FormField
                          key={metric.id}
                          label={`${metric.label}`}
                          description={metric.desc}
                          errorText={getValidationError(
                            metric,
                            readings[metric.id],
                          )}
                        >
                          <Input
                            type="number"
                            step="any"
                            value={
                              readings[metric.id] !== undefined
                                ? readings[metric.id]
                                : ''
                            }
                            onChange={({ detail }) =>
                              handleInputChange(metric.id, detail.value)
                            }
                            placeholder="0.00"
                          />
                        </FormField>
                      ))}
                    </ColumnLayout>
                  </Container>

                  {/* 3. OBSERVACIONES / AJUSTES QUÍMICOS */}
                  <Container
                    header={
                      <Header variant="h2">Ajustes y Observaciones</Header>
                    }
                  >
                    <FormField
                      label="Comentarios de la lectura"
                      errorText={
                        showErrorAlert && observaciones.trim() === ''
                          ? 'Obligatorio: Justifique por qué los parámetros están fuera de rango.'
                          : null
                      }
                    >
                      <Textarea
                        value={observaciones}
                        onChange={({ detail }) => {
                          setObservaciones(detail.value);
                          if (detail.value.trim() !== '')
                            setShowErrorAlert(false);
                        }}
                        placeholder="Si algún valor salió de rango, especifique qué ajuste químico se realizó o la causa raíz..."
                        rows={3}
                      />
                    </FormField>
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
        header="Confirmar Envío de Análisis Químico"
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
          Está a punto de registrar las lecturas químicas de la Central de Vapor
          correspondientes a las <b>{hour.label} hrs</b> en el{' '}
          <b>{turno.label}</b>.
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
