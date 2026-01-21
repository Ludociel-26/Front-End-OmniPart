import type { BoardProps } from '@cloudscape-design/board-components/board';

export const boardI18nStrings: BoardProps.I18nStrings<any> = {
  // 1. INICIO DEL ARRASTRE
  liveAnnouncementDndStarted: (operationType) =>
    operationType === 'resize' ? 'Resizing started' : 'Dragging started',
  
  // 2. REORDENAMIENTO EXITOSO
  liveAnnouncementDndItemReordered: (op) =>
    `Item ${op.item.data.title} reordered to column ${op.col + 1}, row ${op.row + 1}`,
  
  // 3. CAMBIO DE TAMAÑO EXITOSO
  liveAnnouncementDndItemResized: (op) =>
    `Item ${op.item.data.title} resized to ${op.rowSpan} rows and ${op.colSpan} columns`,
  
  // 4. OPERACIÓN COMPLETADA (General)
  liveAnnouncementDndCommitted: (operationType) => 
    `Operation committed: ${operationType}`,
  
  // 5. OPERACIÓN DESCARTADA (Aquí estaba tu error)
  // Debe ser una función que recibe el tipo de operación
  liveAnnouncementDndDiscarded: (operationType) => 
    `Operation discarded. Item returned to original position.`,
  
  // 6. ELIMINAR ELEMENTO
  liveAnnouncementItemRemoved: (op) => 
    `Removed item ${op.item.data.title}.`,
    
  liveAnnouncementPcItemRemoved: (op) => 
    `Removed item ${op.item.data.title}.`,

  // TEXTOS ESTÁTICOS (Estos sí son strings)
  liveAnnouncementDndEyebrow: "Board operation",
  navigationAriaLabel: "Board navigation",
  sidebarAriaLabel: "Board sidebar",
};