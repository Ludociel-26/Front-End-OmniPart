import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import axios from 'axios';
import { applyMode, Mode } from '@cloudscape-design/global-styles';
import {
  Modal,
  Box,
  SpaceBetween,
  Button,
  Alert,
  Spinner,
} from '@cloudscape-design/components';

// 🔒 Asegura que el Front-End envíe las cookies (JWT) en cada petición
axios.defaults.withCredentials = true;

export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserData {
  id: number | string;
  name: string;
  email: string;
  isAccountVerified: boolean;
  role: number;
  area: number;
  roleName: string;
  areaName: string;
}

export interface AlertItem {
  type: 'success' | 'warning' | 'info' | 'error';
  content: React.ReactNode;
  header?: React.ReactNode;
  id?: string;
  loading?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
}

interface AppContextType {
  backendUrl: string;
  isLoggedin: boolean;
  setIsLoggedin: (value: boolean) => void;
  userData: UserData | null;
  setUserData: (value: UserData | null) => void;
  getUserData: () => Promise<void>;
  executeGlobalLogout: () => Promise<void>;
  executeGlobalLoginSync: () => void;
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isLoading: boolean;
  pageLoading: boolean;
  setPageLoading: (loading: boolean) => void;
  loadingText: string;
  setLoadingText: (text: string) => void;
  alerts: AlertItem[];
  addAlert: (
    type: AlertItem['type'],
    content: string,
    header?: string,
    existingId?: string,
    loading?: boolean,
  ) => string;
}

export const AppContent = createContext<AppContextType | null>(null);

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL as string;

  const [isLoggedin, setIsLoggedin] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('Cargando...');
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  // ESTADOS PARA MODALES DE SEGURIDAD
  const [showDisabledModal, setShowDisabledModal] = useState<boolean>(false);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [showExpiredModal, setShowExpiredModal] = useState<boolean>(false);

  const lastActivityRef = useRef<number>(Date.now());
  const authChannel = useRef<BroadcastChannel | null>(null);

  const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutos
  const WARNING_TIMEOUT = 13 * 60 * 1000; // 13 minutos

  const updateActivity = useCallback(() => {
    if (!showWarningModal && !showExpiredModal && !showDisabledModal) {
      lastActivityRef.current = Date.now();
    }
  }, [showWarningModal, showExpiredModal, showDisabledModal]);

  // 🚩 LÓGICA DE ALERTAS INTACTA
  const addAlert = useCallback(
    (
      type: AlertItem['type'],
      content: string,
      header?: string,
      existingId?: string,
      loading: boolean = false,
    ): string => {
      const id =
        existingId ||
        Date.now().toString() + Math.random().toString(36).substring(7);
      setAlerts((prev) => {
        const existingIndex = prev.findIndex((a) => a.id === id);
        const newAlert: AlertItem = {
          type,
          content,
          header,
          id,
          loading,
          dismissible: !loading,
          onDismiss: () =>
            setAlerts((current) => current.filter((a) => a.id !== id)),
        };
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = newAlert;
          return updated;
        }
        return [...prev, newAlert];
      });

      if (!loading && (type === 'success' || type === 'info')) {
        setTimeout(
          () => setAlerts((current) => current.filter((a) => a.id !== id)),
          5000,
        );
      }
      return id;
    },
    [],
  );

  const getUserData = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`);
      if (data.success) {
        setUserData(data.userData);
        setIsLoggedin(true);
      }
    } catch (error) {}
  }, [backendUrl]);

  const getAuthState = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/auth/is-auth?init=true`,
      );
      if (data.success) {
        setIsLoggedin(true);
        await getUserData();
      } else {
        setIsLoggedin(false);
        setUserData(null);
      }
    } catch (error) {
      setIsLoggedin(false);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl, getUserData]);

  // BROADCAST PARA SINCRONIZAR MÚLTIPLES PESTAÑAS
  useEffect(() => {
    authChannel.current = new BroadcastChannel('auth_sync_channel');
    authChannel.current.onmessage = (event) => {
      const { type, payload } = event.data;
      if (window.location.pathname.includes('/login')) return;

      if (type === 'LOGOUT_SYNC') {
        setShowWarningModal(false);
        if (payload === 'DISABLED') setShowDisabledModal(true);
        else if (payload === 'EXPIRED') setShowExpiredModal(true);
      }
      if (type === 'LOGIN_SYNC') {
        getAuthState();
        setShowExpiredModal(false);
        setShowDisabledModal(false);
      }
    };
    return () => authChannel.current?.close();
  }, [getAuthState]);

  const executeGlobalLogout = async () => {
    try {
      await axios.post(`${backendUrl}/api/auth/logout`);
    } catch (err) {}
    setIsLoggedin(false);
    setUserData(null);
    setShowExpiredModal(false);
    setShowDisabledModal(false);
    authChannel.current?.postMessage({
      type: 'LOGOUT_SYNC',
      payload: 'MANUAL',
    });
    window.location.href = '/login';
  };

  const executeGlobalLoginSync = () =>
    authChannel.current?.postMessage({ type: 'LOGIN_SYNC' });

  // =======================================================================
  // INTERCEPTOR CON MANEJO DE MENSAJES DINÁMICOS
  // =======================================================================
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const url = error.config?.url || '';

        if (
          url.includes('/login') ||
          url.includes('/register') ||
          url.includes('init=true')
        ) {
          return Promise.reject(error);
        }

        if (error.response) {
          // 🚩 Extraemos el mensaje humano del Back-End. Si no existe, usamos un fallback seguro.
          const backendMessage =
            error.response.data?.message ||
            'Ha ocurrido un error de autenticación.';

          if (error.response.status === 403) {
            setShowDisabledModal(true);
            // El mensaje se inyecta directamente en la notificación de Cloudscape
            addAlert('error', backendMessage, 'Acceso Restringido');
            authChannel.current?.postMessage({
              type: 'LOGOUT_SYNC',
              payload: 'DISABLED',
            });
          } else if (error.response.status === 401) {
            setShowExpiredModal(true);
            addAlert('error', backendMessage, 'Sesión Terminada');
            authChannel.current?.postMessage({
              type: 'LOGOUT_SYNC',
              payload: 'EXPIRED',
            });
          }
        }
        return Promise.reject(error);
      },
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [addAlert]);

  // =======================================================================
  // RELOJES Y HEARTBEAT DE SEGURIDAD
  // =======================================================================
  useEffect(() => {
    let localTimerId: ReturnType<typeof setInterval>;
    let apiHeartbeatId: ReturnType<typeof setInterval>;
    const events = ['mousemove', 'keydown', 'click', 'scroll'];

    const executeSilentLogout = async () => {
      try {
        await axios.post(`${backendUrl}/api/auth/logout`);
      } catch (err) {}
      setShowWarningModal(false);
      setShowExpiredModal(true);
      addAlert(
        'warning',
        'Cerramos tu sesión por inactividad prolongada.',
        'Sesión Expirada',
      );
      authChannel.current?.postMessage({
        type: 'LOGOUT_SYNC',
        payload: 'EXPIRED',
      });
    };

    if (isLoggedin && !showDisabledModal && !showExpiredModal) {
      events.forEach((event) => window.addEventListener(event, updateActivity));

      localTimerId = setInterval(() => {
        const timeIdle = Date.now() - lastActivityRef.current;
        if (timeIdle >= WARNING_TIMEOUT && timeIdle < IDLE_TIMEOUT) {
          setShowWarningModal(true);
        } else if (timeIdle >= IDLE_TIMEOUT) {
          executeSilentLogout();
        }
      }, 5000);

      apiHeartbeatId = setInterval(async () => {
        const timeIdle = Date.now() - lastActivityRef.current;
        if (timeIdle < WARNING_TIMEOUT) {
          try {
            const response = await axios.get(
              `${backendUrl}/api/auth/is-auth?t=${Date.now()}`,
            );
            if (response.data && response.data.success === false) {
              setShowExpiredModal(true);
              authChannel.current?.postMessage({
                type: 'LOGOUT_SYNC',
                payload: 'EXPIRED',
              });
            }
          } catch (error: any) {
            if (error.response && error.response.status === 401) {
              setShowExpiredModal(true);
              authChannel.current?.postMessage({
                type: 'LOGOUT_SYNC',
                payload: 'EXPIRED',
              });
            }
          }
        }
      }, 10000);
    }

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, updateActivity),
      );
      if (localTimerId) clearInterval(localTimerId);
      if (apiHeartbeatId) clearInterval(apiHeartbeatId);
    };
  }, [
    isLoggedin,
    showDisabledModal,
    showExpiredModal,
    backendUrl,
    updateActivity,
    addAlert,
  ]);

  const handleGoToLogin = () => {
    setIsLoggedin(false);
    setUserData(null);
    setShowExpiredModal(false);
    setShowDisabledModal(false);
    window.location.href = '/login';
  };

  const handleExtendSession = () => {
    lastActivityRef.current = Date.now();
    setShowWarningModal(false);
  };

  const [theme, setTheme] = useState<ThemeMode>(
    () => (localStorage.getItem('theme') as ThemeMode) || 'system',
  );
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      let shouldBeDark =
        theme === 'system' ? mediaQuery.matches : theme === 'dark';
      setIsDark(shouldBeDark);
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
        applyMode(Mode.Dark);
        document.documentElement.style.backgroundColor = '#161d26';
        document.body.style.backgroundColor = '#161d26';
      } else {
        document.documentElement.classList.remove('dark');
        applyMode(Mode.Light);
        document.documentElement.style.backgroundColor = '#ffffff';
        document.body.style.backgroundColor = '#ffffff';
      }
    };
    applyTheme();
    const listener = () => {
      if (theme === 'system') applyTheme();
    };
    mediaQuery.addEventListener('change', listener);
    localStorage.setItem('theme', theme);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  useEffect(() => {
    getAuthState();
  }, [getAuthState]);

  const value: AppContextType = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
    executeGlobalLogout,
    executeGlobalLoginSync,
    theme,
    isDark,
    setTheme,
    toggleTheme,
    isLoading,
    pageLoading,
    setPageLoading,
    loadingText,
    setLoadingText,
    alerts,
    addAlert,
  };

  return (
    <AppContent.Provider value={value}>
      {/* 🛑 MODAL DE CUENTA DESHABILITADA (UX Pulida) */}
      <Modal
        onDismiss={() => {}}
        visible={showDisabledModal}
        header="Acceso Restringido"
        footer={
          <Box float="right">
            <Button variant="primary" onClick={handleGoToLogin}>
              Ir al inicio de sesión
            </Button>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <Alert type="error" header="Cuenta suspendida">
            Tu acceso al sistema ha sido suspendido temporalmente. Por favor,
            contacta al administrador para solucionar este problema.
          </Alert>
          <Box variant="p">
            Cualquier cambio no guardado en tu inventario se ha descartado por
            seguridad.
          </Box>
        </SpaceBetween>
      </Modal>

      {/* ⚠️ MODAL DE ADVERTENCIA */}
      <Modal
        onDismiss={() => {}}
        visible={showWarningModal}
        header="Tu sesión está a punto de caducar"
        footer={
          <Box float="right">
            <Button variant="primary" onClick={handleExtendSession}>
              Continuar trabajando
            </Button>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <Alert type="warning" header="Inactividad detectada">
            Cerraremos tu sesión automáticamente en breve si no interactúas con
            el sistema.
          </Alert>
        </SpaceBetween>
      </Modal>

      {/* ❌ MODAL DE SESIÓN CADUCADA */}
      <Modal
        onDismiss={() => {}}
        visible={showExpiredModal}
        header="Sesión caducada"
        footer={
          <Box float="right">
            <Button variant="primary" onClick={handleGoToLogin}>
              Volver a iniciar sesión
            </Button>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <Alert type="warning" header="Su sesión ha expirado">
            Por seguridad, tu tiempo de sesión ha concluido. Vuelve a iniciar
            sesión para continuar.
          </Alert>
        </SpaceBetween>
      </Modal>

      {isLoading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
          }}
        >
          <SpaceBetween size="m" alignItems="center">
            <Spinner size="large" />
            <Box variant="h3">Validando sesión...</Box>
          </SpaceBetween>
        </div>
      ) : (
        children
      )}
    </AppContent.Provider>
  );
};
