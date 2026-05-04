import axios from 'axios';
import { useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

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
  StatusIndicator,
  Badge,
  SplitPanel,
  ColumnLayout,
  Link,
  CollectionPreferences,
} from '@cloudscape-design/components';
import { useCollection } from '@cloudscape-design/collection-hooks';

import { AppContent } from '@/context/AppContext';

import Navbar from '@/components/layouts/AppHeader';
import GlobalSidebar from '@/components/layouts/AppSidebar';
import { Footer } from '@/components/layouts/AppFooter';
import SecondaryHeader from '@/components/layouts/BreadcrumbNavBar';

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
  .awsui-table-select {
    padding-left: 10px !important;
  }
`;

export interface UserItem {
  id: string;
  email: string;
  rol_id: number;
  role_name: string;
  area_id: number;
  area_level: string;
  name: string;
  surname: string;
  country: string;
  birth_date: string;
  is_account_verified: boolean;
  is_active: boolean;
}

const COLUMN_DEFINITIONS = [
  {
    id: 'name',
    header: 'Nombre',
    cell: (item: UserItem) => (
      <Link href="#" variant="primary" {...({ fontSize: 'body-m' } as any)}>
        <b>{`${item.name} ${item.surname || ''}`}</b>
      </Link>
    ),
    sortingField: 'name',
    isRowHeader: true,
    minWidth: 180,
  },
  {
    id: 'email',
    header: 'Correo Electrónico',
    cell: (item: UserItem) => item.email,
    sortingField: 'email',
    minWidth: 200,
  },
  {
    id: 'role_name',
    header: 'Rol',
    cell: (item: UserItem) => (
      <Badge color={item.role_name === 'admin' ? 'blue' : 'grey'}>
        {item.role_name || 'Sin Rol'}
      </Badge>
    ),
    sortingField: 'role_name',
    minWidth: 120,
  },
  {
    id: 'area_level',
    header: 'Área',
    cell: (item: UserItem) => item.area_level || 'General',
    sortingField: 'area_level',
    minWidth: 140,
  },
  {
    id: 'status',
    header: 'Estado',
    cell: (item: UserItem) => (
      <StatusIndicator type={item.is_active ? 'success' : 'stopped'}>
        {item.is_active ? 'Activo' : 'Inactivo'}
      </StatusIndicator>
    ),
    minWidth: 120,
  },
];

const ValueWithLabel = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div>
    <Box variant={'awsui-key-label' as any} color="text-label">
      {label}
    </Box>
    <div>{children}</div>
  </div>
);

const EmptyState = ({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
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

export default function UsersTable() {
  const { alerts, addAlert, setPageLoading } = useContext(AppContent) || {};
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [navigationOpen, setNavigationOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(false);

  const [tablePreferences, setTablePreferences] = useState({
    pageSize: 50,
    visibleContent: ['name', 'email', 'role_name', 'area_level', 'status'],
  });

  const [splitPreferences, setSplitPreferences] = useState<any>({
    position: 'bottom',
  });

  const [usersData, setUsersData] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<UserItem[]>([]);

  // Estados Asíncronos para control de peticiones simultáneas
  const [isToggling, setIsToggling] = useState(false);
  const [isTogglingVerification, setIsTogglingVerification] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);

  const [splitPanelOpen, setSplitPanelOpen] = useState(false);
  const [splitPanelSize, setSplitPanelSize] = useState(280);

  const isMounted = useRef(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    if (setPageLoading) setPageLoading(false);
    return () => {
      isMounted.current = false;
    };
  }, [setPageLoading]);

  const fetchUsers = useCallback(
    async (isRefresh = false) => {
      try {
        if (isMounted.current) {
          if (isRefresh) setRefreshing(true);
          else setLoading(true);
        }

        const response = await axios.get(`${backendUrl}/api/user/all-users`, {
          withCredentials: true,
        });

        if (response.data.success && isMounted.current) {
          setUsersData(response.data.users);
        }
      } catch (error: any) {
        if (error.response?.status === 403) {
          if (addAlert)
            addAlert(
              'error',
              error.response.data.message ||
                'No tienes permisos para ver el directorio.',
              'Acceso Denegado',
            );
        } else {
          if (addAlert)
            addAlert(
              'error',
              'Error al conectar con el servidor.',
              'Fallo de Red',
            );
        }
        if (isMounted.current) setUsersData([]);
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
      fetchUsers();
    }
  }, [fetchUsers]);

  useEffect(() => {
    if (selectedItems.length > 0) setSplitPanelOpen(true);
    else setSplitPanelOpen(false);
  }, [selectedItems]);

  const handleToggleStatus = async (user: UserItem) => {
    try {
      setIsToggling(true);
      const res = await axios.put(
        `${backendUrl}/api/user/toggle-status/${user.id}`,
        {},
        { withCredentials: true },
      );

      if (res.data.success) {
        if (addAlert)
          addAlert('success', res.data.message, 'Estado Actualizado');

        setUsersData((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, is_active: res.data.is_active } : u,
          ),
        );
        setSelectedItems([{ ...user, is_active: res.data.is_active }]);
      }
    } catch (error: any) {
      if (error.response?.status === 400 || error.response?.status === 403) {
        if (addAlert)
          addAlert('warning', error.response.data.message, 'Acción Denegada');
      } else {
        if (addAlert)
          addAlert(
            'error',
            error.response?.data?.message || 'Error al cambiar estado.',
            'Error',
          );
      }
    } finally {
      setIsToggling(false);
    }
  };

  const handleToggleVerification = async (user: UserItem) => {
    try {
      setIsTogglingVerification(true);
      const res = await axios.put(
        `${backendUrl}/api/user/toggle-verification/${user.id}`,
        {},
        { withCredentials: true },
      );

      if (res.data.success) {
        if (addAlert)
          addAlert('success', res.data.message, 'Verificación Actualizada');

        setUsersData((prev) =>
          prev.map((u) =>
            u.id === user.id
              ? { ...u, is_account_verified: res.data.is_account_verified }
              : u,
          ),
        );
        setSelectedItems([
          { ...user, is_account_verified: res.data.is_account_verified },
        ]);
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        if (addAlert)
          addAlert('warning', error.response.data.message, 'Acceso Denegado');
      } else {
        if (addAlert)
          addAlert(
            'error',
            error.response?.data?.message || 'Error al cambiar verificación.',
            'Error',
          );
      }
    } finally {
      setIsTogglingVerification(false);
    }
  };

  const handleSendReset = async (user: UserItem) => {
    try {
      setIsSendingReset(true);
      const res = await axios.post(
        `${backendUrl}/api/user/send-reset-instructions/${user.id}`,
        {},
        { withCredentials: true },
      );

      if (res.data.success) {
        if (addAlert)
          addAlert(
            'success',
            res.data.message,
            'Correo de Restablecimiento Enviado',
          );
      }
    } catch (error: any) {
      if (error.response?.status === 400 || error.response?.status === 403) {
        if (addAlert)
          addAlert('warning', error.response.data.message, 'Acción Bloqueada');
      } else {
        if (addAlert)
          addAlert(
            'error',
            error.response?.data?.message ||
              'Error interno al intentar enviar el correo.',
            'Error del Servidor',
          );
      }
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleSendVerification = async (user: UserItem) => {
    try {
      setIsSendingVerification(true);
      const res = await axios.post(
        `${backendUrl}/api/user/send-verification/${user.id}`,
        {},
        { withCredentials: true },
      );

      if (res.data.success) {
        if (addAlert)
          addAlert(
            'success',
            res.data.message,
            'Correo de Verificación Enviado',
          );
      }
    } catch (error: any) {
      if (error.response?.status === 400 || error.response?.status === 403) {
        if (addAlert)
          addAlert('warning', error.response.data.message, 'Acción Bloqueada');
      } else {
        if (addAlert)
          addAlert(
            'error',
            error.response?.data?.message ||
              'Error al intentar enviar el correo de verificación.',
            'Error del Servidor',
          );
      }
    } finally {
      setIsSendingVerification(false);
    }
  };

  const {
    items,
    actions,
    filteredItemsCount,
    collectionProps,
    paginationProps,
    filterProps,
  } = useCollection(usersData, {
    pagination: { pageSize: tablePreferences.pageSize },
    sorting: { defaultState: { sortingColumn: COLUMN_DEFINITIONS[0] } },
    selection: {},
    filtering: {
      empty: (
        <EmptyState
          title="Directorio Vacío"
          subtitle="No se encontraron usuarios o no tienes permisos."
          action={<Button variant="primary">Crear usuario</Button>}
        />
      ),
      noMatch: (
        <EmptyState
          title="No hay coincidencias"
          subtitle="No se encontraron usuarios que coincidan con la búsqueda."
          action={
            <Button onClick={() => actions.setFiltering('')}>
              Borrar filtro
            </Button>
          }
        />
      ),
    },
  });

  const getSplitPanelContent = (user: UserItem | undefined) => {
    if (!user)
      return (
        <SplitPanel header={'Detalles del Usuario' as any}>
          <Box textAlign="center" padding="l">
            Selecciona un usuario para ver detalles.
          </Box>
        </SplitPanel>
      );

    const isAnyActionLoading =
      isSendingReset ||
      isToggling ||
      isSendingVerification ||
      isTogglingVerification;

    return (
      <SplitPanel
        header={
          (
            <Header
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  {/* Botón para forzar la validación de cuenta desde el sistema */}
                  <Button
                    iconName={
                      user.is_account_verified
                        ? 'status-negative'
                        : 'status-positive'
                    }
                    loading={isTogglingVerification}
                    onClick={() => handleToggleVerification(user)}
                    disabled={isAnyActionLoading}
                  >
                    {user.is_account_verified
                      ? 'Desverificar'
                      : 'Validar Cuenta'}
                  </Button>

                  <Button
                    loading={isSendingVerification}
                    onClick={() => handleSendVerification(user)}
                    disabled={isAnyActionLoading || user.is_account_verified}
                  >
                    Enviar Verificación
                  </Button>

                  <Button
                    loading={isSendingReset}
                    onClick={() => handleSendReset(user)}
                    disabled={isAnyActionLoading || !user.is_account_verified}
                  >
                    Restablecer Contraseña
                  </Button>

                  <Button
                    variant={user.is_active ? 'normal' : 'primary'}
                    loading={isToggling}
                    onClick={() => handleToggleStatus(user)}
                    disabled={isAnyActionLoading}
                  >
                    {user.is_active ? 'Deshabilitar' : 'Habilitar'}
                  </Button>
                </SpaceBetween>
              }
            >
              {user.name} {user.surname}
            </Header>
          ) as any
        }
        i18nStrings={{
          preferencesTitle: 'Preferencias del panel',
          preferencesPositionLabel: 'Posición del panel',
          preferencesPositionDescription: 'Elige posición',
          preferencesPositionSide: 'Lado',
          preferencesPositionBottom: 'Abajo',
          closeButtonAriaLabel: 'Cerrar panel',
          openButtonAriaLabel: 'Abrir panel',
          resizeHandleAriaLabel: 'Redimensionar panel',
        }}
      >
        <ColumnLayout columns={3} variant="text-grid">
          <SpaceBetween size="l">
            <div>
              <Box variant="h3" padding={{ bottom: 's' }}>
                Estado de Cuenta
              </Box>
              <SpaceBetween size="m">
                <ValueWithLabel label="Email">
                  {user.is_account_verified ? (
                    <StatusIndicator type="success">Verificado</StatusIndicator>
                  ) : (
                    <StatusIndicator type="pending">Pendiente</StatusIndicator>
                  )}
                </ValueWithLabel>
                <ValueWithLabel label="Acceso">
                  <StatusIndicator
                    type={user.is_active ? 'success' : 'stopped'}
                  >
                    {user.is_active ? 'Habilitado' : 'Deshabilitado'}
                  </StatusIndicator>
                </ValueWithLabel>
              </SpaceBetween>
            </div>
          </SpaceBetween>

          <SpaceBetween size="l">
            <div>
              <Box variant="h3" padding={{ bottom: 's' }}>
                Organización
              </Box>
              <SpaceBetween size="m">
                <ValueWithLabel label="Rol">
                  <Badge color="blue">{user.role_name}</Badge>
                </ValueWithLabel>
                <ValueWithLabel label="Área">{user.area_level}</ValueWithLabel>
              </SpaceBetween>
            </div>
          </SpaceBetween>

          <SpaceBetween size="l">
            <div>
              <Box variant="h3" padding={{ bottom: 's' }}>
                Datos Personales
              </Box>
              <SpaceBetween size="m">
                <ValueWithLabel label="Nombre">
                  {user.name} {user.surname}
                </ValueWithLabel>
                <ValueWithLabel label="Correo">{user.email}</ValueWithLabel>
                <ValueWithLabel label="País">{user.country}</ValueWithLabel>
              </SpaceBetween>
            </div>
          </SpaceBetween>
        </ColumnLayout>
        <Box padding="s"></Box>
      </SplitPanel>
    );
  };

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
            { text: 'Usuarios', href: '/users' },
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
        splitPanel={getSplitPanelContent(selectedItems[0])}
        splitPanelOpen={splitPanelOpen}
        onSplitPanelToggle={({ detail }) => setSplitPanelOpen(detail.open)}
        splitPanelSize={splitPanelSize}
        onSplitPanelResize={({ detail }) => setSplitPanelSize(detail.size)}
        splitPanelPreferences={splitPreferences}
        onSplitPanelPreferencesChange={({ detail }) =>
          setSplitPreferences(detail)
        }
        content={
          <Table
            {...collectionProps}
            selectedItems={selectedItems}
            onSelectionChange={({ detail }) =>
              setSelectedItems(detail.selectedItems as UserItem[])
            }
            columnDefinitions={COLUMN_DEFINITIONS}
            items={items}
            selectionType="single"
            variant="full-page"
            stickyHeader={true}
            stickyHeaderVerticalOffset={90}
            loading={loading}
            loadingText="Verificando permisos y cargando directorio..."
            empty={
              <div style={{ padding: '40px 0' }}>{collectionProps.empty}</div>
            }
            header={
              <Header
                variant="h1"
                counter={!loading ? `(${items.length})` : ''}
                actions={
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button
                      iconName="refresh"
                      loading={refreshing}
                      onClick={() => fetchUsers(true)}
                      ariaLabel="Refrescar"
                    />
                    <Button disabled={selectedItems.length === 0}>
                      Editar
                    </Button>
                    <Button variant="primary">Crear usuario</Button>
                  </SpaceBetween>
                }
              >
                Usuarios
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
                    { value: 50, label: '50 recursos' },
                    { value: 100, label: '100 recursos' },
                    { value: 200, label: '200 recursos' },
                  ],
                }}
                visibleContentPreference={{
                  title: 'Columnas visibles',
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
                filteringPlaceholder="Buscar usuarios..."
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
