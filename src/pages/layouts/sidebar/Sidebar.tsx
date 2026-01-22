import React from "react";
import { SideNavigation } from "@cloudscape-design/components";
import { useLocation, useNavigate } from "react-router-dom";
import { navItems } from "./items"; // Importamos la lista del Paso 1

export default function GlobalSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <SideNavigation
      // 1. Detección automática: Compara la URL actual con los items
      activeHref={location.pathname}
      
      header={{ href: "/dashboard", text: "OmniPart Servicios" }}
      
      items={navItems}
      
      // 2. Navegación SPA: Evita que la página se recargue por completo
      onFollow={event => {
        if (!event.detail.external) {
          event.preventDefault();
          navigate(event.detail.href);
        }
      }}
    />
  );
}