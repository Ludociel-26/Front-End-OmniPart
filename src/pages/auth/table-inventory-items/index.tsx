import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, MoveLeft, AlertTriangle } from "lucide-react";

// Usamos la misma imagen de fondo para mantener la identidad de marca
const BACKGROUND_IMAGE = "../assets/sono-background-light.png";

export default function Inventory() {
  // Lógica de tema simplificada para esta vista
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Detectar preferencia guardada o del sistema
    const savedTheme = localStorage.getItem("theme");
    const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && sysDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <div className={`min-h-screen w-full relative flex items-center justify-center p-4 overflow-hidden ${isDarkMode ? "bg-[#050505]" : "bg-gray-200"}`}>
      
      {/* 1. FONDO ESTATICO (Igual al Login) */}
      <div className="absolute inset-0 z-0 bg-cover bg-center fixed" style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}>
        <div className={`absolute inset-0 transition-colors duration-500 ${isDarkMode ? "bg-black/70" : "bg-white/30 backdrop-blur-[2px]"}`}></div>
      </div>

      {/* 2. CONTENEDOR PRINCIPAL (Glassmorphism) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`relative z-10 w-full max-w-2xl p-8 md:p-12 rounded-[3rem] text-center border shadow-2xl backdrop-blur-xl ${
            isDarkMode 
            ? "bg-black/30 border-white/10" 
            : "bg-white/60 border-white/40"
        }`}
      >
        
        {/* Etiqueta Flotante */}
        <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold text-xs uppercase tracking-widest mb-6"
        >
            <AlertTriangle size={14} />
            Error 404
        </motion.div>

        {/* Número Gigante Animado */}
        <motion.h1 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className={`text-[8rem] md:text-[10rem] leading-none font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b ${
                isDarkMode 
                ? "from-white via-zinc-400 to-transparent" 
                : "from-gray-900 via-gray-600 to-transparent"
            }`}
        >
            404
        </motion.h1>

        {/* Mensaje de Texto */}
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4 mb-10"
        >
            <h2 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                ¡Ups! Página no encontrada
            </h2>
            <p className={`text-sm md:text-base max-w-md mx-auto ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>
                Parece que la página que buscas se ha movido, eliminado o nunca existió en nuestro inventario.
            </p>
        </motion.div>

        {/* Botón de Regreso */}
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
        >
            <Link to="/">
                <button className={`group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg ${
                    isDarkMode 
                    ? "bg-white text-black hover:bg-zinc-200 shadow-white/10" 
                    : "bg-gray-900 text-white hover:bg-gray-800 shadow-black/20"
                }`}>
                    <MoveLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                    Regresar al Inicio
                    <Home size={18} className="opacity-50" />
                </button>
            </Link>
        </motion.div>

        {/* Decoración de fondo (Luces) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 overflow-hidden rounded-[3rem]">
            <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-64 h-64 bg-blue-500/20 rounded-full blur-[100px]"></div>
        </div>

      </motion.div>

      {/* Footer Minimalista */}
      <div className={`absolute bottom-6 text-center w-full ${isDarkMode ? "text-zinc-600" : "text-gray-500"} text-[10px]`}>
        &copy; 2025 OmniPart. Todos los derechos reservados.
      </div>
    </div>
  );
}