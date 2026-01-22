import * as React from "react";
// 1. Imports de Cloudscape
import {
  Table,
  Box,
  SpaceBetween,
  Button,
  TextFilter,
  Header,
  Pagination,
  CollectionPreferences,
  Select,
  AppLayout,       // <--- CRUCIAL: El layout principal
  BreadcrumbGroup, // <--- Las migas de pan (ruta superior)
  Flashbar,        // <--- Las barras de notificación azul/verde
  StatusIndicator, // <--- Para los circulitos de estado
  Link             // <--- Para simular links en la tabla
} from "@cloudscape-design/components";

import type { TableProps, SelectProps } from "@cloudscape-design/components";
import { useCollection } from "@cloudscape-design/collection-hooks";

// Imports de tus componentes
import Navbar from '../../layouts/navbar/Navbar'; 
import GlobalSidebar from '../../layouts/sidebar/Sidebar'; 

// --- DATOS Y CONFIGURACIÓN ---

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  status: "Available" | "Out of Stock" | "Discontinued";
  quantity: number;
  lastUpdated: string;
}

const COLUMN_DEFINITIONS: TableProps.ColumnDefinition<InventoryItem>[] = [
  {
    id: "name",
    header: "Nombre del Producto",
    // Usamos Link para que se vea azul como en la captura
    cell: item => <Link href={`#${item.id}`}>{item.name}</Link>,
    sortingField: "name",
    isRowHeader: true
  },
  {
    id: "category",
    header: "Categoría",
    cell: item => item.category,
    sortingField: "category"
  },
  {
    id: "status",
    header: "Estado",
    // StatusIndicator replica los iconos rojo/verde de la captura
    cell: item => (
      <StatusIndicator type={item.status === "Available" ? "success" : "error"}>
        {item.status}
      </StatusIndicator>
    ),
    sortingField: "status"
  },
  {
    id: "quantity",
    header: "Cantidad",
    cell: item => item.quantity,
    sortingField: "quantity"
  },
  {
    id: "lastUpdated",
    header: "Última Actualización",
    cell: item => item.lastUpdated,
    sortingField: "lastUpdated"
  }
];

const MOCK_INVENTORY: InventoryItem[] = [
  { id: "1", name: "Servidor Rack 4U", category: "Hardware", status: "Available", quantity: 15, lastUpdated: "2024-01-20" },
  { id: "2", name: "Cable Óptico 10m", category: "Accesorios", status: "Out of Stock", quantity: 0, lastUpdated: "2024-01-18" },
  { id: "3", name: "Switch Gestionable", category: "Redes", status: "Available", quantity: 8, lastUpdated: "2024-01-19" },
  { id: "4", name: "Licencia Software", category: "Software", status: "Available", quantity: 50, lastUpdated: "2024-01-15" },
  { id: "5", name: "Router Industrial", category: "Redes", status: "Discontinued", quantity: 2, lastUpdated: "2023-12-10" },
  { id: "6", name: "Panel Patch", category: "Accesorios", status: "Available", quantity: 25, lastUpdated: "2024-01-21" },
];

const CATEGORY_OPTIONS = [
  { label: "Todas las categorías", value: undefined },
  { label: "Hardware", value: "Hardware" },
  { label: "Redes", value: "Redes" },
  { label: "Accesorios", value: "Accesorios" },
  { label: "Software", value: "Software" }
];

// --- COMPONENTE PRINCIPAL ---

export default function InventoryTable() {
  const [selectedItems, setSelectedItems] = React.useState<InventoryItem[]>([]);
  const [categoryFilter, setCategoryFilter] = React.useState<SelectProps.Option | null>(CATEGORY_OPTIONS[0]);

  const { items, actions, filteredItemsCount, collectionProps, paginationProps, filterProps } = useCollection(
    MOCK_INVENTORY,
    {
      pagination: { pageSize: 10 },
      sorting: { defaultState: { sortingColumn: COLUMN_DEFINITIONS[0] } },
      selection: {},
      filtering: {
        empty: (
          <Box textAlign="center" color="inherit">
            <b>No hay items</b>
            <Box padding={{ bottom: "s" }} variant="p" color="inherit">
              No se encontraron recursos.
            </Box>
          </Box>
        ),
        noMatch: (
          <Box textAlign="center" color="inherit">
            <b>No hay coincidencias</b>
            <Box padding={{ bottom: "s" }} variant="p" color="inherit">
              Intenta borrar el filtro.
            </Box>
            <Button onClick={() => actions.setFiltering("")}>Borrar filtro</Button>
          </Box>
        ),
        filteringFunction: (item, filteringText) => {
          const matchesText = item.name.toLowerCase().includes(filteringText.toLowerCase());
          const matchesCategory = categoryFilter?.value 
            ? item.category === categoryFilter.value 
            : true;
          return matchesText && matchesCategory;
        }
      },
    }
  );

  return (
    <>
      {/* 1. Navbar fuera del AppLayout */}
      <Navbar />
      
      {/* 2. AppLayout maneja toda la estructura (Sidebar, Breadcrumbs, Notificaciones, Contenido) */}
      <AppLayout
        navigation={<GlobalSidebar />}
        toolsHide={true} // Ocultamos el panel derecho para igualar la captura
        
        // MIGAS DE PAN (Ruta superior)
        breadcrumbs={
          <BreadcrumbGroup
            items={[
              { text: "Service", href: "#" },
              { text: "Dashboard", href: "#" },
              { text: "Instances", href: "#" }
            ]}
          />
        }

        // NOTIFICACIONES (Barras Azul y Verde)
        notifications={
          <Flashbar
            items={[
              {
                type: "info",
                dismissible: true,
                content: "Esta demostración es un ejemplo de los patrones de Cloudscape Design System.",
                id: "message_1"
              },
              {
                type: "success",
                dismissible: true,
                content: "Recurso creado exitosamente",
                id: "message_2"
              }
            ]}
          />
        }

        // CONTENIDO PRINCIPAL (La Tabla)
        content={
          <Table
            {...collectionProps}
            selectedItems={selectedItems}
            onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems as InventoryItem[])}
            ariaLabels={{
              selectionGroupLabel: "Selección de items",
              allItemsSelectionLabel: ({ selectedItems }) => `${selectedItems.length} seleccionados`,
              itemSelectionLabel: ({ selectedItems }, item) => item.name
            }}
            columnDefinitions={COLUMN_DEFINITIONS}
            items={items}
            selectionType="multi" // Checkboxes a la izquierda
            variant="full-page"   // Estilo plano integrado al fondo
            stickyHeader={true}
            
            // CABECERA DE LA TABLA
            header={
              <Header
                counter={`(${items.length})`}
                info={<Link variant="info">Info</Link>} // Link "Info" pequeño
                actions={
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button disabled={selectedItems.length === 0}>Instance actions</Button>
                    <Button disabled={selectedItems.length === 0}>Restore from S3</Button>
                    <Button variant="primary">Launch DB instance</Button>
                  </SpaceBetween>
                }
              >
                Instances
              </Header>
            }

            // FILTROS
            filter={
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <div style={{ flexGrow: 1, maxWidth: '400px' }}>
                  <TextFilter
                    {...filterProps}
                    filteringPlaceholder="Find instances"
                    countText={`${filteredItemsCount} coincidencias`}
                  />
                </div>
                <div style={{ width: 200 }}>
                   <Select
                      selectedOption={categoryFilter}
                      onChange={({ detail }) => {
                          setCategoryFilter(detail.selectedOption);
                          actions.setFiltering(filterProps.filteringText); 
                      }}
                      options={CATEGORY_OPTIONS}
                      placeholder="Filter engine"
                      ariaLabel="Categoría"
                    />
                </div>
              </SpaceBetween>
            }
            
            pagination={<Pagination {...paginationProps} />}
            
            preferences={
              <CollectionPreferences
                title="Preferencias"
                confirmLabel="Confirmar"
                cancelLabel="Cancelar"
                preferences={{ pageSize: 10, visibleContent: ["name", "category", "status", "quantity", "lastUpdated"] }}
                pageSizePreference={{
                  title: "Tamaño de página",
                  options: [
                    { value: 10, label: "10 recursos" },
                    { value: 20, label: "20 recursos" }
                  ]
                }}
              />
            }
          />
        }
      />
    </>
  );
}