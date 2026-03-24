import axios from 'axios';
import { useContext, useState, useCallback, useEffect, useRef } from 'react';

// Imports de Cloudscape Design System
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
  Input,
  Select,
  StatusIndicator,
} from '@cloudscape-design/components';
import { useCollection } from '@cloudscape-design/collection-hooks';

// Contexto Global
import { AppContent } from '@/context/AppContext';

// Imports Locales
import Navbar from '@/components/layouts/AppHeader';
import GlobalSidebar from '@/components/layouts/AppSidebar';
import { Footer } from '@/components/layouts/AppFooter';
import SecondaryHeader from '@/components/layouts/BreadcrumbNavBar';

// Imagen Local para el Empty State
import emptyStateImage from '@/assets/table-items/robot-empty.svg';

// --- ESTILOS CSS ---
const awsStyles = `
  .awsui-table-row-selected > td {
    box-shadow: none !important;
    background-color: #f1faff !important;
    border-top: 2px solid #0972d3 !important;
    border-bottom: 2px solid #0972d3 !important;
  }
  .awsui-table-row-selected > td:first-child {
    border-left: 2px solid #0972d3 !important;
    border-top-left-radius: 12px !important; 
    border-bottom-left-radius: 12px !important;
  }
  .awsui-table-row-selected > td:last-child {
    border-right: 2px solid #0972d3 !important;
    border-top-right-radius: 12px !important;
    border-bottom-right-radius: 12px !important;
  }
`;

// --- INTERFACES ---
export interface UbicacionItem {
  ubicacion_id: number;
  codigo: string; // Ej: P01-E02-N03
  pasillo: string;
  estante: string;
  nivel: string;
  estatus: 'Disponible' | 'Ocupada' | 'Mantenimiento';
  createdAt?: string;
  updatedAt?: string;
}

// Opciones para el Select del Estatus
const ESTATUS_OPTIONS = [
  { label: 'Disponible', value: 'Disponible' },
  { label: 'Ocupada', value: 'Ocupada' },
  { label: 'Mantenimiento', value: 'Mantenimiento' },
];

// --- COMPONENTE: EMPTY STATE ---
const EmptyState = ({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action: React.ReactNode;
}) => {
  return (
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
          style={{
            maxWidth: '250px',
            width: '100%',
            display: 'block',
            margin: '0 auto',
          }}
        />
      </Box>
      {action}
    </Box>
  );
};

export default function UbicacionesTable() {
  const { alerts, addAlert, setPageLoading } = useContext(AppContent) || {};
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [navigationOpen, setNavigationOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [ubicacionesData, setUbicacionesData] = useState<UbicacionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<UbicacionItem[]>([]);

  const [tablePreferences, setTablePreferences] = useState({
    pageSize: 20,
    visibleContent: [
      'ubicacion_id',
      'codigo',
      'pasillo',
      'estante',
      'nivel',
      'estatus',
    ],
  });

  const isMounted = useRef(true);
  const hasFetched = useRef(false);

  // --- HELPER PARA RENDERIZAR ESTATUS ---
  const getStatusIndicator = (estatus: string) => {
    switch (estatus) {
      case 'Disponible':
        return <StatusIndicator type="success">Disponible</StatusIndicator>;
      case 'Ocupada':
        return <StatusIndicator type="error">Ocupada</StatusIndicator>;
      case 'Mantenimiento':
        return <StatusIndicator type="warning">Mantenimiento</StatusIndicator>;
      default:
        return <StatusIndicator type="info">{estatus}</StatusIndicator>;
    }
  };

  // --- DEFINICIÓN DE COLUMNAS CON INLINE EDIT ---
  const COLUMN_DEFINITIONS = [
    {
      id: 'ubicacion_id',
      header: 'ID',
      cell: (item: UbicacionItem) => item.ubicacion_id,
      sortingField: 'ubicacion_id',
      minWidth: 80,
      isRowHeader: true,
    },
    {
      id: 'codigo',
      header: 'Código Generado',
      cell: (item: UbicacionItem) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
          {item.pasillo}-{item.estante}-{item.nivel}
        </span>
      ),
      // No tiene inline edit porque se compone de los otros campos
      minWidth: 160,
    },
    {
      id: 'pasillo',
      header: 'Pasillo',
      cell: (item: UbicacionItem) => item.pasillo,
      sortingField: 'pasillo',
      minWidth: 120,
      editConfig: {
        ariaLabel: 'Editar pasillo',
        editIconAriaLabel: 'editable',
        errorIconAriaLabel: 'Error de validación',
        editingCell: (item: UbicacionItem, { currentValue, setValue }: any) => (
          <Input
            autoFocus
            value={currentValue ?? item.pasillo}
            onChange={(e) => setValue(e.detail.value.toUpperCase())}
            placeholder="Ej. P01"
          />
        ),
        validation: (_item: UbicacionItem, value: string) => {
          if (!value || value.trim() === '') return 'Requerido.';
          return undefined;
        },
      },
    },
    {
      id: 'estante',
      header: 'Estante / Rack',
      cell: (item: UbicacionItem) => item.estante,
      sortingField: 'estante',
      minWidth: 120,
      editConfig: {
        ariaLabel: 'Editar estante',
        editIconAriaLabel: 'editable',
        errorIconAriaLabel: 'Error de validación',
        editingCell: (item: UbicacionItem, { currentValue, setValue }: any) => (
          <Input
            autoFocus
            value={currentValue ?? item.estante}
            onChange={(e) => setValue(e.detail.value.toUpperCase())}
            placeholder="Ej. E02"
          />
        ),
        validation: (_item: UbicacionItem, value: string) => {
          if (!value || value.trim() === '') return 'Requerido.';
          return undefined;
        },
      },
    },
    {
      id: 'nivel',
      header: 'Nivel / Cajón',
      cell: (item: UbicacionItem) => item.nivel,
      sortingField: 'nivel',
      minWidth: 120,
      editConfig: {
        ariaLabel: 'Editar nivel',
        editIconAriaLabel: 'editable',
        errorIconAriaLabel: 'Error de validación',
        editingCell: (item: UbicacionItem, { currentValue, setValue }: any) => (
          <Input
            autoFocus
            value={currentValue ?? item.nivel}
            onChange={(e) => setValue(e.detail.value.toUpperCase())}
            placeholder="Ej. N03"
          />
        ),
        validation: (_item: UbicacionItem, value: string) => {
          if (!value || value.trim() === '') return 'Requerido.';
          return undefined;
        },
      },
    },
    {
      id: 'estatus',
      header: 'Estatus',
      cell: (item: UbicacionItem) => getStatusIndicator(item.estatus),
      sortingField: 'estatus',
      minWidth: 180,
      editConfig: {
        ariaLabel: 'Editar estatus',
        editIconAriaLabel: 'editable',
        errorIconAriaLabel: 'Error de validación',
        editingCell: (item: UbicacionItem, { currentValue, setValue }: any) => {
          const value = currentValue ?? item.estatus;
          return (
            <Select
              autoFocus
              expandToViewport
              selectedOption={
                ESTATUS_OPTIONS.find((opt) => opt.value === value) || null
              }
              onChange={({ detail }) => setValue(detail.selectedOption.value)}
              options={ESTATUS_OPTIONS}
            />
          );
        },
        validation: (_item: UbicacionItem, value: string) => {
          if (!value) return 'Debes seleccionar un estatus.';
          return undefined;
        },
      },
    },
  ];

  useEffect(() => {
    isMounted.current = true;
    if (setPageLoading) setPageLoading(false);
    return () => {
      isMounted.current = false;
    };
  }, [setPageLoading]);

  // --- OBTENER DATOS DE LA API REAL ---
  const fetchUbicaciones = useCallback(
    async (isRefresh = false) => {
      const alertId = addAlert
        ? addAlert(
            'info',
            isRefresh
              ? 'Actualizando inventario de ubicaciones...'
              : 'Obteniendo ubicaciones desde la base de datos...',
            'Sincronizando',
            undefined,
            true,
          )
        : undefined;

      try {
        if (isMounted.current) {
          if (isRefresh) setRefreshing(true);
          else setLoading(true);
        }

        const response = await axios.get(
          // Ajusta esta ruta a tu endpoint real
          // `${backendUrl}/api/ubicaciones`
          ``,
          {
            withCredentials: true,
          },
        );

        if (response.data.success) {
          if (isMounted.current) {
            setUbicacionesData(response.data.ubicaciones);
          }
          await new Promise((resolve) => setTimeout(resolve, 600));

          if (addAlert) {
            addAlert(
              'success',
              'Layout del almacén cargado correctamente.',
              'Éxito',
              alertId,
              false,
            );
          }
        } else {
          if (addAlert) {
            addAlert(
              'warning',
              'No se encontraron ubicaciones registradas.',
              'Advertencia',
              alertId,
              false,
            );
          }
        }
      } catch (error: any) {
        console.error('Error cargando ubicaciones:', error);
        if (addAlert) {
          addAlert(
            'error',
            error.message || 'Error al conectar con el servidor',
            'Fallo de Red',
            alertId,
            false,
          );
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [backendUrl, addAlert],
  );

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchUbicaciones();
    }
  }, [fetchUbicaciones]);

  // --- LÓGICA DE GUARDADO INLINE HACIA LA API ---
  const handleInlineEditSave = async (
    item: UbicacionItem,
    column: any,
    newValue: string,
  ) => {
    try {
      await axios.put(
        // Ajusta esta ruta a tu endpoint real
        // `${backendUrl}/api/ubicaciones/${item.ubicacion_id}`
        '',
        { [column.id]: newValue },
        { withCredentials: true },
      );

      setUbicacionesData((prevData) =>
        prevData.map((ubicacion) =>
          ubicacion.ubicacion_id === item.ubicacion_id
            ? { ...ubicacion, [column.id]: newValue }
            : ubicacion,
        ),
      );

      if (addAlert) {
        addAlert(
          'success',
          `La ubicación se actualizó correctamente.`,
          'Guardado exitoso',
          undefined,
          false,
        );
      }
    } catch (error: any) {
      console.error('Error actualizando ubicación:', error);
      if (addAlert) {
        addAlert(
          'error',
          'Ocurrió un error al intentar guardar los cambios. Intenta de nuevo.',
          'Error de guardado',
          undefined,
          false,
        );
      }
      throw error;
    }
  };

  const {
    items,
    actions,
    filteredItemsCount,
    collectionProps,
    paginationProps,
    filterProps,
  } = useCollection(ubicacionesData, {
    pagination: { pageSize: tablePreferences.pageSize },
    sorting: { defaultState: { sortingColumn: COLUMN_DEFINITIONS[0] } },
    selection: {},
    filtering: {
      empty: (
        <EmptyState
          title="No hay ubicaciones creadas"
          subtitle="Diseña el layout de tu almacén agregando pasillos y estantes."
          action={<Button variant="primary">Crear ubicación</Button>}
        />
      ),
      noMatch: (
        <EmptyState
          title="No hay coincidencias"
          subtitle="No se encontraron ubicaciones que coincidan con la búsqueda."
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
        <SecondaryHeader
          breadcrumbs={[
            { text: 'Sistema', href: '#' },
            { text: 'Almacén', href: '#' },
            { text: 'Ubicaciones', href: '/ubicaciones' },
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
          <Table
            {...collectionProps}
            selectedItems={selectedItems}
            onSelectionChange={({ detail }) =>
              setSelectedItems(detail.selectedItems as UbicacionItem[])
            }
            columnDefinitions={COLUMN_DEFINITIONS as any}
            items={items}
            selectionType="single"
            variant="full-page"
            stickyHeader={true}
            stickyHeaderVerticalOffset={90}
            loading={loading}
            loadingText="Cargando mapa de ubicaciones..."
            trackBy="ubicacion_id"
            submitEdit={handleInlineEditSave as any}
            empty={
              <div style={{ padding: '40px 0' }}>{collectionProps.empty}</div>
            }
            header={
              <Header
                variant="h1"
                counter={!loading ? `(${items.length})` : ''}
                description="Gestiona las ubicaciones físicas (pasillos, estantes, cajones) de las refacciones en el almacén."
                actions={
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button
                      iconName="refresh"
                      loading={refreshing}
                      onClick={() => fetchUbicaciones(true)}
                      ariaLabel="Refrescar"
                    />
                    <Button disabled={selectedItems.length === 0}>
                      Eliminar
                    </Button>
                    <Button variant="primary">Nueva ubicación</Button>
                  </SpaceBetween>
                }
              >
                Ubicaciones de Inventario
              </Header>
            }
            preferences={
              <CollectionPreferences
                title="Preferencias de vista"
                confirmLabel="Confirmar"
                cancelLabel="Cancelar"
                preferences={tablePreferences as any}
                onConfirm={({ detail }) => setTablePreferences(detail as any)}
                pageSizePreference={{
                  title: 'Tamaño de página',
                  options: [
                    { value: 20, label: '20 ubicaciones' },
                    { value: 50, label: '50 ubicaciones' },
                  ],
                }}
                visibleContentPreference={{
                  title: 'Seleccionar columnas visibles',
                  options: [
                    {
                      label: 'Detalles de ubicación',
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
                filteringPlaceholder="Buscar por código, pasillo o estante..."
                countText={`${filteredItemsCount} coincidencias`}
              />
            }
            pagination={<Pagination {...paginationProps} />}
          />
        }
      />
      <Footer />
    </div>
  );
}
