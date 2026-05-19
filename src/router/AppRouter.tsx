import React, { useContext, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppContent } from '@/context/AppContext';

// Componentes Cloudscape
import Spinner from '@cloudscape-design/components/spinner';
import Box from '@cloudscape-design/components/box';
import Container from '@cloudscape-design/components/container';

// Componentes UI
import { TopLoadingBar } from '@/components/common/TopLoadingBar';
import ProtectedRoute from './ProtectedRoute';

// --- LAZY LOADING ---
const Dashboard = React.lazy(() => import('@/pages/auth/dashboard/index'));
const Inventory = React.lazy(
  () => import('@/pages/auth/almacén/table-inventory-items/index'),
);
const FolderView = React.lazy(
  () => import('@/pages/auth/almacén/folder-view/index'),
);
const ProductDetailPage = React.lazy(
  () => import('@/pages/auth/product-detail-page/index'),
);
const User = React.lazy(() => import('@/pages/auth/user-management/index'));
const UserReg = React.lazy(
  () => import(`@/pages/auth/user-management/form-register/form`),
);
const UserEdit = React.lazy(
  () => import(`@/pages/auth/user-management/form-register/EditUser`),
);
const CleaningPlanPage = React.lazy(
  () => import('@/pages/public/cleaning-plan-page/index'),
);
const Mondini2Details = React.lazy(
  () => import('@/pages/public/cleaning-plan-page/mondini-2/Mondini2Details'),
);

const Mondini3Details = React.lazy(
  () => import('@/pages/public/cleaning-plan-page/mondini-3/Mondini3Details'),
);

const Mondini6Details = React.lazy(
  () => import('@/pages/public/cleaning-plan-page/mondini-6/Mondini6Details'),
);

const Almacén = React.lazy(
  () => import('@/pages/auth/almacén/product-detail-inventory/index'),
);

const Maintenance = React.lazy(
  () => import('@/pages/auth/mantenimiento/product-detail-inventory/index'),
);

const Checklists = React.lazy(
  () => import('@/pages/auth/mantenimiento/checklists-pre-operativos/index'),
);

const PerformInspection = React.lazy(
  () => import('@/pages/auth/mantenimiento/perform-inspection/index'),
);

const BitacoraVapor = React.lazy(
  () => import('@/pages/auth/mantenimiento/bitacora-central-vapor/index'),
);

const VaporLogsTable = React.lazy(
  () => import('@/pages/auth/mantenimiento/vapor-logs-table/index'),
);

const AirCompressorEntry = React.lazy(
  () => import('@/pages/auth/mantenimiento/air-compressor-entry/index'),
);

const AirLogsTable = React.lazy(
  () => import('@/pages/auth/mantenimiento/air-logs-table/index'),
);

const ChemicalAnalysisEntry = React.lazy(
  () => import('@/pages/auth/mantenimiento/chemical-analysis-entry/index'),
);

const ChemicalAnalysis = React.lazy(
  () => import('@/pages/auth/mantenimiento/chemical-analysis-logs-table'),
);

const DailyReportsFrozenMachinery = React.lazy(
  () =>
    import('@/pages/auth/mantenimiento/daily-reports-frozen-machinery/index'),
);

const DailyReportsRefrigeratedMachinery = React.lazy(
  () =>
    import('@/pages/auth/mantenimiento/daily-reports-refrigerated-machinery/index'),
);

const DailyReportsRefrigeratedMachineryLogsTable = React.lazy(
  () =>
    import('@/pages/auth/mantenimiento/daily-reports-frozen-machinery-logs-table/index'),
);

const DailyReportsRefrigerationRefrigerated = React.lazy(
  () =>
    import('@/pages/auth/mantenimiento/daily-reports-refrigeration-refrigerated'),
);

const CuartoFrio5TelemetryEntry = React.lazy(
  () => import('@/pages/auth/mantenimiento/cuarto-frio5-telemetry-entry/index'),
);

const TelemetryEntry = React.lazy(
  () => import('@/pages/auth/mantenimiento/telemetry-entry/index'),
);

const AdministrationCenter = React.lazy(
  () => import('@/pages/auth/user-management/product-detail-user/index'),
);

const AreasTable = React.lazy(
  () => import('@/pages/auth/user-management/area/AreasTable'),
);

const RolesTable = React.lazy(
  () => import('@/pages/auth/user-management/roles/RolesTable'),
);

const VisualComparator = React.lazy(
  () => import('@/pages/auth/almacén/visual-comparator/ImageComparator'),
);

const SupplierItem = React.lazy(
  () => import('@/pages/auth/almacén/provider/ProveedorItem'),
);

const LocationsItem = React.lazy(
  () => import('@/pages/auth/almacén/locations/UbicacionItem'),
);

const UsesforSpareParts = React.lazy(
  () => import('@/pages/auth/almacén/UsesforSpareParts/UsesforSpareParts'),
);

const UserInf = React.lazy(
  () => import('@/pages/auth/user-management/user-info/index'),
);

const InfoSystem = React.lazy(() => import('@/pages/auth/about/index'));

const Services = React.lazy(() => import('@/pages/auth/services/index'));

// Imports estáticos
import Login from '@/pages/auth/SignIn';
import Home from '@/pages/public/Home';
import Verify from '@/pages/auth/VerifyEmail';
import ResetPassword from '@/pages/auth/ResetPassword';
import NotFound from '@/pages/auth/NotFound';

const AppRouter = () => {
  // 1. Extraemos isLoggedin aquí también para proteger las rutas públicas
  const { isLoading, pageLoading, isLoggedin } = useContext(AppContent)!;

  // 2. BLOQUEO DE CARGA INICIAL (Full Screen)
  // Mantiene el usuario en espera hasta que el backend responda "Sí/No" sobre la sesión.
  if (isLoading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f2f3f3', // Color neutro Cloudscape para evitar flash blanco puro
        }}
      >
        <Container>
          <Box textAlign="center" padding="l">
            <Spinner size="large" variant="normal" />
            <Box variant="p" padding={{ top: 's' }} color="text-body-secondary">
              Verificando sesión...
            </Box>
          </Box>
        </Container>
      </div>
    );
  }

  return (
    <>
      <TopLoadingBar visible={pageLoading} />

      <Suspense fallback={<TopLoadingBar visible={true} />}>
        <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />

          {/* --- CORRECCIÓN CLAVE --- 
              Si ya está logueado, redirige a dashboard. 
              Si no, muestra Login. 
          */}
          <Route
            path="/login"
            element={
              isLoggedin ? <Navigate to="/dashboard" replace /> : <Login />
            }
          />

          <Route path="/verify-email" element={<Verify />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/cleaning-plan-page" element={<CleaningPlanPage />} />
          <Route
            path="/cleaning-plan-mondini-2"
            element={<Mondini2Details />}
          />
          <Route
            path="/cleaning-plan-mondini-3"
            element={<Mondini3Details />}
          />
          <Route
            path="/cleaning-plan-mondini-6"
            element={<Mondini6Details />}
          />
          <Route path="/home" element={<Home />} />

          {/* Destalles Serivcios */}
          <Route
            path="/services"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <Services />
              </ProtectedRoute>
            }
          />
          <Route
            path="/almacen"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <Almacén />
              </ProtectedRoute>
            }
          />

          <Route
            path="/maintenance"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <Maintenance />
              </ProtectedRoute>
            }
          />

          <Route
            path="/maintenance/checklists-pre-operativos"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <Checklists />
              </ProtectedRoute>
            }
          />

          <Route
            path="/maintenance/perform-inspection"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <PerformInspection />
              </ProtectedRoute>
            }
          />

          <Route
            path="/maintenance/vapor-logs-table"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <VaporLogsTable />
              </ProtectedRoute>
            }
          />

          <Route
            path="/maintenance/bitacora-central-vapor"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <BitacoraVapor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/maintenance/telemetry-entry"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <TelemetryEntry />
              </ProtectedRoute>
            }
          />

          <Route
            path="/maintenance/air-logs-table"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <AirLogsTable />
              </ProtectedRoute>
            }
          />

          <Route
            path="/maintenance/air-compressor-entry"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <AirCompressorEntry />
              </ProtectedRoute>
            }
          />

          <Route
            path="/maintenance/chemical-analysis-logs-table"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <ChemicalAnalysis />
              </ProtectedRoute>
            }
          />

          <Route
            path="/maintenance/chemical-analysis-entry"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <ChemicalAnalysisEntry />
              </ProtectedRoute>
            }
          />

          <Route
            path="/maintenance/daily-reports-frozen-machinery"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <DailyReportsFrozenMachinery />
              </ProtectedRoute>
            }
          />

          <Route
            path="/maintenance/daily-reports-refrigerated-machinery"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <DailyReportsRefrigeratedMachinery />
              </ProtectedRoute>
            }
          />

          <Route
            path="/maintenance/daily-reports-refrigerated-machinery-logs-table"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <DailyReportsRefrigeratedMachineryLogsTable />
              </ProtectedRoute>
            }
          />

          <Route
            path="/maintenance/daily-reports-refrigeration-refrigerated"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <DailyReportsRefrigerationRefrigerated />
              </ProtectedRoute>
            }
          />

          <Route
            path="/maintenance/cuarto-frio5-telemetry-entry"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <CuartoFrio5TelemetryEntry />
              </ProtectedRoute>
            }
          />

          <Route
            path="/administration"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <AdministrationCenter />
              </ProtectedRoute>
            }
          />

          {/* RUTAS PROTEGIDAS */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/folder-view"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <FolderView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product-detail-page"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <ProductDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/user"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <User />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/user-reg"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <UserReg />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/user-edit/:userId"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <UserEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/areastable"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <AreasTable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rolestable"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <RolesTable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/visual-comparator"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <VisualComparator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/supplier-item"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <SupplierItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/locations-item"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <LocationsItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/uses-for-spare-parts"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <UsesforSpareParts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/user-inf"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <UserInf />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/info"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <InfoSystem />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default AppRouter;
