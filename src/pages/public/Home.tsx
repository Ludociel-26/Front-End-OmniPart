import { useState, useEffect, useRef } from 'react';
// FIX: Importación de ReactNode como tipo
import type { ReactNode } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

// CLOUDSCAPE IMPORTS
import TopNavigation from '@cloudscape-design/components/top-navigation';
import Button from '@cloudscape-design/components/button';

// LUCIDE ICONS (Depurados 100%)
// FIX: Se eliminaron Layers y BoxIcon porque no se estaban utilizando
import {
  ScanLine,
  Camera,
  Activity,
  Zap,
  ShieldCheck,
  BrainCircuit,
  Cloud,
  ClipboardCheck,
  Gauge,
  Snowflake,
  Flame,
  Server,
  FlaskConical,
  Scan,
  Network,
  Database,
  CheckCircle2,
  Focus,
  Crosshair,
  Infinity as InfinityIcon,
  Sparkles,
  Code,
} from 'lucide-react';

// --- ANIMACIONES BASE ---
const pulseGlow = {
  opacity: [0.3, 1, 0.3],
  scale: [1, 1.2, 1],
  transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
};

const floatAnim = (delay = 0, distance = 10) => ({
  y: [-distance, distance, -distance],
  transition: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay },
});

// --- COMPONENTE HELPER: SCROLL REVEAL ---
const ScrollReveal = ({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
      animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// --- 1. NAVEGACIÓN ---
const QuickFindNav = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-[#000000]/80 backdrop-blur-2xl border-white/10' : 'bg-transparent border-transparent'}`}
    >
      <TopNavigation
        identity={{
          href: '#',
          title: 'QuickFind',
          logo: {
            src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTMgN3YyYTMgMyAwIDAgMCAzIDNoM20tNi01YTMgMyAwIDAgMSAzLTNoM20wIDE0SDZhMyAzIDAgMCAxLTMtM3YtMm0xMiA1aDNhMyAzIDAgMCAwIDMtM3YtMm0tNS0xMGgzYTMgMyAwIDAgMSAzIDN2MiIvPjwvc3ZnPg==',
            alt: 'Logo',
          },
        }}
        utilities={[
          {
            type: 'button',
            text: 'Protocolo de Limpieza',
            variant: 'link',
            href: '#/cleaning-plan-page',
          },
          {
            type: 'button',
            text: 'Telemetría',
            variant: 'link',
            href: '#/maintenance/perform-inspection',
          },
          {
            type: 'button',
            text: 'Consola Admin',
            variant: 'primary-button',
            href: '#/login',
          },
        ]}
      />
    </div>
  );
};

// --- 2. SCANNER AVANZADO (VECTORIZACIÓN) ---
const AdvancedVectorScanner = () => {
  const { scrollYProgress } = useScroll();
  const hudY1 = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const hudY2 = useTransform(scrollYProgress, [0, 1], [0, 30]);

  return (
    <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10 perspective-[1500px]">
      {/* PANEL PRINCIPAL: CÁMARA */}
      <motion.div
        initial={{ opacity: 0, rotateY: 15, z: -100 }}
        animate={{ opacity: 1, rotateY: 0, z: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="col-span-1 lg:col-span-2 relative bg-[#020508] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,161,201,0.15)] h-[550px]"
      >
        <div className="absolute top-0 w-full flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/60 backdrop-blur-xl z-30">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
            </div>
            <span className="text-xs font-mono text-[#00a1c9] flex items-center gap-2">
              <Camera size={14} /> LIVE_FEED_01 (OPTICAL + IR)
            </span>
          </div>
          <div className="px-3 py-1 rounded-full border border-[#6aaf35]/50 text-[#6aaf35] text-[10px] font-mono flex items-center gap-2 bg-[#6aaf35]/10">
            <div className="w-1.5 h-1.5 bg-[#6aaf35] rounded-full animate-ping"></div>{' '}
            PROCESSING
          </div>
        </div>

        <div className="relative w-full h-full flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00a1c9]/15 via-black to-black overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,161,201,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,161,201,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-60"></div>

          <motion.div
            // FIX: as any para que Framer Motion no se queje del tipado estricto
            animate={floatAnim(0, 15) as any}
            className="relative z-10 w-full h-full flex items-center justify-center"
          >
            <div className="relative w-[300px] h-[300px] flex items-center justify-center">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full opacity-90 drop-shadow-[0_0_15px_rgba(0,161,201,0.4)]"
              >
                <motion.path
                  d="M100 20 L160 50 L160 150 L100 180 L40 150 L40 50 Z"
                  fill="none"
                  stroke="#00a1c9"
                  strokeWidth="1.5"
                  strokeDasharray="5 5"
                  animate={{ strokeDashoffset: [0, -100] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                />
                <path
                  d="M100 20 L100 100 L160 150 M40 50 L100 100 M40 150 L100 100 M160 50 L100 100"
                  fill="none"
                  stroke="#00a1c9"
                  strokeWidth="0.5"
                  opacity="0.4"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="30"
                  fill="none"
                  stroke="#00a1c9"
                  strokeWidth="1"
                />
                <motion.circle
                  cx="100"
                  cy="20"
                  r="4"
                  fill="#ff9900"
                  // FIX: as any para el tipado estricto
                  animate={pulseGlow as any}
                />
                <motion.circle
                  cx="160"
                  cy="150"
                  r="4"
                  fill="#6aaf35"
                  // FIX: as any para el tipado estricto
                  animate={pulseGlow as any}
                />
                <motion.circle
                  cx="40"
                  cy="50"
                  r="4"
                  fill="#00a1c9"
                  // FIX: as any para el tipado estricto
                  animate={pulseGlow as any}
                />
              </svg>

              <div className="absolute inset-[-30px] border border-[#00a1c9]/40 bg-[#00a1c9]/5">
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#00a1c9]"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#00a1c9]"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#00a1c9]"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#00a1c9]"></div>

                <motion.div
                  animate={{ x: [-90, 90, -90], y: [-70, 70, -70] }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute z-20 top-1/2 left-1/2 text-[#00a1c9] opacity-80"
                >
                  <Crosshair
                    size={60}
                    strokeWidth={0.5}
                    className="-translate-x-1/2 -translate-y-1/2"
                  />
                </motion.div>

                <motion.div
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00a1c9] to-transparent shadow-[0_0_20px_#00a1c9]"
                />
              </div>
            </div>

            <motion.div
              style={{ y: hudY1 }}
              className="absolute top-[20%] left-[8%] bg-black/80 border border-[#00a1c9]/40 p-3 rounded-lg text-xs font-mono text-white backdrop-blur-xl shadow-2xl"
            >
              <span className="text-[#00a1c9] font-bold text-sm">
                ID: VALVE_PRO_X9
              </span>
              <br />
              <span className="text-gray-400">
                STATE: <span className="text-white">SCANNED</span>
              </span>
              <br />
              <span className="text-gray-400">
                MATCH: <span className="text-[#6aaf35] font-bold">99.98%</span>
              </span>
            </motion.div>

            <motion.div
              style={{ y: hudY2 }}
              className="absolute bottom-[20%] right-[5%] bg-black/80 border border-[#ff9900]/40 p-3 rounded-lg text-xs font-mono text-white backdrop-blur-xl shadow-2xl"
            >
              <span className="text-[#ff9900] font-bold flex items-center gap-1">
                <Zap size={12} /> ANOMALY FLAG
              </span>
              <br />
              <span className="text-gray-400">TYPE: WEAR_TEAR</span>
              <br />
              <span className="text-gray-400">
                CONFIDENCE: <span className="text-yellow-500">87.5%</span>
              </span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* PANEL DERECHO: MAPA DINO */}
      <motion.div
        initial={{ opacity: 0, rotateY: -15, z: -100 }}
        animate={{ opacity: 1, rotateY: 0, z: 0 }}
        transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
        className="col-span-1 relative bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden h-[550px] flex flex-col p-5"
      >
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
          <div className="flex items-center gap-2 text-white">
            <Scan size={16} className="text-purple-400" />
            <span className="text-sm font-bold tracking-tight">
              DINO Attention Map
            </span>
          </div>
          <Activity size={14} className="text-[#6aaf35] animate-pulse" />
        </div>

        <div className="flex-1 relative bg-black rounded-xl border border-white/5 flex flex-col items-center justify-center overflow-hidden p-4">
          <svg
            width="100%"
            height="100%"
            className="absolute inset-0 opacity-50"
          >
            <motion.path
              d="M 0 50 Q 150 0 0 250"
              fill="none"
              stroke="#a855f7"
              strokeWidth="1.5"
              animate={{
                d: [
                  'M 0 50 Q 150 0 0 250',
                  'M 0 50 Q -50 150 0 250',
                  'M 0 50 Q 150 0 0 250',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.path
              d="M 250 50 Q 50 0 250 250"
              fill="none"
              stroke="#00a1c9"
              strokeWidth="1.5"
              animate={{
                d: [
                  'M 250 50 Q 50 0 250 250',
                  'M 250 50 Q 300 150 250 250',
                  'M 250 50 Q 50 0 250 250',
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
            />
          </svg>

          <div className="grid grid-cols-5 grid-rows-6 gap-2 w-full h-full opacity-90 relative z-10">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="w-full h-full rounded flex items-center justify-center"
                animate={{
                  backgroundColor:
                    Math.random() > 0.6
                      ? 'rgba(168,85,247,0.3)'
                      : 'rgba(0,161,201,0.1)',
                }}
                transition={{
                  duration: 1 + Math.random() * 2,
                  repeat: Infinity,
                }}
              >
                <div
                  className={`w-1 h-1 rounded-full ${Math.random() > 0.5 ? 'bg-purple-300' : 'bg-[#00a1c9]'}`}
                ></div>
              </motion.div>
            ))}
          </div>

          <div className="absolute bottom-4 w-[90%] font-mono text-[10px] text-gray-300 bg-black/90 p-3 rounded-lg border border-white/10 backdrop-blur-xl">
            <div className="flex justify-between mb-1.5">
              <span className="text-purple-400 font-bold">Vector Space</span>
              <span>1024_DIMS</span>
            </div>
            <div className="flex justify-between mb-1.5">
              <span>Attention_Heads</span>
              <span className="text-[#00a1c9]">12/12</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-1.5">
              <span>Sync_Status</span>
              <span className="text-[#6aaf35] font-bold">AWS_RDS_OK</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- 3. NUEVO: STACK TECNOLÓGICO (SVGs GIGANTES Y REALISTAS) ---
const ReactLogo = () => (
  <svg
    width="48"
    height="48"
    viewBox="-11.5 -10.23174 23 20.46348"
    className="animate-[spin_10s_linear_infinite]"
  >
    <circle cx="0" cy="0" r="2.05" fill="#61dafb" />
    <g stroke="#61dafb" strokeWidth="1" fill="none">
      <ellipse rx="11" ry="4.2" />
      <ellipse rx="11" ry="4.2" transform="rotate(60)" />
      <ellipse rx="11" ry="4.2" transform="rotate(120)" />
    </g>
  </svg>
);

const AwsLogo = () => (
  <svg
    width="60"
    height="48"
    viewBox="0 0 100 60"
    fill="none"
    className="text-[#FF9900]"
  >
    <path
      d="M60.6,35.5c-6.8,4.7-16.7,7.7-26.6,7.7c-11.8,0-21.7-4-28.7-9.5c-1-0.8-2.4-0.6-3.2,0.4c-0.8,1-0.6,2.4,0.4,3.2c8.2,6.5,19.6,11.2,32.8,11.2c11.3,0,22.2-3.4,29.9-8.7c1.1-0.7,1.4-2.2,0.6-3.3C64.9,35.3,63.4,35,60.6,35.5z"
      fill="currentColor"
    />
    <path
      d="M68.8,31.7c-0.6-0.6-1.5-0.6-2.1,0c-1.3,1.3-3.6,2.1-5.7,2.1c-0.8,0-1.5,0.7-1.5,1.5c0,0.8,0.7,1.5,1.5,1.5c3.2,0,6.6-1.3,8.7-3.4C70.3,32.8,70.3,32.2,68.8,31.7z"
      fill="currentColor"
    />
    <text
      x="5"
      y="25"
      fill="#fff"
      fontSize="28"
      fontWeight="bold"
      fontFamily="sans-serif"
    >
      AWS
    </text>
  </svg>
);

const TechStackMarquee = () => {
  const stack = [
    {
      name: 'React',
      icon: <ReactLogo />,
      color: 'text-[#61DAFB]',
      border: 'border-[#61DAFB]/40',
    },
    {
      name: 'DINOv2',
      icon: <BrainCircuit size={48} />,
      color: 'text-purple-400',
      border: 'border-purple-400/40',
    },
    {
      name: 'Node.js',
      icon: <Cloud size={48} />,
      color: 'text-[#339933]',
      border: 'border-[#339933]/40',
    },
    {
      name: 'AWS Serverless',
      icon: <AwsLogo />,
      color: 'text-[#FF9900]',
      border: 'border-[#FF9900]/40',
    },
    {
      name: 'PostgreSQL',
      icon: <Database size={48} />,
      color: 'text-[#336791]',
      border: 'border-[#336791]/40',
    },
    {
      name: 'JWT Auth',
      icon: <ShieldCheck size={48} />,
      color: 'text-pink-500',
      border: 'border-pink-500/40',
    },
  ];

  return (
    <div className="py-8 border-b border-white/5 bg-[#020508] relative z-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#020508] via-transparent to-[#020508] z-10 w-full pointer-events-none"></div>

      <div className="flex w-fit">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="flex gap-8 px-4"
        >
          {[...stack, ...stack].map((tech, i) => (
            <div
              key={i}
              className={`flex items-center gap-5 bg-black/60 border ${tech.border} px-8 py-5 rounded-2xl backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)] whitespace-nowrap hover:scale-105 transition-transform cursor-pointer`}
            >
              <div
                className={`${tech.color} drop-shadow-[0_0_10px_currentColor]`}
              >
                {tech.icon}
              </div>
              <span className="text-gray-100 font-bold font-mono text-xl tracking-wide">
                {tech.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

// --- 4. DINO NEURAL MODEL ---
const DinoModelSection = () => {
  return (
    <section
      id="dino"
      className="py-32 relative z-10 bg-black border-t border-white/5 overflow-hidden"
    >
      <div className="container mx-auto px-6 max-w-[1200px]">
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-6">
            <div className="px-3 py-1 rounded-full border border-purple-500/30 bg-purple-950/20 text-purple-300 text-xs font-mono flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <FlaskConical size={14} /> Representación Autosupervisada
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-8">
            DINO Neural Engine: <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-[#00a1c9] to-[#6aaf35]">
              Aprende sin límites.
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-20 max-w-3xl leading-relaxed">
            Nuestra IA no necesita etiquetas manuales. Utilizando DINO
            (Self-Distillation with No Labels), la red comprende la estructura
            profunda de tus inventarios analizando correspondencias semánticas
            entre millones de recortes.
          </p>
        </ScrollReveal>

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="hidden md:block absolute top-1/2 left-[45%] w-[10%] h-[2px] bg-white/10 transform -translate-y-1/2 z-0 overflow-hidden">
            <motion.div
              className="w-full h-full bg-gradient-to-r from-purple-500 to-[#6aaf35]"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          <ScrollReveal delay={0.2} className="z-10">
            <div className="bg-[#050505] border border-purple-500/20 p-8 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.05)] hover:border-purple-500/50 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-purple-950/40 border border-purple-500/40 flex items-center justify-center mb-6">
                <Server className="text-purple-400" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Red Maestro (Teacher)
              </h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Mantiene un promedio exponencial de los pesos. Genera
                representaciones estables de alto nivel de las piezas
                industriales.
              </p>
              <div className="w-full bg-black rounded p-3 border border-white/10 font-mono text-xs text-purple-300 flex items-center gap-2">
                <Focus size={14} /> Target Output Generated
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.4} className="z-10">
            <div className="bg-[#050505] border border-[#6aaf35]/20 p-8 rounded-2xl shadow-[0_0_50px_rgba(106,175,53,0.05)] hover:border-[#6aaf35]/50 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-[#6aaf35]/10 border border-[#6aaf35]/40 flex items-center justify-center mb-6">
                <BrainCircuit className="text-[#6aaf35]" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Red Alumno (Student)
              </h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Procesa vistas distorsionadas y recortadas de la misma pieza,
                ajustando sus pesos para coincidir con las predicciones del
                Maestro.
              </p>
              <div className="w-full bg-black rounded p-3 border border-white/10 font-mono text-xs text-[#6aaf35] flex items-center gap-2">
                <Zap size={14} /> Parameters Updated
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

// --- 5. MULTI-SERVICIOS ---
const MultiServiceEcosystem = () => {
  return (
    <section
      id="ecosystem"
      className="py-32 relative bg-[#020508] border-t border-white/5 overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-6">
            <div className="px-3 py-1 rounded-full border border-[#ff9900]/30 bg-[#ff9900]/10 text-[#ff9900] text-xs font-mono flex items-center gap-2">
              <Network size={14} /> Plataforma Unificada
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
            Más allá de la visión. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff9900] to-[#ff4400]">
              Control total de infraestructura.
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-16 max-w-3xl leading-relaxed">
            QuickFind OS se integra con redes de sensores IoT. Un solo dashboard
            para telemetría crítica y automatización de compliance sanitario.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ScrollReveal delay={0.2}>
            <div className="bg-[#050505] border border-white/10 rounded-2xl p-8 h-full relative overflow-hidden group hover:border-[#ff9900]/50 transition-colors">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#ff9900]/5 rounded-full blur-3xl group-hover:bg-[#ff9900]/20 transition-all"></div>
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-14 h-14 rounded-xl bg-black border border-white/10 flex items-center justify-center text-[#ff9900] shadow-lg">
                  <Gauge size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Telemetría IoT
                  </h3>
                  <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">
                    Sensores Vivos
                  </span>
                </div>
              </div>
              <div className="space-y-4 relative z-10 font-mono text-sm">
                <div className="bg-black border border-white/5 rounded-xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Snowflake className="text-[#00a1c9]" size={22} />
                    <div>
                      <div className="text-gray-300 font-medium">
                        Cuarto Frío A
                      </div>
                    </div>
                  </div>
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-2xl font-bold text-[#00a1c9]"
                  >
                    -18.4°C
                  </motion.span>
                </div>
                <div className="bg-black border border-white/5 rounded-xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Flame className="text-[#ff4400]" size={22} />
                    <div>
                      <div className="text-gray-300 font-medium">
                        Caldera Main
                      </div>
                    </div>
                  </div>
                  <motion.span
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-2xl font-bold text-[#ff4400]"
                  >
                    124 PSI
                  </motion.span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div className="bg-[#050505] border border-white/10 rounded-2xl p-8 h-full relative overflow-hidden group hover:border-[#00a1c9]/50 transition-colors">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#00a1c9]/5 rounded-full blur-3xl group-hover:bg-[#00a1c9]/20 transition-all"></div>
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-14 h-14 rounded-xl bg-black border border-white/10 flex items-center justify-center text-[#00a1c9] shadow-lg">
                  <ClipboardCheck size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Compliance & Sanidad
                  </h3>
                  <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">
                    Auditoría Automática
                  </span>
                </div>
              </div>
              <div className="space-y-3 font-mono text-sm relative z-10 text-gray-400">
                {[
                  {
                    text: 'Desinfección Línea A',
                    time: '08:00 AM',
                    status: 'DONE',
                  },
                  {
                    text: 'Purgado Válvulas',
                    time: '10:30 AM',
                    status: 'DONE',
                  },
                  {
                    text: 'Inspección Filtros',
                    time: '14:00 PM',
                    status: 'PENDING',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-black rounded-lg border border-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${item.status === 'DONE' ? 'bg-[#6aaf35]' : 'border border-gray-600'}`}
                      >
                        {item.status === 'DONE' && (
                          <CheckCircle2 size={14} className="text-black" />
                        )}
                      </div>
                      <span
                        className={
                          item.status === 'DONE'
                            ? 'line-through text-gray-600'
                            : 'text-gray-200'
                        }
                      >
                        {item.text}
                      </span>
                    </div>
                    <span className="text-xs">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

// --- 6. CAPACIDADES ---
const CapabilitiesSection = () => {
  const items = [
    {
      name: 'Alta Disponibilidad',
      desc: 'Clústers redundantes aseguran operación continua sin interrupciones. 99.99% SLA garantizado.',
      icon: <ShieldCheck className="text-[#6aaf35]" size={28} />,
    },
    {
      name: 'Inferencia Local Edge',
      desc: 'Modelos CV vectorizan localmente reduciendo latencia a <20ms y conservando ancho de banda.',
      icon: <Zap className="text-[#ff9900]" size={28} />,
    },
    {
      name: 'Sincronización Cloud',
      desc: 'Integración nativa bidireccional con SAP, Oracle, Dynamics y bases de datos AWS RDS.',
      icon: <InfinityIcon className="text-[#00a1c9]" size={28} />,
    },
  ];

  return (
    <section className="py-32 relative z-10 bg-black border-t border-white/5 overflow-hidden">
      <motion.div
        // FIX: as any para Framer Motion
        animate={floatAnim(1, 20) as any}
        className="absolute top-[10%] right-[-100px] w-[600px] h-[600px] opacity-10 pointer-events-none z-0"
      >
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          <path
            d="M50,5 L95,25 L95,75 L50,95 L5,75 L5,25 Z"
            fill="none"
            stroke="#fff"
            strokeWidth="0.2"
            strokeDasharray="1,1"
          />
          <path
            d="M50,5 L50,95 M5,25 L95,75 M5,75 L95,25"
            fill="none"
            stroke="#fff"
            strokeWidth="0.1"
          />
        </svg>
      </motion.div>

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <ScrollReveal>
          <div className="mb-16">
            <h2 className="text-white text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Arquitectura Enterprise
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl">
              Diseñada estrictamente para los rigores, escalas y tolerancias a
              fallos de la logística industrial y manufactura.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <ScrollReveal key={index} delay={index * 0.2}>
              <div className="bg-[#050505] border border-white/10 p-8 rounded-2xl h-full hover:bg-white/[0.05] hover:border-white/30 transition-all duration-300">
                <div className="w-16 h-16 rounded-xl bg-black flex items-center justify-center border border-white/10 shadow-lg mb-8">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">
                  {item.name}
                </h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- 7. FOOTER ---
const QuickFindFooter = () => (
  <footer className="py-16 bg-[#020508] border-t border-white/10 relative z-10 font-mono text-xs text-gray-500">
    <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white">
          <ScanLine size={18} />
        </div>
        <div className="flex flex-col">
          <span className="text-gray-200 font-bold text-sm tracking-widest">
            QUICKFIND
          </span>
          <span className="mt-1">
            © 2026. Infraestructura Logística Avanzada.
          </span>
        </div>
      </div>
      <div className="flex gap-8">
        <div className="flex items-center gap-2 border border-[#6aaf35]/30 bg-[#6aaf35]/5 px-3 py-1.5 rounded-full text-[#6aaf35]">
          <div className="w-1.5 h-1.5 bg-[#6aaf35] rounded-full animate-pulse"></div>{' '}
          All Systems Operational
        </div>
      </div>
    </div>
  </footer>
);

// --- APP PRINCIPAL ---
export default function QuickFindLanding() {
  const { scrollY } = useScroll();

  // PARALLAX PROFUNDO
  const bgY1 = useTransform(scrollY, [0, 5000], [0, 1000]);

  // EFECTO CINEMÁTICO HERO
  const heroScale = useTransform(scrollY, [0, 600], [1, 1.25]);
  const heroOpacity = useTransform(scrollY, [0, 450], [1, 0]);
  const heroBlur = useTransform(scrollY, [0, 450], ['blur(0px)', 'blur(20px)']);
  const heroY = useTransform(scrollY, [0, 600], [0, -100]);

  // ANIMACIÓN PARALLAX DEL SCANNER (Para que esté cerca del stack)
  const scannerY = useTransform(scrollY, [0, 900], [0, -50]);

  return (
    <div className="bg-black min-h-screen text-gray-300 font-sans selection:bg-[#00a1c9]/40 overflow-x-hidden">
      <QuickFindNav />

      {/* 1. HERO SECTION CINEMÁTICO */}
      <section
        className="relative pt-44 pb-10 px-6 overflow-hidden min-h-[100vh] flex flex-col items-center justify-start"
        style={{
          maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, black 80%, transparent 100%)',
        }}
      >
        <motion.div
          style={{ y: bgY1 }}
          className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        >
          <div className="absolute top-[20%] left-[15%] w-2 h-2 bg-[#00a1c9] rounded-full shadow-[0_0_30px_#00a1c9]"></div>
          <div className="absolute top-[50%] right-[20%] w-3 h-3 bg-[#6aaf35] rounded-full shadow-[0_0_30px_#6aaf35]"></div>
          <svg className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></svg>
        </motion.div>

        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-gradient-to-b from-[#00a1c9]/15 via-[#6aaf35]/5 to-transparent blur-[150px] pointer-events-none z-0" />

        <motion.div
          style={{
            scale: heroScale,
            opacity: heroOpacity,
            filter: heroBlur,
            y: heroY,
          }}
          className="container mx-auto text-center max-w-[1000px] relative z-10 flex flex-col items-center origin-center"
        >
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-950/30 backdrop-blur-md text-xs font-mono text-purple-300 mb-8 mt-6 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
            <Sparkles size={14} className="text-purple-400" /> DINO-powered
            Vision Platform
          </div>

          <h1 className="text-5xl md:text-[90px] font-extrabold tracking-tighter text-white leading-[0.95] mb-8 drop-shadow-2xl">
            Digitalización total <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00a1c9] via-[#6aaf35] to-[#ff9900]">
              de tu infraestructura.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-3xl leading-relaxed">
            Unifica el rastreo visual, telemetría y gestión de sanidad en un
            solo lugar impulsado por inteligencia artificial.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <Button variant="primary">Agendar Implementación</Button>
            <Button variant="normal">
              Arquitectura Técnica <Code size={16} className="inline ml-1" />
            </Button>
          </div>
        </motion.div>

        <motion.div
          style={{ y: scannerY }}
          className="w-full z-20 mt-12 relative"
        >
          <AdvancedVectorScanner />
        </motion.div>
      </section>

      {/* 2. STACK TECNOLÓGICO (MARQUEE GIGANTE) */}
      <TechStackMarquee />

      {/* 3. DINO MODEL & MÓDULOS */}
      <DinoModelSection />
      <MultiServiceEcosystem />
      <CapabilitiesSection />

      {/* 4. CTA FINAL */}
      <section className="py-40 relative bg-black border-t border-white/5 text-center flex flex-col items-center overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex items-center justify-center">
          <div className="w-[800px] h-[800px] rounded-full border border-[#00a1c9]/30 absolute"></div>
          <div className="w-[600px] h-[600px] rounded-full border border-[#00a1c9]/30 absolute"></div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="w-[800px] h-[800px] absolute rounded-full origin-center"
          >
            <div className="w-1/2 h-1/2 bg-gradient-to-br from-[#00a1c9]/30 to-transparent rounded-tl-full border-l-2 border-t-2 border-[#00a1c9]"></div>
          </motion.div>
        </div>

        <ScrollReveal className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 bg-[#00a1c9]/10 rounded-full border border-[#00a1c9]/30 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(0,161,201,0.2)] backdrop-blur-md">
            <ScanLine className="text-[#00a1c9]" size={40} strokeWidth={1.5} />
          </div>
          <h2 className="text-5xl md:text-8xl font-extrabold text-white mb-8 tracking-tighter">
            Digitaliza tu Planta.
          </h2>
          <p className="text-lg md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Opera a la velocidad de la nube. Sin latencia, sin puntos ciegos.
          </p>
          <Button variant="primary">Comenzar Prueba Piloto</Button>
        </ScrollReveal>
      </section>

      <QuickFindFooter />
    </div>
  );
}
