import React, { useState } from 'react';
import {
  Box,
  Header,
  SpaceBetween,
  Button,
  Cards,
  TextFilter
} from '@cloudscape-design/components';
import { allWidgets } from './config';

// Importante: usar 'type' para evitar error de Vite
import type { WidgetConfig } from './interfaces';

interface PaletteProps {
  activeWidgetIds: string[];
  onAddWidget: (id: string) => void;
}

export const DashboardPalette = ({ activeWidgetIds, onAddWidget }: PaletteProps) => {
  const [filteringText, setFilteringText] = useState("");

  const availableWidgets = Object.entries(allWidgets)
    .filter(([id]) => !activeWidgetIds.includes(id))
    .map(([id, config]) => ({ id, ...config }));

  const filteredItems = availableWidgets.filter(item => 
    (item.title || "").toLowerCase().includes(filteringText.toLowerCase())
  );

  return (
    <SpaceBetween size="l">
      <Header variant="h2">Add widgets</Header>
      <Box variant="p" color="text-body-secondary">
        Customize your dashboard by adding widgets.
      </Box>

      <TextFilter
        filteringText={filteringText}
        onChange={({ detail }) => setFilteringText(detail.filteringText)}
        filteringPlaceholder="Find widgets"
      />

      <Cards
        cardDefinition={{
          header: item => item.title,
          sections: [
            {
              id: "action",
              content: item => (
                <Button 
                    iconName="add-plus" 
                    variant="inline-link" 
                    onClick={() => onAddWidget(item.id)}
                >
                    Add
                </Button>
              )
            }
          ]
        }}
        cardsPerRow={[{ cards: 1 }]}
        items={filteredItems}
        empty={
          <Box textAlign="center" color="text-body-secondary">
            <b>No widgets match</b>
          </Box>
        }
      />
    </SpaceBetween>
  );
};