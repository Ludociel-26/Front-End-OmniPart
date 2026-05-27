import * as React from 'react';
import SideNavigation from '@cloudscape-design/components/side-navigation';
import Badge from '@cloudscape-design/components/badge';
import { useLocation, useNavigate } from 'react-router-dom';

export default () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Sincronizamos el resaltado del menú con la URL actual del navegador
  const [activeHref, setActiveHref] = React.useState(
    location.pathname + location.hash,
  );

  React.useEffect(() => {
    setActiveHref(location.pathname + location.hash);
  }, [location.pathname, location.hash]);

  // Estilos constantes para las etiquetas tipo AWS Console
  // Función para generar el estilo de puntos gruesos de AWS
  const getAwsDottedStyle = (color: string): React.CSSProperties => ({
    fontSize: '11px',
    fontWeight: 700,
    marginLeft: '6px',
    color: color,
    paddingBottom: '0px',
    display: 'inline-block',
    cursor: 'pointer',
    pointerEvents: 'none',
    // TRUCO SENIOR: Usamos un degradado repetitivo para crear puntos definidos y gruesos
    backgroundImage: `linear-gradient(to right, ${color} 20%, rgba(255,255,255,0) 0%)`,
    backgroundPosition: 'bottom',
    backgroundSize: '4px 1.5px', // 4px de ancho total, 1.5px de grosor del punto
    backgroundRepeat: 'repeat-x',
  });

  const newStyle = getAwsDottedStyle('#0073bb');
  const betaStyle = getAwsDottedStyle('#ec7211');

  return (
    <SideNavigation
      activeHref={activeHref}
      header={{ href: '/services', text: 'Servicios' }}
      onFollow={(event) => {
        if (!event.detail.external) {
          event.preventDefault();
          // Navegación a través del Router para evitar recargas
          navigate(event.detail.href);
        }
      }}
      items={[
        {
          type: 'link',
          text: 'Panel',
          href: '/dashboard',
          info: <span style={betaStyle}>Dev</span>,
        },
        { type: 'divider' },
        // ==========================================
        // 1. DOCUMENTACIÓN
        // ==========================================
        {
          type: 'section-group',
          title: 'Documentación',
          items: [
            {
              type: 'link',
              text: 'Front-Doc',
              href: '#/page2',
              external: true,
              info: <span style={newStyle}>New</span>,
            },
            {
              type: 'link',
              text: 'Back-Doc',
              href: '#/page3',
              external: true,
              info: <span style={newStyle}>New</span>,
            },
            {
              type: 'link',
              text: 'DinoV2',
              href: 'https://angelamartinez20-dinov2-5.mintlify.app/',
              external: true,
              info: <span style={betaStyle}>Beta</span>,
            },
          ],
        },
        { type: 'divider' },
        // ==========================================
        // 2. ALMACÉN E INVENTARIO
        // ==========================================
        {
          type: 'section-group',
          title: 'Almacén',
          items: [
            {
              type: 'link',
              text: 'Visión General',
              href: '/almacen',
              info: <span style={newStyle}>New</span>,
            },
            {
              type: 'section',
              text: 'Inventario',
              items: [
                {
                  type: 'link',
                  text: 'General',
                  href: '/inventory',
                  info: <span style={newStyle}>New</span>,
                },
                {
                  type: 'link',
                  text: 'Asignación',
                  href: '/inventory/uses-for-spare-parts',
                  info: <span style={newStyle}>New</span>,
                },
                {
                  type: 'link',
                  text: 'Ubicaciones',
                  href: '/inventory/locations-item',
                  info: <span style={newStyle}>New</span>,
                },
                {
                  type: 'link',
                  text: 'Proveedores',
                  href: '/inventory/supplier-item',
                  info: <span style={newStyle}>New</span>,
                },
                {
                  type: 'link',
                  text: 'Inteligencia Visual',
                  href: '/inventory/visual-comparator',
                  info: <span style={betaStyle}>Beta</span>,
                },
              ],
            },
          ],
        },
        { type: 'divider' },
        // ==========================================
        // 2. MANTENIMIENTO
        // ==========================================

        {
          type: 'section-group',
          title: 'Mantenimiento',
          items: [
            {
              type: 'link',
              text: 'Visión General',
              href: '/maintenance',
              info: <span style={newStyle}>New</span>,
            },
            {
              type: 'section',
              text: 'Bitácora',
              items: [
                {
                  type: 'link',
                  text: 'Pre-Operativos',
                  href: '/maintenance/checklists-pre-operativos',
                  info: <span style={betaStyle}>Dev</span>,
                },
                {
                  type: 'link',
                  text: 'Central de Vapor',
                  href: '/maintenance/vapor-logs-table',
                  info: <span style={betaStyle}>Dev</span>,
                },
                {
                  type: 'link',
                  text: 'Compresor de Aire',
                  href: '/maintenance/air-logs-table',
                  info: <span style={betaStyle}>Dev</span>,
                },
                {
                  type: 'link',
                  text: 'Análisis Químicos',
                  href: '/maintenance/chemical-analysis-logs-table',
                  info: <span style={betaStyle}>Dev</span>,
                },
                {
                  type: 'link',
                  text: 'Maquinaria Congelados',
                  href: '/maintenance/daily-reports-refrigerated-machinery-logs-table',
                  info: <span style={betaStyle}>Dev</span>,
                },
                {
                  type: 'link',
                  text: 'Cuarto Frío #5',
                  href: '/maintenance/cuarto-frio5-table-logs',
                  info: <span style={betaStyle}>Dev</span>,
                },
              ],
            },
            {
              type: 'section',
              text: 'Telemetría',
              items: [
                {
                  type: 'link',
                  text: 'Inspección Pre-Operativa',
                  href: '/maintenance/perform-inspection',
                  info: <span style={newStyle}>New</span>,
                },
                {
                  type: 'link',
                  text: 'Central de Vapor-test plantilla',
                  href: '/maintenance/bitacora-central-vapor',
                  info: <span style={newStyle}>New</span>,
                },
                {
                  type: 'link',
                  text: 'Central de Vapor Div',
                  href: '/maintenance/telemetry-entry',
                  info: <span style={newStyle}>New</span>,
                },
                {
                  type: 'link',
                  text: 'Compresor de Aire',
                  href: '/maintenance/air-compressor-entry',
                  info: <span style={newStyle}>New</span>,
                },
                {
                  type: 'link',
                  text: 'Análisis Químicos',
                  href: '/maintenance/chemical-analysis-entry',
                  info: <span style={newStyle}>New</span>,
                },
                {
                  type: 'link',
                  text: 'Maquinaria Congelados',
                  href: '/maintenance/daily-reports-frozen-machinery',
                  info: <span style={newStyle}>New</span>,
                },
                {
                  type: 'link',
                  text: 'Maquinaria Refrigerados',
                  href: '/maintenance/daily-reports-refrigerated-machinery',
                  info: <span style={newStyle}>New</span>,
                },
                {
                  type: 'link',
                  text: 'División Refrigerados',
                  href: '/maintenance/daily-reports-refrigeration-refrigerated',
                  info: <span style={newStyle}>New</span>,
                },
                {
                  type: 'link',
                  text: 'Compresores Cuarto Frío #5',
                  href: '/maintenance/cuarto-frio5-telemetry-entry',
                  info: <span style={newStyle}>New</span>,
                },
              ],
            },
            { type: 'link', text: 'Page 7', href: '#/page7' },
            {
              type: 'expandable-link-group',
              text: 'Expandable link group',
              href: '#/exp-link-group',
              items: [
                { type: 'link', text: 'Page 8', href: '#/page8' },
                { type: 'link', text: 'Page 9', href: '#/page9' },
              ],
            },
            { type: 'link', text: 'Page 10', href: '#/page10' },
            {
              type: 'link-group',
              text: 'Link group',
              href: '#/link-group',
              items: [
                { type: 'link', text: 'Page 11', href: '#/page11' },
                { type: 'link', text: 'Page 12', href: '#/page12' },
              ],
            },
            {
              type: 'link',
              text: 'Plan de Limpieza',
              href: '#/cleaning-plan-page',
              external: true,
            },
          ],
        },
        { type: 'divider' },
        {
          type: 'section-group',
          title: 'Centro de Administración',
          items: [
            {
              type: 'link',
              text: 'Visión General',
              href: '/administration',
              info: <span style={newStyle}>New</span>,
            },
            {
              type: 'section',
              text: 'User',
              items: [
                {
                  type: 'link',
                  text: 'User Info',
                  href: '/admin/user-inf',
                  info: <span style={newStyle}>New</span>,
                },
                {
                  type: 'link',
                  text: 'Users',
                  href: '/admin/user',
                  info: <span style={newStyle}>New</span>,
                },
                {
                  type: 'link',
                  text: 'Editar Usuario',
                  href: '/admin/user-edit/:userId',
                  info: <span style={newStyle}>New</span>,
                },
                {
                  type: 'link',
                  text: 'Role',
                  href: '/admin/rolestable',
                  info: <span style={newStyle}>New</span>,
                },
                {
                  type: 'link',
                  text: 'Area',
                  href: '/admin/areastable',
                  info: <span style={newStyle}>New</span>,
                },
              ],
            },
          ],
        },
        {
          type: 'link',
          text: 'Notifications',
          href: '#/notifications',
          info: <Badge color="red">23</Badge>,
        },
        {
          type: 'link',
          text: 'System Info',
          href: '/admin/info',
          external: true,
          externalIconAriaLabel: 'Opens in a new tab',
          info: <span style={newStyle}>New</span>,
        },
      ]}
    />
  );
};
