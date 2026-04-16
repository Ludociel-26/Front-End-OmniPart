import { useState, useEffect } from 'react';
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
} from '@cloudscape-design/components';

import Navbar from '@/components/layouts/AppHeader';
import GlobalSidebar from '@/components/layouts/AppSidebar';
import SecondaryHeader from '@/components/layouts/BreadcrumbNavBar';
import { Footer } from '@/components/layouts/AppFooter';

// --- TIPOS DE DATOS LOCALES ---
interface SelectOption {
  label: string;
  value: string;
}

// --- ESQUEMA MAESTRO: CONGELADOS (Versión 6.0 - Actualizado) ---
const SCHEMA = {
  compresores: [1, 2, 3],
  metricasCompresor: [
    {
      id: 'pres_succ',
      label: 'Presión Succión',
      unit: 'Psig',
      desc: '-4 In Hg a 2 Psig',
      min: -4,
      max: 2,
    },
    {
      id: 'pres_aceite_1',
      label: 'Presión Aceite 1',
      unit: 'Psig',
      desc: '180 a 250',
      min: 180,
      max: 250,
    },
    {
      id: 'pres_aceite_2',
      label: 'Presión Aceite 2',
      unit: 'Psig',
      desc: '180 a 250',
      min: 180,
      max: 250,
    },
    {
      id: 'pres_desc',
      label: 'Presión Descarga',
      unit: 'Psig',
      desc: '150 a 200',
      min: 150,
      max: 200,
    },
    {
      id: 'voltaje',
      label: 'Voltaje',
      unit: 'Volts',
      desc: '440 a 480',
      min: 440,
      max: 480,
    },
    {
      id: 'ampers',
      label: 'Ampers',
      unit: 'Amp',
      desc: '250 a 330',
      min: 250,
      max: 330,
    },
    {
      id: 'sv',
      label: 'SV%',
      unit: '%',
      desc: '20 a 100 %',
      min: 20,
      max: 100,
    },
    {
      id: 'temp_motor',
      label: 'Temperatura de Motor principal',
      unit: '°C',
      desc: '40 a 80 °C',
      min: 40,
      max: 80,
    },
  ],
  datosTurnoCompresor: [
    {
      id: 'nivel_aceite',
      label: 'Nivel Aceite',
      unit: 'Mirillas', // Se añade dinámicamente en el renderizado
      desc: '2 a 2.5',
      min: 2,
      max: 2.5,
    },
    { id: 'horas_motor', label: 'Inicio Horas (Motor)', unit: 'Hrs' },
    { id: 'horas_compresor', label: 'Inicio Horas (Compresor)', unit: 'Hrs' },
  ],
  temperaturasArea: [
    {
      id: 'frio_4',
      label: '4-Frio',
      desc: 'Rango: -26, -22, -18',
      min: -26,
      max: -18,
    },
    {
      id: 'frio_3',
      label: '3-Frio',
      desc: 'Rango: -26, -22, -18',
      min: -26,
      max: -18,
    },
    { id: 'ref_2', label: '2-Ref.', desc: 'Rango: 0, 2, 3', min: 0, max: 3 },
    { id: 'seco_1', label: '1-Seco', desc: 'Rango: 0, 2, 3', min: 0, max: 3 },
  ],
  datosProceso: [
    {
      id: 'tiempo_deshielo',
      label: 'Tiempo de deshielo I.Q.F.',
      unit: 'Minutos',
      type: 'number',
    },
    { id: 'producto_congelar', label: 'Producto a congelar', type: 'text' },
  ],
};

const generateHourOptions = (): SelectOption[] => {
  const options: SelectOption[] = [];
  for (let i = 0; i < 24; i++) {
    const hourString = i.toString().padStart(2, '0') + ':00';
    options.push({ label: hourString, value: hourString });
  }
  return options;
};

export default function CongeladosTelemetryEntry() {
  const [navigationOpen, setNavigationOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [turno, setTurno] = useState<SelectOption>({
    label: 'Turno A',
    value: 'A',
  });
  const [hour, setHour] = useState<SelectOption>({
    label: '07:00',
    value: '07:00',
  });
  const [observaciones, setObservaciones] = useState('');

  const [readings, setReadings] = useState<Record<string, any>>({});

  useEffect(() => {
    const initialReadings: Record<string, any> = {};

    SCHEMA.compresores.forEach((num) => {
      SCHEMA.metricasCompresor.forEach((metric) => {
        initialReadings[`c${num}_${metric.id}`] = '';
      });
      SCHEMA.datosTurnoCompresor.forEach((metric) => {
        initialReadings[`c${num}_${metric.id}`] = '';
      });
    });

    SCHEMA.temperaturasArea.forEach((temp) => {
      initialReadings[temp.id] = '';
    });
    SCHEMA.datosProceso.forEach((proceso) => {
      initialReadings[proceso.id] = '';
    });

    setReadings(initialReadings);
    setObservaciones('');
  }, [hour.value, turno.value]);

  const handleInputChange = (id: string, value: any) => {
    setReadings((prev) => ({ ...prev, [id]: value }));
  };

  const getValidationError = (metric: any, value: any) => {
    if (value === '' || value === undefined) return null;

    if (metric.min === undefined && metric.max === undefined) return null;

    const num = parseFloat(value);
    if (isNaN(num)) return 'Debe ser un número';
    if (metric.min !== undefined && num < metric.min)
      return `Mín: ${metric.min}`;
    if (metric.max !== undefined && num > metric.max)
      return `Máx: ${metric.max}`;
    return null;
  };

  const handleSubmit = (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      assetArea: 'division_congelados',
      turno: turno.value,
      timestampHour: hour.value,
      telemetry: {
        compresores: SCHEMA.compresores.map((num) => ({
          id: num,
          lecturas: SCHEMA.metricasCompresor.reduce(
            (acc, m) => ({ ...acc, [m.id]: readings[`c${num}_${m.id}`] }),
            {},
          ),
          cierre: SCHEMA.datosTurnoCompresor.reduce(
            (acc, m) => ({ ...acc, [m.id]: readings[`c${num}_${m.id}`] }),
            {},
          ),
        })),
        temperaturas: SCHEMA.temperaturasArea.reduce(
          (acc, cf) => ({ ...acc, [cf.id]: readings[cf.id] }),
          {},
        ),
        proceso: SCHEMA.datosProceso.reduce(
          (acc, p) => ({ ...acc, [p.id]: readings[p.id] }),
          {},
        ),
      },
      observaciones,
    };

    console.log('Payload Guardado:', payload);

    setTimeout(() => {
      setIsSubmitting(false);
      alert(`Bitácora de Congelados (${hour.value}) guardada exitosamente.`);
    }, 1200);
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
            { text: 'División Congelados', href: '#' },
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
        content={
          <div style={{ padding: '24px' }}>
            <form onSubmit={handleSubmit}>
              <Form
                actions={
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button formAction="none" variant="link">
                      Descartar
                    </Button>
                    <Button
                      variant="primary"
                      loading={isSubmitting}
                      onClick={handleSubmit}
                    >
                      Guardar Registro Horario
                    </Button>
                  </SpaceBetween>
                }
              >
                <SpaceBetween size="l">
                  <Header
                    variant="h1"
                    description="Reporte Diario de Refrigeración (Formato 2.2-16-3-13 v6.0)"
                  >
                    División Congelados
                  </Header>

                  <Alert type="info" header="Atención Operador">
                    Las filas correspondientes a{' '}
                    <strong>Nivel de Aceite e Inicio de Horas</strong> solo
                    deben llenarse en las columnas aplicables al inicio o cierre
                    de turno.
                  </Alert>

                  {/* 1. CONTEXTO */}
                  <Container
                    header={
                      <Header variant="h2">Datos de Turno y Horario</Header>
                    }
                  >
                    <ColumnLayout columns={2}>
                      <FormField label="Turno Asignado">
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
                      <FormField label="Hora del Reporte">
                        <Select
                          selectedOption={hour}
                          onChange={({ detail }) =>
                            setHour(detail.selectedOption as SelectOption)
                          }
                          options={generateHourOptions()}
                        />
                      </FormField>
                    </ColumnLayout>
                  </Container>

                  {/* 2. COMPRESORES EN PARALELO */}
                  <Grid
                    gridDefinition={[
                      { colspan: { default: 12, xl: 4 } },
                      { colspan: { default: 12, xl: 4 } },
                      { colspan: { default: 12, xl: 4 } },
                    ]}
                  >
                    {SCHEMA.compresores.map((num) => (
                      <Container
                        key={`comp_${num}`}
                        header={<Header variant="h2">Compresor {num}</Header>}
                      >
                        <SpaceBetween size="m">
                          {/* Sección: Parámetros Horarios */}
                          <div
                            style={{
                              backgroundColor: '#fff',
                              padding: '16px',
                              borderRadius: '8px',
                              border: '1px solid #eaeded',
                            }}
                          >
                            <Box
                              variant={'awsui-key-label' as any}
                              margin={{ bottom: 'm' }}
                            >
                              Parámetros en Tiempo Real
                            </Box>
                            <ColumnLayout columns={2}>
                              {SCHEMA.metricasCompresor.map((metric) => {
                                const inputId = `c${num}_${metric.id}`;
                                return (
                                  <FormField
                                    key={inputId}
                                    // FIX: Inyección de la unidad en el label para los parámetros del compresor
                                    label={`${metric.label} ${metric.unit ? `(${metric.unit})` : ''}`}
                                    description={metric.desc}
                                    errorText={getValidationError(
                                      metric,
                                      readings[inputId],
                                    )}
                                  >
                                    <Input
                                      type="number"
                                      step="any"
                                      value={
                                        readings[inputId] !== undefined
                                          ? readings[inputId]
                                          : ''
                                      }
                                      onChange={({ detail }) =>
                                        handleInputChange(inputId, detail.value)
                                      }
                                      placeholder="0"
                                    />
                                  </FormField>
                                );
                              })}
                            </ColumnLayout>
                          </div>

                          {/* Sección: Inicio de Turno */}
                          <div
                            style={{
                              backgroundColor: '#f0f8ff',
                              padding: '16px',
                              borderRadius: '8px',
                              border: '1px solid #0972d3',
                            }}
                          >
                            {/* FIX: Renombrado conceptual para mejor adaptabilidad al formato */}
                            <Box
                              variant={'awsui-key-label' as any}
                              margin={{ bottom: 'm' }}
                            >
                              Parámetros de Inicio de Turno
                            </Box>
                            <ColumnLayout columns={1}>
                              {SCHEMA.datosTurnoCompresor.map((metric) => {
                                const inputId = `c${num}_${metric.id}`;
                                return (
                                  <FormField
                                    key={inputId}
                                    // FIX: Inyección de la unidad en el label (Aquí se mostrará 'Mirillas' y 'Hrs')
                                    label={`${metric.label} ${metric.unit ? `(${metric.unit})` : ''}`}
                                    description={metric.desc}
                                    errorText={getValidationError(
                                      metric,
                                      readings[inputId],
                                    )}
                                  >
                                    <Input
                                      type="number"
                                      step="any"
                                      value={
                                        readings[inputId] !== undefined
                                          ? readings[inputId]
                                          : ''
                                      }
                                      onChange={({ detail }) =>
                                        handleInputChange(inputId, detail.value)
                                      }
                                      placeholder="-"
                                    />
                                  </FormField>
                                );
                              })}
                            </ColumnLayout>
                          </div>
                        </SpaceBetween>
                      </Container>
                    ))}
                  </Grid>

                  {/* 3. TEMPERATURAS Y PROCESO I.Q.F */}
                  <Container
                    header={
                      <Header variant="h2">
                        Temperaturas y Operación I.Q.F.
                      </Header>
                    }
                  >
                    <SpaceBetween size="l">
                      <ColumnLayout columns={4} variant="text-grid">
                        {SCHEMA.temperaturasArea.map((cf) => (
                          <FormField
                            key={cf.id}
                            label={cf.label}
                            description={cf.desc}
                            errorText={getValidationError(cf, readings[cf.id])}
                          >
                            <Input
                              type="number"
                              step="any"
                              value={
                                readings[cf.id] !== undefined
                                  ? readings[cf.id]
                                  : ''
                              }
                              onChange={({ detail }) =>
                                handleInputChange(cf.id, detail.value)
                              }
                              placeholder="°C"
                            />
                          </FormField>
                        ))}
                      </ColumnLayout>
                      <hr
                        style={{ borderTop: '1px solid #eaeded', margin: '0' }}
                      />
                      <ColumnLayout columns={2} variant="text-grid">
                        {SCHEMA.datosProceso.map((proceso) => (
                          <FormField
                            key={proceso.id}
                            label={proceso.label}
                            description={
                              proceso.unit ? `En ${proceso.unit}` : ''
                            }
                          >
                            <Input
                              type={proceso.type as 'text' | 'number'}
                              value={
                                readings[proceso.id] !== undefined
                                  ? readings[proceso.id]
                                  : ''
                              }
                              onChange={({ detail }) =>
                                handleInputChange(proceso.id, detail.value)
                              }
                              placeholder={
                                proceso.type === 'text' ? 'Ej. Brócoli' : '0'
                              }
                            />
                          </FormField>
                        ))}
                      </ColumnLayout>
                    </SpaceBetween>
                  </Container>

                  {/* 4. OBSERVACIONES */}
                  <Container
                    header={<Header variant="h2">Avisos Relevantes</Header>}
                  >
                    <FormField label="Observaciones del Turno">
                      <Textarea
                        value={observaciones}
                        onChange={({ detail }) =>
                          setObservaciones(detail.value)
                        }
                        placeholder="Registre aquí reportes de mantenimiento, purgas o anomalías..."
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
    </div>
  );
}
