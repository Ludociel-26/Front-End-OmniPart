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

export interface RoleItem {
  rol_id: number;
  name: string;
  descripcion: string;
  createdAt?: string;
  updatedAt?: string;
}

const EmptyState = ({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action: React.ReactNode;
}) => (
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

export default function RolesTable() {
  const { alerts, addAlert, setPageLoading } = useContext(AppContent) || {};
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [navigationOpen, setNavigationOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(false);

  const [rolesData, setRolesData] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<RoleItem[]>([]);

  // Modales
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', descripcion: '' });

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [tablePreferences, setTablePreferences] = useState({
    pageSize: 20,
    visibleContent: ['rol_id', 'name', 'descripcion'],
  });

  const isMounted = useRef(true);
  const hasFetched = useRef(false);

  const COLUMN_DEFINITIONS = [
    {
      id: 'rol_id',
      header: 'ID',
      cell: (item: RoleItem) => item.rol_id,
      sortingField: 'rol_id',
      minWidth: 80,
      isRowHeader: true,
    },
    {
      id: 'name',
      header: 'Nombre del Rol',
      cell: (item: RoleItem) => (
        <strong style={{ textTransform: 'capitalize' }}>{item.name}</strong>
      ),
      sortingField: 'name',
      minWidth: 160,
      editConfig: {
        ariaLabel: 'Editar nombre',
        editIconAriaLabel: 'editable',
        errorIconAriaLabel: 'Error de validación',
        editingCell: (item: RoleItem, { currentValue, setValue }: any) => (
          <Input
            autoFocus
            value={currentValue ?? item.name}
            onChange={(e) => setValue(e.detail.value)}
            placeholder="Ej. admin"
          />
        ),
        validation: (_item: RoleItem, value: string) => {
          if (!value || value.trim() === '') return 'Requerido.';
          return undefined;
        },
      },
    },
    {
      id: 'descripcion',
      header: 'Descripción',
      cell: (item: RoleItem) => item.descripcion,
      sortingField: 'descripcion',
      minWidth: 350,
      editConfig: {
        ariaLabel: 'Editar descripción',
        editIconAriaLabel: 'editable',
        errorIconAriaLabel: 'Error de validación',
        editingCell: (item: RoleItem, { currentValue, setValue }: any) => (
          <Input
            autoFocus
            value={currentValue ?? item.descripcion}
            onChange={(e) => setValue(e.detail.value)}
            placeholder="Nivel de acceso..."
          />
        ),
        validation: (_item: RoleItem, value: string) => {
          if (!value || value.trim() === '') return 'Requerida.';
          if (value.length < 5) return 'Demasiado corta.';
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

  // --- 1. GET: OBTENER ROLES ---
  const fetchRoles = useCallback(
    async (isRefresh = false) => {
      try {
        if (isMounted.current) {
          if (isRefresh) setRefreshing(true);
          else setLoading(true);
        }
        // 🔒 Enviamos cookies para la validación RBAC
        const response = await axios.get(`${backendUrl}/api/roles`, {
          withCredentials: true,
        });
        const resData = response.data;
        if (resData.success) {
          if (isMounted.current) setRolesData(resData.roles || []);
        }
      } catch (error: any) {
        if (addAlert)
          addAlert(
            'error',
            'Error al verificar roles. ¿Tienes permisos de admin?',
            'Acceso Denegado',
          );
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
      fetchRoles();
    }
  }, [fetchRoles]);

  // --- 2. PUT: EDICIÓN INLINE ---
  const handleInlineEditSave = async (
    item: RoleItem,
    column: any,
    newValue: string,
  ) => {
    try {
      const payload = { [column.id]: newValue };
      const res = await axios.put(
        `${backendUrl}/api/roles/${item.rol_id}`,
        payload,
        { withCredentials: true },
      );

      if (res.data.success || res.status === 200) {
        setRolesData((prevData) =>
          prevData.map((role) =>
            role.rol_id === item.rol_id
              ? { ...role, [column.id]: newValue }
              : role,
          ),
        );
        if (addAlert) addAlert('success', `Rol actualizado correctamente.`);
      }
    } catch (error: any) {
      if (addAlert)
        addAlert(
          'error',
          error.response?.data?.message || 'Error al guardar los cambios.',
        );
      throw error;
    }
  };

  // --- 3. POST: CREAR ROL ---
  const handleCreateRole = async () => {
    if (!newRole.name) {
      if (addAlert) addAlert('error', 'El nombre del rol es obligatorio.');
      return;
    }
    try {
      setIsCreating(true);
      const res = await axios.post(`${backendUrl}/api/roles`, newRole, {
        withCredentials: true,
      });
      if (res.data.success || res.status === 201) {
        if (addAlert) addAlert('success', 'Rol creado exitosamente.');
        setIsCreateModalVisible(false);
        setNewRole({ name: '', descripcion: '' });
        fetchRoles(); // Sincroniza tabla
      }
    } catch (error: any) {
      if (addAlert)
        addAlert(
          'error',
          error.response?.data?.message || 'Error al crear el rol.',
        );
    } finally {
      setIsCreating(false);
    }
  };

  // --- 4. DELETE: ELIMINAR ROL ---
  const handleDeleteRole = async () => {
    if (selectedItems.length === 0) return;
    try {
      setIsDeleting(true);
      const roleId = selectedItems[0].rol_id;
      await axios.delete(`${backendUrl}/api/roles/${roleId}`, {
        withCredentials: true,
      });

      if (addAlert) addAlert('success', 'Rol eliminado exitosamente.');
      setSelectedItems([]);
      setIsDeleteModalVisible(false);
      fetchRoles();
    } catch (error: any) {
      if (addAlert)
        addAlert(
          'error',
          error.response?.data?.message ||
            'Error al eliminar el rol. ¿Está en uso?',
        );
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
  } = useCollection(rolesData, {
    pagination: { pageSize: tablePreferences.pageSize },
    sorting: { defaultState: { sortingColumn: COLUMN_DEFINITIONS[0] } },
    selection: {},
    filtering: {
      empty: (
        <EmptyState
          title="No hay roles del sistema"
          subtitle="No existen roles o niveles de acceso registrados."
          action={
            <Button
              variant="primary"
              onClick={() => setIsCreateModalVisible(true)}
            >
              Crear rol
            </Button>
          }
        />
      ),
      noMatch: (
        <EmptyState
          title="No hay coincidencias"
          subtitle="No se encontraron roles."
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
            { text: 'Roles y Accesos', href: '/roles' },
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
              setSelectedItems(detail.selectedItems as RoleItem[])
            }
            columnDefinitions={COLUMN_DEFINITIONS as any}
            items={items}
            selectionType="single"
            variant="full-page"
            stickyHeader={true}
            stickyHeaderVerticalOffset={90}
            loading={loading}
            loadingText="Cargando roles..."
            trackBy="rol_id"
            submitEdit={handleInlineEditSave as any}
            empty={
              <div style={{ padding: '40px 0' }}>{collectionProps.empty}</div>
            }
            header={
              <Header
                variant="h1"
                counter={!loading ? `(${items.length})` : ''}
                description="Administra los niveles de acceso y permisos dentro de la plataforma."
                actions={
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button
                      iconName="refresh"
                      loading={refreshing}
                      onClick={() => fetchRoles(true)}
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
                      Nuevo rol
                    </Button>
                  </SpaceBetween>
                }
              >
                Roles del Sistema
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
                filteringPlaceholder="Buscar rol..."
                countText={`${filteredItemsCount} coincidencias`}
              />
            }
            pagination={<Pagination {...paginationProps} />}
          />
        }
      />
      <Footer />

      {/* --- MODAL CREAR ROL --- */}
      <Modal
        onDismiss={() => setIsCreateModalVisible(false)}
        visible={isCreateModalVisible}
        closeAriaLabel="Cerrar"
        header="Crear nuevo Rol"
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
                onClick={handleCreateRole}
              >
                Guardar Rol
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween direction="vertical" size="m">
          <FormField
            label="Nombre del Rol"
            description="Se recomienda usar un nombre corto, ej. 'admin' o 'usuario'."
          >
            <Input
              value={newRole.name}
              onChange={({ detail }) =>
                setNewRole({ ...newRole, name: detail.value })
              }
              placeholder="Ej. auditor"
            />
          </FormField>
          <FormField
            label="Descripción"
            description="Explica el nivel de acceso que otorga este rol."
          >
            <Input
              value={newRole.descripcion}
              onChange={({ detail }) =>
                setNewRole({ ...newRole, descripcion: detail.value })
              }
              placeholder="Permiso de solo lectura..."
            />
          </FormField>
        </SpaceBetween>
      </Modal>

      {/* --- MODAL ELIMINAR ROL --- */}
      <Modal
        onDismiss={() => setIsDeleteModalVisible(false)}
        visible={isDeleteModalVisible}
        closeAriaLabel="Cerrar"
        header="Eliminar Rol"
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
                onClick={handleDeleteRole}
              >
                Sí, Eliminar
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Box variant="p">
          ¿Estás seguro de que deseas eliminar el rol{' '}
          <b>{selectedItems[0]?.name}</b>? Esta acción no se puede deshacer.
        </Box>
      </Modal>
    </div>
  );
}
