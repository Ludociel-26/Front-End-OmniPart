import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AppLayout,
  Container,
  Header,
  SpaceBetween,
  Button,
  Select,
  Slider,
  Cards,
  Box,
  Badge,
  Grid,
  FormField,
  Link,
  Flashbar,
  Icon,
  Alert,
  ColumnLayout,
  StatusIndicator,
  ProgressBar,
} from '@cloudscape-design/components';

// --- IMPORTACIONES DE LAYOUT (Ajusta según tu repositorio) ---
import Navbar from '@/components/layouts/AppHeader';
import GlobalSidebar from '@/components/layouts/AppSidebar';
import SecondaryHeader from '@/components/layouts/BreadcrumbNavBar';
import { Footer } from '@/components/layouts/AppFooter';

// --- INTERFACES ---
interface Roi {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface SearchResult {
  nombre: string;
  maquina: string;
  distancia: string;
  imagen: string;
  nivel: string;
  detalles: { ubicacion: string; uso_en: string; proveedores: string };
}

// --- ESTILOS MODERNOS Y ANIMACIONES ---
const styles = `
  /* LENS STYLES */
  .lens-wrapper {
    display: flex;
    justify-content: center;
    background: #f8f9fa;
    border-radius: 8px;
    padding: 8px;
    border: 1px solid #eaeded;
  }

  .lens-container {
    position: relative;
    display: inline-block;
    max-width: 100%;
    user-select: none;
    border-radius: 4px;
    overflow: hidden;
    background: #000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  .lens-image {
    display: block;
    max-width: 100%;
    max-height: 500px; 
    width: auto;
    height: auto;
    object-fit: contain;
    cursor: crosshair;
  }

  .lens-roi {
    position: absolute;
    border: 2px solid #0972d3;
    border-radius: 2px;
    background: rgba(9, 114, 211, 0.15);
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
    z-index: 10;
    cursor: move;
  }

  .roi-handle {
    position: absolute;
    width: 14px;
    height: 14px;
    background: #fff;
    border: 2px solid #0972d3;
    border-radius: 50%;
    z-index: 11;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  .handle-tl { top: -7px; left: -7px; cursor: nwse-resize; }
  .handle-tr { top: -7px; right: -7px; cursor: nesw-resize; }
  .handle-bl { bottom: -7px; left: -7px; cursor: nesw-resize; }
  .handle-br { bottom: -7px; right: -7px; cursor: nwse-resize; }

  /* DROPZONE MODERNA */
  .modern-dropzone {
    border: 2px dashed #879596;
    border-radius: 12px;
    padding: 60px 20px;
    text-align: center;
    background-color: #ffffff;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .modern-dropzone:hover, .modern-dropzone.dragging {
    border-color: #0972d3;
    background-color: #f2f8fd;
  }

  .modern-dropzone.dragging {
    transform: scale(1.02);
  }

  /* ANIMACIÓN DE CARDS */
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animated-card {
    animation: fadeInUp 0.4s ease-out forwards;
  }

  /* CUSTOM CARD IMAGE STYLES */
  .result-img-container {
    height: 160px;
    overflow: hidden;
    border-radius: 6px;
    border: 1px solid #eaeded;
    margin-bottom: 12px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .result-img-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
  .result-img-container:hover img {
    transform: scale(1.05);
  }
`;

export default function VisualSearch() {
  const [navigationOpen, setNavigationOpen] = useState(true);

  // Estado del Backend
  const [backendStatus, setBackendStatus] = useState<
    'checking' | 'online' | 'offline'
  >('checking');

  // Controles de Configuración
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [topK, setTopK] = useState<number>(5);
  const [planta, setPlanta] = useState<any>({
    label: 'Planta 1',
    value: 'planta1',
  });

  // Drag & Drop
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados del ROI (Region Of Interest)
  const [roiBox, setRoiBox] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const [normalizedRoi, setNormalizedRoi] = useState<Roi | null>(null);
  const interactionState = useRef<{
    type: string;
    startX: number;
    startY: number;
    origRoi: any;
  }>({ type: 'none', startX: 0, startY: 0, origRoi: null });
  const imgRef = useRef<HTMLImageElement>(null);

  // Resultados y Notificaciones
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [flashbarItems, setFlashbarItems] = useState<
    React.ComponentProps<typeof Flashbar>['items']
  >([]);

  const plantasOptions = [
    { label: 'Planta 1', value: 'planta1' },
    { label: 'Planta 2', value: 'planta2' },
  ];

  // --- VALIDACIÓN DEL BACKEND AL INICIO ---
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await fetch('https://dinov2-1.onrender.com/', {
          method: 'GET',
          mode: 'no-cors',
        });
        setBackendStatus('online');
      } catch (error) {
        setBackendStatus('offline');
      }
    };
    checkBackend();
  }, []);

  // --- GESTIÓN DE NOTIFICACIONES ---
  const addNotification = (item: any) => {
    setFlashbarItems((prev) => {
      const filtered = prev.filter((p) => p.id !== item.id);
      return [item, ...filtered];
    });
  };

  const removeNotification = (id: string) => {
    setFlashbarItems((prev) => prev.filter((item) => item.id !== id));
  };

  // --- MANEJO DE ARCHIVOS Y BARRA DE PROGRESO PROFESIONAL ---
  const handleImageUpload = (selectedFile: File) => {
    const uploadId = 'upload-progress';
    let currentProgress = 0;

    const renderProgressNotification = (progressValue: number) => {
      addNotification({
        type: 'in-progress',
        id: uploadId,
        dismissible: false,
        content: (
          <ProgressBar
            label="Subiendo imagen"
            description="Preparando la imagen para el análisis con IA..."
            value={progressValue}
            additionalInfo="Verificando formato y calidad"
            variant="flash"
          />
        ),
      });
    };

    renderProgressNotification(currentProgress);

    const interval = setInterval(() => {
      currentProgress += 15;

      if (currentProgress >= 100) {
        clearInterval(interval);

        const url = URL.createObjectURL(selectedFile);
        setFile(selectedFile);
        setPreviewUrl(url);
        setRoiBox(null);
        setNormalizedRoi(null);

        addNotification({
          type: 'success',
          id: uploadId,
          content: 'Imagen cargada y lista para búsqueda.',
          dismissible: true,
          onDismiss: () => removeNotification(uploadId),
        });

        setTimeout(() => removeNotification(uploadId), 3000);

        // Ejecutar la búsqueda global automáticamente
        performSearch(null, selectedFile, topK);
      } else {
        renderProgressNotification(currentProgress);
      }
    }, 120);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length)
      handleImageUpload(e.dataTransfer.files[0]);
  };

  // --- INTERACCIÓN DEL LENS ---
  const handlePointerDown = (e: React.PointerEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!imgRef.current) return;

    const rect = imgRef.current.getBoundingClientRect();
    interactionState.current = {
      type,
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      origRoi: roiBox ? { ...roiBox } : null,
    };

    if (type === 'new')
      setRoiBox({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        w: 0,
        h: 0,
      });

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!imgRef.current) return;
    const { type, startX, startY, origRoi } = interactionState.current;
    if (type === 'none') return;

    const rect = imgRef.current.getBoundingClientRect();
    let cx = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    let cy = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    if (type === 'new') {
      setRoiBox({
        x: Math.min(cx, startX),
        y: Math.min(cy, startY),
        w: Math.abs(cx - startX),
        h: Math.abs(cy - startY),
      });
    } else if (type === 'move' && origRoi) {
      let nx = origRoi.x + (cx - startX),
        ny = origRoi.y + (cy - startY);
      nx = Math.max(0, Math.min(nx, rect.width - origRoi.w));
      ny = Math.max(0, Math.min(ny, rect.height - origRoi.h));
      setRoiBox({ ...origRoi, x: nx, y: ny });
    } else if (type.startsWith('resize') && origRoi) {
      let nx = origRoi.x,
        ny = origRoi.y,
        nw = origRoi.w,
        nh = origRoi.h;
      if (type.includes('l')) {
        nw = origRoi.w + (origRoi.x - cx);
        nx = cx;
      }
      if (type.includes('r')) {
        nw = cx - origRoi.x;
      }
      if (type.includes('t')) {
        nh = origRoi.h + (origRoi.y - cy);
        ny = cy;
      }
      if (type.includes('b')) {
        nh = cy - origRoi.y;
      }

      if (nw < 20) {
        nw = 20;
        nx = origRoi.x + origRoi.w - 20;
      }
      if (nh < 20) {
        nh = 20;
        ny = origRoi.y + origRoi.h - 20;
      }
      setRoiBox({ x: nx, y: ny, w: nw, h: nh });
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    interactionState.current.type = 'none';

    setRoiBox((currentBox) => {
      if (
        currentBox &&
        imgRef.current &&
        currentBox.w > 20 &&
        currentBox.h > 20
      ) {
        const nRoi = {
          x: currentBox.x / imgRef.current.width,
          y: currentBox.y / imgRef.current.height,
          w: currentBox.w / imgRef.current.width,
          h: currentBox.h / imgRef.current.height,
        };
        setNormalizedRoi(nRoi);
        performSearch(nRoi, file, topK);
        return currentBox;
      }
      setNormalizedRoi(null);
      return null;
    });
  }, [file, topK, handlePointerMove]);

  // --- API REQUEST ---
  const performSearch = async (
    roiToSearch: Roi | null,
    targetFile: File | null,
    limit: number,
  ) => {
    if (!targetFile || !planta || backendStatus === 'offline') return;

    const searchId = 'search-action';
    setLoading(true);
    setResults([]);

    addNotification({
      type: 'in-progress',
      id: searchId,
      content: (
        <ProgressBar
          label="Buscando coincidencias"
          description="Analizando patrones con el motor DINOv2..."
          value={100}
          variant="flash"
        />
      ),
      dismissible: false,
    });

    const formData = new FormData();
    formData.append('imagen', targetFile);
    formData.append('limite', limit.toString());

    if (roiToSearch) {
      formData.append('x', roiToSearch.x.toFixed(4));
      formData.append('y', roiToSearch.y.toFixed(4));
      formData.append('w', roiToSearch.w.toFixed(4));
      formData.append('h', roiToSearch.h.toFixed(4));
    }

    try {
      const res = await fetch(
        'https://dinov2-1.onrender.com/piezas/buscar/global',
        {
          method: 'POST',
          headers: { 'x-planta': planta.value },
          body: formData,
        },
      );
      const data = await res.json();
      if (!data.ok) throw new Error('Error en backend');

      setResults(data.data);
      addNotification({
        type: 'success',
        id: searchId,
        content: `Búsqueda completada: ${data.data.length} similitudes.`,
        dismissible: true,
        onDismiss: () => removeNotification(searchId),
      });
      setTimeout(() => removeNotification(searchId), 4000);
    } catch (err) {
      addNotification({
        type: 'error',
        id: searchId,
        header: 'Fallo en la búsqueda',
        content: 'Verifica la conexión con el servidor DINOv2.',
        dismissible: true,
        onDismiss: () => removeNotification(searchId),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#f2f3f3',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div
        id="sticky-nav-container"
        style={{ position: 'sticky', top: 0, zIndex: 1002, width: '100%' }}
      >
        <Navbar />
        {/* @ts-ignore */}
        <SecondaryHeader
          breadcrumbs={[
            { text: 'Servicios', href: '/' },
            { text: 'Inteligencia Visual', href: '#' },
          ]}
          isMenuOpen={navigationOpen}
          onMenuClick={() => setNavigationOpen(!navigationOpen)}
        />
      </div>

      <AppLayout
        headerSelector="#sticky-nav-container"
        navigation={<GlobalSidebar />}
        navigationOpen={navigationOpen}
        onNavigationChange={({ detail }) => setNavigationOpen(detail.open)}
        contentType="cards"
        toolsHide={true}
        notifications={<Flashbar items={flashbarItems} />}
        content={
          /* FIX: Se envolvió SpaceBetween en un div para aplicarle el margin/padding nativo y cumplir TS */
          <div style={{ marginTop: '16px', paddingBottom: '40px' }}>
            <SpaceBetween size="l" direction="vertical">
              <Header
                variant="h1"
                description="Dibuja un cuadro en la imagen para encontrar piezas similares en el inventario."
                actions={
                  <StatusIndicator
                    type={
                      backendStatus === 'online'
                        ? 'success'
                        : backendStatus === 'offline'
                          ? 'error'
                          : 'in-progress'
                    }
                  >
                    {backendStatus === 'online'
                      ? 'IA Conectada'
                      : backendStatus === 'offline'
                        ? 'Motor IA Desconectado'
                        : 'Verificando Conexión...'}
                  </StatusIndicator>
                }
              >
                Motor de Búsqueda Visual
              </Header>

              {backendStatus === 'offline' && (
                <Alert type="error" header="Servidor No Disponible">
                  No se pudo establecer conexión con el motor de IA en el puerto
                  8000. Por favor, asegúrate de que el backend esté ejecutándose
                  antes de subir imágenes.
                </Alert>
              )}

              {!previewUrl ? (
                <Container>
                  <div
                    className={`modern-dropzone ${isDragging ? 'dragging' : ''}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Icon
                      name="upload"
                      size="large"
                      variant={isDragging ? 'link' : 'normal'}
                    />
                    <Box
                      color={
                        isDragging ? 'text-status-info' : 'text-body-secondary'
                      }
                      fontSize="heading-m"
                      fontWeight="bold"
                    >
                      {isDragging
                        ? 'Suelta la imagen para comenzar'
                        : 'Arrastra una foto de la pieza aquí'}
                    </Box>
                    <Box color="text-body-secondary" fontSize="body-m">
                      o haz clic para explorar en tus archivos
                    </Box>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={(e) =>
                        e.target.files?.length &&
                        handleImageUpload(e.target.files[0])
                      }
                    />
                  </div>
                </Container>
              ) : (
                <Grid
                  gridDefinition={[
                    { colspan: { default: 12, l: 5 } },
                    { colspan: { default: 12, l: 7 } },
                  ]}
                >
                  <SpaceBetween size="m" direction="vertical">
                    <Container
                      header={
                        <Header
                          variant="h2"
                          actions={
                            <Button
                              iconName="upload"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              Cambiar foto
                            </Button>
                          }
                        >
                          Zona de Interés
                        </Header>
                      }
                    >
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={(e) =>
                          e.target.files?.length &&
                          handleImageUpload(e.target.files[0])
                        }
                      />

                      <div className="lens-wrapper">
                        <div className="lens-container">
                          <img
                            ref={imgRef}
                            src={previewUrl}
                            alt="Consulta"
                            className="lens-image"
                            draggable={false}
                            onPointerDown={(e) => handlePointerDown(e, 'new')}
                          />
                          {roiBox && (
                            <div
                              className="lens-roi"
                              onPointerDown={(e) =>
                                handlePointerDown(e, 'move')
                              }
                              style={{
                                left: roiBox.x,
                                top: roiBox.y,
                                width: roiBox.w,
                                height: roiBox.h,
                              }}
                            >
                              <div
                                className="roi-handle handle-tl"
                                onPointerDown={(e) =>
                                  handlePointerDown(e, 'resize-tl')
                                }
                              />
                              <div
                                className="roi-handle handle-tr"
                                onPointerDown={(e) =>
                                  handlePointerDown(e, 'resize-tr')
                                }
                              />
                              <div
                                className="roi-handle handle-bl"
                                onPointerDown={(e) =>
                                  handlePointerDown(e, 'resize-bl')
                                }
                              />
                              <div
                                className="roi-handle handle-br"
                                onPointerDown={(e) =>
                                  handlePointerDown(e, 'resize-br')
                                }
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </Container>

                    <Container>
                      <ColumnLayout columns={2}>
                        <FormField label="Planta destino">
                          <Select
                            selectedOption={planta}
                            onChange={({ detail }) => {
                              setPlanta(detail.selectedOption);
                              performSearch(normalizedRoi, file, topK);
                            }}
                            options={plantasOptions}
                          />
                        </FormField>
                        <FormField label={`Resultados Top: ${topK}`}>
                          <Slider
                            value={topK}
                            max={20}
                            min={1}
                            step={1}
                            /* FIX: Se eliminó onStep (inexistente). 
                               Se ejecuta performSearch directamente en onChange usando detail.value */
                            onChange={({ detail }) => {
                              setTopK(detail.value);
                              performSearch(normalizedRoi, file, detail.value);
                            }}
                          />
                        </FormField>
                      </ColumnLayout>
                    </Container>
                  </SpaceBetween>

                  <Cards
                    loading={loading}
                    loadingText="Analizando similitudes..."
                    items={results}
                    empty={
                      <Box
                        textAlign="center"
                        color="inherit"
                        padding={{ top: 'xxl', bottom: 'xxl' }}
                      >
                        <Icon name="search" size="large" />
                        <Box variant="h3" margin={{ top: 'm' }}>
                          No hay resultados aún
                        </Box>
                        <Box variant="p" color="text-body-secondary">
                          Ajusta el recuadro azul sobre la imagen para enfocar
                          la búsqueda.
                        </Box>
                      </Box>
                    }
                    header={
                      <Header
                        variant="h2"
                        counter={
                          results.length > 0 ? `(${results.length})` : undefined
                        }
                      >
                        Coincidencias
                      </Header>
                    }
                    cardDefinition={{
                      header: (item) => (
                        <Link fontSize="heading-m" className="animated-card">
                          {item.nombre}
                        </Link>
                      ),
                      sections: [
                        {
                          id: 'imagen',
                          content: (item) => (
                            <div className="result-img-container animated-card">
                              <img
                                src={
                                  item.imagen
                                    ? `http://localhost:8000${item.imagen}`
                                    : 'https://www.svgrepo.com/show/451131/no-image.svg'
                                }
                                alt={item.nombre}
                              />
                            </div>
                          ),
                        },
                        {
                          id: 'detalles',
                          content: (item) => (
                            <div
                              className="animated-card"
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '8px',
                              }}
                            >
                              <div>
                                {/* FIX: as any para silenciar el error estricto de variant en Box */}
                                <Box
                                  variant={'awsui-key-label' as any}
                                  fontSize="body-s"
                                >
                                  Similitud
                                </Box>
                                <b>{item.distancia}</b>
                              </div>
                              <div>
                                <Box
                                  variant={'awsui-key-label' as any}
                                  fontSize="body-s"
                                >
                                  Máquina
                                </Box>
                                <b>{item.maquina}</b>
                              </div>
                              <div style={{ gridColumn: 'span 2' }}>
                                <Box
                                  variant={'awsui-key-label' as any}
                                  fontSize="body-s"
                                >
                                  Ubicación
                                </Box>
                                <Box>{item.detalles.ubicacion || 'N/A'}</Box>
                              </div>
                              <div
                                style={{
                                  gridColumn: 'span 2',
                                  marginTop: '4px',
                                }}
                              >
                                <Badge
                                  color={
                                    item.nivel.toLowerCase() === 'alta'
                                      ? 'green'
                                      : item.nivel.toLowerCase() === 'media'
                                        ? 'blue'
                                        : 'red'
                                  }
                                >
                                  Fiabilidad: {item.nivel.toUpperCase()}
                                </Badge>
                              </div>
                            </div>
                          ),
                        },
                      ],
                    }}
                  />
                </Grid>
              )}
            </SpaceBetween>
          </div>
        }
      />
      <Footer />
    </div>
  );
}
