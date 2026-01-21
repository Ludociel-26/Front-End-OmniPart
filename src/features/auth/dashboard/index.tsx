import React, { useState, useEffect, useCallback, useRef } from 'react';
import { applyMode, applyDensity, Mode, Density } from '@cloudscape-design/global-styles';

// --- IMPORTACIONES CLOUDSCAPE ---
import Board from '@cloudscape-design/board-components/board';
import type { BoardProps } from '@cloudscape-design/board-components/board';
import BoardItem from '@cloudscape-design/board-components/board-item';
import {
  AppLayout,
  ContentLayout,
  Header,
  SpaceBetween,
  Button,
  Box,
  SideNavigation,
  TopNavigation,
  Flashbar,
  Input,
  type FlashbarProps,
  type TopNavigationProps
} from '@cloudscape-design/components';

// --- IMPORTACIONES LOCALES ---
import { getDefaultLayout, getBoardWidgets, allWidgets } from './config';
import { navItems } from './sidebar-items';
import type { WidgetDataType } from './interfaces';
import { DashboardPalette } from './palette';
import { boardI18nStrings } from './board-i18n';

// --- UTILIDADES ---
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    let timeoutId: number;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => setWidth(window.innerWidth), 100);
    };
    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(timeoutId);
    }
  }, []);
  return width;
}

const useIsMac = () => {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);
  return isMac;
};

export default function DashboardFeature() {
  const windowWidth = useWindowWidth();
  const isMac = useIsMac();

  // Estados UI
  const [navigationOpen, setNavigationOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [activeHref, setActiveHref] = useState('#/dashboard');
  
  // --- ESTADO DEL USUARIO ---
  // Inicia en true para VER el loader inmediatamente
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    // Simulamos carga de 3 segundos
    const timer = setTimeout(() => {
      setIsUserLoading(false);
      // FOTO DE PRUEBA (Cuadrada para probar el recorte circular)
      setUserAvatarUrl("https://i.pravatar.cc/300?img=33"); 
    }, 3000); 
    return () => clearTimeout(timer);
  }, []);

  // --- BUSCADOR ---
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- TEMA ---
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as any;
    const savedDensity = localStorage.getItem('density');
    if (savedTheme) setThemePreference(savedTheme);
    if (savedDensity === 'compact') applyDensity(Density.Compact);
    else applyDensity(Density.Comfortable);
  }, []);

  useEffect(() => {
    const apply = () => {
      if (themePreference === 'system') {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) applyMode(Mode.Dark);
        else applyMode(Mode.Light);
      } else if (themePreference === 'dark') {
        applyMode(Mode.Dark);
      } else {
        applyMode(Mode.Light);
      }
    };
    apply();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => { if (themePreference === 'system') apply(); };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [themePreference]);

  const handleThemeSelect = useCallback((id: string) => {
    setThemePreference(id as any);
    localStorage.setItem('theme', id);
  }, []);

  const handleDensitySelect = useCallback((id: string) => {
    if (id === 'compact') { applyDensity(Density.Compact); localStorage.setItem('density', 'compact'); }
    if (id === 'comfortable') { applyDensity(Density.Comfortable); localStorage.setItem('density', 'comfortable'); }
  }, []);

  // --- DASHBOARD ITEMS ---
  const [items, setItems] = useState<BoardProps.Item<WidgetDataType>[]>(() => {
    const savedLayout = localStorage.getItem('dashboard-layout-v11');
    if (savedLayout) {
      try {
        const parsedLayout = JSON.parse(savedLayout);
        return parsedLayout.map((item: any) => {
           const config = allWidgets[item.id];
           return { ...item, data: { title: config?.title || 'Widget', provider: config?.provider, disableContentPaddings: false } };
        });
      } catch (e) { console.error(e); }
    }
    return getBoardWidgets(getDefaultLayout(window.innerWidth));
  });

  const [flashbarItems, setFlashbarItems] = useState<FlashbarProps.MessageDefinition[]>([
    {
      type: "info",
      dismissible: true,
      content: "Panel sincronizado. Presiona Cmd+S para buscar.",
      id: "message_1",
      onDismiss: () => setFlashbarItems([]) 
    }
  ]);

  const handleItemsChange = useCallback((event: CustomEvent<BoardProps.ItemsChangeDetail<WidgetDataType>>) => {
    setItems(event.detail.items);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
        const layoutToSave = items.map(item => ({ id: item.id, columnSpan: item.columnSpan, rowSpan: item.rowSpan }));
        localStorage.setItem('dashboard-layout-v11', JSON.stringify(layoutToSave));
    }, 500);
    return () => clearTimeout(timeout);
  }, [items]);

  const handleAddWidget = useCallback((widgetId: string) => {
    const widgetConfig = allWidgets[widgetId];
    setItems(prev => [...prev, {
      id: widgetId,
      rowSpan: widgetConfig.definition?.defaultRowSpan || 2,
      columnSpan: widgetConfig.definition?.defaultColumnSpan || 1,
      data: { title: widgetConfig.title || 'Widget', provider: widgetConfig.provider, disableContentPaddings: false }
    }]);
  }, []);

  const handleReset = useCallback(() => {
      setItems(getBoardWidgets(getDefaultLayout(windowWidth)));
      localStorage.removeItem('dashboard-layout-v11');
  }, [windowWidth]);

  return (
    <div className="dashboard-container"> 
      <style>{`
        .dashboard-container { opacity: 0; animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        /* =========================================
           1. BUSCADOR GIGANTE Y RESPONSIVO
           ========================================= */
        .big-search-wrapper {
            width: 100%;
            /* En PC ocupa hasta 800px, en móvil se ajusta */
            width: 600px;
            max-width: 100%;
            position: relative;
            transition: width 0.3s ease;
        }
        
        @media (min-width: 1200px) {
             .big-search-wrapper { width: 800px; }
        }
        @media (max-width: 600px) {
             .big-search-wrapper { width: 100%; min-width: 200px; }
        }

        /* Hackeamos el input interno de Cloudscape para hacerlo ALTO */
        .big-search-wrapper [data-awsui-input] {
            height: 50px !important;       /* Altura forzada */
            font-size: 18px !important;    /* Texto grande */
            padding-right: 100px !important; /* Espacio para el atajo */
            border-radius: 8px !important;
            padding-left: 45px !important; /* Espacio para la lupa (si Cloudscape la pone) */
        }

        /* =========================================
           2. ATAJO DE TECLADO (CMD + S)
           ========================================= */
        .search-shortcut-badge {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: var(--color-background-container-content);
            border: 1px solid var(--color-border-item-focused);
            border-radius: 6px;
            color: var(--color-text-body-secondary);
            font-size: 14px;
            font-weight: 800;
            pointer-events: none;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            z-index: 2;
        }

        /* =========================================
           3. LOADER TIPO ANDROID (Gira + Respira)
           ========================================= */
        /* Ocultamos el spinner por defecto */
        span[data-awsui-icon-name="status-in-progress"] svg {
            display: none !important;
        }

        /* Creamos nuestro propio loader */
        span[data-awsui-icon-name="status-in-progress"]::after {
            content: '';
            display: block;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 3px solid transparent;
            /* Color del borde que gira */
            border-top-color: #0972d3; 
            border-left-color: #00a1c9; 
            
            /* Animación doble: Girar y Cambiar tamaño */
            animation: 
                androidSpin 1s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite,
                androidPulse 1s ease-in-out infinite alternate;
        }

        @keyframes androidSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @keyframes androidPulse {
            0% { border-width: 2px; opacity: 0.6; }
            100% { border-width: 4px; opacity: 1; }
        }

        /* =========================================
           4. AVATAR DE USUARIO (Círculo Perfecto)
           ========================================= */
        /* Centrado vertical del contenedor */
        span[class*="awsui_icon_"] {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            height: 100% !important;
        }
        
        /* Imagen del usuario */
        button[class*="awsui_button"] img {
            width: 32px !important;
            height: 32px !important;
            min-width: 32px !important;
            aspect-ratio: 1 / 1 !important; /* Fuerza relación 1:1 */
            border-radius: 50% !important;  /* Círculo */
            object-fit: cover !important;   /* Recorte inteligente */
            border: 2px solid var(--color-border-divider-default);
            margin: 0 !important;
        }
      `}</style>

      <div id="h" style={{ position: 'sticky', top: 0, zIndex: 1002 }}>
        <TopNavigation
          identity={{
            href: "#",
            title: "HotelBits",
            logo: {
              src: "https://d1.awsstatic.com/webteam/homepage/editor-choice/site-builder-icon.2625292e35a72728329606555627255760163359.png",
              alt: "Logo"
            }
          }}
          search={
            <div className="big-search-wrapper">
              <Input
                ref={searchInputRef}
                ariaLabel="Buscador global"
                value={searchValue}
                onChange={({ detail }) => setSearchValue(detail.value)}
                placeholder="Buscar (ej. Reservas, Usuarios, Ajustes)..."
                type="search"
              />
              <div className="search-shortcut-badge">
                <span style={{ fontSize: '18px', lineHeight: 1 }}>{isMac ? '⌘' : 'Ctrl'}</span>
                <span>+</span>
                <span>S</span>
              </div>
            </div>
          }
          utilities={[
            // 1. APPS (9 Puntos)
            {
                type: "menu-dropdown",
                iconName: "view-app",
                ariaLabel: "Aplicaciones",
                title: "Apps",
                items: [ { id: "app1", text: "Dashboard", href: "#" } ]
            },
            // 2. NOTIFICACIONES
            {
              type: "button",
              iconName: "notification",
              title: "Notificaciones",
              ariaLabel: "Notificaciones",
              badge: true,
              onClick: () => {}
            },
            // 3. AJUSTES
            {
              type: "menu-dropdown",
              iconName: "settings",
              ariaLabel: "Ajustes",
              onItemClick: (e) => {
                const id = e.detail.id;
                if (['light','dark','system'].includes(id)) handleThemeSelect(id);
                if (['compact','comfortable'].includes(id)) handleDensitySelect(id);
              },
              items: [
                { id: "theme", text: "Tema", items: [ { id: "light", text: "Claro", iconName: "gen-ai" }, { id: "dark", text: "Oscuro", iconName: "star" }, { id: "system", text: "Sistema", iconName: "monitor" } ] },
                { id: "density", text: "Densidad", items: [ { id: "comfortable", text: "Cómoda", iconName: "view-full" }, { id: "compact", text: "Compacta", iconName: "view-vertical" } ] }
              ]
            },
            {
                type: "menu-dropdown",
                iconName: "status-info",
                ariaLabel: "Ayuda",
                items: [ { id: "docs", text: "Documentación", external: true } ]
            },
            // 4. USUARIO
            {
              type: "menu-dropdown",
              text: "Carlos Ruiz", // NOMBRE SIEMPRE VISIBLE
              description: "Admin",
              
              // LÓGICA DE ICONO:
              // Si carga -> "status-in-progress" (nuestro CSS lo transforma en spinner Android)
              // Si cargó y hay URL -> undefined (para que use iconUrl)
              // Si cargó y NO hay URL -> "user-profile" (fallback)
              iconName: isUserLoading 
                  ? "status-in-progress" 
                  : (userAvatarUrl ? undefined : "user-profile"),
                  
              // URL IMAGEN
              iconUrl: (!isUserLoading && userAvatarUrl) ? userAvatarUrl : undefined,
              iconAlt: "Avatar",
              
              items: [
                { id: "profile", text: "Mi Perfil", iconName: "user-profile" },
                { id: "verify", text: "Validar Correo", iconName: "email" },
                { id: "security", text: "Seguridad", iconName: "lock" },
                { type: "divider" },
                { id: "signout", text: "Cerrar sesión", iconName: "exit" }
              ]
            }
          ]}
        />
      </div>

      <AppLayout
        contentType="dashboard"
        navigationOpen={navigationOpen}
        onNavigationChange={({ detail }) => setNavigationOpen(detail.open)}
        navigation={
          <SideNavigation
            activeHref={activeHref}
            header={{ href: "#/", text: "Servicios" }}
            items={navItems}
            onFollow={e => { e.preventDefault(); setActiveHref(e.detail.href); }}
          />
        }
        toolsOpen={toolsOpen}
        onToolsChange={({ detail }) => setToolsOpen(detail.open)}
        toolsWidth={350}
        tools={<DashboardPalette activeWidgetIds={items.map(i => i.id)} onAddWidget={handleAddWidget} />}
        toolsHide={false}
        notifications={<Flashbar items={flashbarItems} />}
        content={
          <ContentLayout
            header={
              <SpaceBetween size="m">
                <Header
                  variant="h1"
                  info={<Button variant="icon" iconName="info" />}
                  actions={
                    <SpaceBetween direction="horizontal" size="xs">
                      <Button onClick={handleReset}>Restablecer</Button>
                      <Button variant="primary" iconName="add-plus" onClick={() => setToolsOpen(true)}>Agregar widgets</Button>
                    </SpaceBetween>
                  }
                >
                  Panel de Control de Servicios
                </Header>
              </SpaceBetween>
            }
          >
            <Board
              items={items}
              onItemsChange={handleItemsChange}
              i18nStrings={boardI18nStrings}
              renderItem={(item, actions) => {
                const WidgetComponent = item.data.provider; 
                return (
                  <BoardItem 
                    header={<Header>{item.data.title}</Header>}
                    i18nStrings={{
                      dragHandleAriaLabel: "Arrastrar widget",
                      resizeHandleAriaLabel: "Redimensionar widget",
                      resizeHandleAriaDescription: "Enter para redimensionar, Esc para cancelar",
                    }}
                    settings={
                      <Button variant="icon" iconName="close" ariaLabel="Quitar" onClick={() => actions.removeItem()} />
                    }
                  >
                    <WidgetComponent />
                  </BoardItem>
                );
              }}
              empty={
                <Box textAlign="center" padding="l">
                  <Box variant="strong" color="text-body-secondary">Sin widgets</Box>
                  <Button onClick={() => setToolsOpen(true)}>Agregar widgets</Button>
                </Box>
              }
            />
          </ContentLayout>
        }
      />
    </div>
  );
}