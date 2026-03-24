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

// 👇 AQUÍ IMPORTAS TU IMAGEN LOCAL (Ajusta la ruta y el nombre del archivo) 👇
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
  .area-color-dot {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 8px;
    vertical-align: middle;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
  }
  .color-picker-input {
    -webkit-appearance: none;
    border: none;
    width: 28px;
    height: 28px;
    border-radius: 4px;
    cursor: pointer;
    padding: 0;
    background: transparent;
  }
  .color-picker-input::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  .color-picker-input::-webkit-color-swatch {
    border: 1px solid #ccc;
    border-radius: 4px;
  }
`;

// --- INTERFACES ---
export interface AreaItem {
  area_id: number;
  level: string;
  descripcion: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

// --- NUEVO COMPONENTE: EMPTY STATE ---
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
          src={emptyStateImage} // Usamos la variable importada arriba
          alt="Estado vacío"
          style={{
            maxWidth: '250px', // Tamaño adaptado a la captura
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

export default function AreasTable() {
  // 🚩 CORRECCIÓN: Usamos la variable de entorno de Vite para la URL del backend
  const { alerts, addAlert, setPageLoading } = useContext(AppContent) || {};
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [navigationOpen, setNavigationOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [areasData, setAreasData] = useState<AreaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<AreaItem[]>([]);

  const [tablePreferences, setTablePreferences] = useState({
    pageSize: 20,
    visibleContent: ['area_id', 'level', 'color', 'descripcion'],
  });

  const isMounted = useRef(true);
  const hasFetched = useRef(false);

  // --- DEFINICIÓN DE COLUMNAS CON INLINE EDIT ---
  const COLUMN_DEFINITIONS = [
    {
      id: 'area_id',
      header: 'ID',
      cell: (item: AreaItem) => item.area_id,
      sortingField: 'area_id',
      minWidth: 80,
      isRowHeader: true,
    },
    {
      id: 'level',
      header: 'Área',
      cell: (item: AreaItem) => (
        <strong style={{ textTransform: 'capitalize' }}>{item.level}</strong>
      ),
      sortingField: 'level',
      minWidth: 160,
      editConfig: {
        ariaLabel: 'Editar nombre del área',
        editIconAriaLabel: 'editable',
        errorIconAriaLabel: 'Error de validación',
        editingCell: (item: AreaItem, { currentValue, setValue }: any) => (
          <Input
            autoFocus
            value={currentValue ?? item.level}
            onChange={(e) => setValue(e.detail.value)}
            placeholder="Ej. almacén"
          />
        ),
        validation: (_item: AreaItem, value: string) => {
          if (!value || value.trim() === '')
            return 'El nombre del área es requerido.';
          return undefined;
        },
      },
    },
    {
      id: 'color',
      header: 'Color',
      cell: (item: AreaItem) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span
            className="area-color-dot"
            style={{ backgroundColor: item.color || '#879596' }}
          ></span>
          <span
            style={{
              fontFamily: 'monospace',
              color: '#5f6b7a',
              fontSize: '12px',
            }}
          >
            {item.color ? item.color.toUpperCase() : '#879596'}
          </span>
        </div>
      ),
      sortingField: 'color',
      minWidth: 140,
      editConfig: {
        ariaLabel: 'Editar color del área',
        editIconAriaLabel: 'editable',
        errorIconAriaLabel: 'Error de validación',
        editingCell: (item: AreaItem, { currentValue, setValue }: any) => {
          const hexColor = currentValue ?? item.color ?? '#000000';
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="color"
                className="color-picker-input"
                value={hexColor}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
              />
              <Input
                value={hexColor}
                onChange={(e) => setValue(e.detail.value)}
                placeholder="#000000"
              />
            </div>
          );
        },
        validation: (_item: AreaItem, value: string) => {
          const hexRegex = /^#([0-9A-F]{3}){1,2}$/i;
          if (!value || !hexRegex.test(value))
            return 'Ingresa un código HEX válido (ej. #FF0000).';
          return undefined;
        },
      },
    },
    {
      id: 'descripcion',
      header: 'Descripción',
      cell: (item: AreaItem) => item.descripcion,
      sortingField: 'descripcion',
      minWidth: 350,
      editConfig: {
        ariaLabel: 'Editar descripción',
        editIconAriaLabel: 'editable',
        errorIconAriaLabel: 'Error de validación',
        editingCell: (item: AreaItem, { currentValue, setValue }: any) => (
          <Input
            autoFocus
            value={currentValue ?? item.descripcion}
            onChange={(e) => setValue(e.detail.value)}
            placeholder="Descripción de responsabilidades..."
          />
        ),
        validation: (_item: AreaItem, value: string) => {
          if (!value || value.trim() === '')
            return 'La descripción es requerida.';
          if (value.length < 10)
            return 'La descripción debe ser más detallada.';
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
  const fetchAreas = useCallback(
    async (isRefresh = false) => {
      const alertId = addAlert
        ? addAlert(
            'info',
            isRefresh
              ? 'Actualizando áreas...'
              : 'Obteniendo áreas desde la base de datos...',
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
          `${backendUrl}/api/levelArea`,
          // ``
          {
            withCredentials: true,
          },
        );

        if (response.data.success) {
          if (isMounted.current) {
            setAreasData(response.data.areas);
          }
          await new Promise((resolve) => setTimeout(resolve, 600));

          if (addAlert) {
            addAlert(
              'success',
              'Catálogo de áreas cargado correctamente.',
              'Éxito',
              alertId,
              false,
            );
          }
        } else {
          if (addAlert) {
            addAlert(
              'warning',
              'No se encontraron áreas o hubo un problema al leer la base de datos.',
              'Advertencia',
              alertId,
              false,
            );
          }
        }
      } catch (error: any) {
        console.error('Error cargando áreas:', error);
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
      fetchAreas();
    }
  }, [fetchAreas]);

  // --- LÓGICA DE GUARDADO INLINE HACIA LA API ---
  const handleInlineEditSave = async (
    item: AreaItem,
    column: any,
    newValue: string,
  ) => {
    try {
      await axios.put(
        `${backendUrl}/api/levelArea/${item.area_id}`,
        // ''
        { [column.id]: newValue },
        { withCredentials: true },
      );

      setAreasData((prevData) =>
        prevData.map((area) =>
          area.area_id === item.area_id
            ? { ...area, [column.id]: newValue }
            : area,
        ),
      );

      if (addAlert) {
        addAlert(
          'success',
          `El campo ${column.header} se actualizó correctamente en la base de datos.`,
          'Guardado exitoso',
          undefined,
          false,
        );
      }
    } catch (error: any) {
      console.error('Error actualizando área:', error);
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
  } = useCollection(areasData, {
    pagination: { pageSize: tablePreferences.pageSize },
    sorting: { defaultState: { sortingColumn: COLUMN_DEFINITIONS[0] } },
    selection: {},
    filtering: {
      empty: (
        <EmptyState
          title="No hay áreas operativas"
          subtitle="No existen áreas registradas en el sistema para mostrar."
          action={<Button variant="primary">Crear área</Button>}
        />
      ),
      noMatch: (
        <EmptyState
          title="No hay coincidencias"
          subtitle="No se encontraron áreas que coincidan con la búsqueda."
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
            { text: 'Configuración', href: '#' },
            { text: 'Áreas Operativas', href: '/areas' },
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
              setSelectedItems(detail.selectedItems as AreaItem[])
            }
            columnDefinitions={COLUMN_DEFINITIONS as any}
            items={items}
            selectionType="single"
            variant="full-page"
            stickyHeader={true}
            stickyHeaderVerticalOffset={90}
            loading={loading}
            loadingText="Cargando áreas operativas..."
            trackBy="area_id"
            submitEdit={handleInlineEditSave as any}
            // Mantenemos un padding generoso para que el empty state se vea centrado y limpio
            empty={
              <div style={{ padding: '40px 0' }}>{collectionProps.empty}</div>
            }
            header={
              <Header
                variant="h1"
                counter={!loading ? `(${items.length})` : ''}
                description="Administra los departamentos operativos y sus colores identificativos."
                actions={
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button
                      iconName="refresh"
                      loading={refreshing}
                      onClick={() => fetchAreas(true)}
                      ariaLabel="Refrescar"
                    />
                    <Button disabled={selectedItems.length === 0}>
                      Eliminar
                    </Button>
                    <Button variant="primary">Nueva área</Button>
                  </SpaceBetween>
                }
              >
                Áreas Operativas
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
                    { value: 20, label: '20 recursos' },
                    { value: 50, label: '50 recursos' },
                  ],
                }}
                visibleContentPreference={{
                  title: 'Seleccionar columnas visibles',
                  options: [
                    {
                      label: 'Propiedades principales',
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
                filteringPlaceholder="Buscar áreas..."
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
