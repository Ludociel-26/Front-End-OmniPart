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
  Modal,
  FormField,
} from '@cloudscape-design/components';
import { useCollection } from '@cloudscape-design/collection-hooks';

// Contexto Global
import { AppContent } from '@/context/AppContext';

// Imports Locales
import Navbar from '@/components/layouts/AppHeader';
import GlobalSidebar from '@/components/layouts/AppSidebar';
import { Footer } from '@/components/layouts/AppFooter';
import SecondaryHeader from '@/components/layouts/BreadcrumbNavBar';

// Imagen estado vacío
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

export default function AreasTable() {
  const { alerts, addAlert, setPageLoading } = useContext(AppContent) || {};
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Estados de Interfaz
  const [navigationOpen, setNavigationOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados de Datos
  const [areasData, setAreasData] = useState<AreaItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<AreaItem[]>([]);

  // Estados para Modal de Creación
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newArea, setNewArea] = useState({
    level: '',
    descripcion: '',
    color: '#fcfcfc',
  });

  // Estados para Modal de Eliminación
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [tablePreferences, setTablePreferences] = useState({
    pageSize: 20,
    visibleContent: ['area_id', 'level', 'color', 'descripcion'],
  });

  const isMounted = useRef(true);
  const hasFetched = useRef(false);

  // --- COLUMNAS CON INLINE EDIT ---
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
            placeholder="Ej. Almacén"
          />
        ),
        validation: (_item: AreaItem, value: string) => {
          if (!value || value.trim() === '') return 'El nombre es requerido.';
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
            return 'HEX inválido (ej. #FF0000).';
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
          if (!value || value.trim() === '') return 'Requerida.';
          if (value.length < 5) return 'Debe ser más detallada.';
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

  // --- 1. OBTENER DATOS (GET) ---
  const fetchAreas = useCallback(
    async (isRefresh = false) => {
      try {
        if (isMounted.current) {
          if (isRefresh) setRefreshing(true);
          else setLoading(true);
        }
        const response = await axios.get(`${backendUrl}/api/levelArea`, {
          withCredentials: true,
        });
        if (response.data.success) {
          if (isMounted.current) setAreasData(response.data.areas);
        }
      } catch (error: any) {
        // 🛡️ CAPTURA DE ERROR DE PERMISOS (403)
        if (error.response?.status === 403) {
          if (addAlert)
            addAlert(
              'error',
              error.response.data.message ||
                'No tienes permisos para ver las áreas.',
              'Acceso Denegado',
            );
        } else {
          if (addAlert)
            addAlert('error', 'Error al obtener las áreas.', 'Fallo de Red');
        }
        if (isMounted.current) setAreasData([]); // Muestra el Empty State
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

  // --- 2. ACTUALIZAR DATO INLINE (PUT) ---
  const handleInlineEditSave = async (
    item: AreaItem,
    column: any,
    newValue: string,
  ) => {
    try {
      const payload = { [column.id]: newValue };
      const res = await axios.put(
        `${backendUrl}/api/levelArea/${item.area_id}`,
        payload,
        { withCredentials: true },
      );

      if (res.data.success) {
        setAreasData((prevData) =>
          prevData.map((area) =>
            area.area_id === item.area_id
              ? { ...area, [column.id]: newValue }
              : area,
          ),
        );
        if (addAlert) addAlert('success', `Área actualizada correctamente.`);
      }
    } catch (error: any) {
      // 🛡️ CAPTURA DE ERROR DE PERMISOS Y VALIDACIONES
      if (error.response?.status === 403) {
        if (addAlert)
          addAlert('error', error.response.data.message, 'Acceso Denegado');
      } else {
        if (addAlert)
          addAlert(
            'error',
            error.response?.data?.message || 'Error al guardar los cambios.',
          );
      }
      throw error; // Requerido para abortar el cambio visual en la tabla
    }
  };

  // --- 3. CREAR NUEVA ÁREA (POST) ---
  const handleCreateArea = async () => {
    if (!newArea.level) {
      if (addAlert) addAlert('error', 'El nombre del área es obligatorio.');
      return;
    }
    try {
      setIsCreating(true);
      const res = await axios.post(`${backendUrl}/api/levelArea`, newArea, {
        withCredentials: true,
      });
      if (res.data.success) {
        if (addAlert) addAlert('success', 'Área creada exitosamente.');
        setIsCreateModalVisible(false);
        setNewArea({ level: '', descripcion: '', color: '#fcfcfc' });
        fetchAreas(); // Refrescar la tabla
      }
    } catch (error: any) {
      // 🛡️ CAPTURA DE ERROR DE PERMISOS Y VALIDACIONES
      if (error.response?.status === 403) {
        if (addAlert)
          addAlert('error', error.response.data.message, 'Acceso Denegado');
      } else {
        if (addAlert)
          addAlert(
            'error',
            error.response?.data?.message || 'Error al crear el área.',
          );
      }
    } finally {
      setIsCreating(false);
    }
  };

  // --- 4. ELIMINAR ÁREA (DELETE) ---
  const handleDeleteArea = async () => {
    if (selectedItems.length === 0) return;
    try {
      setIsDeleting(true);
      const areaId = selectedItems[0].area_id;

      await axios.delete(`${backendUrl}/api/levelArea/${areaId}`, {
        withCredentials: true,
      });

      if (addAlert) addAlert('success', 'Área eliminada exitosamente.');
      setSelectedItems([]);
      setIsDeleteModalVisible(false);
      fetchAreas();
    } catch (error: any) {
      // 🛡️ CAPTURA DE ERROR DE PERMISOS Y VALIDACIONES
      if (error.response?.status === 403) {
        if (addAlert)
          addAlert('error', error.response.data.message, 'Acceso Denegado');
      } else {
        if (addAlert)
          addAlert(
            'error',
            error.response?.data?.message ||
              'Error al eliminar el área. Asegúrese de que no esté en uso.',
          );
      }
    } finally {
      setIsDeleting(false);
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
          subtitle="No existen áreas registradas o no tienes permisos para verlas."
          action={
            <Button
              variant="primary"
              onClick={() => setIsCreateModalVisible(true)}
            >
              Crear área
            </Button>
          }
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
            loadingText="Verificando permisos y cargando áreas..."
            trackBy="area_id"
            submitEdit={handleInlineEditSave as any}
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
                    <Button
                      disabled={selectedItems.length === 0}
                      onClick={() => setIsDeleteModalVisible(true)}
                    >
                      Eliminar
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => setIsCreateModalVisible(true)}
                    >
                      Nueva área
                    </Button>
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
                    { value: 20, label: '20 áreas' },
                    { value: 50, label: '50 áreas' },
                  ],
                }}
                visibleContentPreference={{
                  title: 'Columnas visibles',
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
                filteringPlaceholder="Buscar áreas..."
                countText={`${filteredItemsCount} coincidencias`}
              />
            }
            pagination={<Pagination {...paginationProps} />}
          />
        }
      />
      <Footer />

      {/* --- MODAL DE CREACIÓN --- */}
      <Modal
        onDismiss={() => setIsCreateModalVisible(false)}
        visible={isCreateModalVisible}
        closeAriaLabel="Cerrar"
        header="Crear nueva área operativa"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant="link"
                onClick={() => setIsCreateModalVisible(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                loading={isCreating}
                onClick={handleCreateArea}
              >
                Crear Área
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween direction="vertical" size="m">
          <FormField
            label="Nombre del área"
            description="El nombre oficial del departamento."
          >
            <Input
              value={newArea.level}
              onChange={({ detail }) =>
                setNewArea({ ...newArea, level: detail.value })
              }
              placeholder="Ej. Producción"
            />
          </FormField>
          <FormField
            label="Descripción"
            description="Responsabilidades de esta área."
          >
            <Input
              value={newArea.descripcion}
              onChange={({ detail }) =>
                setNewArea({ ...newArea, descripcion: detail.value })
              }
              placeholder="Encargados de..."
            />
          </FormField>
          <FormField
            label="Color identificativo"
            description="Selecciona un color en formato HEX."
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="color"
                className="color-picker-input"
                value={newArea.color}
                onChange={(e) =>
                  setNewArea({ ...newArea, color: e.target.value })
                }
              />
              <Input
                value={newArea.color}
                onChange={({ detail }) =>
                  setNewArea({ ...newArea, color: detail.value })
                }
                placeholder="#fcfcfc"
              />
            </div>
          </FormField>
        </SpaceBetween>
      </Modal>

      {/* --- MODAL DE ELIMINACIÓN --- */}
      <Modal
        onDismiss={() => setIsDeleteModalVisible(false)}
        visible={isDeleteModalVisible}
        closeAriaLabel="Cerrar"
        header="Eliminar área"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant="link"
                onClick={() => setIsDeleteModalVisible(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                loading={isDeleting}
                onClick={handleDeleteArea}
              >
                Sí, Eliminar
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Box variant="p">
          ¿Estás seguro de que deseas eliminar el área{' '}
          <b>{selectedItems[0]?.level}</b>? Esta acción no se puede deshacer y
          puede afectar a los usuarios asignados a ella.
        </Box>
      </Modal>
    </div>
  );
}
