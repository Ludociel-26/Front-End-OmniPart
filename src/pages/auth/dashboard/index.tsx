import React, { useState, useEffect, useCallback } from 'react';

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
  Flashbar,
  type FlashbarProps
} from '@cloudscape-design/components';

// --- IMPORTACIONES LOCALES ---
import { getDefaultLayout, getBoardWidgets, allWidgets } from './config';
import type { WidgetDataType } from './interfaces';
import { DashboardPalette } from './palette';
import { boardI18nStrings } from './board-i18n';

// Importamos el nuevo componente
import Navbar from '../../layouts/navbar/Navbar'; // Ajusta la ruta si es necesario
import GlobalSidebar from '../../layouts/sidebar/Sidebar'; // <--- EL NUEVO SLIDER

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

export default function DashboardFeature() {
  const windowWidth = useWindowWidth();

  // Estados UI Básicos
  const [navigationOpen, setNavigationOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [activeHref, setActiveHref] = useState('#/dashboard');
  
  // --- DASHBOARD ITEMS Y WIDGETS ---
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
      content: "Panel sincronizado.",
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
      `}</style>

      {/* AQUÍ LLAMAMOS A TU NUEVO COMPONENTE REUTILIZABLE */}
      <Navbar />

      <AppLayout
        contentType="dashboard"
        navigationOpen={navigationOpen}
        onNavigationChange={({ detail }) => setNavigationOpen(detail.open)}
        navigation={<GlobalSidebar />}
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