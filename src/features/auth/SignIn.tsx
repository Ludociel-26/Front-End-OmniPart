import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun, Moon, Monitor, ChevronLeft, ChevronRight, Mail, User, Lock,
  Eye, EyeOff, Briefcase, MapPin, Calendar, ScanLine, Cpu, Settings,
  Box, Check, ShieldCheck, AlertCircle
} from "lucide-react";

import backgroundImage from "@/assets/login/images/secure-cloud-2.13f9c7779deee5111de648fbd4a012ec550f6e06-2.png"
import LOGO_IMAGE from "@/assets/icons/logo_del_monte.png"
import bg1 from "@/assets/login/images/bedrock-agentcore.png"
import bg2 from "@/assets/login/images/best-of-reinvent.png"
import bg3 from "@/assets/login/images/devops-agent.png"
import bg4 from "@/assets/login/images/quick-suite.png"

// --- CONSTANTES ---
// const BACKGROUND_IMAGE = "/src/assets/images/login/login_light_background.png";
// const LOGO_IMAGE = "/src/assets/icons/vite.svg"; 

type ThemeMode = "light" | "dark" | "system";

// --- HOOK DE TEMA ---
function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("theme") as ThemeMode;
    return saved || "system";
  });
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      let shouldBeDark = false;
      if (mode === "system") shouldBeDark = mediaQuery.matches;
      else shouldBeDark = mode === "dark";
      setIsDark(shouldBeDark);
      const root = window.document.documentElement;
      if (shouldBeDark) root.classList.add("dark");
      else root.classList.remove("dark");
    };
    applyTheme();
    const listener = () => { if (mode === "system") applyTheme(); };
    mediaQuery.addEventListener("change", listener);
    localStorage.setItem("theme", mode);
    return () => mediaQuery.removeEventListener("change", listener);
  }, [mode]);
  return { mode, setMode, isDark };
}

// --- UTILIDAD VALIDACIÓN ---
const validatePassword = (pass: string) => {
    return {
        length: pass.length >= 8,
        uppercase: /[A-Z]/.test(pass),
        lowercase: /[a-z]/.test(pass),
        number: /[0-9]/.test(pass),
        special: /[^A-Za-z0-9]/.test(pass),
    };
};

const calculateStrength = (checks: any) => {
    const total = Object.keys(checks).length;
    const valid = Object.values(checks).filter(Boolean).length;
    return (valid / total) * 100;
};

// --- INPUT ANIMADO ---
const AnimatedInput = ({ 
    type, placeholder, className, icon, isDarkMode, showPasswordToggle, 
    showPassword, onTogglePassword, hasError, value, ...props 
}: any) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (value || type === "date") {
        setDisplayedText(placeholder);
        return;
    }
    let index = 0;
    let timeoutId: any;
    setDisplayedText(""); 
    const typeChar = () => {
      if (placeholder && index < placeholder.length) {
        setDisplayedText((prev) => placeholder.slice(0, index + 1));
        index++;
        timeoutId = setTimeout(typeChar, 30 + Math.random() * 50); 
      }
    };
    timeoutId = setTimeout(typeChar, 200);
    return () => clearTimeout(timeoutId);
  }, [placeholder, type]); 

  const inputType = showPasswordToggle ? (showPassword ? "text" : "password") : type;
  
  let baseColorClass = isDarkMode ? "text-zinc-400 group-focus-within:text-white" : "text-gray-500 group-focus-within:text-emerald-700";
  let errorClass = "";
  
  if (hasError) {
      baseColorClass = "text-red-500";
      errorClass = isDarkMode ? "border-red-500/50 bg-red-500/10" : "border-red-500 bg-red-50";
  }

  return (
    <div className="relative group w-full shrink-0">
      {icon && (
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${baseColorClass} z-10 pointer-events-none`}>
          {icon}
        </div>
      )}
      <div className={`absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none ${
          hasError ? errorClass : isFocused ? (isDarkMode ? "opacity-100 shadow-[0_0_20px_rgba(255,255,255,0.05)]" : "opacity-100 shadow-[0_0_15px_rgba(16,185,129,0.2)]") : "opacity-0"
      }`}></div>
      <input
        type={inputType}
        value={value}
        placeholder={value ? placeholder : (type === "date" ? undefined : displayedText)} 
        className={`${className} ${hasError ? "border-red-500 focus:border-red-500 text-red-500 placeholder-red-400" : ""} ${icon ? "pl-11" : ""} ${showPasswordToggle ? "pr-11" : ""}`}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {hasError && !showPasswordToggle && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none"><AlertCircle size={18} /></div>}
      {showPasswordToggle && (
        <button type="button" onClick={onTogglePassword} className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200 p-1 rounded-full ${hasError ? "text-red-500 hover:text-red-400" : (isDarkMode ? "text-zinc-400 hover:text-white" : "text-gray-500 hover:text-gray-900")}`}>
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
};

// --- SELECTOR DE REGIÓN ---
const CountrySelect = ({ className, icon, isDarkMode, ...props }: any) => {
    const iconColorClass = isDarkMode ? "text-zinc-400 group-focus-within:text-white" : "text-gray-500 group-focus-within:text-emerald-700";
    return (
        <div className="relative group w-full shrink-0">
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${iconColorClass} z-10 pointer-events-none`}>
                {icon}
            </div>
            <select className={`${className} pl-11 appearance-none cursor-pointer`} {...props}>
                <option value="" disabled selected>Selecciona tu Región</option>
                <option value="MX">México 🇲🇽</option>
                <option value="US">Estados Unidos 🇺🇸</option>
                <option value="CA">Canadá 🇨🇦</option>
                <option value="ES">España 🇪🇸</option>
            </select>
            <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? "text-zinc-500" : "text-gray-500"}`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
        </div>
    );
}

// --- ICONOS ANIMADOS ---
const TechIconCycle = ({ isDarkMode }: { isDarkMode: boolean }) => {
    const icons = [
        { Icon: ScanLine, color: "text-blue-400" },
        { Icon: Cpu, color: "text-purple-400" },
        { Icon: Settings, color: "text-emerald-400" },
        { Icon: Box, color: "text-orange-400" },
    ];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % icons.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const CurrentIcon = icons[index].Icon;

    return (
        <div className={`relative p-3 rounded-xl backdrop-blur-md border shadow-lg overflow-hidden ${isDarkMode ? "bg-white/10 border-white/20" : "bg-white/80 border-white/60"}`}>
            <AnimatePresence mode="wait">
                <motion.div key={index} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.3 }}>
                    <CurrentIcon size={28} className={icons[index].color} />
                </motion.div>
            </AnimatePresence>
            <motion.div animate={{ top: ["-10%", "110%", "-10%"] }} transition={{ duration: 3, ease: "linear", repeat: Infinity }} className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        </div>
    );
}

// --- PANEL DERECHO ---
const InfoPanel = ({ isDarkMode, testimonials, currentTestimonial, prevTestimonial, nextTestimonial }: any) => {
  const features = ["Trazabilidad", "Alertas Stock", "Auditoría", "Reportes ISO"];
  
  const randomImage = useMemo(() => {
    const images = [
        bg1,
        bg2,
        bg3,
        bg4, 
    ];
    return images[Math.floor(Math.random() * images.length)];
  }, []);

  return (
    <div className={`relative hidden lg:flex flex-col h-full p-8 overflow-hidden rounded-r-[2.5rem] rounded-l-[3rem] ml-[-2.5rem] z-20 border-r border-y ${isDarkMode ? "border-white/10" : "border-white/40"}`}>
      
      {/* FONDO GLASS */}
      <div className={`absolute inset-0 transition-colors duration-500 ${isDarkMode ? "bg-black/40" : "bg-white/50"} backdrop-blur-3xl`}></div>
      
      {/* Animaciones Fondo */}
      <motion.div animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }} className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-emerald-500/20 rounded-full blur-[80px]"></motion.div>
      <motion.div animate={{ x: [0, -40, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }} transition={{ duration: 10, repeat: Infinity, repeatType: "mirror", delay: 1 }} className="absolute bottom-[10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[90px]"></motion.div>

      <div className="relative z-10 h-full flex flex-col">
        
        {/* TESTIMONIOS */}
        <div className="mt-12 space-y-3 flex-shrink-0">
          <h2 className={`text-xl font-bold tracking-tight opacity-90 ${isDarkMode ? "text-white" : "text-emerald-950"}`}>Experiencia OmniPart</h2>
          <div className="h-20 relative">
            <AnimatePresence mode="wait">
                <motion.div key={currentTestimonial} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.5 }} className="space-y-2">
                    <blockquote className={`text-sm font-medium leading-snug italic ${isDarkMode ? "text-zinc-200" : "text-gray-900"}`}>"{testimonials[currentTestimonial].quote}"</blockquote>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? "text-emerald-400" : "text-emerald-700"}`}>{testimonials[currentTestimonial].author} — {testimonials[currentTestimonial].role}</p>
                </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex gap-2">
            <button onClick={prevTestimonial} className={`p-2 rounded-full border backdrop-blur-md transition-all active:scale-95 ${isDarkMode ? "border-white/20 hover:bg-white/10 text-white" : "border-gray-600 hover:bg-black/5 text-gray-900"}`}><ChevronLeft size={14} /></button>
            <button onClick={nextTestimonial} className={`p-2 rounded-full border backdrop-blur-md transition-all active:scale-95 ${isDarkMode ? "border-white/20 hover:bg-white/10 text-white" : "border-gray-600 hover:bg-black/5 text-gray-900"}`}><ChevronRight size={14} /></button>
          </div>
        </div>

        {/* ESPACIADOR FLEXIBLE */}
        <div className="flex-1 min-h-[40px]"></div>

        {/* TARJETA INFERIOR + GHOST CARD (EFECTO DETRÁS CORREGIDO) */}
        <div className="relative w-full flex-shrink-0 h-[340px]">
            
            {/* 1. TARJETA FANTASMA (DETRÁS) - Desplazada para que se note */}
            <div 
                className={`absolute inset-0 rounded-[2.5rem] backdrop-blur-sm z-0 transform translate-y-4 scale-95 border ${
                    isDarkMode 
                        ? "bg-white/5 border-white/5" 
                        : "bg-black/5 border-black/5"
                }`}
            ></div>
            
            {/* 2. TARJETA PRINCIPAL (IMAGEN) */}
            <div className={`relative w-full h-full rounded-[2.5rem] overflow-hidden flex flex-col justify-end backdrop-blur-2xl border shadow-2xl group z-10 transition-transform hover:scale-[1.01] ${isDarkMode ? "border-white/15" : "border-white/60"}`}>
                <div className="absolute inset-0 z-0 transition-transform duration-1000 group-hover:scale-105" style={{ backgroundImage: `url(${randomImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div className={`absolute inset-0 z-10 bg-gradient-to-t ${isDarkMode ? "from-black/95 via-black/60 to-black/20" : "from-white/95 via-white/70 to-white/10"}`}></div>
                
                <div className="relative z-20 p-6 pb-8">
                    <div className="absolute top-4 right-4"><TechIconCycle isDarkMode={isDarkMode} /></div>
                    <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Plataforma 360°</h3>
                    <p className={`text-xs mb-4 leading-relaxed font-semibold ${isDarkMode ? "text-zinc-200" : "text-gray-800"}`}>Reconocimiento visual de refacciones (DinoV2) y control total desde la recepción hasta el despacho.</p>
                    <div className="flex flex-wrap gap-2">
                        {features.map((feature, index) => (
                            <span key={index} className={`px-2.5 py-1 rounded-md text-[9px] font-bold tracking-wider uppercase border shadow-sm ${isDarkMode ? "bg-emerald-500/20 text-emerald-100 border-emerald-500/30 backdrop-blur-md" : "bg-white/90 text-emerald-900 border-emerald-300 backdrop-blur-md"}`}>{feature}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const { mode, setMode, isDark: isDarkMode } = useTheme();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  // Estados de Formulario
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passChecks, setPassChecks] = useState(validatePassword(""));

  const toggleTheme = () => {
    if (mode === "light") setMode("dark");
    else if (mode === "dark") setMode("system");
    else setMode("light");
  };

  const testimonials = [
    { quote: "La interfaz es increíblemente rápida. Redujimos el tiempo de inventario en un 40%.", author: "Ing. Roberto M.", role: "Gerente de Planta" },
    { quote: "Poder gestionar usuarios y roles desde el móvil ha sido un cambio radical.", author: "Ana S.", role: "Logística" },
    { quote: "El soporte técnico 24/7 nos ha salvado en múltiples auditorías.", author: "Carlos D.", role: "Auditor ISO" },
  ];

  const nextTestimonial = () => setCurrentTestimonial((p) => (p + 1) % testimonials.length);
  const prevTestimonial = () => setCurrentTestimonial((p) => (p - 1 + testimonials.length) % testimonials.length);

  useEffect(() => {
    const interval = setInterval(() => { nextTestimonial(); }, 5000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { setPassChecks(validatePassword(password)); }, [password]);

  const strengthPercent = calculateStrength(passChecks);
  const isFormValid = strengthPercent === 100 && password === confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      console.log("Formulario enviado");
  };

  const inputClassName = `w-full px-4 py-3.5 rounded-xl text-sm transition-all duration-300 outline-none border backdrop-blur-sm ${
    isDarkMode 
      ? "bg-black/10 border-white/10 text-white placeholder-zinc-500 focus:border-emerald-500/80 focus:bg-black/30" 
      : "bg-white/60 border-gray-400 text-gray-900 placeholder-gray-600 focus:border-emerald-600 focus:bg-white/80 focus:ring-2 focus:ring-emerald-100/50"
  }`;

  return (
    <div className={`min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 overflow-y-auto transition-colors duration-500 ${isDarkMode ? "bg-[#050505]" : "bg-gray-200"}`}>
      
      {/* FONDO IMAGEN FIJA */}
      <div className="absolute inset-0 z-0 bg-cover bg-center fixed" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className={`absolute inset-0 transition-colors duration-500 ${isDarkMode ? "bg-black/60" : "bg-white/10 backdrop-blur-[1px]"}`}></div>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <motion.div
        layout
        className={`relative z-10 w-[95%] sm:w-[90%] lg:max-w-6xl shadow-2xl overflow-hidden grid lg:grid-cols-2 transition-all duration-500 mx-auto my-auto
            ${/* Altura fija SOLO en Desktop para evitar saltos */ "lg:h-[700px]"}
            ${/* Altura automática en Móvil para que crezca y no se corte */ "h-auto min-h-[600px]"}
            ${"max-w-[420px] rounded-[2.5rem] backdrop-blur-xl border border-white/10"}
            ${isDarkMode ? "bg-black/30" : "bg-white/40"}
            ${"lg:rounded-[3.5rem] lg:bg-transparent lg:shadow-none lg:backdrop-blur-none lg:border-none"} 
        `}
      >
        
        {/* COLUMNA IZQUIERDA (FORMULARIO) */}
        <div className={`relative p-6 sm:p-8 lg:p-12 flex flex-col w-full h-full transition-all duration-500
            ${isDarkMode ? "lg:bg-[#121212]/40" : "lg:bg-white/30"} 
            ${"lg:rounded-l-[3rem] lg:backdrop-blur-2xl lg:border-y lg:border-l lg:border-white/10"}
        `}>
            
            {/* CABECERA (Fija) */}
            <div className="flex justify-between items-center mb-6 w-full z-50 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <img src={LOGO_IMAGE} alt="Logo" className="h-10 w-auto object-contain drop-shadow-2xl" />
                    <span className={`font-bold text-2xl tracking-tighter drop-shadow-md ${isDarkMode ? "text-white" : "text-gray-900"}`}>OmniPart</span>
                </div>
                <button onClick={toggleTheme} className={`p-2.5 rounded-full border backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 ${isDarkMode ? "bg-white/5 border-white/10 text-zinc-300 hover:text-white" : "bg-white/50 border-gray-400 text-gray-800 hover:text-emerald-700"}`}>
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div key={mode} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                            {mode === "light" && <Sun size={20} />}
                            {mode === "dark" && <Moon size={20} />}
                            {mode === "system" && <Monitor size={20} />}
                        </motion.div>
                    </AnimatePresence>
                </button>
            </div>
            
            {/* SWITCH (Fijo) */}
            <div className="flex justify-center mb-4 flex-shrink-0">
                <div className={`p-1.5 rounded-full flex relative w-full max-w-[300px] backdrop-blur-md ${isDarkMode ? "bg-black/20 border border-white/10" : "bg-white/40 border border-gray-300/50"}`}>
                    <motion.div layoutId="activeTab" className={`absolute top-1.5 bottom-1.5 rounded-full shadow-lg ${isDarkMode ? "bg-zinc-800/90 border border-white/10 shadow-black/20" : "bg-white/90 border border-white/60 shadow-emerald-500/10"}`} initial={false} animate={{ left: isLogin ? "6px" : "50%", width: "calc(50% - 6px)" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                    <button onClick={() => setIsLogin(true)} className={`relative z-10 w-1/2 py-2.5 text-xs font-bold rounded-full transition-colors ${isLogin ? (isDarkMode ? "text-white" : "text-emerald-900") : (isDarkMode ? "text-zinc-400" : "text-gray-700")}`}>Iniciar sesión</button>
                    <button onClick={() => setIsLogin(false)} className={`relative z-10 w-1/2 py-2.5 text-xs font-bold rounded-full transition-colors ${!isLogin ? (isDarkMode ? "text-white" : "text-emerald-900") : (isDarkMode ? "text-zinc-400" : "text-gray-700")}`}>Registro</button>
                </div>
            </div>

            {/* CONTENIDO FLEXIBLE - SE ADAPTA EN MOVIL */}
            {/* En Desktop usa height 100% (h-full), en movil usa altura automatica (h-auto) */}
            <div className="flex-1 relative w-full flex flex-col lg:overflow-hidden min-h-[400px]">
                <AnimatePresence mode="wait">
                    {isLogin ? (
                        <motion.div 
                            key="login" 
                            initial={{ opacity: 0, x: -20 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            exit={{ opacity: 0, x: 20 }} 
                            transition={{ duration: 0.3 }} 
                            // IMPORTANTE: absolute solo en desktop, relative en movil para que empuje el footer
                            className="w-full lg:absolute lg:inset-0 flex flex-col justify-center"
                        >
                            <form onSubmit={handleSubmit} className="w-full space-y-6">
                                <div className="text-center lg:text-left">
                                    <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Bienvenido</h1>
                                    <p className={`text-sm ${isDarkMode ? "text-zinc-300" : "text-gray-700"}`}>Gestiona tu inventario con eficiencia.</p>
                                </div>
                                <div className="space-y-5 pt-2">
                                    <AnimatedInput type="email" name="email" autoComplete="username" placeholder="Usuario o email" className={inputClassName} icon={<Mail size={20} />} isDarkMode={isDarkMode} />
                                    <AnimatedInput type="password" name="password" autoComplete="current-password" placeholder="Contraseña" className={inputClassName} icon={<Lock size={20} />} isDarkMode={isDarkMode} showPasswordToggle={true} showPassword={showPassword} onTogglePassword={() => setShowPassword(!showPassword)} />
                                </div>
                                <div className="flex justify-between items-center text-xs px-1">
                                    <label className="flex items-center gap-2 cursor-pointer opacity-80 hover:opacity-100">
                                        <input type="checkbox" className="rounded border-gray-500 text-emerald-500 bg-transparent focus:ring-0" />
                                        <span className={isDarkMode ? "text-zinc-300" : "text-gray-700 font-semibold"}>Recordarme</span>
                                    </label>
                                    <a href="#" className="text-emerald-600 hover:text-emerald-500 font-bold hover:underline">¿Olvidaste tu contraseña?</a>
                                </div>
                                <button type="submit" className={`w-full mt-6 py-4 rounded-2xl font-bold text-sm shadow-xl transition-all hover:scale-[1.01] active:scale-[0.98] ${isDarkMode ? "bg-white text-black hover:bg-zinc-200" : "bg-gray-900 text-white hover:bg-gray-800"}`}>INGRESAR AL SISTEMA</button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="register" 
                            initial={{ opacity: 0, x: 20 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            exit={{ opacity: 0, x: 20 }} 
                            transition={{ duration: 0.3 }} 
                            // IMPORTANTE: absolute solo en desktop, relative en movil
                            className="w-full lg:absolute lg:inset-0 flex flex-col"
                        >
                             <form onSubmit={handleSubmit} className="w-full flex flex-col h-full lg:overflow-hidden">
                                <div className="text-center lg:text-left mb-2 flex-shrink-0">
                                    <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Crear cuenta</h1>
                                    <p className={`text-xs ${isDarkMode ? "text-zinc-300" : "text-gray-700"}`}>Únete al equipo OmniPart.</p>
                                </div>
                                
                                {/* SCROLL INTERNO SOLO PARA INPUTS */}
                                {/* En movil quitamos el max-height para que se vea todo, en desktop lo limitamos */}
                                <div className="flex-1 lg:overflow-y-auto custom-scrollbar pr-2 -mr-2 space-y-3 py-2 min-h-0">
                                    <div className="grid grid-cols-2 gap-3">
                                        <AnimatedInput type="text" name="given-name" autoComplete="given-name" placeholder="Nombre" className={inputClassName} icon={<User size={18} />} isDarkMode={isDarkMode} />
                                        <AnimatedInput type="text" name="family-name" autoComplete="family-name" placeholder="Apellido" className={inputClassName} icon={<User size={18} />} isDarkMode={isDarkMode} />
                                    </div>
                                    <CountrySelect className={inputClassName} name="country" autoComplete="country" icon={<MapPin size={18} />} isDarkMode={isDarkMode} />
                                    <div className="grid grid-cols-2 gap-3">
                                        <AnimatedInput type="date" name="bday" autoComplete="bday" className={inputClassName} icon={<Calendar size={18} />} isDarkMode={isDarkMode} />
                                        <AnimatedInput type="text" name="employee-id" placeholder="No. Empleado" className={inputClassName} icon={<Briefcase size={18} />} isDarkMode={isDarkMode} />
                                    </div>
                                    <AnimatedInput type="email" name="email" autoComplete="email" placeholder="Correo electrónico" className={inputClassName} icon={<Mail size={18} />} isDarkMode={isDarkMode} />
                                    
                                    <div className="space-y-2 pb-2">
                                        <AnimatedInput type="password" name="new-password" autoComplete="new-password" value={password} onChange={(e: any) => setPassword(e.target.value)} hasError={password.length > 0 && calculateStrength(passChecks) < 100} placeholder="Crear contraseña" className={inputClassName} icon={<Lock size={18} />} isDarkMode={isDarkMode} showPasswordToggle={true} showPassword={showPassword} onTogglePassword={() => setShowPassword(!showPassword)} />
                                        
                                        {password.length > 0 && (
                                            <div className="h-1 w-full bg-gray-200/20 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${strengthPercent}%` }} className={`h-full ${strengthPercent < 50 ? "bg-red-500" : strengthPercent < 100 ? "bg-yellow-500" : "bg-emerald-500"}`} />
                                            </div>
                                        )}

                                        <AnimatedInput type="password" name="confirm-password" autoComplete="new-password" value={confirmPassword} onChange={(e: any) => setConfirmPassword(e.target.value)} hasError={confirmPassword.length > 0 && confirmPassword !== password} placeholder="Confirmar contraseña" className={inputClassName} icon={<Lock size={18} />} isDarkMode={isDarkMode} showPasswordToggle={true} showPassword={showConfirmPassword} onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)} />
                                        
                                        <div className={`grid grid-cols-2 gap-1 text-[10px] p-2 rounded-lg ${isDarkMode ? "bg-white/5" : "bg-white/50"}`}>
                                            <div className={`flex items-center gap-1 ${passChecks.length ? "text-emerald-500" : "text-gray-400"}`}><Check size={10} /> 8+ Caracteres</div>
                                            <div className={`flex items-center gap-1 ${passChecks.uppercase ? "text-emerald-500" : "text-gray-400"}`}><Check size={10} /> Mayúscula</div>
                                            <div className={`flex items-center gap-1 ${passChecks.number ? "text-emerald-500" : "text-gray-400"}`}><Check size={10} /> Número</div>
                                            <div className={`flex items-center gap-1 ${passChecks.special ? "text-emerald-500" : "text-gray-400"}`}><Check size={10} /> Símbolo</div>
                                        </div>
                                    </div>
                                </div>

                                {/* BOTÓN FIJO EN BOTTOM */}
                                <div className="mt-2 pt-2 flex-shrink-0">
                                    <button 
                                        type="submit"
                                        disabled={!isFormValid}
                                        className={`w-full py-4 rounded-2xl font-bold text-sm shadow-xl transition-all duration-300 flex-shrink-0
                                            ${isFormValid 
                                                ? `hover:scale-[1.01] active:scale-[0.98] ${isDarkMode ? "bg-emerald-500 text-white" : "bg-emerald-600 text-white"}` 
                                                : "bg-gray-400/50 text-gray-500 cursor-not-allowed grayscale"
                                            }`}
                                    >
                                        {isFormValid ? "SOLICITAR REGISTRO" : "COMPLETE EL FORMULARIO"}
                                    </button>
                                </div>
                             </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* FOOTER */}
            <div className="mt-8 text-center lg:text-left flex-shrink-0">
                <p className={`text-[10px] ${isDarkMode ? "text-zinc-500" : "text-gray-600"}`}>
                    &copy; 2024 OmniPart Inc. <a href="#" className="underline hover:text-emerald-600 transition-colors">Política de Privacidad</a>
                </p>
            </div>
        </div>

        {/* COLUMNA DERECHA */}
        <InfoPanel isDarkMode={isDarkMode} testimonials={testimonials} currentTestimonial={currentTestimonial} prevTestimonial={prevTestimonial} nextTestimonial={nextTestimonial} />

      </motion.div>
    </div>
  );
}