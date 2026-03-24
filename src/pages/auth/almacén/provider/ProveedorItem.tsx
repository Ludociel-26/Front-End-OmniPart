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
// Mantenemos solo los estilos estrictamente necesarios para el sombreado de selección
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
export interface ProveedorItem {
  proveedor_id: number;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

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

export default function ProveedoresTable() {
  const { alerts, addAlert, setPageLoading } = useContext(AppContent) || {};
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [navigationOpen, setNavigationOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [proveedoresData, setProveedoresData] = useState<ProveedorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<ProveedorItem[]>([]);

  const [tablePreferences, setTablePreferences] = useState({
    pageSize: 20,
    visibleContent: ['proveedor_id', 'nombre', 'contacto', 'telefono', 'email'],
  });

  const isMounted = useRef(true);
  const hasFetched = useRef(false);

  // --- DEFINICIÓN DE COLUMNAS CON INLINE EDIT ---
  const COLUMN_DEFINITIONS = [
    {
      id: 'proveedor_id',
      header: 'ID',
      cell: (item: ProveedorItem) => item.proveedor_id,
      sortingField: 'proveedor_id',
      minWidth: 80,
      isRowHeader: true,
    },
    {
      id: 'nombre',
      header: 'Razón Social / Empresa',
      cell: (item: ProveedorItem) => <strong>{item.nombre}</strong>,
      sortingField: 'nombre',
      minWidth: 200,
      editConfig: {
        ariaLabel: 'Editar nombre del proveedor',
        editIconAriaLabel: 'editable',
        errorIconAriaLabel: 'Error de validación',
        editingCell: (item: ProveedorItem, { currentValue, setValue }: any) => (
          <Input
            autoFocus
            value={currentValue ?? item.nombre}
            onChange={(e) => setValue(e.detail.value)}
            placeholder="Ej. Refacciones Industriales S.A."
          />
        ),
        validation: (_item: ProveedorItem, value: string) => {
          if (!value || value.trim() === '')
            return 'El nombre de la empresa es requerido.';
          return undefined;
        },
      },
    },
    {
      id: 'contacto',
      header: 'Persona de Contacto',
      cell: (item: ProveedorItem) => item.contacto,
      sortingField: 'contacto',
      minWidth: 180,
      editConfig: {
        ariaLabel: 'Editar persona de contacto',
        editIconAriaLabel: 'editable',
        errorIconAriaLabel: 'Error de validación',
        editingCell: (item: ProveedorItem, { currentValue, setValue }: any) => (
          <Input
            autoFocus
            value={currentValue ?? item.contacto}
            onChange={(e) => setValue(e.detail.value)}
            placeholder="Ej. Juan Pérez"
          />
        ),
        validation: (_item: ProveedorItem, value: string) => {
          if (!value || value.trim() === '')
            return 'El nombre del contacto es requerido.';
          return undefined;
        },
      },
    },
    {
      id: 'telefono',
      header: 'Teléfono',
      cell: (item: ProveedorItem) => item.telefono,
      sortingField: 'telefono',
      minWidth: 150,
      editConfig: {
        ariaLabel: 'Editar teléfono',
        editIconAriaLabel: 'editable',
        errorIconAriaLabel: 'Error de validación',
        editingCell: (item: ProveedorItem, { currentValue, setValue }: any) => (
          <Input
            autoFocus
            type="text" // FIX: Cambiado de "tel" a "text" porque Cloudscape no acepta "tel"
            value={currentValue ?? item.telefono}
            onChange={(e) => setValue(e.detail.value)}
            placeholder="Ej. 555-123-4567"
          />
        ),
        validation: (_item: ProveedorItem, value: string) => {
          if (!value || value.trim() === '') return 'El teléfono es requerido.';
          return undefined;
        },
      },
    },
    {
      id: 'email',
      header: 'Correo Electrónico',
      cell: (item: ProveedorItem) => (
        <a
          href={`mailto:${item.email}`}
          style={{ color: '#0972d3', textDecoration: 'none' }}
        >
          {item.email}
        </a>
      ),
      sortingField: 'email',
      minWidth: 200,
      editConfig: {
        ariaLabel: 'Editar correo electrónico',
        editIconAriaLabel: 'editable',
        errorIconAriaLabel: 'Error de validación',
        editingCell: (item: ProveedorItem, { currentValue, setValue }: any) => (
          <Input
            autoFocus
            type="email" // "email" sí es soportado por Cloudscape
            value={currentValue ?? item.email}
            onChange={(e) => setValue(e.detail.value)}
            placeholder="contacto@empresa.com"
          />
        ),
        validation: (_item: ProveedorItem, value: string) => {
          const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
          if (!value || value.trim() === '') return 'El correo es requerido.';
          if (!emailRegex.test(value))
            return 'Ingresa un formato de correo válido.';
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
  const fetchProveedores = useCallback(
    async (isRefresh = false) => {
      const alertId = addAlert
        ? addAlert(
            'info',
            isRefresh
              ? 'Actualizando lista de proveedores...'
              : 'Obteniendo proveedores desde la base de datos...',
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
          // `${backendUrl}/api/proveedores`
          ``,
          {
            withCredentials: true,
          },
        );

        if (response.data.success) {
          if (isMounted.current) {
            setProveedoresData(response.data.proveedores);
          }
          await new Promise((resolve) => setTimeout(resolve, 600));

          if (addAlert) {
            addAlert(
              'success',
              'Directorio de proveedores cargado correctamente.',
              'Éxito',
              alertId,
              false,
            );
          }
        } else {
          if (addAlert) {
            addAlert(
              'warning',
              'No se encontraron proveedores o hubo un problema al leer la base de datos.',
              'Advertencia',
              alertId,
              false,
            );
          }
        }
      } catch (error: any) {
        console.error('Error cargando proveedores:', error);
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
      fetchProveedores();
    }
  }, [fetchProveedores]);

  // --- LÓGICA DE GUARDADO INLINE HACIA LA API ---
  const handleInlineEditSave = async (
    item: ProveedorItem,
    column: any,
    newValue: string,
  ) => {
    try {
      await axios.put(
        // Ajusta esta ruta a tu endpoint real
        // `${backendUrl}/api/proveedores/${item.proveedor_id}`
        '',
        { [column.id]: newValue },
        { withCredentials: true },
      );

      setProveedoresData((prevData) =>
        prevData.map((prov) =>
          prov.proveedor_id === item.proveedor_id
            ? { ...prov, [column.id]: newValue }
            : prov,
        ),
      );

      if (addAlert) {
        addAlert(
          'success',
          `El campo ${column.header} se actualizó correctamente.`,
          'Guardado exitoso',
          undefined,
          false,
        );
      }
    } catch (error: any) {
      console.error('Error actualizando proveedor:', error);
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
  } = useCollection(proveedoresData, {
    pagination: { pageSize: tablePreferences.pageSize },
    sorting: { defaultState: { sortingColumn: COLUMN_DEFINITIONS[0] } },
    selection: {},
    filtering: {
      empty: (
        <EmptyState
          title="No hay proveedores registrados"
          subtitle="Agrega proveedores de refacciones para poder visualizar su información aquí."
          action={<Button variant="primary">Añadir proveedor</Button>}
        />
      ),
      noMatch: (
        <EmptyState
          title="No hay coincidencias"
          subtitle="No se encontraron proveedores que coincidan con la búsqueda."
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
        {/* Usamos @ts-ignore si SecondaryHeader sigue quejándose de los props */}
        {/* @ts-ignore */}
        <SecondaryHeader
          breadcrumbs={[
            { text: 'Sistema', href: '#' },
            { text: 'Almacén', href: '#' },
            { text: 'Proveedores de Refacciones', href: '/proveedores' },
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
              setSelectedItems(detail.selectedItems as ProveedorItem[])
            }
            columnDefinitions={COLUMN_DEFINITIONS as any}
            items={items}
            selectionType="single"
            variant="full-page"
            stickyHeader={true}
            stickyHeaderVerticalOffset={90}
            loading={loading}
            loadingText="Cargando directorio de proveedores..."
            trackBy="proveedor_id"
            submitEdit={handleInlineEditSave as any}
            empty={
              <div style={{ padding: '40px 0' }}>{collectionProps.empty}</div>
            }
            header={
              <Header
                variant="h1"
                counter={!loading ? `(${items.length})` : ''}
                description="Administra los contactos y empresas proveedoras de refacciones para tu almacén."
                actions={
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button
                      iconName="refresh"
                      loading={refreshing}
                      onClick={() => fetchProveedores(true)}
                      ariaLabel="Refrescar"
                    />
                    <Button disabled={selectedItems.length === 0}>
                      Eliminar
                    </Button>
                    <Button variant="primary">Nuevo proveedor</Button>
                  </SpaceBetween>
                }
              >
                Proveedores
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
                    { value: 20, label: '20 recursos' },
                    { value: 50, label: '50 recursos' },
                  ],
                }}
                visibleContentPreference={{
                  title: 'Seleccionar columnas visibles',
                  options: [
                    {
                      label: 'Información del proveedor',
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
                filteringPlaceholder="Buscar por empresa, contacto o correo..."
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
