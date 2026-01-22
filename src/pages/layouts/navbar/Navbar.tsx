import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  TopNavigation, 
  Input 
} from '@cloudscape-design/components';
import { applyMode, applyDensity, Mode, Density } from '@cloudscape-design/global-styles';

// --- IMPORTAMOS LOS ESTILOS AQUÍ ---
import './navbar.css'; 

// Hook auxiliar para detectar Mac
const useIsMac = () => {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);
  return isMac;
};

export default function GlobalHeader() {
  const isMac = useIsMac();
  
  // --- ESTADO DEL USUARIO ---
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsUserLoading(false);
      setUserAvatarUrl(""); 
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

  // --- TEMA Y DENSIDAD ---
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

  return (
    <div id="h" style={{ position: 'sticky', top: 0, zIndex: 1002 }}>
      
      {/* ¡YA NO NECESITAMOS LA ETIQUETA STYLE AQUÍ! */}
      
      <TopNavigation
        identity={{
          href: "#",
          title: "OmniPart",
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
              placeholder="Buscar (ej. Refacciones, Usuarios, Ajustes)..."
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
          {
              type: "menu-dropdown",
              iconName: "view-app",
              ariaLabel: "Aplicaciones",
              title: "Apps",
              items: [ { id: "app1", text: "Dashboard", href: "#" } ]
          },
          {
            type: "button",
            iconName: "notification",
            title: "Notificaciones",
            ariaLabel: "Notificaciones",
            badge: true,
            onClick: () => {}
          },
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
          {
            type: "menu-dropdown",
            text: "Carlos Ruiz",
            description: "Admin",
            iconName: isUserLoading ? "status-in-progress" : (userAvatarUrl ? undefined : "user-profile"),
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
  );
}