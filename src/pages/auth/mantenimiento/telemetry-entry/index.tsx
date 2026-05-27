import { useState, useEffect, useMemo, useContext } from 'react';
import api from '@/services/api'; // Usamos tu instancia protegida
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
  Flashbar,
  Modal,
  Textarea,
} from '@cloudscape-design/components';

import { AppContent } from '@/context/AppContext';
import Navbar from '@/components/layouts/AppHeader';
import GlobalSidebar from '@/components/layouts/AppSidebar';
import SecondaryHeader from '@/components/layouts/BreadcrumbNavBar';
import { Footer } from '@/components/layouts/AppFooter';

const MAINTENANCE_API_URL =
  import.meta.env.VITE_MAINTENANCE_API_URL || 'http://localhost:4001';

// --- TIPOS DE DATOS ---
interface SelectOption {
  label: string;
  value: string;
}
interface BoilerOption extends SelectOption {
  value: 'cerrey' | 'cleaver' | 'myrggo';
}

const BOILER_OPTIONS: BoilerOption[] = [
  { label: 'Caldera Ce-rrey', value: 'cerrey' },
  { label: 'Caldera Cleaver', value: 'cleaver' },
  { label: 'Caldera Myrggo', value: 'myrggo' },
];

const TURNOS_OPTIONS: SelectOption[] = [
  { label: 'Turno A', value: 'A' },
  { label: 'Turno B', value: 'B' },
  { label: 'Turno C', value: 'C' },
];

// --- ESQUEMA DINÁMICO MAPEADO A BASE DE DATOS ---
const generateVaporSchema = (boiler: BoilerOption['value']) => {
  let presComb = { min: 0, max: 0, desc: '' };
  let lbsAire = { min: 0, max: 0, desc: '' };
  let tempComb = { min: 0, max: 0, desc: '' };

  switch (boiler) {
    case 'cerrey':
      presComb = { min: 4, max: 6, desc: 'Rango: 4 a 6 PSI' };
      lbsAire = { min: 10, max: 20, desc: 'Rango: 10 a 20 LBS' };
      tempComb = { min: 90, max: 130, desc: 'Rango: 90 a 130 °C' };
      break;
    case 'cleaver':
      presComb = { min: 4, max: 6, desc: 'Rango: 4 a 6 PSI' };
      lbsAire = { min: 15, max: 25, desc: 'Rango: 15 a 25 LBS' };
      tempComb = { min: 110, max: 130, desc: 'Rango: 110 a 130 °C' };
      break;
    case 'myrggo':
      presComb = { min: 1.5, max: 2, desc: 'Rango: 1.5 a 2 PSI' };
      lbsAire = { min: 20, max: 35, desc: 'Rango: 20 a 35 LBS' };
      tempComb = { min: 90, max: 130, desc: 'Rango: 90 a 130 °C' };
      break;
  }

  return {
    numericGroups: [
      {
        title: 'Presiones y Flujos',
        fields: [
          {
            id: 'presion_comb',
            label: 'Presión en Comb.',
            unit: 'PSI',
            ...presComb,
          },
          {
            id: 'presion_vapor',
            label: 'Presión Vapor',
            unit: 'Kg',
            min: 7.0,
            max: 8.5,
            desc: 'Rango: 7 a 8.5 Kg',
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
            id: 'temp_dia',
            label: 'Temp. Tanque Día',
            unit: '°C',
            min: 60,
            max: 120,
            desc: 'Rango: 60 a 120 °C',
          },
          {
            id: 'temp_gases',
            label: 'Temp. Gases',
            unit: '°C',
            min: 100,
            max: 250,
            desc: 'Rango: 100 a 250 °C',
          },
          {
            id: 'temp_agua',
            label: 'Temp. Agua',
            unit: '°C',
            min: 80,
            max: 120,
            desc: 'Rango: 80 a 120 °C',
          },
        ],
      },
    ],
    operationalModes: [
      {
        id: 'tipo_combustible',
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
        id: 'nivel_combustoleo_dia',
        label: 'Revisar Nivel Combustóleo Tanque Día',
      },
      { id: 'disp_seguridad', label: 'Revisar Dispositivos de Seguridad' },
      { id: 'bomba_alim_agua', label: 'Revisar Bomba Alimentación Agua' },
      { id: 'colum_h_agua', label: 'Columna de Agua (Purgada)' },
      { id: 'purga_fondo', label: 'Purga de Fondo Realizada' },
    ],
  };
};

const generateHourOptions = (): SelectOption[] => {
  const options: SelectOption[] = [];
  for (let i = 0; i < 24; i++) {
    const hourString = i.toString(); // Enviamos solo el número "7", "8", "14" a la BD
    const labelString = i.toString().padStart(2, '0') + ':00';
    options.push({ label: labelString, value: hourString });
  }
  return options;
};

export default function CentralVaporEntry() {
  const appContext = useContext(AppContent) as any;
  const alerts = appContext?.alerts || [];
  const addAlert = appContext?.addAlert;

  const [navigationOpen, setNavigationOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  // Estados Formulario Base
  const [hour, setHour] = useState<SelectOption>({
    label: '08:00',
    value: '8',
  });
  const [turno, setTurno] = useState<SelectOption>(TURNOS_OPTIONS[0]);
  const [selectedBoiler, setSelectedBoiler] = useState<BoilerOption>(
    BOILER_OPTIONS[0],
  );

  const currentSchema = useMemo(
    () => generateVaporSchema(selectedBoiler.value),
    [selectedBoiler],
  );
  const [readings, setReadings] = useState<Record<string, any>>({});

  // Estados Formulario Global (Fondo de la bitácora)
  const [globales, setGlobales] = useState({
    consumo_agua: '',
    total_kg_vapor: '',
    sal: '',
    diesel: '',
    rev_bypass: '',
    nivel_combustoleo_prin: '',
    observaciones: '',
  });

  // ESTADO SGC
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

  // 1. CARGAR PLANTILLA SGC AL INICIAR
  useEffect(() => {
    const loadActiveConfigs = async () => {
      try {
        const res = await api.get(
          `${MAINTENANCE_API_URL}/api/document-configs`,
        );
        if (res.data.success) {
          const config = res.data.data.find(
            (c: any) => c.area_key === 'central_vapor_bitacora',
          );
          if (config) setSgcConfig(config);
        }
      } catch (e) {
        if (addAlert) addAlert('error', 'Fallo al sincronizar SGC ISO.');
      }
    };
    loadActiveConfigs();
  }, []);

  // 2. INICIALIZAR LECTURAS POR HORA
  const initReadings = () => {
    const initialReadings: Record<string, any> = {};
    currentSchema.numericGroups.forEach((group) => {
      group.fields.forEach((field) => {
        initialReadings[field.id] = '';
      });
    });
    currentSchema.operationalModes.forEach((mode) => {
      initialReadings[mode.id] = mode.options[0].id; // Default: COMB / SUAVE
    });
    currentSchema.checks.forEach((check) => {
      initialReadings[check.id] = false; // Default Checkbox: false
    });
    setReadings(initialReadings);
    setShowErrorAlert(false);
  };

  useEffect(() => {
    initReadings();
  }, [hour.value, selectedBoiler.value, currentSchema]);

  const handleInputChange = (id: string, value: any) =>
    setReadings((prev) => ({ ...prev, [id]: value }));
  const handleGlobalChange = (id: string, value: string) =>
    setGlobales((prev) => ({ ...prev, [id]: value }));

  const getValidationError = (metric: any, value: any) => {
    if (value === '' || value === undefined) return null;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'Debe ser numérico.';
    if (metric.min !== undefined && numValue < metric.min)
      return `Mínimo: ${metric.min}`;
    if (metric.max !== undefined && numValue > metric.max)
      return `Máximo: ${metric.max}`;
    return null;
  };

  // 3. VALIDAR ANTES DE MOSTRAR MODAL
  const handlePreSubmit = (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    setShowErrorAlert(false);

    // Valida que todos los numéricos no tengan errores lógicos
    let hasErrors = false;
    currentSchema.numericGroups.forEach((g) => {
      g.fields.forEach((f) => {
        if (getValidationError(f, readings[f.id])) hasErrors = true;
      });
    });

    if (hasErrors) {
      setShowErrorAlert(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setIsConfirmModalVisible(true);
  };

  // 4. GUARDAR EN LA BD
  const confirmSubmit = async () => {
    setIsSubmitting(true);

    // Mapeo Inteligente UI -> Base de Datos
    const mappedReadings = {
      hora: hour.value,
      presion_comb: readings.presion_comb,
      presion_vapor: readings.presion_vapor,
      lbs_aire: readings.lbs_aire,
      temp_comb: readings.temp_comb,
      temp_dia: readings.temp_dia,
      temp_gases: readings.temp_gases,
      temp_agua: readings.temp_agua,

      // Mapeo Segmented Controls
      operacion_comb: readings.tipo_combustible === 'COMB' ? 'X' : '',
      operacion_diesel: readings.tipo_combustible === 'DIESEL' ? 'X' : '',
      agua_suave: readings.tipo_agua === 'SUAVE' ? 'X' : '',
      agua_cruda: readings.tipo_agua === 'CRUDA' ? 'X' : '',

      // Mapeo Checkboxes
      nivel_combustoleo_dia: readings.nivel_combustoleo_dia ? 'OK' : '',
      disp_seguridad: readings.disp_seguridad ? 'OK' : '',
      bomba_alim_agua: readings.bomba_alim_agua ? 'OK' : '',
      colum_h_agua: readings.colum_h_agua ? 'OK' : '',
      purga_fondo: readings.purga_fondo ? 'OK' : '',
    };

    const payload = {
      caldera: selectedBoiler.label,
      turno: turno.value,
      globales,
      readings: [mappedReadings],
      // Metadatos SGC
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
      const response = await api.post(
        `${MAINTENANCE_API_URL}/api/central-vapor`,
        payload,
      );
      if (response.data.success) {
        if (addAlert)
          addAlert(
            'success',
            `Lectura de las ${hour.label} registrada para ${selectedBoiler.label}.`,
          );
        initReadings(); // Limpia la hora actual para pasar a la siguiente
        setIsConfirmModalVisible(false);
      }
    } catch (error: any) {
      setIsConfirmModalVisible(false);
      if (addAlert)
        addAlert(
          'error',
          error.response?.data?.message ||
            'Error al conectar con la base de datos de telemetría.',
        );
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
            { text: 'Bitácoras Dpto.', href: '#' },
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
                      onClick={initReadings}
                    >
                      Limpiar Lectura
                    </Button>
                    <Button variant="primary" onClick={handlePreSubmit}>
                      Firma y Registro
                    </Button>
                  </SpaceBetween>
                }
                errorText={
                  showErrorAlert
                    ? 'Verifique los parámetros numéricos resaltados en rojo. Están fuera de rango.'
                    : null
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
                    Bitácora Central de Vapor
                  </Header>

                  {/* IDENTIFICADORES */}
                  <Container
                    header={<Header variant="h2">Contexto del Registro</Header>}
                  >
                    <ColumnLayout columns={3}>
                      <FormField label="Máquina / Caldera">
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
                      <FormField label="Turno de Operación">
                        <Select
                          selectedOption={turno}
                          onChange={({ detail }) =>
                            setTurno(detail.selectedOption as SelectOption)
                          }
                          options={TURNOS_OPTIONS}
                        />
                      </FormField>
                      <FormField label="Hora de Corte (Lectura)">
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

                  {/* GRUPOS NUMÉRICOS (TERMODINÁMICOS) */}
                  {currentSchema.numericGroups.map((group, index) => (
                    <Container
                      key={index}
                      header={<Header variant="h2">{group.title}</Header>}
                    >
                      <ColumnLayout
                        columns={group.fields.length > 3 ? 4 : 3}
                        variant="text-grid"
                      >
                        {group.fields.map((field) => {
                          const errorMsg = getValidationError(
                            field,
                            readings[field.id],
                          );
                          return (
                            <FormField
                              key={field.id}
                              label={`${field.label} (${field.unit})`}
                              description={field.desc}
                              errorText={errorMsg}
                            >
                              <Input
                                type="number"
                                step="any"
                                placeholder="0.00"
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
                          );
                        })}
                      </ColumnLayout>
                    </Container>
                  ))}

                  {/* SEGMENTOS DE OPERACIÓN */}
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

                  {/* CHECKBOXES DE REVISIÓN */}
                  <Container
                    header={
                      <Header variant="h2">
                        Revisiones de Rutina y Purgas
                      </Header>
                    }
                  >
                    <Alert
                      statusIconAriaLabel="Info"
                      type="info"
                      header="Confirmación Visual"
                    >
                      Confirme únicamente las tareas ejecutadas o validadas en
                      esta hora exacta de operación.
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

                  {/* 🚩 NUEVO: DATOS GLOBALES DEL TURNO / DÍA */}
                  <Container
                    header={
                      <Header variant="h2">
                        Parámetros Globales (Opcional por Hora)
                      </Header>
                    }
                  >
                    <SpaceBetween size="l">
                      <Grid
                        gridDefinition={[
                          { colspan: 3 },
                          { colspan: 3 },
                          { colspan: 3 },
                          { colspan: 3 },
                        ]}
                      >
                        <FormField label="Consumo Agua (L)">
                          <Input
                            value={globales.consumo_agua}
                            onChange={({ detail }) =>
                              handleGlobalChange('consumo_agua', detail.value)
                            }
                            placeholder="0.00"
                          />
                        </FormField>
                        <FormField label="Total Kg/Vapor">
                          <Input
                            value={globales.total_kg_vapor}
                            onChange={({ detail }) =>
                              handleGlobalChange('total_kg_vapor', detail.value)
                            }
                            placeholder="0.00"
                          />
                        </FormField>
                        <FormField label="Sal (Kg)">
                          <Input
                            value={globales.sal}
                            onChange={({ detail }) =>
                              handleGlobalChange('sal', detail.value)
                            }
                            placeholder="0.00"
                          />
                        </FormField>
                        <FormField label="Diésel (L)">
                          <Input
                            value={globales.diesel}
                            onChange={({ detail }) =>
                              handleGlobalChange('diesel', detail.value)
                            }
                            placeholder="0.00"
                          />
                        </FormField>
                      </Grid>
                      <ColumnLayout columns={2}>
                        <FormField label="Rev. Bypass Tanque de Día">
                          <Input
                            value={globales.rev_bypass}
                            onChange={({ detail }) =>
                              handleGlobalChange('rev_bypass', detail.value)
                            }
                            placeholder="Ej. Operando Normal"
                          />
                        </FormField>
                        <FormField label="Nivel Combustóleo Principal">
                          <Input
                            value={globales.nivel_combustoleo_prin}
                            onChange={({ detail }) =>
                              handleGlobalChange(
                                'nivel_combustoleo_prin',
                                detail.value,
                              )
                            }
                            placeholder="%"
                          />
                        </FormField>
                      </ColumnLayout>
                      <FormField label="Observaciones Finales / Generales del Turno">
                        <Textarea
                          value={globales.observaciones}
                          onChange={({ detail }) =>
                            handleGlobalChange('observaciones', detail.value)
                          }
                          placeholder="Describa anomalías mayores..."
                          rows={3}
                        />
                      </FormField>
                    </SpaceBetween>
                  </Container>
                </SpaceBetween>
              </Form>
            </form>
          </div>
        }
      />
      <Footer />

      {/* 🚩 MODAL DE CONFIRMACIÓN SGC */}
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
                Revisar Datos
              </Button>
              <Button
                variant="primary"
                loading={isSubmitting}
                onClick={confirmSubmit}
              >
                Firmar e Ingresar Registro
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Box variant="p" padding={{ bottom: 'm' }}>
          Está a punto de insertar la telemetría de la{' '}
          <b>{selectedBoiler.label}</b> correspondiente a las{' '}
          <b>{hour.label} hrs.</b> ({turno.label}).
        </Box>
        <Box variant="p" color="text-status-info">
          <i>
            Documento Normativo auditable:{' '}
            <b>
              {sgcConfig.codigo_documento} (Versión {sgcConfig.version})
            </b>
            .
          </i>
        </Box>
        <Box variant="p" color="text-body-secondary" margin={{ top: 'l' }}>
          Al presionar "Firmar", su ID de usuario quedará enlazado a esta hora
          como responsable operativo del equipo de presión, conforme al estándar
          de {sgcConfig.estandar_calidad}.
        </Box>
      </Modal>
    </div>
  );
}
