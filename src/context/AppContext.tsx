import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import axios from 'axios';
// 🚩 IMPORTAMOS TU INSTANCIA API PARA INYECTARLE EL TOKEN TAMBIÉN
import api from '@/services/api';
import { applyMode, Mode } from '@cloudscape-design/global-styles';
import {
  Modal,
  Box,
  SpaceBetween,
  Button,
  Alert,
  Spinner,
} from '@cloudscape-design/components';

// 🔒 Asegura que el Front-End envíe las cookies en peticiones Cross-Origin
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

  // LÓGICA DE ALERTAS
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

    localStorage.removeItem('auth_token');

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
  // 🚩 INTERCEPTORES UNIFICADOS PARA MICROSERVICIOS
  // =======================================================================
  useEffect(() => {
    // Función reutilizable para inyectar el token en CUALQUIER instancia
    const injectToken = (config: any) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    };

    // Función reutilizable para manejar la renovación (Refresh Token)
    const handleResponseError = async (error: any) => {
      const originalRequest = error.config;
      const url = originalRequest?.url || '';

      if (
        url.includes('/login') ||
        url.includes('/register') ||
        url.includes('/refresh-token') ||
        url.includes('init=true')
      ) {
        return Promise.reject(error);
      }

      // Si caduca el Access Token, usamos la cookie para pedir otro en silencio
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Pedimos la renovación (la cookie vieja viaja aquí automáticamente)
          const refreshResponse = await axios.post(
            `${backendUrl}/api/auth/refresh-token`,
          );

          if (refreshResponse.data.success) {
            const newAccessToken = refreshResponse.data.accessToken;
            localStorage.setItem('auth_token', newAccessToken);

            // Reintentamos la petición que había fallado
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            // 🚩 Usamos axios nativo para reintentar respetando la config original
            return axios(originalRequest);
          }
        } catch (refreshError) {
          // Si el refresh_token expiró, cerramos la sesión en la cara del usuario
          setShowExpiredModal(true);
          addAlert(
            'error',
            'Sesión Terminada por Inactividad prolongada.',
            'Sesión Terminada',
          );
          authChannel.current?.postMessage({
            type: 'LOGOUT_SYNC',
            payload: 'EXPIRED',
          });
          localStorage.removeItem('auth_token');
          return Promise.reject(refreshError);
        }
      }

      if (error.response?.status === 403) {
        setShowDisabledModal(true);
        const backendMessage =
          error.response.data?.message || 'Acceso Restringido.';
        addAlert('error', backendMessage, 'Acceso Restringido');
        authChannel.current?.postMessage({
          type: 'LOGOUT_SYNC',
          payload: 'DISABLED',
        });
      }

      return Promise.reject(error);
    };

    // 🚩 APLICAMOS A AXIOS (API Auth y Base)
    const reqAxios = axios.interceptors.request.use(injectToken, (e) =>
      Promise.reject(e),
    );
    const resAxios = axios.interceptors.response.use(
      (r) => r,
      handleResponseError,
    );

    // 🚩 APLICAMOS A TU INSTANCIA "api" (API Mantenimiento)
    const reqApi = api.interceptors.request.use(injectToken, (e) =>
      Promise.reject(e),
    );
    const resApi = api.interceptors.response.use((r) => r, handleResponseError);

    return () => {
      // Limpieza
      axios.interceptors.request.eject(reqAxios);
      axios.interceptors.response.eject(resAxios);
      api.interceptors.request.eject(reqApi);
      api.interceptors.response.eject(resApi);
    };
  }, [backendUrl, addAlert]);

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

      localStorage.removeItem('auth_token');

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
              // Interceptor se encargará
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
    localStorage.removeItem('auth_token');

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
      {/* 🛑 MODAL DE CUENTA DESHABILITADA */}
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
