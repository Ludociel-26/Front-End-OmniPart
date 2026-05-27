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
  Alert,
  SegmentedControl,
  Textarea,
  Modal,
  Flashbar,
  Grid,
} from '@cloudscape-design/components';

import { AppContent } from '@/context/AppContext';
import Navbar from '@/components/layouts/AppHeader';
import GlobalSidebar from '@/components/layouts/AppSidebar';
import SecondaryHeader from '@/components/layouts/BreadcrumbNavBar';
import { Footer } from '@/components/layouts/AppFooter';

const MAINTENANCE_API_URL =
  import.meta.env.VITE_MAINTENANCE_API_URL || 'http://localhost:4001';

// --- ESQUEMA MAESTRO: BITÁCORA COMPRESOR DE AIRE ---
const COMPRESSOR_SCHEMA = {
  tempLecturas: [1, 2, 3, 4, 5, 6, 7],
  tempFinales: [
    { id: 'temp_sull', label: 'Temperatura Sull', unit: '°C', max: 95 },
    { id: 'temp_gd', label: 'Temperatura GD', unit: '°C', max: 95 },
  ],
  presLecturas: [1, 2, 3, 4, 5, 6, 7],
  presFinales: [
    { id: 'pres_sull', label: 'Presión Sull', unit: 'PSI', min: 100, max: 120 },
    { id: 'pres_gd', label: 'Presión GD', unit: 'PSI', min: 100, max: 120 },
  ],
  visualChecks: [
    {
      id: 'fuga_aire',
      label: 'Fuga de Aire',
      options: [
        { id: 'NO', text: 'Sin Fugas' },
        { id: 'SI', text: 'Fuga Detectada' },
      ],
    },
    {
      id: 'fuga_aceite',
      label: 'Fuga de Aceite',
      options: [
        { id: 'NO', text: 'Sin Fugas' },
        { id: 'SI', text: 'Fuga Detectada' },
      ],
    },
    {
      id: 'ruido_extrano',
      label: 'Ruidos Extraños',
      options: [
        { id: 'NO', text: 'Operación Normal' },
        { id: 'SI', text: 'Ruido Anormal' },
      ],
    },
    {
      id: 'purga_test',
      label: 'Purga de Aire',
      options: [
        { id: 'OFF', text: 'OFF' },
        { id: 'ON', text: 'TEST ON' },
      ],
    },
    {
      id: 'mirilla_filtro',
      label: 'Mirilla Nivel Filtro Purga',
      options: [
        { id: 'LLENO', text: 'Lleno' },
        { id: 'VACIO', text: 'Vacío' },
      ],
    },
  ],
  cierreTurno: [
    { id: 'horas_sull', label: 'Horas Trabajadas (Sull)', unit: 'Hrs' },
    { id: 'horas_gd', label: 'Horas Trabajadas (GD)', unit: 'Hrs' },
  ],
};

const generateBiHourlyOptions = () => {
  const options = [];
  for (let i = 0; i < 24; i += 2) {
    const hourString = i.toString().padStart(2, '0') + ':00';
    options.push({ label: hourString, value: hourString });
  }
  return options;
};

export default function AirCompressorEntry() {
  const { alerts, addAlert } = useContext(AppContent) || {};

  const [navigationOpen, setNavigationOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  // Estados Base
  const [hour, setHour] = useState<any>({ label: '06:00', value: '06:00' });
  const [turno, setTurno] = useState<any>({ label: 'Turno A', value: 'A' });
  const [observaciones, setObservaciones] = useState('');
  const [readings, setReadings] = useState<Record<string, any>>({});

  // ESTADO SGC
  const [sgcConfig, setSgcConfig] = useState<any>({
    codigo_documento: 'Cargando...',
    version: '--',
    fecha_revision: '--',
    propietario: '--',
    aprobador: '--',
    estandar_calidad: '--',
  });

  // 1. CARGAR PLANTILLA SGC AL INICIAR
  useEffect(() => {
    const loadActiveConfigs = async () => {
      try {
        const res = await api.get(
          `${MAINTENANCE_API_URL}/api/document-configs`,
        );
        if (res.data.success) {
          const config = res.data.data.find(
            (c: any) => c.area_key === 'bitacora_compresor_aire',
          );
          if (config) setSgcConfig(config);
        }
      } catch (e) {
        if (addAlert) addAlert('error', 'Fallo al sincronizar SGC ISO.');
      }
    };
    loadActiveConfigs();
  }, []);

  // 2. INICIALIZAR LECTURAS
  useEffect(() => {
    const initialReadings: Record<string, any> = {};
    COMPRESSOR_SCHEMA.tempLecturas.forEach(
      (num) => (initialReadings[`temp_lec_${num}`] = ''),
    );
    COMPRESSOR_SCHEMA.presLecturas.forEach(
      (num) => (initialReadings[`pres_lec_${num}`] = ''),
    );
    COMPRESSOR_SCHEMA.tempFinales.forEach(
      (metric) => (initialReadings[metric.id] = ''),
    );
    COMPRESSOR_SCHEMA.presFinales.forEach(
      (metric) => (initialReadings[metric.id] = ''),
    );
    COMPRESSOR_SCHEMA.visualChecks.forEach(
      (check) => (initialReadings[check.id] = check.options[0].id),
    );
    COMPRESSOR_SCHEMA.cierreTurno.forEach(
      (field) => (initialReadings[field.id] = ''),
    );

    setReadings(initialReadings);
    setObservaciones('');
  }, [hour.value]);

  const handleInputChange = (id: string, value: string) => {
    setReadings((prev) => ({ ...prev, [id]: value }));
  };

  const getValidationError = (metric: any, value: any) => {
    if (value === '' || value === undefined) return null;
    const num = parseFloat(value);
    if (isNaN(num)) return 'Inválido';
    if (metric.min !== undefined && num < metric.min)
      return `Min: ${metric.min}`;
    if (metric.max !== undefined && num > metric.max)
      return `Max: ${metric.max}`;
    return null;
  };

  // 3. PRE-SUBMIT: ABRIR MODAL
  const handlePreSubmit = (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsConfirmModalVisible(true);
  };

  // 4. GUARDAR EN LA BD
  const confirmSubmit = async () => {
    setIsSubmitting(true);

    // Mapeamos los datos para que coincidan EXACTAMENTE con el modelo Backend (CompressorReading)
    const formattedReadings = [
      {
        hora: hour.value,
        temp_1: readings.temp_lec_1,
        temp_2: readings.temp_lec_2,
        temp_3: readings.temp_lec_3,
        temp_4: readings.temp_lec_4,
        temp_5: readings.temp_lec_5,
        temp_6: readings.temp_lec_6,
        temp_7: readings.temp_lec_7,
        temp_sull: readings.temp_sull,
        temp_gd: readings.temp_gd,

        pres_1: readings.pres_lec_1,
        pres_2: readings.pres_lec_2,
        pres_3: readings.pres_lec_3,
        pres_4: readings.pres_lec_4,
        pres_5: readings.pres_lec_5,
        pres_6: readings.pres_lec_6,
        pres_7: readings.pres_lec_7,
        pres_sull: readings.pres_sull,
        pres_gd: readings.pres_gd,

        fuga_aire: readings.fuga_aire,
        fuga_aceite: readings.fuga_aceite,
        purga_test: readings.purga_test,
        mirilla: readings.mirilla_filtro,
        ruido: readings.ruido_extrano,
      },
    ];

    const payload = {
      turno: turno.value,
      readings: formattedReadings,
      globales: {
        horas_sull: readings.horas_sull,
        horas_gd: readings.horas_gd,
        observaciones: observaciones,
      },
      metadata: sgcConfig,
    };

    try {
      const response = await api.post(
        `${MAINTENANCE_API_URL}/api/compresores`,
        payload,
      );

      if (response.data.success) {
        if (addAlert)
          addAlert(
            'success',
            `Bitácora de las ${hour.value} hrs guardada correctamente.`,
          );
        setIsConfirmModalVisible(false);
      }
    } catch (e: any) {
      if (addAlert)
        addAlert(
          'error',
          e.response?.data?.message || 'Error de conexión con el servidor.',
        );
      setIsConfirmModalVisible(false);
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
            { text: 'Telemetría', href: '#' },
            { text: 'Compresor de Aire', href: '#' },
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
                      Firma y Registro
                    </Button>
                  </SpaceBetween>
                }
              >
                <SpaceBetween size="l">
                  {/* CABECERA SGC */}
                  <Header
                    variant="h1"
                    description={`Formato SGC No. ${sgcConfig.codigo_documento} | Versión: ${sgcConfig.version}`}
                    actions={
                      <Box color="text-status-inactive">
                        Rev: {sgcConfig.fecha_revision}
                      </Box>
                    }
                  >
                    Bitácora Compresor de Aire
                  </Header>

                  <Container
                    header={<Header variant="h2">Contexto Operativo</Header>}
                  >
                    <ColumnLayout columns={2}>
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
                      <FormField label="Hora de Lectura (Intervalo de 2 hrs)">
                        <Select
                          selectedOption={hour}
                          onChange={({ detail }) =>
                            setHour(detail.selectedOption as any)
                          }
                          options={generateBiHourlyOptions()}
                        />
                      </FormField>
                    </ColumnLayout>
                  </Container>

                  {/* 1. CONTENEDOR DE TEMPERATURAS */}
                  <Container
                    header={
                      <Header variant="h2">
                        Temperaturas de Operación (°C)
                      </Header>
                    }
                  >
                    <SpaceBetween size="l">
                      <div>
                        <Box
                          variant={'awsui-key-label' as any}
                          margin={{ bottom: 'xs' }}
                        >
                          Registros de Temperatura (1 al 7)
                        </Box>
                        <ColumnLayout columns={7}>
                          {COMPRESSOR_SCHEMA.tempLecturas.map((num) => (
                            <FormField
                              key={`t_lec_${num}`}
                              label={`Lec ${num}`}
                            >
                              <Input
                                type="number"
                                step="any"
                                placeholder="-"
                                value={
                                  readings[`temp_lec_${num}`] !== undefined
                                    ? readings[`temp_lec_${num}`]
                                    : ''
                                }
                                onChange={({ detail }) =>
                                  handleInputChange(
                                    `temp_lec_${num}`,
                                    detail.value,
                                  )
                                }
                              />
                            </FormField>
                          ))}
                        </ColumnLayout>
                      </div>

                      <div
                        style={{
                          borderTop: '1px solid #eaeded',
                          paddingTop: '16px',
                        }}
                      >
                        <Box
                          variant={'awsui-key-label' as any}
                          margin={{ bottom: 'xs' }}
                        >
                          Registro Final por Equipo
                        </Box>
                        <ColumnLayout columns={2}>
                          {COMPRESSOR_SCHEMA.tempFinales.map((metric) => (
                            <FormField
                              key={metric.id}
                              label={`${metric.label}`}
                              description={`Máximo ${metric.max}°C`}
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
                      </div>
                    </SpaceBetween>
                  </Container>

                  {/* 2. CONTENEDOR DE PRESIONES */}
                  <Container
                    header={<Header variant="h2">Presión de Aire (PSI)</Header>}
                  >
                    <SpaceBetween size="l">
                      <div>
                        <Box
                          variant={'awsui-key-label' as any}
                          margin={{ bottom: 'xs' }}
                        >
                          Registros de Presión (1 al 7)
                        </Box>
                        <ColumnLayout columns={7}>
                          {COMPRESSOR_SCHEMA.presLecturas.map((num) => (
                            <FormField
                              key={`p_lec_${num}`}
                              label={`Lec ${num}`}
                            >
                              <Input
                                type="number"
                                step="any"
                                placeholder="-"
                                value={
                                  readings[`pres_lec_${num}`] !== undefined
                                    ? readings[`pres_lec_${num}`]
                                    : ''
                                }
                                onChange={({ detail }) =>
                                  handleInputChange(
                                    `pres_lec_${num}`,
                                    detail.value,
                                  )
                                }
                              />
                            </FormField>
                          ))}
                        </ColumnLayout>
                      </div>

                      <div
                        style={{
                          borderTop: '1px solid #eaeded',
                          paddingTop: '16px',
                        }}
                      >
                        <Box
                          variant={'awsui-key-label' as any}
                          margin={{ bottom: 'xs' }}
                        >
                          Registro Final por Equipo
                        </Box>
                        <ColumnLayout columns={2}>
                          {COMPRESSOR_SCHEMA.presFinales.map((metric) => (
                            <FormField
                              key={metric.id}
                              label={`${metric.label}`}
                              description={`Rango: ${metric.min} - ${metric.max} PSI`}
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
                      </div>
                    </SpaceBetween>
                  </Container>

                  {/* 3. INSPECCIÓN Y PURGAS */}
                  <Container
                    header={
                      <Header variant="h2">Inspección de Fugas y Purgas</Header>
                    }
                  >
                    <ColumnLayout columns={3} variant="text-grid">
                      {COMPRESSOR_SCHEMA.visualChecks.map((check) => (
                        <FormField key={check.id} label={check.label}>
                          <SegmentedControl
                            selectedId={readings[check.id]}
                            onChange={({ detail }) =>
                              handleInputChange(check.id, detail.selectedId)
                            }
                            options={check.options}
                          />
                        </FormField>
                      ))}
                    </ColumnLayout>
                  </Container>

                  {/* 4. CIERRE DE TURNO */}
                  <Container
                    header={<Header variant="h2">Horas Trabajadas</Header>}
                  >
                    <Box margin={{ bottom: 'm' }}>
                      <Alert type="warning">
                        Las horas trabajadas se tomarán al final del turno "C".
                        Si no es su turno, deje esto en blanco.
                      </Alert>
                    </Box>
                    <ColumnLayout columns={2}>
                      {COMPRESSOR_SCHEMA.cierreTurno.map((field) => (
                        <FormField
                          key={field.id}
                          label={`${field.label} (${field.unit})`}
                        >
                          <Input
                            type="number"
                            step="any"
                            placeholder="Ej. 12500"
                            value={
                              readings[field.id] !== undefined
                                ? readings[field.id]
                                : ''
                            }
                            onChange={({ detail }) =>
                              handleInputChange(field.id, detail.value)
                            }
                          />
                        </FormField>
                      ))}
                    </ColumnLayout>
                  </Container>

                  {/* 5. OBSERVACIONES */}
                  <Container
                    header={<Header variant="h2">Observaciones</Header>}
                  >
                    <FormField label="Comentarios">
                      <Textarea
                        value={observaciones}
                        onChange={({ detail }) =>
                          setObservaciones(detail.value)
                        }
                        placeholder="Registre cualquier anomalía del bloque..."
                        rows={2}
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

      {/* MODAL DE CONFIRMACIÓN SGC */}
      <Modal
        onDismiss={() => setIsConfirmModalVisible(false)}
        visible={isConfirmModalVisible}
        closeAriaLabel="Cerrar"
        header="Firma Oficial de Bitácora"
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
          Está a punto de insertar la telemetría de las <b>{hour.label} hrs</b>{' '}
          correspondiente al <b>{turno.label}</b>.
        </Box>
        <Box variant="p" color="text-status-info">
          <i>
            Este documento se auditará bajo el estándar de{' '}
            <b>{sgcConfig.estandar_calidad}</b>.
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
