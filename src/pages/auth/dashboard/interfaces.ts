// CORREGIDO: "import type" es obligatorio aquí
import type { BoardProps } from '@cloudscape-design/board-components/board';
import type React from 'react';

export interface WidgetDataType {
  title: string;
  description?: string;
  disableContentPaddings?: boolean;
  provider: React.JSXElementConstructor<any>;
}

export type DashboardWidgetItem = BoardProps.Item<WidgetDataType>;

export interface WidgetConfig {
  title?: string;
  description?: string;
  provider: React.JSXElementConstructor<any>;
  definition?: {
    defaultRowSpan?: number;
    defaultColumnSpan?: number;
    minRowSpan?: number;
    minColumnSpan?: number;
  };
}

export interface StoredWidgetPlacement {
  id: string;
  columnSpan?: number;
  rowSpan?: number;
  columnOffset?: Record<string, number>;
}