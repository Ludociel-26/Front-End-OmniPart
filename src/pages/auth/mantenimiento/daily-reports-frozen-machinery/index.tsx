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
  Box,
  ColumnLayout,
  Grid,
  SegmentedControl,
  Textarea,
  ExpandableSection,
  Checkbox,
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
  const [navigationOpen, setNavigationOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const [turno, setTurno] = useState<SelectOption>({
    label: 'Turno A',
    value: 'A',
  });
  const [observacionesGlobales, setObservacionesGlobales] = useState('');

  const [evaluations, setEvaluations] = useState<Record<string, any>>({});

  useEffect(() => {
    const initialState: Record<string, any> = {};

    // Iniciar Módulos Estándar (3 Estados)
    [
      ...SCHEMA.maquinaria,
      ...SCHEMA.cuartos,
      ...SCHEMA.acondicionado,
      ...SCHEMA.amoniaco, // Amoníaco es A, B, C en formato v3.0
    ].forEach((item) => {
      initialState[item.id] = { status: 'NORMAL', comments: '' };
    });

    // Iniciar Módulos Aislados (Rejillas, Deshielo, Ecochiller)
    Object.values(SCHEMA.sistemas_aislados).forEach((item) => {
      initialState[item.id] = { status: 'NORMAL', comments: '' };
    });

    // Iniciar Fugas Drager
    SCHEMA.fugas_drager.forEach((item) => {
      initialState[item.id] = { status: 'SIN_FUGA', comments: '' };
    });

    // Iniciar Dosificadores
    SCHEMA.dosificadores.forEach((item) => {
      initialState[item.id] = { status: 'SI', comments: '' };
    });

    // Iniciar Limpieza
    initialState[SCHEMA.limpieza.id] = { status: false, comments: '' };

    setEvaluations(initialState);
    setObservacionesGlobales('');
    setShowErrorAlert(false);
  }, [turno.value]);

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
  };

  const handleCommentChange = (id: string, text: string) => {
    setEvaluations((prev) => ({
      ...prev,
      [id]: { ...prev[id], comments: text },
    }));
  };

  // FIX: Cambiado 'e?: React.FormEvent' a 'e?: any' para que funcione con ambos eventos
  const handleSubmit = (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    setShowErrorAlert(false);

    // Validación: Se exige comentario si algo está Anormal, Falla, Con Fuga o en NO.
    const hasErrors = Object.values(evaluations).some(
      (evalItem) =>
        (evalItem.status === 'ANORMAL' ||
          evalItem.status === 'FALLA' ||
          evalItem.status === 'CON_FUGA' ||
          evalItem.status === 'NO') &&
        evalItem.comments?.trim() === '',
    );

    if (hasErrors) {
      setShowErrorAlert(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    const payload = {
      reportType: 'diario_maquinaria_congelados',
      turno: turno.value,
      timestamp: new Date().toISOString(),
      evaluations,
      observacionesGlobales,
    };

    console.log('JSON listo para Base de Datos:', payload);

    setTimeout(() => {
      setIsSubmitting(false);
      alert(
        `Reporte Diario de Congelados (Turno ${turno.value}) guardado exitosamente.`,
      );
    }, 1500);
  };

  // Renderizador principal unificado
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
    if (currentEval.status === 'FALLA') borderColor = '#d13212';

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
            {/* @ts-ignore */}
            <Box
              variant="span"
              fontSize="body-m"
              fontWeight={requiresComment ? 'bold' : 'normal'}
            >
              {item.label}
            </Box>
            {/* Mostrar descripción extra si existe en el esquema (Ideal para rangos) */}
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
                      Guardar Reporte
                    </Button>
                  </SpaceBetween>
                }
                errorText={
                  showErrorAlert
                    ? 'Faltan comentarios en las evaluaciones marcadas con incidencias (Anormal, Falla, Fuga, No).'
                    : null
                }
              >
                <SpaceBetween size="l">
                  <Header
                    variant="h1"
                    description="Inspección física de equipos. Las incidencias exigen justificación."
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

                  {/* 1. MAQUINARIA */}
                  <ExpandableSection
                    headerText="1. FUNCIONAMIENTO DE MAQUINARIA"
                    variant="container"
                    defaultExpanded={true}
                  >
                    {SCHEMA.maquinaria.map((item) =>
                      renderRow(item, OPCIONES_GENERALES_3),
                    )}
                  </ExpandableSection>

                  {/* 2. CUARTOS FRIOS */}
                  <ExpandableSection
                    headerText="2. DIFUSORES EN CUARTOS FRÍOS"
                    variant="container"
                    defaultExpanded={true}
                  >
                    {SCHEMA.cuartos.map((item) =>
                      renderRow(item, OPCIONES_GENERALES_3),
                    )}
                  </ExpandableSection>

                  {/* 3. DOSIFICADORES */}
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

                  {/* 4. AIRE ACONDICIONADO */}
                  <ExpandableSection
                    headerText="SISTEMA DE AIRE ACONDICIONADO"
                    variant="container"
                    defaultExpanded={true}
                  >
                    {SCHEMA.acondicionado.map((item) =>
                      renderRow(item, OPCIONES_GENERALES_3),
                    )}
                  </ExpandableSection>

                  {/* 5. SISTEMAS AISLADOS E INSPECCIONES */}
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

                  {/* 6. AMONIACO Y FUGAS */}
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

                  {/* 7. LIMPIEZA Y OBSERVACIONES FINALES */}
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
                        placeholder="Escriba aquí los comentarios generales del reporte diario o eventualidades del turno..."
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
    </div>
  );
}
