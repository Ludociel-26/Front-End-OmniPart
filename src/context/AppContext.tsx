import axios from "axios";
import { createContext, useState, ReactNode, useEffect } from "react";
import { toast } from "react-toastify";

// Definir el tipo de usuario con el rol incluido
interface UserData {
  id: string;
  name: string;
  email: string;
  isAccountVerified: boolean;
  role: number; // Aseguramos que el rol siempre está presente
}

// Definir el tipo de contexto
interface AppContextType {
  backendUrl: string;
  isLoggedin: boolean;
  setIsLoggedin: (value: boolean) => void;
  userData: UserData | null;
  setUserData: (value: UserData | null) => void;
  theme: string;
  toggleTheme: () => void; 
  getUserData: () => Promise<void>;
}

// Crear el contexto con un valor por defecto
export const AppContent = createContext<AppContextType | null>(null);

interface AppContextProviderProps {
  children: ReactNode;
}

export const AppContextProvider = ({ children }: AppContextProviderProps) => {
  axios.defaults.withCredentials = true;
  const backendUrl = import.meta.env.VITE_BACKEND_URL as string; 

  const [isLoggedin, setIsLoggedin] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [theme, setTheme] = useState<string>('light'); 

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.className = newTheme;
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.className = savedTheme;
    } else {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemTheme);
      document.documentElement.className = systemTheme;
    }
  }, []);

  // Función para verificar si el usuario está autenticado y obtener sus datos
  const getAuthState = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`);
      if (data.success) {
        setIsLoggedin(true);
        getUserData();
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Función para obtener la información del usuario incluyendo el rol
  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`);
      if (data.success) {
        setUserData(data.userData); 
        setIsLoggedin(true);
      } else {
        setUserData(null);
        setIsLoggedin(false);
        toast.error(data.message);
      }
    } catch (error: any) {
      setUserData(null);
      setIsLoggedin(false);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getAuthState();
  }, []);

  const value: AppContextType = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    theme,
    toggleTheme,
    getUserData
  };

  return <AppContent.Provider value={value}>{children}</AppContent.Provider>;
};