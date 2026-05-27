import * as React from 'react';
import { useState, useEffect, useContext } from 'react';
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
  Grid,
  Alert,
  Textarea,
  SegmentedControl,
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

// --- ESQUEMA MAESTRO: CUARTO FRÍO #5 (2.2-16-3-16) ---
const SCHEMA = {
  parametrosSistema: [
    { id: 'nivel_refrigerante', label: 'Nivel de Refrigerante', unit: '%' },
    {
      id: 'pres_succion',
      label: 'Presión Succión',
      unit: 'PSI',
      target: 50,
      desc: 'Ideal: 50 PSI',
    },
    {
      id: 'pres_descarga',
      label: 'Presión Descarga',
      unit: 'PSI',
      target: 220,
      desc: 'Ideal: 220 PSI',
    },
    { id: 'pct_carga', label: '% de Carga', unit: '%' },
  ],
  evaporadores: [
    {
      id: 'evap_1',
      label: 'Temp Evap 1',
      unit: '°C',
      min: 9,
      max: 11,
      desc: '10±1°C',
    },
    {
      id: 'evap_2',
      label: 'Temp Evap 2',
      unit: '°C',
      min: 9,
      max: 11,
      desc: '10±1°C',
    },
    {
      id: 'evap_3',
      label: 'Temp Evap 3',
      unit: '°C',
      min: 0,
      max: 2,
      desc: '1±1°C (D: 0, 6, 12, 18)',
    },
    {
      id: 'evap_4',
      label: 'Temp Evap 4',
      unit: '°C',
      min: 0,
      max: 2,
      desc: '1±1°C (D: 4, 10, 16, 22)',
    },
    {
      id: 'evap_5',
      label: 'Temp Evap 5',
      unit: '°C',
      min: 0,
      max: 2,
      desc: '1±1°C (D: 2, 8, 14, 20)',
    },
    {
      id: 'evap_6',
      label: 'Temp Evap 6',
      unit: '°C',
      min: 0,
      max: 2,
      desc: '1±1°C (D: 5, 11, 17, 23)',
    },
    {
      id: 'evap_7',
      label: 'Temp Evap 7',
      unit: '°C',
      min: 0,
      max: 2,
      desc: '1±1°C (D: 1, 7, 13, 19)',
    },
    {
      id: 'evap_8',
      label: 'Temp Evap 8',
      unit: '°C',
      min: 0,
      max: 2,
      desc: '1±1°C (D: 3, 9, 15, 21)',
    },
  ],
  temperaturasAmbiente: [
    { id: 'temp_ambiente', label: 'Temp Ambiente Exterior', unit: '°C' },
    {
      id: 'temp_cuarto_1',
      label: 'Temp Cuarto (Termómetro 1)',
      unit: '°C',
      min: 0,
      max: 3,
      desc: '0-3°C',
    },
    {
      id: 'temp_cuarto_2',
      label: 'Temp Cuarto (Termómetro 2)',
      unit: '°C',
      min: 0,
      max: 3,
      desc: '0-3°C',
    },
    {
      id: 'temp_cuarto_3',
      label: 'Temp Cuarto (Termómetro 3)',
      unit: '°C',
      min: 0,
      max: 3,
      desc: '0-3°C',
    },
  ],
};

const generateHourOptions = () => {
  const options: any[] = [];
  for (let i = 0; i < 24; i++) {
    const hourString = i.toString().padStart(2, '0') + ':00';
    options.push({ label: hourString, value: hourString });
  }
  return options;
};

export default function CuartoFrio5TelemetryEntry() {
  const { alerts, addAlert } = useContext(AppContent) || {};

  const [navigationOpen, setNavigationOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  // Estados Base
  const [turno, setTurno] = useState<any>({ label: 'Turno A', value: 'A' });
  const [hour, setHour] = useState<any>({ label: '07:00', value: '07:00' });
  const [observaciones, setObservaciones] = useState('');
  const [readings, setReadings] = useState<Record<string, any>>({});

  // ESTADO SGC: Almacena las versiones ISO traídas de la base de datos
  const [sgcConfig, setSgcConfig] = useState<any>({
    codigo_documento: 'Cargando...',
    version: '--',
    fecha_revision: '--',
    propietario: '--',
    aprobador: '--',
    estandar_calidad: '--',
  });

  // 1. CARGA INICIAL DEL FORMATO SGC
  useEffect(() => {
    const loadActiveConfigs = async () => {
      try {
        const res = await api.get(
          `${MAINTENANCE_API_URL}/api/document-configs`,
        );
        if (res.data.success) {
          const config = res.data.data.find(
            (c: any) => c.area_key === 'bitacora_cuarto_frio_5',
          );
          if (config) setSgcConfig(config);
        }
      } catch (e) {
        if (addAlert)
          addAlert(
            'error',
            'Fallo al sincronizar matriz de control de versiones ISO.',
          );
      }
    };
    loadActiveConfigs();
  }, []);

  // 2. INICIALIZAR LECTURAS AL CAMBIAR HORA O TURNO
  useEffect(() => {
    const initialReadings: Record<string, any> = {};
    initialReadings['nivel_aceite'] = 'OK';
    initialReadings['apagadores_encendidos'] = true;

    SCHEMA.parametrosSistema.forEach((m) => (initialReadings[m.id] = ''));
    SCHEMA.evaporadores.forEach((m) => (initialReadings[m.id] = ''));
    SCHEMA.temperaturasAmbiente.forEach((m) => (initialReadings[m.id] = ''));

    setReadings(initialReadings);
    setObservaciones('');
    setShowErrorAlert(false);
  }, [hour.value, turno.value]);

  const handleInputChange = (id: string, value: any) => {
    setReadings((prev) => ({ ...prev, [id]: value }));
  };

  const getValidationError = (metric: any, value: any) => {
    if (value === undefined || value === null || value === '') return null;
    const stringValue = String(value).trim().toUpperCase();
    if (stringValue === 'D') return null; // Letra D es válida (Deshielo)

    const num = parseFloat(stringValue);
    if (isNaN(num)) return 'Ingrese un número o "D" para deshielo.';
    if (metric.min !== undefined && num < metric.min)
      return `Min esperado: ${metric.min}`;
    if (metric.max !== undefined && num > metric.max)
      return `Max esperado: ${metric.max}`;
    return null;
  };

  // 3. VALIDACIÓN PRE-ENVÍO (Abrir Modal)
  const handlePreSubmit = (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    setShowErrorAlert(false);

    let hasErrors = false;
    // Comprobar errores visuales en todos los campos numéricos
    [
      ...SCHEMA.parametrosSistema,
      ...SCHEMA.evaporadores,
      ...SCHEMA.temperaturasAmbiente,
    ].forEach((metric) => {
      if (getValidationError(metric, readings[metric.id])) hasErrors = true;
    });

    if (hasErrors) {
      setShowErrorAlert(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setIsConfirmModalVisible(true);
  };

  // 4. CONFIRMAR Y GUARDAR EN BACKEND
  const confirmSubmit = async () => {
    setIsSubmitting(true);

    const payload = {
      turno: turno.value,
      timestampHour: hour.value,
      telemetry: readings,
      observaciones,
      metadata: sgcConfig, // Se inyecta la cabecera ISO al registro
    };

    try {
      const response = await api.post(
        `${MAINTENANCE_API_URL}/api/cuarto-frio-5`,
        payload,
      );

      if (response.data.success) {
        if (addAlert) {
          addAlert(
            'success',
            `Lecturas del CF#5 a las ${hour.value} guardadas exitosamente bajo la Norma ${sgcConfig.codigo_documento}.`,
          );
        }
        setIsConfirmModalVisible(false);
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

  const nivelAceiteValue =
    readings['nivel_aceite'] !== undefined ? readings['nivel_aceite'] : 'OK';
  const apagadoresValue =
    readings['apagadores_encendidos'] !== undefined
      ? readings['apagadores_encendidos']
        ? 'SI'
        : 'NO'
      : 'SI';

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
            { text: 'Telemetría Operativa', href: '#' },
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
                      Descartar
                    </Button>
                    <Button variant="primary" onClick={handlePreSubmit}>
                      Firma y Registro Horario
                    </Button>
                  </SpaceBetween>
                }
                errorText={
                  showErrorAlert
                    ? 'Verifique los parámetros resaltados en rojo. Corrija las anomalías antes de firmar el documento.'
                    : null
                }
              >
                <SpaceBetween size="l">
                  <Header
                    variant="h1"
                    description={`Formato SGC No. ${sgcConfig.codigo_documento} | Versión: ${sgcConfig.version}. Use la letra 'D' en evaporadores en ciclo de deshielo.`}
                    actions={
                      <Box color="text-status-inactive">
                        Rev: {sgcConfig.fecha_revision}
                      </Box>
                    }
                  >
                    Bitácora: Sala de Compresores Cuarto Frío #5
                  </Header>

                  {/* 1. CONTEXTO DE HORA Y TURNO */}
                  <Container
                    header={<Header variant="h2">Hora de Lectura</Header>}
                  >
                    <ColumnLayout columns={2}>
                      <FormField label="Turno de Operación">
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
                      <FormField label="Hora (Intervalos de 1 Hr)">
                        <Select
                          selectedOption={hour}
                          onChange={({ detail }) =>
                            setHour(detail.selectedOption as any)
                          }
                          options={generateHourOptions()}
                        />
                      </FormField>
                    </ColumnLayout>
                  </Container>

                  {/* 2. PARÁMETROS DEL SISTEMA (PRESIONES Y NIVELES) */}
                  <Container
                    header={
                      <Header variant="h2">
                        Parámetros de Sala de Compresores
                      </Header>
                    }
                  >
                    <SpaceBetween size="l">
                      <ColumnLayout columns={4} variant="text-grid">
                        {SCHEMA.parametrosSistema.map((metric) => (
                          <FormField
                            key={metric.id}
                            label={`${metric.label} (${metric.unit})`}
                            description={metric.desc}
                            errorText={getValidationError(
                              metric,
                              readings[metric.id],
                            )}
                          >
                            <Input
                              type="number"
                              step="any"
                              placeholder="0.00"
                              value={
                                readings[metric.id] !== undefined
                                  ? readings[metric.id]
                                  : ''
                              }
                              onChange={({ detail }) =>
                                handleInputChange(metric.id, detail.value)
                              }
                            />
                          </FormField>
                        ))}
                      </ColumnLayout>

                      <div
                        style={{
                          borderTop: '1px solid #eaeded',
                          paddingTop: '16px',
                        }}
                      >
                        <Grid
                          gridDefinition={[{ colspan: { default: 12, s: 6 } }]}
                        >
                          <FormField
                            label="Revisión de Nivel de Aceite (5 Compresores)"
                            description="Si están de la mitad a tres cuartos reporte OK, en caso contrario reporte 'X' y anote en observaciones."
                          >
                            <SegmentedControl
                              selectedId={nivelAceiteValue}
                              onChange={({ detail }) =>
                                handleInputChange(
                                  'nivel_aceite',
                                  detail.selectedId,
                                )
                              }
                              options={[
                                { text: '✓ OK (Niveles Óptimos)', id: 'OK' },
                                { text: '✕ X (Revisar Niveles)', id: 'X' },
                              ]}
                            />
                          </FormField>
                        </Grid>
                      </div>
                    </SpaceBetween>
                  </Container>

                  {/* 3. TEMPERATURAS DE EVAPORADORES */}
                  <Container
                    header={
                      <Header variant="h2">Temperaturas de Evaporadores</Header>
                    }
                  >
                    <Box margin={{ bottom: 'm' }}>
                      <Alert type="info" header="Instrucción de Deshielo">
                        Si el evaporador está en ciclo de deshielo, escriba la
                        letra <strong>D</strong> en lugar de la temperatura. Los
                        horarios programados están indicados debajo de cada
                        campo.
                      </Alert>
                    </Box>
                    <Grid
                      gridDefinition={Array(8).fill({
                        colspan: { default: 12, s: 3 },
                      })}
                    >
                      {SCHEMA.evaporadores.map((evap) => (
                        <div key={evap.id} style={{ marginBottom: '16px' }}>
                          <FormField
                            label={evap.label}
                            description={evap.desc}
                            errorText={getValidationError(
                              evap,
                              readings[evap.id],
                            )}
                          >
                            <Input
                              type="text"
                              placeholder="Ej. 1.5 o D"
                              value={
                                readings[evap.id] !== undefined
                                  ? readings[evap.id]
                                  : ''
                              }
                              onChange={({ detail }) =>
                                handleInputChange(evap.id, detail.value)
                              }
                            />
                          </FormField>
                        </div>
                      ))}
                    </Grid>
                  </Container>

                  {/* 4. TEMPERATURAS DE CUARTO Y AMBIENTE */}
                  <Container
                    header={
                      <Header variant="h2">Temperaturas Interiores</Header>
                    }
                  >
                    <Box margin={{ bottom: 'm' }}>
                      <Alert type="warning">
                        La temperatura del cuarto debe ser leída exclusivamente
                        en los termómetros interiores. (Rango esperado: 0 a
                        3°C).
                      </Alert>
                    </Box>
                    <ColumnLayout columns={4} variant="text-grid">
                      {SCHEMA.temperaturasAmbiente.map((temp) => (
                        <FormField
                          key={temp.id}
                          label={temp.label}
                          description={temp.desc}
                          errorText={getValidationError(
                            temp,
                            readings[temp.id],
                          )}
                        >
                          <Input
                            type="number"
                            step="any"
                            placeholder="0.00"
                            value={
                              readings[temp.id] !== undefined
                                ? readings[temp.id]
                                : ''
                            }
                            onChange={({ detail }) =>
                              handleInputChange(temp.id, detail.value)
                            }
                          />
                        </FormField>
                      ))}
                    </ColumnLayout>
                  </Container>

                  {/* 5. VALIDACIÓN FINAL Y OBSERVACIONES */}
                  <Grid
                    gridDefinition={[
                      { colspan: { default: 12, m: 5 } },
                      { colspan: { default: 12, m: 7 } },
                    ]}
                  >
                    <Container
                      header={
                        <Header variant="h3">Validación de Apagadores</Header>
                      }
                    >
                      <FormField description="Revisa que los apagadores manuales de los difusores y compresores estén encendidos.">
                        <SegmentedControl
                          selectedId={apagadoresValue}
                          onChange={({ detail }) =>
                            handleInputChange(
                              'apagadores_encendidos',
                              detail.selectedId === 'SI',
                            )
                          }
                          options={[
                            { text: 'Sí, encendidos', id: 'SI' },
                            { text: 'No (Reportar)', id: 'NO' },
                          ]}
                        />
                      </FormField>
                    </Container>

                    <Container
                      header={
                        <Header variant="h3">
                          Observaciones (Reporte al Reverso)
                        </Header>
                      }
                    >
                      <FormField>
                        <Textarea
                          value={observaciones}
                          onChange={({ detail }) =>
                            setObservaciones(detail.value)
                          }
                          placeholder="Si marcó 'X' en niveles de aceite, 'No' en apagadores, o hay otra anomalía, descríbalo aquí..."
                          rows={3}
                        />
                      </FormField>
                    </Container>
                  </Grid>
                </SpaceBetween>
              </Form>
            </form>
          </div>
        }
      />
      <Footer />

      {/* MODAL CONFIRMACION SGC */}
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
          Está a punto de registrar la telemetría del Cuarto Frío #5 a las{' '}
          <b>{hour.label} hrs</b> (<b>{turno.label}</b>).
        </Box>
        <Box variant="p" color="text-status-info">
          <i>
            Este documento se auditará bajo el estándar{' '}
            <b>{sgcConfig.estandar_calidad}</b>, Propietario:{' '}
            <b>{sgcConfig.propietario}</b>.
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
