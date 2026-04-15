import { useState, useEffect, useMemo } from 'react';
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
  Checkbox,
  SegmentedControl,
} from '@cloudscape-design/components';

import Navbar from '@/components/layouts/AppHeader';
import GlobalSidebar from '@/components/layouts/AppSidebar';
import SecondaryHeader from '@/components/layouts/BreadcrumbNavBar';
import { Footer } from '@/components/layouts/AppFooter';

// --- TIPOS DE DATOS ---
// Definimos la interfaz localmente para evitar errores de importación con el empaquetador
interface SelectOption {
  label: string;
  value: string;
}

interface BoilerOption extends SelectOption {
  value: 'cerrey' | 'cleaver' | 'myrggo';
}

// Opciones de calderas disponibles
const BOILER_OPTIONS: BoilerOption[] = [
  { label: 'Ce-rrey', value: 'cerrey' },
  { label: 'Cleaver', value: 'cleaver' },
  { label: 'Myrggo', value: 'myrggo' },
];

// --- ESQUEMA DINÁMICO ---
const generateVaporSchema = (boiler: BoilerOption['value']) => {
  let presComb = { min: 0, max: 0, desc: '' };
  let lbsAire = { min: 0, max: 0, desc: '' };
  let tempComb = { min: 0, max: 0, desc: '' };

  switch (boiler) {
    case 'cerrey':
      presComb = { min: 4, max: 6, desc: 'Rango esperado: 4 a 6 PSI' };
      lbsAire = { min: 10, max: 20, desc: 'Rango esperado: 10 a 20 LBS' };
      tempComb = { min: 90, max: 130, desc: 'Rango esperado: 90 a 130 °C' };
      break;
    case 'cleaver':
      presComb = { min: 4, max: 6, desc: 'Rango esperado: 4 a 6 PSI' };
      lbsAire = { min: 15, max: 25, desc: 'Rango esperado: 15 a 25 LBS' };
      tempComb = { min: 110, max: 130, desc: 'Rango esperado: 110 a 130 °C' };
      break;
    case 'myrggo':
      presComb = { min: 1.5, max: 2, desc: 'Rango esperado: 1.5 a 2 PSI' };
      lbsAire = { min: 20, max: 35, desc: 'Rango esperado: 20 a 35 LBS' };
      tempComb = { min: 90, max: 130, desc: 'Rango esperado: 90 a 130 °C' };
      break;
  }

  return {
    numericGroups: [
      {
        title: 'Presiones y Flujos',
        fields: [
          {
            id: 'pres_comb',
            label: 'Presión en Comb.',
            unit: 'PSI',
            ...presComb,
          },
          {
            id: 'kg_vapor',
            label: 'Presión Vapor',
            unit: 'Kg',
            min: 7.0,
            max: 8.5,
            desc: 'Rango esperado: 7 a 8.5 Kg',
          },
          { id: 'lbs_aire', label: 'LBS Aire', unit: 'LBS', ...lbsAire },
        ],
      },
      {
        title: 'Temperaturas (°C)',
        fields: [
          {
            id: 'temp_comb',
            label: 'Temp. Combustóleo',
            unit: '°C',
            ...tempComb,
          },
          {
            id: 'temp_tdia',
            label: 'Temp. Tanque Día',
            unit: '°C',
            min: 60,
            max: 120,
            desc: 'Rango esperado: 60 a 120 °C',
          },
          {
            id: 'temp_gases',
            label: 'Temp. Gases',
            unit: '°C',
            min: 100,
            max: 250,
            desc: 'Rango esperado: 100 a 250 °C',
          },
          {
            id: 'temp_agua',
            label: 'Temp. Agua',
            unit: '°C',
            min: 80,
            max: 120,
            desc: 'Rango esperado: 80 a 120 °C',
          },
        ],
      },
    ],
    operationalModes: [
      {
        id: 'tipo_operacion',
        label: 'Operación del Quemador',
        options: [
          { id: 'COMB', text: 'Combustóleo' },
          { id: 'DIESEL', text: 'Diésel' },
        ],
      },
      {
        id: 'tipo_agua',
        label: 'Alimentación de Agua',
        options: [
          { id: 'SUAVE', text: 'Agua Suave' },
          { id: 'CRUDA', text: 'Agua Cruda' },
        ],
      },
    ],
    checks: [
      {
        id: 'rev_nivel_tanque',
        label: 'Revisar Nivel de Combustóleo en Tanque de Día',
      },
      { id: 'rev_seguridad', label: 'Revisar Dispositivos de Seguridad' },
      { id: 'rev_bomba_agua', label: 'Revisar Bomba de Alimentación de Agua' },
      { id: 'columna_agua', label: 'Columna de Agua' },
      { id: 'purga_fondo', label: 'Purga de Fondo' },
    ],
  };
};

const generateHourOptions = (): SelectOption[] => {
  const options: SelectOption[] = [];
  for (let i = 0; i < 24; i++) {
    const hourString = i.toString().padStart(2, '0') + ':00';
    options.push({ label: hourString, value: hourString });
  }
  return options;
};

export default function CentralVaporEntry() {
  const [navigationOpen, setNavigationOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [hour, setHour] = useState<SelectOption>({
    label: '08:00',
    value: '08:00',
  });
  const [selectedBoiler, setSelectedBoiler] = useState<BoilerOption>(
    BOILER_OPTIONS[0],
  );

  const currentSchema = useMemo(
    () => generateVaporSchema(selectedBoiler.value),
    [selectedBoiler],
  );
  const [readings, setReadings] = useState<Record<string, any>>({});

  useEffect(() => {
    const initialReadings: Record<string, any> = {};

    currentSchema.numericGroups.forEach((group) => {
      group.fields.forEach((field) => {
        initialReadings[field.id] = '';
      });
    });

    currentSchema.operationalModes.forEach((mode) => {
      initialReadings[mode.id] = mode.options[0].id;
    });

    currentSchema.checks.forEach((check) => {
      initialReadings[check.id] = false;
    });

    setReadings(initialReadings);
  }, [hour.value, selectedBoiler.value, currentSchema]);

  const handleInputChange = (id: string, value: any) => {
    setReadings((prev) => ({ ...prev, [id]: value }));
  };

  const getValidationError = (metric: any, value: any) => {
    if (value === '' || value === undefined) return null;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'Debe ser un número válido.';
    if (metric.min !== undefined && numValue < metric.min)
      return `Mínimo aceptado: ${metric.min}`;
    if (metric.max !== undefined && numValue > metric.max)
      return `Máximo aceptado: ${metric.max}`;
    return null;
  };

  // FIX: Cambiado de (e?: React.FormEvent) a (e?: any) para aceptar eventos tanto de Form como de Button
  const handleSubmit = (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      assetId: selectedBoiler.value,
      timestampHour: hour.value,
      telemetry: readings,
    };

    console.log('Payload estructurado para BD:', payload);

    setTimeout(() => {
      setIsSubmitting(false);
      alert(
        `Bitácora de la caldera ${selectedBoiler.label} (${hour.value}) guardada correctamente.`,
      );
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
            { text: 'Central de Vapor', href: '#' },
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
                      Guardar Registro
                    </Button>
                  </SpaceBetween>
                }
              >
                <SpaceBetween size="l">
                  <Header
                    variant="h1"
                    description="Capture los parámetros de operación de acuerdo a los límites establecidos por máquina."
                  >
                    Bitácora Central de Vapor
                  </Header>

                  <Container
                    header={<Header variant="h2">Contexto del Registro</Header>}
                  >
                    <ColumnLayout columns={2}>
                      <FormField
                        label="Máquina / Caldera"
                        description="Seleccione la caldera a inspeccionar"
                      >
                        <Select
                          selectedOption={selectedBoiler}
                          onChange={({ detail }) =>
                            setSelectedBoiler(
                              detail.selectedOption as BoilerOption,
                            )
                          }
                          options={BOILER_OPTIONS}
                        />
                      </FormField>

                      <FormField
                        label="Hora de Corte"
                        description="Horario correspondiente a la lectura"
                      >
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

                  {currentSchema.numericGroups.map((group, index) => (
                    <Container
                      key={index}
                      header={<Header variant="h2">{group.title}</Header>}
                    >
                      <ColumnLayout
                        columns={group.fields.length > 3 ? 4 : 3}
                        variant="text-grid"
                      >
                        {group.fields.map((field) => (
                          <FormField
                            key={field.id}
                            label={`${field.label} (${field.unit})`}
                            description={field.desc}
                            errorText={getValidationError(
                              field,
                              readings[field.id],
                            )}
                          >
                            <Input
                              type="number"
                              step="any"
                              value={
                                readings[field.id] !== undefined
                                  ? readings[field.id]
                                  : ''
                              }
                              onChange={({ detail }) =>
                                handleInputChange(field.id, detail.value)
                              }
                              placeholder="0.00"
                            />
                          </FormField>
                        ))}
                      </ColumnLayout>
                    </Container>
                  ))}

                  <Container
                    header={<Header variant="h2">Estados de Operación</Header>}
                  >
                    <ColumnLayout columns={2}>
                      {currentSchema.operationalModes.map((mode) => (
                        <FormField key={mode.id} label={mode.label}>
                          <SegmentedControl
                            selectedId={readings[mode.id]}
                            onChange={({ detail }) =>
                              handleInputChange(mode.id, detail.selectedId)
                            }
                            options={mode.options}
                          />
                        </FormField>
                      ))}
                    </ColumnLayout>
                  </Container>

                  <Container
                    header={<Header variant="h2">Revisiones de Rutina</Header>}
                  >
                    <Alert
                      statusIconAriaLabel="Info"
                      type="info"
                      header="Confirmación Visual"
                    >
                      Confirme únicamente las tareas ejecutadas o validadas en
                      esta hora de operación.
                    </Alert>
                    <Box margin={{ top: 'l' }}>
                      <Grid
                        gridDefinition={[
                          { colspan: { default: 12, s: 6 } },
                          { colspan: { default: 12, s: 6 } },
                        ]}
                      >
                        {currentSchema.checks.map((check) => (
                          <div key={check.id} style={{ marginBottom: '16px' }}>
                            <Checkbox
                              onChange={({ detail }) =>
                                handleInputChange(check.id, detail.checked)
                              }
                              checked={readings[check.id] || false}
                            >
                              <span
                                style={{ fontSize: '14px', fontWeight: '500' }}
                              >
                                {check.label}
                              </span>
                            </Checkbox>
                          </div>
                        ))}
                      </Grid>
                    </Box>
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
