import { useContext, useState, useCallback, useEffect, useRef } from 'react';

// Imports de Cloudscape
import {
  Table,
  Box,
  SpaceBetween,
  Button,
  TextFilter,
  Header,
  Pagination,
  AppLayout,
  Flashbar,
  CollectionPreferences,
  Multiselect,
  TokenGroup,
  Modal,
  Form,
  FormField,
  Input,
  Select,
} from '@cloudscape-design/components';
import { useCollection } from '@cloudscape-design/collection-hooks';

// Contexto Global
import { AppContent } from '@/context/AppContext';

// Imports Locales
import Navbar from '@/components/layouts/AppHeader';
import GlobalSidebar from '@/components/layouts/AppSidebar';
import { Footer } from '@/components/layouts/AppFooter';
import SecondaryHeader from '@/components/layouts/BreadcrumbNavBar';
import emptyStateImage from '@/assets/table-items/robot-empty.svg';

// --- ESTILOS CSS ---
const awsStyles = `
  .awsui-table-row-selected > td {
    box-shadow: none !important;
    background-color: #f1faff !important;
    border-top: 2px solid #0972d3 !important;
    border-bottom: 2px solid #0972d3 !important;
  }
`;

// --- INTERFACES ---
export interface Option {
  label: string;
  value: string;
}

export interface RefaccionItem {
  refaccion_id: number;
  numero_parte: string;
  nombre: string;
  usosAsignados: Option[]; // Array de usos (label, value)
}

// Opciones estandarizadas para el modal de nuevo uso
const CATEGORIA_OPTIONS = [
  { label: 'Mantenimiento Preventivo', value: 'Preventivo' },
  { label: 'Mantenimiento Correctivo', value: 'Correctivo' },
  { label: 'Mejora / Modificación', value: 'Mejora' },
  { label: 'Consumo General', value: 'General' },
];

const EmptyState = ({ title, subtitle, action }: any) => (
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
        style={{ maxWidth: '250px', margin: '0 auto' }}
      />
    </Box>
    {action}
  </Box>
);

export default function AsignacionUsosTable() {
  const { alerts, addAlert, setPageLoading } = useContext(AppContent) || {};

  // FIX: Se mantiene la variable backendUrl, aunque en este mock no se utilice activamente
  // se deja lista para cuando descomentes el código de la API.
  // @ts-ignore
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [navigationOpen, setNavigationOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(false);

  // Datos principales
  const [refaccionesData, setRefaccionesData] = useState<RefaccionItem[]>([]);
  const [usosCatalogo, setUsosCatalogo] = useState<Option[]>([]); // Opciones para el Multiselect
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<RefaccionItem[]>([]);

  // Estado del Modal para Crear Uso
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nuevoUsoNombre, setNuevoUsoNombre] = useState('');

  // FIX: Tipamos el estado como `any` para evitar conflictos con OptionDefinition de Cloudscape
  const [nuevoUsoCategoria, setNuevoUsoCategoria] = useState<any>(null);
  const [guardandoUso, setGuardandoUso] = useState(false);

  const [tablePreferences, setTablePreferences] = useState({
    pageSize: 20,
    visibleContent: ['numero_parte', 'nombre', 'usosAsignados'],
  });

  const isMounted = useRef(true);

  // --- COLUMNAS DE LA TABLA ---
  const COLUMN_DEFINITIONS = [
    {
      id: 'numero_parte',
      header: 'Número de Parte',
      cell: (item: RefaccionItem) => (
        <span style={{ fontFamily: 'monospace' }}>{item.numero_parte}</span>
      ),
      sortingField: 'numero_parte',
      minWidth: 150,
    },
    {
      id: 'nombre',
      header: 'Refacción',
      cell: (item: RefaccionItem) => <strong>{item.nombre}</strong>,
      sortingField: 'nombre',
      minWidth: 250,
    },
    {
      id: 'usosAsignados',
      header: 'Usos Asignados',
      minWidth: 400,
      // Visualización normal: Mostramos TokenGroup (etiquetas)
      cell: (item: RefaccionItem) =>
        item.usosAsignados?.length > 0 ? (
          <TokenGroup
            items={item.usosAsignados.map((uso) => ({
              label: uso.label,
              dismissible: false,
            }))}
            alignment="horizontal"
          />
        ) : (
          <span style={{ color: '#879596', fontStyle: 'italic' }}>
            Sin usos asignados
          </span>
        ),
      // Edición en línea: Mostramos un Multiselect
      editConfig: {
        ariaLabel: 'Asignar usos',
        editIconAriaLabel: 'editable',
        errorIconAriaLabel: 'Error de validación',
        editingCell: (item: RefaccionItem, { currentValue, setValue }: any) => {
          const selectedOptions = currentValue ?? item.usosAsignados;
          return (
            <Multiselect
              options={usosCatalogo}
              selectedOptions={selectedOptions}
              onChange={({ detail }) => setValue(detail.selectedOptions)}
              placeholder="Elige uno o más usos..."
              selectedAriaLabel="Seleccionado"
              expandToViewport
            />
          );
        },
        validation: () => undefined, // Es opcional tener usos
      },
    },
  ];

  // --- OBTENER DATOS (Refacciones y Catálogo de Usos) ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // DATOS SIMULADOS PARA EJEMPLO DE LA UI
      setUsosCatalogo([
        { label: 'Cambio de Baleros', value: '1' },
        { label: 'Lubricación General', value: '2' },
        { label: 'Mantenimiento Motor', value: '3' },
      ]);

      setRefaccionesData([
        {
          refaccion_id: 1,
          numero_parte: 'BAL-608ZZ',
          nombre: 'Balero 608ZZ Metálico',
          usosAsignados: [{ label: 'Cambio de Baleros', value: '1' }],
        },
        {
          refaccion_id: 2,
          numero_parte: 'GRS-LIT-01',
          nombre: 'Grasa de Litio 1Kg',
          usosAsignados: [],
        },
      ]);

      if (setPageLoading) setPageLoading(false);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [setPageLoading]);

  useEffect(() => {
    isMounted.current = true;
    fetchData();
    return () => {
      isMounted.current = false;
    };
  }, [fetchData]);

  // --- GUARDADO INLINE DE LA TABLA (Asignar Usos a Refacción) ---
  const handleInlineEditSave = async (
    item: RefaccionItem,
    column: any,
    newValue: Option[],
  ) => {
    try {
      // API Call simulada
      setRefaccionesData((prev) =>
        prev.map((ref) =>
          ref.refaccion_id === item.refaccion_id
            ? { ...ref, [column.id]: newValue }
            : ref,
        ),
      );
      if (addAlert)
        addAlert(
          'success',
          'Usos asignados correctamente.',
          'Guardado exitoso',
        );
    } catch (error) {
      if (addAlert) addAlert('error', 'Error al asignar los usos.', 'Error');
      throw error;
    }
  };

  // --- CREAR NUEVO USO DESDE EL MODAL ---
  const handleCrearUso = async () => {
    if (!nuevoUsoNombre || !nuevoUsoCategoria) return;
    setGuardandoUso(true);

    try {
      // API Call simulada
      const nuevoId = Math.random().toString();
      const nuevaOpcion = { label: nuevoUsoNombre, value: nuevoId };

      // Actualizamos el catálogo local
      setUsosCatalogo((prev) => [...prev, nuevaOpcion]);

      if (addAlert)
        addAlert(
          'success',
          `El uso "${nuevoUsoNombre}" fue creado y ya está disponible.`,
          'Uso creado',
        );

      setIsModalOpen(false);
      setNuevoUsoNombre('');
      setNuevoUsoCategoria(null);
    } catch (error) {
      if (addAlert) addAlert('error', 'No se pudo crear el uso.', 'Error');
    } finally {
      setGuardandoUso(false);
    }
  };

  const {
    items,
    actions,
    filteredItemsCount,
    collectionProps,
    paginationProps,
    filterProps,
  } = useCollection(refaccionesData, {
    pagination: { pageSize: tablePreferences.pageSize },
    sorting: {},
    selection: {},
    filtering: {
      empty: (
        <EmptyState
          title="No hay refacciones"
          subtitle="No hay inventario registrado."
          action={<Button variant="primary">Añadir refacción</Button>}
        />
      ),
      noMatch: (
        <EmptyState
          title="Sin coincidencias"
          subtitle="No se encontraron refacciones."
          action={
            <Button onClick={() => actions.setFiltering('')}>
              Borrar filtro
            </Button>
          }
        />
      ),
    },
  });

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <style>{awsStyles}</style>
      <div
        id="sticky-nav-container"
        style={{ position: 'sticky', top: 0, zIndex: 1002 }}
      >
        <Navbar />
        {/* FIX: Se agregaron las props obligatorias para controlar la visibilidad de los menús laterales */}
        <SecondaryHeader
          breadcrumbs={[
            { text: 'Sistema', href: '#' },
            { text: 'Almacén', href: '#' },
            { text: 'Asignación de Usos', href: '#' },
          ]}
          isMenuOpen={navigationOpen}
          onMenuClick={() => setNavigationOpen(!navigationOpen)}
          isInfoOpen={toolsOpen}
          onInfoClick={() => setToolsOpen(!toolsOpen)}
        />
      </div>

      <AppLayout
        headerSelector="#sticky-nav-container"
        navigation={<GlobalSidebar />}
        navigationOpen={navigationOpen}
        onNavigationChange={({ detail }) => setNavigationOpen(detail.open)}
        toolsOpen={toolsOpen}
        onToolsChange={({ detail }) => setToolsOpen(detail.open)}
        contentType="table"
        notifications={
          alerts && alerts.length > 0 ? (
            <Flashbar items={alerts as any} stackItems={true} />
          ) : null
        }
        content={
          <>
            <Table
              {...collectionProps}
              selectedItems={selectedItems}
              onSelectionChange={({ detail }) =>
                setSelectedItems(detail.selectedItems as RefaccionItem[])
              }
              columnDefinitions={COLUMN_DEFINITIONS as any}
              items={items}
              selectionType="single"
              variant="full-page"
              stickyHeader={true}
              stickyHeaderVerticalOffset={90}
              loading={loading}
              loadingText="Cargando refacciones..."
              trackBy="refaccion_id"
              submitEdit={handleInlineEditSave as any}
              header={
                <Header
                  variant="h1"
                  counter={!loading ? `(${items.length})` : ''}
                  description="Asigna usos o aplicaciones a las refacciones de tu inventario usando el modo de edición (doble clic o icono del lápiz)."
                  actions={
                    <SpaceBetween direction="horizontal" size="xs">
                      <Button
                        iconName="refresh"
                        onClick={fetchData}
                        ariaLabel="Refrescar"
                      />
                      <Button onClick={() => setIsModalOpen(true)}>
                        Crear nuevo uso en el catálogo
                      </Button>
                    </SpaceBetween>
                  }
                >
                  Gestión de Usos por Refacción
                </Header>
              }
              preferences={
                <CollectionPreferences
                  title="Preferencias"
                  confirmLabel="Confirmar"
                  cancelLabel="Cancelar"
                  preferences={tablePreferences as any}
                  onConfirm={({ detail }) => setTablePreferences(detail as any)}
                  pageSizePreference={{
                    title: 'Tamaño de página',
                    options: [
                      { value: 20, label: '20' },
                      { value: 50, label: '50' },
                    ],
                  }}
                  visibleContentPreference={{
                    title: 'Columnas',
                    options: [
                      {
                        label: 'Propiedades',
                        options: COLUMN_DEFINITIONS.map((col) => ({
                          id: col.id,
                          label: col.header as string,
                        })),
                      },
                    ],
                  }}
                />
              }
              filter={
                <TextFilter
                  {...filterProps}
                  filteringPlaceholder="Buscar refacción..."
                  countText={`${filteredItemsCount} coincidencias`}
                />
              }
              pagination={<Pagination {...paginationProps} />}
            />

            {/* MODAL DE CREACIÓN RÁPIDA DE USOS */}
            <Modal
              onDismiss={() => setIsModalOpen(false)}
              visible={isModalOpen}
              closeAriaLabel="Cerrar modal"
              header="Añadir nuevo uso al catálogo"
              footer={
                <Box float="right">
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button
                      variant="link"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      loading={guardandoUso}
                      onClick={handleCrearUso}
                    >
                      Guardar Uso
                    </Button>
                  </SpaceBetween>
                </Box>
              }
            >
              <Form>
                <SpaceBetween direction="vertical" size="l">
                  <FormField
                    label="Nombre del Uso"
                    description="Ej. Mantenimiento Preventivo Mensual, Cambio de Banda, etc."
                  >
                    <Input
                      value={nuevoUsoNombre}
                      onChange={({ detail }) => setNuevoUsoNombre(detail.value)}
                      placeholder="Ingresa el nombre del uso"
                    />
                  </FormField>
                  <FormField label="Clasificación">
                    {/* FIX: Casteado as any para que TypeScript no arroje error por OptionDefinition */}
                    <Select
                      selectedOption={nuevoUsoCategoria}
                      onChange={({ detail }) =>
                        setNuevoUsoCategoria(detail.selectedOption as any)
                      }
                      options={CATEGORIA_OPTIONS}
                      placeholder="Selecciona una clasificación"
                      expandToViewport
                    />
                  </FormField>
                </SpaceBetween>
              </Form>
            </Modal>
          </>
        }
      />
      <Footer />
    </div>
  );
}
