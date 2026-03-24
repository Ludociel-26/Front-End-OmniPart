import * as React from 'react';
import SideNavigation from '@cloudscape-design/components/side-navigation';
import { useLocation, useNavigate } from 'react-router-dom';

// Importamos tus estilos
import './styles/sidebar.css';

export default function GlobalSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Sincronizamos la ruta actual con el botón activo en el menú
  const [activeHref, setActiveHref] = React.useState(location.pathname);

  React.useEffect(() => {
    setActiveHref(location.pathname);
  }, [location.pathname]);

  return (
    <div className="global-sidebar-container">
      <SideNavigation
        activeHref={activeHref}
        header={{
          href: '/services',
          text: 'Servicios',
        }}
        onFollow={(event) => {
          if (!event.detail.external) {
            event.preventDefault();
            setActiveHref(event.detail.href);
            navigate(event.detail.href);
          }
        }}
        items={[
          {
            type: 'link',
            text: 'Panel',
            href: '/dashboard',
          },
          { type: 'divider' },

          // ==========================================
          // 1. ALMACÉN E INVENTARIO (Desplegable Principal)
          // ==========================================
          {
            type: 'expandable-link-group',
            text: 'Almacén',
            href: '/almacen', // Al hacer clic en el título, navega al Landing y expande el menú
            items: [
              {
                type: 'link',
                text: 'Visión General',
                href: '/almacen',
              },
              {
                type: 'expandable-link-group',
                text: 'Inventario General',
                href: '/inventory',
                items: [
                  {
                    type: 'link',
                    text: 'Visual Comparator',
                    href: '/inventory/visual-comparator',
                  },
                  {
                    type: 'link',
                    text: 'Recepción Rápida',
                    href: '/almacen/entradas/recepcion',
                  },
                  {
                    type: 'link',
                    text: 'Control de Calidad',
                    href: '/almacen/entradas/calidad',
                  },
                  {
                    type: 'link',
                    text: 'Devoluciones',
                    href: '/almacen/entradas/devoluciones',
                  },
                ],
              },
              {
                type: 'expandable-link-group',
                text: 'Proveedores',
                href: '/almacen/salidas',
                items: [
                  {
                    type: 'link',
                    text: 'Pedidos / Solicitudes',
                    href: '/almacen/salidas/pedidos',
                  },
                  {
                    type: 'link',
                    text: 'Lista de Picking',
                    href: '/almacen/salidas/picking',
                  },
                  {
                    type: 'link',
                    text: 'Mesa de Empaque',
                    href: '/almacen/salidas/empaque',
                  },
                  {
                    type: 'link',
                    text: 'Guías de Envío',
                    href: '/almacen/salidas/envios',
                  },
                ],
              },
              {
                type: 'expandable-link-group',
                text: 'Control de Inventario',
                href: '/almacen/inventario',
                items: [
                  {
                    type: 'link',
                    text: 'Consulta de Stock',
                    href: '/almacen/inventario/stock',
                  },
                  {
                    type: 'link',
                    text: 'Ajustes',
                    href: '/almacen/inventario/ajustes',
                  },
                  {
                    type: 'link',
                    text: 'Conteo Cíclico',
                    href: '/almacen/inventario/conteo',
                  },
                  {
                    type: 'link',
                    text: 'Kárdex',
                    href: '/almacen/inventario/kardex',
                  },
                  {
                    type: 'link',
                    text: 'Transferencias',
                    href: '/almacen/inventario/transferencias',
                  },
                ],
              },
              {
                type: 'expandable-link-group',
                text: 'Catálogos Maestros',
                href: '/almacen/catalogos',
                items: [
                  {
                    type: 'link',
                    text: 'Productos (SKU)',
                    href: '/almacen/catalogos/productos',
                  },
                  {
                    type: 'link',
                    text: 'Proveedores',
                    href: '/almacen/catalogos/proveedores',
                  },
                  {
                    type: 'link',
                    text: 'Ubicaciones',
                    href: '/almacen/catalogos/ubicaciones',
                  },
                  {
                    type: 'link',
                    text: 'Categorías',
                    href: '/almacen/catalogos/categorias',
                  },
                ],
              },
            ],
          },
          { type: 'divider' },

          // ==========================================
          // 2. MANTENIMIENTO (Desplegable Principal)
          // ==========================================
          {
            type: 'expandable-link-group',
            text: 'Mantenimiento',
            href: '/maintenance',
            items: [
              { type: 'link', text: 'Visión General', href: '/maintenance' },
              {
                type: 'link',
                text: 'Checklists Pre-Operativos',
                href: '/maintenance/checklists-pre-operativos',
              },
              {
                type: 'link',
                text: 'Nueva Inspección',
                href: '/maintenance/perform-inspection',
              },
              {
                type: 'link',
                text: 'Telemetría e Históricos',
                href: '/mantenimiento/equipos',
              },
              {
                type: 'link',
                text: 'Captura de Telemetría',
                href: '/maintenance/telemetry-entry',
              },
              {
                type: 'link',
                text: 'Bitácora de Vapor Logs',
                href: '/maintenance/vapor-logs-table',
              },
              {
                type: 'link',
                text: 'Bitácora Central de Vapor',
                href: '/maintenance/bitacora-central-vapor',
              },
              {
                type: 'link',
                text: 'Bitácora de Aire Logs',
                href: '/maintenance/air-logs-table',
              },
              {
                type: 'link',
                text: 'Bitácora Compresor de Aire',
                href: '/maintenance/air-compressor-entry',
              },
              {
                type: 'link',
                text: 'Bitácora de Químicos Logs',
                href: '/maintenance/chemical-analysis-logs-table',
              },
              {
                type: 'link',
                text: 'Bitácora Análisis Químicos',
                href: '/maintenance/chemical-analysis-entry',
              },
              {
                type: 'link',
                text: 'Informes Diarios de Maquinaria Congelados',
                href: '/maintenance/daily-reports-frozen-machinery',
              },
              {
                type: 'link',
                text: 'Reporte Diario: Maquinaria Refrigerados',
                href: '/maintenance/daily-reports-refrigerated-machinery',
              },
              {
                type: 'link',
                text: 'Cuarto Frio5',
                href: '/maintenance/cuarto-frio5-telemetry-entry',
              },
              {
                type: 'link',
                text: 'Refrigeración (Refrigerados)',
                href: '/maintenance/daily-reports-refrigeration-refrigerated',
              },
              {
                type: 'link',
                text: 'Activos (Maquinaria)',
                href: '/mantenimiento/ordenes',
              },
              {
                type: 'link',
                text: 'Rutinas y Bitácoras (Operación Diaria)',
                href: '/mantenimiento/preventivo',
              },
              {
                type: 'link',
                text: 'Reportes Oficiales',
                href: '/mantenimiento/solicitudes',
              },
              {
                type: 'link',
                text: 'Plan de Limpieza',
                href: '/cleaning-plan-page',
                external: true,
              },
              {
                type: 'link',
                text: 'Plan de Mondini 2',
                href: '/cleaning-plan-mondini-2',
                external: true,
              },
              {
                type: 'link',
                text: 'Plan de Mondini 3',
                href: '/cleaning-plan-mondini-3',
                external: true,
              },
            ],
          },
          { type: 'divider' },

          // ==========================================
          // 3. ADMINISTRACIÓN DEL SISTEMA (Desplegable Principal)
          // ==========================================
          {
            type: 'expandable-link-group',
            text: 'Administración',
            href: '/admin',
            items: [
              {
                type: 'link',
                text: 'Centro de Administración',
                href: '/administration',
              },
              { type: 'link', text: 'Cuenta', href: '/admin' },
              {
                type: 'expandable-link-group',
                text: 'Usuarios',
                href: '/admin/user',
                items: [
                  {
                    type: 'link',
                    text: 'Áreas Operativas',
                    href: '/admin/areastable',
                  },
                  { type: 'link', text: 'Roles', href: '/admin/rolestable' },
                  {
                    type: 'link',
                    text: 'Ubicaciones',
                    href: '/almacen/catalogos/ubicaciones',
                  },
                  {
                    type: 'link',
                    text: 'Categorías',
                    href: '/almacen/catalogos/categorias',
                  },
                ],
              },
              {
                type: 'link',
                text: 'Auditoría y Logs',
                href: '/admin/auditoria',
              },
              { type: 'divider' },
              {
                type: 'link',
                text: 'Ajustes Globales',
                href: '/admin/configuracion',
              },
              {
                type: 'link',
                text: 'Configuración',
                href: '/admin/info',
              },
            ],
          },
        ]}
      />
    </div>
  );
}
