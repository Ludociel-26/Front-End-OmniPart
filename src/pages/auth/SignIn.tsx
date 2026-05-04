import React, { useState, useEffect, useMemo, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import {
  Sun,
  Moon,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Calendar,
  ScanLine,
  Cpu,
  Settings,
  Box,
  Check,
  AlertCircle,
} from 'lucide-react';

import '@cloudscape-design/global-styles/index.css';
import { Button, Flashbar } from '@cloudscape-design/components';
import { useLanguage } from '@/context/LanguageContext';
import { AppContent } from '@/context/AppContext';

import backgroundImage from '@/assets/login/loginBg.png';
import LOGO_IMAGE from '@/assets/icons/appiconf.png';
import bg1 from '@/assets/login/f1.png';
import bg2 from '@/assets/login/f2.png';
import bg3 from '@/assets/login/f3.png';
import bg4 from '@/assets/login/f4.png';
import bg5 from '@/assets/login/f5.png';
import bg6 from '@/assets/login/f6.png';
import bg7 from '@/assets/login/f7.png';
import bg8 from '@/assets/login/f8.png';
import bg9 from '@/assets/login/f9.png';
import bg10 from '@/assets/login/f10.png';
import bg11 from '@/assets/login/f11.png';
import bg12 from '@/assets/login/f12.png';
import bg13 from '@/assets/login/f13.png';
import bg14 from '@/assets/login/f14.png';

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

const AnimatedInput = ({
  type,
  placeholder,
  className,
  icon,
  isDarkMode,
  showPasswordToggle,
  showPassword,
  onTogglePassword,
  hasError,
  value,
  onChange,
  name,
  ...props
}: any) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (value || type === 'date') {
      setDisplayedText(placeholder);
      return;
    }
    let index = 0;
    let timeoutId: any;
    setDisplayedText('');
    const typeChar = () => {
      if (placeholder && index < placeholder.length) {
        setDisplayedText(placeholder.slice(0, index + 1));
        index++;
        timeoutId = setTimeout(typeChar, 30 + Math.random() * 50);
      }
    };
    timeoutId = setTimeout(typeChar, 200);
    return () => clearTimeout(timeoutId);
  }, [placeholder, type, value]);

  const inputType = showPasswordToggle
    ? showPassword
      ? 'text'
      : 'password'
    : type;

  let baseColorClass = isDarkMode
    ? 'text-zinc-400 group-focus-within:text-white'
    : 'text-gray-500 group-focus-within:text-blue-600';
  let errorClass = '';

  if (hasError) {
    baseColorClass = 'text-red-500';
    errorClass = isDarkMode
      ? 'border-red-500/50 bg-red-500/10'
      : 'border-red-500 bg-red-50';
  }

  return (
    <div className="relative group w-full shrink-0 overflow-visible">
      {icon && (
        <div
          className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${baseColorClass} z-10 pointer-events-none`}
        >
          {icon}
        </div>
      )}
      <div
        className={`absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none ${hasError ? errorClass : isFocused ? (isDarkMode ? 'opacity-100 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'opacity-100 shadow-[0_0_15px_rgba(59,130,246,0.2)]') : 'opacity-0'}`}
      ></div>
      <input
        type={inputType}
        name={name}
        value={value}
        onChange={onChange}
        style={{ colorScheme: isDarkMode ? 'dark' : 'light' }}
        placeholder={
          value ? placeholder : type === 'date' ? undefined : displayedText
        }
        className={`${className} ${hasError ? 'border-red-500 focus:border-red-500 text-red-500 placeholder-red-400' : ''} ${icon ? 'pl-11' : ''} ${showPasswordToggle ? 'pr-11' : ''}`}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {hasError && !showPasswordToggle && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
          <AlertCircle size={18} />
        </div>
      )}
      {showPasswordToggle && (
        <button
          type="button"
          onClick={onTogglePassword}
          className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200 p-1 rounded-full ${hasError ? 'text-red-500 hover:text-red-400' : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
};

const CountrySelect = ({
  className,
  icon,
  isDarkMode,
  label,
  value,
  onChange,
  name,
  ...props
}: any) => {
  const iconColorClass = isDarkMode
    ? 'text-zinc-400 group-focus-within:text-white'
    : 'text-gray-500 group-focus-within:text-blue-600';
  return (
    <div className="relative group w-full shrink-0">
      <div
        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${iconColorClass} z-10 pointer-events-none`}
      >
        {icon}
      </div>
      <select
        name={name}
        value={value}
        onChange={onChange}
        style={{ colorScheme: isDarkMode ? 'dark' : 'light' }}
        className={`${className} pl-11 appearance-none cursor-pointer`}
        {...props}
      >
        <option value="" disabled>
          {label}
        </option>
        <option value="US">United States 🇺🇸</option>
        <option value="CA">Canada 🇨🇦</option>
        <option value="MX">México 🇲🇽</option>
        <option value="FR">France 🇫🇷</option>
        <option value="ES">España 🇪🇸</option>
        <option value="CN">China 🇨🇳</option>
        <option value="JP">Japan 🇯🇵</option>
        <option value="KR">Korea 🇰🇷</option>
      </select>
      <div
        className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
};

const TechIconCycle = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const icons = [
    { Icon: ScanLine, color: 'text-blue-400' },
    { Icon: Cpu, color: 'text-purple-400' },
    { Icon: Settings, color: 'text-emerald-400' },
    { Icon: Box, color: 'text-orange-400' },
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
    <div
      className={`relative p-3 rounded-xl backdrop-blur-md border shadow-lg overflow-hidden ${isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white/80 border-white/60'}`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 1.0 }}
        >
          <CurrentIcon size={28} className={icons[index].color} />
        </motion.div>
      </AnimatePresence>
      <motion.div
        animate={{ top: ['-10%', '110%', '-10%'] }}
        transition={{ duration: 2.8, ease: 'linear', repeat: Infinity }}
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-80 shadow-[0_0_8px_rgba(96,165,250,0.8)]"
      />
    </div>
  );
};

const InfoPanel = ({
  isDarkMode,
  testimonials,
  currentTestimonial,
  prevTestimonial,
  nextTestimonial,
  t,
}: any) => {
  const features = t('features') || [];
  const randomImage = useMemo(() => {
    const images = [
      bg1,
      bg2,
      bg3,
      bg4,
      bg5,
      bg6,
      bg7,
      bg8,
      bg9,
      bg10,
      bg11,
      bg12,
      bg13,
      bg14,
    ];
    return images[Math.floor(Math.random() * images.length)];
  }, []);
  return (
    <div
      className={`relative hidden lg:flex flex-col h-full p-8 overflow-hidden rounded-r-[2.5rem] rounded-l-[3rem] ml-[-2.5rem] z-20 border-r border-y ${isDarkMode ? 'border-white/10' : 'border-white/40'}`}
    >
      <div
        className={`absolute inset-0 transition-colors duration-500 ${isDarkMode ? 'bg-black/40' : 'bg-white/50'} backdrop-blur-3xl`}
      ></div>
      <motion.div
        animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: 'mirror' }}
        className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-cyan-500/20 rounded-full blur-[80px] z-0"
      ></motion.div>
      <motion.div
        animate={{ x: [0, -40, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: 'mirror',
          delay: 1,
        }}
        className="absolute bottom-[10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[90px] z-0"
      ></motion.div>

      <div className="relative z-10 h-full flex flex-col justify-between">
        <div className="mt-8 space-y-3 flex-shrink-0">
          <h2
            className={`text-xl font-bold tracking-tight opacity-90 ${isDarkMode ? 'text-white' : 'text-blue-950'}`}
          >
            QuickFind Experience
          </h2>
          <div className="h-20 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-2"
              >
                <blockquote
                  className={`text-sm font-medium leading-snug italic ${isDarkMode ? 'text-zinc-200' : 'text-gray-900'}`}
                >
                  "{testimonials[currentTestimonial].quote}"
                </blockquote>
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}
                >
                  {testimonials[currentTestimonial].author} —{' '}
                  {testimonials[currentTestimonial].role}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex gap-2">
            <button
              onClick={prevTestimonial}
              className={`p-2 rounded-full border backdrop-blur-md transition-all active:scale-95 ${isDarkMode ? 'border-white/20 hover:bg-white/10 text-white' : 'border-gray-600 hover:bg-black/5 text-gray-900'}`}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={nextTestimonial}
              className={`p-2 rounded-full border backdrop-blur-md transition-all active:scale-95 ${isDarkMode ? 'border-white/20 hover:bg-white/10 text-white' : 'border-gray-600 hover:bg-black/5 text-gray-900'}`}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        <div className="relative w-full h-[280px]">
          <div
            className={`absolute inset-0 rounded-[2.5rem] backdrop-blur-sm z-0 transform translate-y-3 scale-95 border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}
          ></div>
          <div
            className={`relative w-full h-full rounded-[2.5rem] overflow-hidden flex flex-col justify-end backdrop-blur-2xl border shadow-2xl group z-10 transition-transform hover:scale-[1.01] ${isDarkMode ? 'border-white/15' : 'border-white/60'}`}
          >
            <div
              className="absolute inset-0 z-0 transition-transform duration-1000 group-hover:scale-105"
              style={{
                backgroundImage: `url(${randomImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div
              className={`absolute inset-0 z-10 bg-gradient-to-t ${isDarkMode ? 'from-black/95 via-black/60 to-black/20' : 'from-white/95 via-white/70 to-white/10'}`}
            ></div>
            <div className="relative z-20 p-6">
              <div className="absolute top-4 right-4">
                <TechIconCycle isDarkMode={isDarkMode} />
              </div>
              <h3
                className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                {t('panelTitle')}
              </h3>
              <p
                className={`text-xs mb-3 leading-relaxed font-semibold ${isDarkMode ? 'text-zinc-200' : 'text-gray-800'}`}
              >
                {t('panelDesc')}
              </p>
              <div className="flex flex-wrap gap-2">
                {features.slice(0, 3).map((feature: string, index: number) => (
                  <span
                    key={index}
                    className={`px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase border shadow-sm ${isDarkMode ? 'bg-blue-500/20 text-blue-100 border-blue-500/30 backdrop-blur-md' : 'bg-white/90 text-blue-900 border-blue-300 backdrop-blur-md'}`}
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const { t, language } = useLanguage();
  const appContext = useContext(AppContent);

  if (!appContext) {
    throw new Error('AppContent must be used within AppContextProvider');
  }

  // 🚩 EXTRAEMOS LA FUNCIÓN DE SINCRONIZACIÓN
  const {
    theme,
    isDark,
    toggleTheme,
    backendUrl,
    setIsLoggedin,
    isLoggedin,
    getUserData,
    userData,
    setPageLoading,
    addAlert,
    alerts,
    executeGlobalLoginSync,
  } = appContext as any;

  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    country: '',
    birthday: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [passChecks, setPassChecks] = useState(validatePassword(''));

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'password') {
      setPassChecks(validatePassword(value));
    }
  };

  const testimonials = [
    {
      quote:
        'The interface is incredibly fast. We reduced inventory time by 40%.',
      author: 'Ing. Roberto M.',
      role: 'Manager',
    },
    {
      quote: 'Managing users and roles from mobile has been a game changer.',
      author: 'Ana S.',
      role: 'Logistics',
    },
    {
      quote: '24/7 technical support saved us during multiple audits.',
      author: 'Carlos D.',
      role: 'ISO Auditor',
    },
  ];

  const nextTestimonial = () =>
    setCurrentTestimonial((p) => (p + 1) % testimonials.length);
  const prevTestimonial = () =>
    setCurrentTestimonial(
      (p) => (p - 1 + testimonials.length) % testimonials.length,
    );

  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const strengthPercent = calculateStrength(passChecks);
  const isFormValid =
    strengthPercent === 100 && formData.password === formData.confirmPassword;

  // LÓGICA DE SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPageLoading(true);

    const alertId = addAlert(
      'info',
      isLogin ? 'Autenticando credenciales...' : 'Registrando usuario...',
      'Procesando',
      undefined,
      true,
    );

    try {
      axios.defaults.withCredentials = true;

      if (!isLogin) {
        const { data } = await axios.post(`${backendUrl}/api/auth/register`, {
          name: formData.name,
          surname: formData.surname,
          country: formData.country,
          birth_date: formData.birthday,
          email: formData.email,
          password: formData.password,
        });

        if (data.success) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          addAlert(
            'success',
            'Cuenta creada exitosamente. Bienvenido.',
            'Éxito',
            alertId,
            false,
          );

          setIsLoggedin(true);
          await getUserData();

          // 🚩 MAGIA AWS: Avisa a las otras pestañas que ya hay sesión activa
          if (executeGlobalLoginSync) {
            executeGlobalLoginSync();
          }
        } else {
          addAlert(
            'warning',
            data.message,
            'Validación Fallida',
            alertId,
            false,
          );
          setPageLoading(false);
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/auth/login`, {
          email: formData.email,
          password: formData.password,
        });

        if (data.success) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          addAlert(
            'success',
            'Sesión iniciada correctamente.',
            'Bienvenido',
            alertId,
            false,
          );

          setIsLoggedin(true);
          await getUserData();

          // 🚩 MAGIA AWS: Avisa a las otras pestañas que ya hay sesión activa
          if (executeGlobalLoginSync) {
            executeGlobalLoginSync();
          }
        } else {
          addAlert(
            'warning',
            data.message,
            'Autenticación Fallida',
            alertId,
            false,
          );
          setPageLoading(false);
        }
      }
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message || '';

        if (status === 503 || serverMessage.includes('#DB-503')) {
          addAlert(
            'error',
            'La API no pudo establecer comunicación con la base de datos PostgreSQL.',
            'Service Unavailable [Network Error #DB-503]',
            alertId,
            false,
          );
        } else {
          addAlert(
            'error',
            serverMessage || 'Error desconocido en el servidor.',
            `Server Error [HTTP ${status}]`,
            alertId,
            false,
          );
        }
      } else if (error.request) {
        addAlert(
          'error',
          'No se pudo alcanzar el microservicio de autenticación. Verifique si la red está caída.',
          'Connection Refused [#API-502]',
          alertId,
          false,
        );
      } else {
        addAlert(
          'error',
          error.message,
          'Application Error [Client-Side]',
          alertId,
          false,
        );
      }
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (userData && userData.role && isLoggedin) {
      const allowedRoles = [1, 2, 3, 4];
      if (allowedRoles.includes(userData.role)) {
        navigate('/dashboard');
      } else {
        addAlert(
          'error',
          'El rol asignado no cuenta con los privilegios necesarios para acceder a este módulo.',
          'Access Denied [IAM-403]',
        );
        setPageLoading(false);
      }
    }
  }, [userData, isLoggedin, navigate, setPageLoading, addAlert]);

  const inputClassName = `w-full px-4 py-3.5 rounded-xl text-sm transition-all duration-300 outline-none border backdrop-blur-sm ${
    isDark
      ? 'bg-black/10 border-white/10 text-white placeholder-zinc-500 focus:border-blue-500/80 focus:bg-black/30'
      : 'bg-white/60 border-gray-400 text-gray-900 placeholder-gray-600 focus:border-blue-600 focus:bg-white/80 focus:ring-2 focus:ring-blue-100/50'
  }`;

  const validationLabels = t('passStrength') || [];

  if (isLoggedin) {
    return null;
  }

  return (
    <>
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px ${isDark ? '#1a1a1a' : '#ffffff'} inset !important;
            -webkit-text-fill-color: ${isDark ? 'white' : 'black'} !important;
            transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      <div
        className={`min-h-[100dvh] w-full relative flex items-center justify-center p-4 transition-colors duration-500 overflow-hidden ${isDark ? 'bg-[#050505]' : 'bg-gray-200'}`}
      >
        <div
          className="absolute inset-0 z-0 bg-cover bg-center fixed"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div
            className={`absolute inset-0 transition-colors duration-500 ${isDark ? 'bg-black/60' : 'bg-white/10 backdrop-blur-[1px]'}`}
          ></div>
        </div>

        <img
          src={LOGO_IMAGE}
          alt="Logo"
          className={`absolute z-50 cursor-pointer transition-all duration-700 top-8 left-1/2 -translate-x-1/2 w-24 drop-shadow-lg md:top-12 md:left-12 md:translate-x-0`}
        />

        <motion.div
          layout
          className={`relative z-10 w-full shadow-2xl overflow-hidden grid lg:grid-cols-2 transition-all duration-500 mx-auto max-w-[420px] lg:max-w-5xl h-auto min-h-[500px] lg:h-[600px] rounded-[2.5rem] backdrop-blur-xl border border-white/10 ${isDark ? 'bg-black/30' : 'bg-white/40'} ${'lg:rounded-[3.5rem] lg:bg-transparent lg:shadow-none lg:backdrop-blur-none lg:border-none'} mt-12 md:mt-0`}
        >
          <div
            className={`relative p-6 sm:p-8 flex flex-col w-full h-full transition-all duration-500 ${isDark ? 'lg:bg-[#121212]/40' : 'lg:bg-white/30'} ${'lg:rounded-l-[3rem] lg:backdrop-blur-2xl lg:border-y lg:border-l lg:border-white/10'} lg:pr-16 xl:pr-20`}
          >
            {/* Header */}
            <div className="relative z-30 flex justify-between items-center mb-4 w-full flex-shrink-0">
              <div className="flex items-center gap-3">
                <span
                  className={`font-bold text-2xl tracking-tighter drop-shadow-md ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  QuickFind
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full uppercase border ${isDark ? 'bg-white/10 border-white/20 text-zinc-400' : 'bg-black/5 border-black/10 text-zinc-500'}`}
                >
                  {language}
                </span>
              </div>
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-full border backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 ${isDark ? 'bg-white/5 border-white/10 text-zinc-300 hover:text-white' : 'bg-white/50 border-gray-400 text-gray-800 hover:text-blue-700'}`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={theme}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {theme === 'light' && <Sun size={20} />}
                    {theme === 'dark' && <Moon size={20} />}
                    {theme === 'system' && <Monitor size={20} />}
                  </motion.div>
                </AnimatePresence>
              </button>
            </div>

            {/* Toggle Tabs */}
            <div className="relative z-30 flex justify-center mb-4 flex-shrink-0">
              <div
                className={`p-1.5 rounded-full flex relative w-full max-w-[280px] backdrop-blur-md ${isDark ? 'bg-black/20 border border-white/10' : 'bg-white/40 border border-gray-300/50'}`}
              >
                <motion.div
                  layoutId="activeTab"
                  className={`absolute top-1.5 bottom-1.5 rounded-full shadow-lg ${isDark ? 'bg-zinc-800/90 border border-white/10 shadow-black/20' : 'bg-white/90 border border-white/60 shadow-blue-500/10'}`}
                  initial={false}
                  animate={{
                    left: isLogin ? '6px' : '50%',
                    width: 'calc(50% - 6px)',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
                <button
                  onClick={() => setIsLogin(true)}
                  className={`relative z-10 w-1/2 py-2 text-xs font-bold rounded-full transition-colors ${isLogin ? (isDark ? 'text-white' : 'text-blue-900') : isDark ? 'text-zinc-400' : 'text-gray-700'}`}
                >
                  {t('login')}
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`relative z-10 w-1/2 py-2 text-xs font-bold rounded-full transition-colors ${!isLogin ? (isDark ? 'text-white' : 'text-blue-900') : isDark ? 'text-zinc-400' : 'text-gray-700'}`}
                >
                  {t('register')}
                </button>
              </div>
            </div>

            <div className="flex-1 relative w-full flex flex-col lg:overflow-hidden min-h-[350px]">
              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full lg:absolute lg:inset-0 flex flex-col justify-center"
                  >
                    {/* LOGIN FORM */}
                    <form onSubmit={handleSubmit} className="w-full space-y-5">
                      <div className="text-center lg:text-left">
                        <h1
                          className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}
                        >
                          {t('welcome')}
                        </h1>
                        <p
                          className={`text-sm ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}
                        >
                          {t('subtitle')}
                        </p>
                      </div>
                      <div className="space-y-4 pt-2">
                        <AnimatedInput
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          autoComplete="username"
                          placeholder={t('userPlaceholder')}
                          className={inputClassName}
                          icon={<Mail size={20} />}
                          isDarkMode={isDark}
                        />
                        <AnimatedInput
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          autoComplete="current-password"
                          placeholder={t('passwordPlaceholder')}
                          className={inputClassName}
                          icon={<Lock size={20} />}
                          isDarkMode={isDark}
                          showPasswordToggle={true}
                          showPassword={showPassword}
                          onTogglePassword={() =>
                            setShowPassword(!showPassword)
                          }
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs px-1">
                        <label className="flex items-center gap-2 cursor-pointer opacity-80 hover:opacity-100">
                          <input
                            type="checkbox"
                            className="rounded border-gray-500 text-blue-500 bg-transparent focus:ring-0"
                          />
                          <span
                            className={
                              isDark
                                ? 'text-zinc-300'
                                : 'text-gray-700 font-semibold'
                            }
                          >
                            {t('rememberMe')}
                          </span>
                        </label>
                        <a
                          href="/reset-password"
                          className={`font-bold hover:underline ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
                        >
                          {t('forgotPass')}
                        </a>
                      </div>

                      <div className="mt-6">
                        <Button variant="primary" fullWidth formAction="submit">
                          {t('btnIngresar')}
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full lg:absolute lg:inset-0 flex flex-col"
                  >
                    {/* REGISTER FORM */}
                    <form
                      onSubmit={handleSubmit}
                      className="w-full flex flex-col h-full lg:overflow-hidden"
                    >
                      <div className="text-center lg:text-left mb-2 flex-shrink-0">
                        <h1
                          className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                        >
                          {t('createAccount')}
                        </h1>
                        <p
                          className={`text-xs ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}
                        >
                          {t('joinTeam')}
                        </p>
                      </div>

                      <div className="flex-1 lg:overflow-y-auto custom-scrollbar pr-4 space-y-3 py-2 min-h-0">
                        <div className="grid grid-cols-2 gap-3">
                          <AnimatedInput
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            autoComplete="given-name"
                            placeholder={t('name')}
                            className={inputClassName}
                            icon={<User size={18} />}
                            isDarkMode={isDark}
                          />
                          <AnimatedInput
                            type="text"
                            name="surname"
                            value={formData.surname}
                            onChange={handleInputChange}
                            autoComplete="family-name"
                            placeholder={t('surname')}
                            className={inputClassName}
                            icon={<User size={18} />}
                            isDarkMode={isDark}
                          />
                        </div>

                        <AnimatedInput
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          autoComplete="email"
                          placeholder={t('email')}
                          className={inputClassName}
                          icon={<Mail size={18} />}
                          isDarkMode={isDark}
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <CountrySelect
                            className={inputClassName}
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            autoComplete="country"
                            label={t('country')}
                            icon={<MapPin size={18} />}
                            isDarkMode={isDark}
                          />
                          <AnimatedInput
                            type="date"
                            name="birthday"
                            value={formData.birthday}
                            onChange={handleInputChange}
                            autoComplete="bday"
                            placeholder={t('bday')}
                            className={inputClassName}
                            icon={<Calendar size={18} />}
                            isDarkMode={isDark}
                          />
                        </div>

                        <div className="space-y-2 pb-2">
                          <AnimatedInput
                            type="password"
                            name="password"
                            autoComplete="new-password"
                            value={formData.password}
                            onChange={handleInputChange}
                            hasError={
                              formData.password.length > 0 &&
                              calculateStrength(passChecks) < 100
                            }
                            placeholder={t('createPass')}
                            className={inputClassName}
                            icon={<Lock size={18} />}
                            isDarkMode={isDark}
                            showPasswordToggle={true}
                            showPassword={showPassword}
                            onTogglePassword={() =>
                              setShowPassword(!showPassword)
                            }
                          />

                          {formData.password.length > 0 && (
                            <div className="h-1 w-full bg-gray-200/20 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${strengthPercent}%` }}
                                className={`h-full ${strengthPercent < 50 ? 'bg-red-500' : strengthPercent < 100 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                              />
                            </div>
                          )}

                          <AnimatedInput
                            type="password"
                            name="confirmPassword"
                            autoComplete="new-password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            hasError={
                              formData.confirmPassword.length > 0 &&
                              formData.confirmPassword !== formData.password
                            }
                            placeholder={t('confirmPass')}
                            className={inputClassName}
                            icon={<Lock size={18} />}
                            isDarkMode={isDark}
                            showPasswordToggle={true}
                            showPassword={showConfirmPassword}
                            onTogglePassword={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          />

                          <div
                            className={`grid grid-cols-2 gap-1 text-[10px] p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-white/50'}`}
                          >
                            <div
                              className={`flex items-center gap-1 ${passChecks.length ? 'text-blue-500' : 'text-gray-400'}`}
                            >
                              <Check size={10} /> {validationLabels[0]}
                            </div>
                            <div
                              className={`flex items-center gap-1 ${passChecks.uppercase ? 'text-blue-500' : 'text-gray-400'}`}
                            >
                              <Check size={10} /> {validationLabels[1]}
                            </div>
                            <div
                              className={`flex items-center gap-1 ${passChecks.number ? 'text-blue-500' : 'text-gray-400'}`}
                            >
                              <Check size={10} /> {validationLabels[2]}
                            </div>
                            <div
                              className={`flex items-center gap-1 ${passChecks.special ? 'text-blue-500' : 'text-gray-400'}`}
                            >
                              <Check size={10} /> {validationLabels[3]}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 flex-shrink-0">
                        <Button
                          variant="primary"
                          fullWidth
                          formAction="submit"
                          disabled={!isFormValid}
                        >
                          {isFormValid ? t('btnRegister') : t('fillForm')}
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-4 text-center lg:text-left flex-shrink-0">
              <p
                className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-gray-600'}`}
              >
                {t('footer')}{' '}
                <a
                  href="#"
                  className="underline hover:text-blue-600 transition-colors"
                >
                  {t('privacy')}
                </a>
              </p>
            </div>
          </div>

          <InfoPanel
            isDarkMode={isDark}
            testimonials={testimonials}
            currentTestimonial={currentTestimonial}
            prevTestimonial={prevTestimonial}
            nextTestimonial={nextTestimonial}
            t={t}
          />
        </motion.div>

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-[600px] px-4 pointer-events-none transition-all duration-300">
          <div className="pointer-events-auto shadow-2xl rounded-xl overflow-hidden">
            <Flashbar items={alerts as any} stackItems={true} />
          </div>
        </div>
      </div>
    </>
  );
}
