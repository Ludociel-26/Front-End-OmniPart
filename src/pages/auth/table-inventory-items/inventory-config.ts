// NOTA: Agregamos "type" aquí para evitar el error de "binding not found"
import type { TableProps } from "@cloudscape-design/components";

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  status: "Available" | "Out of Stock" | "Discontinued";
  quantity: number;
  lastUpdated: string;
}

export const COLUMN_IjHQ: TableProps.ColumnDefinition<InventoryItem>[] = [
  {
    id: "name",
    header: "Nombre del Producto",
    cell: item => item.name,
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
    cell: item => item.status,
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

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: "1", name: "Servidor Rack 4U", category: "Hardware", status: "Available", quantity: 15, lastUpdated: "2024-01-20" },
  { id: "2", name: "Cable Óptico 10m", category: "Accesorios", status: "Out of Stock", quantity: 0, lastUpdated: "2024-01-18" },
  { id: "3", name: "Switch Gestionable", category: "Redes", status: "Available", quantity: 8, lastUpdated: "2024-01-19" },
  { id: "4", name: "Licencia Software", category: "Software", status: "Available", quantity: 50, lastUpdated: "2024-01-15" },
  { id: "5", name: "Router Industrial", category: "Redes", status: "Discontinued", quantity: 2, lastUpdated: "2023-12-10" },
  { id: "6", name: "Panel Patch", category: "Accesorios", status: "Available", quantity: 25, lastUpdated: "2024-01-21" },
];