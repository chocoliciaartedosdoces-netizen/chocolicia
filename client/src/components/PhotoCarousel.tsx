/**
 * PhotoCarousel – wrapper SSR-safe para o CircularCarousel 3D da Chocolícia.
 *
 * Estratégia:
 * - No servidor (e no 1.º render do cliente) renderiza um fallback estático com
 *   scroll-snap, para que as fotos e os alt fiquem no HTML estático para SEO.
 * - Após hidratação (useEffect), substitui pelo carrossel 3D carregado com
 *   React.lazy + Suspense, sem aumentar o bundle inicial.
 * - Clicar em qualquer foto (carrossel ou fallback) abre o PhotoLightbox.
 */
import React, { useEffect, useRef, useState, Suspense, useCallback } from 'react';

// Lazy import do carrossel 3D — só carrega no cliente após hidratação
const CircularCarousel = React.lazy(() => import('./CircularCarousel'));

// PhotoLightbox — só instanciado no cliente (createPortal usa document.body)
let PhotoLightbox: React.ComponentType<{
  photos: Array<{ src: string; alt: string }>;
  initialIndex: number;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}> | null = null;

export interface CarouselPhoto {
  src: string;
  alt: string;
}

/** Lista tipada das fotos com alt descritivo e fiel ao conteúdo visual */
export const carouselPhotos: CarouselPhoto[] = [
  {
    src: '/images/carrossel/cupcakes-powerpuff-01.webp',
    alt: 'Cupcakes decorados com cobertura verde e topo personalizado com personagem animado',
  },
  {
    src: '/images/carrossel/bolo-fundo-do-mar-01.webp',
    alt: 'Bolo temático fundo do mar com cobertura azul, areia decorativa e topos de animais marinhos',
  },
  {
    src: '/images/carrossel/mesa-fundo-do-mar-01.webp',
    alt: 'Mesa de doces com tema fundo do mar, bolo central, cupcakes, brigadeiros e decoração com balões',
  },
  {
    src: '/images/carrossel/mesa-bluey-01.webp',
    alt: 'Mesa de festa decorada com tema Bluey, painel, balões coloridos e doces sobre mesas brancas',
  },
  {
    src: '/images/carrossel/cupcakes-bluey-01.webp',
    alt: 'Cupcakes decorados com pasta americana em tema infantil, com personagens e detalhes coloridos',
  },
  {
    src: '/images/carrossel/bolo-fundo-do-mar-02.webp',
    alt: 'Bolo de dois andares branco decorado com conchas, estrelas do mar e flores azuis em fondant',
  },
  {
    src: '/images/carrossel/bolo-naked-frutas-01.webp',
    alt: 'Bolo naked cake de dois andares decorado com frutas vermelhas, uvas e açúcar de confeiteiro',
  },
  {
    src: '/images/carrossel/conjunto-bolo-doces-01.webp',
    alt: 'Bolo branco com flores vermelhas e topo dourado, acompanhado de caixas de doces artesanais',
  },
];

/** Converte para o formato { src, alt } esperado pelo CircularCarousel */
const carouselItems = carouselPhotos.map(p => ({ src: p.src, alt: p.alt }));

/**
 * O alvo é 1,5x a largura frontal original, mantendo fit = 1.
 */
interface BreakpointConfig {
  cardWidth: number;
}

const BREAKPOINTS: Record<string, BreakpointConfig> = {
  mobile: { cardWidth: 160 },
  tablet: { cardWidth: 245 },
  desktop: { cardWidth: 245 },
};

/** Hook SSR-safe para detectar largura da janela */
function useWindowWidth() {
  const [width, setWidth] = useState<number>(0);
  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return width;
}

/** Fallback estático com scroll-snap — renderizado no servidor e no 1.º render */
function StaticFallback({
  onPhotoClick,
}: {
  onPhotoClick?: (index: number, trigger: HTMLElement) => void;
}) {
  return (
    <div
      aria-label="Carrossel de fotos da Chocolícia"
      style={{
        width: '100%',
        height: '100%',
        overflowX: 'auto',
        display: 'flex',
        gap: 16,
        scrollSnapType: 'x mandatory',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        padding: '0 16px',
        boxSizing: 'border-box',
      }}
    >
      {carouselPhotos.map((photo, index) => (
        <div
          key={photo.src}
          style={{
            scrollSnapAlign: 'start',
            flexShrink: 0,
            width: 260,
            height: 'calc(100% - 24px)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <button
            type="button"
            aria-label={`Ampliar foto: ${photo.alt}`}
            onClick={event => onPhotoClick?.(index, event.currentTarget)}
            style={{
              width: '100%',
              height: '100%',
              padding: 0,
              border: 'none',
              cursor: 'zoom-in',
              borderRadius: 12,
              overflow: 'hidden',
              display: 'block',
            }}
          >
            <img
              src={photo.src}
              alt={photo.alt}
              loading="lazy"
              decoding="async"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function PhotoCarousel() {
  const [mounted, setMounted] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [LightboxComp, setLightboxComp] = useState<typeof PhotoLightbox>(null);
  const windowWidth = useWindowWidth();
  const triggerRef = useRef<HTMLElement | null>(null);

  // Troca para o carrossel 3D e carrega o lightbox apenas depois de montar no cliente
  useEffect(() => {
    setMounted(true);
    // Import dinâmico do lightbox — zero impacto no SSR
    import('./PhotoLightbox').then(m => {
      PhotoLightbox = m.default;
      setLightboxComp(() => m.default);
    });
  }, []);

  // Dimensões responsivas (calculadas apenas no cliente)
  let { cardWidth } = BREAKPOINTS.mobile;
  if (windowWidth >= 1024) {
    ({ cardWidth } = BREAKPOINTS.desktop);
  } else if (windowWidth >= 768) {
    ({ cardWidth } = BREAKPOINTS.tablet);
  }

  const containerClassName = 'relative h-[278px] w-full md:h-[407px]';
  const hint = (
    <p className="mt-2 text-center text-sm text-[#8A5A44]" style={{ userSelect: 'none' }}>
      Arraste para girar e toque na foto para ampliar.
    </p>
  );

  const openLightbox = useCallback((index: number, trigger?: HTMLElement | null) => {
    if (trigger) triggerRef.current = trigger;
    setLightboxIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  if (!mounted) {
    return (
      <>
        <div className={containerClassName}>
          <StaticFallback onPhotoClick={openLightbox} />
        </div>
        {hint}
      </>
    );
  }

  return (
    <>
      <div className={containerClassName}>
        <Suspense fallback={<StaticFallback onPhotoClick={openLightbox} />}>
          <CircularCarousel
            items={carouselItems}
            preset="cylinder"
            intro="rise"
            aspectRatio={0.75}
            cardWidth={cardWidth}
            fitWidth={false}
            speed={14}
            captions={false}
            gap={25}
            tilt={-5}
            curve={1}
            perspective={2500}
            autoplay="drift"
            interval={3}
            direction="left"
            momentum={0.6}
            snap
            pauseOnHover
            focusOnClick={false}
            draggable
            parallax={0.3}
            stretch={0.5}
            depthFade={0.55}
            innerShade={0.6}
            cornerRadius={12}
            fadeColor="#FFF9F0"
            onItemClick={(item, index) => {
              const carousel = document.querySelector<HTMLElement>('.circular-carousel');
              carousel?.focus();
              openLightbox(index, carousel);
            }}
          />
        </Suspense>
      </div>

      {hint}

      {/* Lightbox — renderizado fora do fluxo via portal */}
      {lightboxIndex !== null && LightboxComp && (
        <LightboxComp
          photos={carouselPhotos}
          initialIndex={lightboxIndex}
          onClose={closeLightbox}
          triggerRef={triggerRef as React.RefObject<HTMLElement | null>}
        />
      )}
    </>
  );
}
