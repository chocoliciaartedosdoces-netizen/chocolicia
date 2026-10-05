/**
 * PhotoLightbox – visualizador de fotos ampliadas sem biblioteca externa.
 *
 * Renderizado apenas no cliente via createPortal.
 * SSR: nenhum acesso a window/document no import — tudo dentro de useEffect.
 */
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface LightboxPhoto {
  src: string;
  alt: string;
}

export interface PhotoLightboxProps {
  photos: LightboxPhoto[];
  initialIndex: number;
  onClose: () => void;
  /** Ref do elemento que abriu o diálogo — foco é devolvido aqui ao fechar */
  triggerRef?: React.RefObject<HTMLElement | null>;
}

/* ─── Helpers ──────────────────────────────────────────────────────────── */

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),' +
  'textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/* ─── Componente ────────────────────────────────────────────────────────── */

export default function PhotoLightbox({
  photos,
  initialIndex,
  onClose,
  triggerRef,
}: PhotoLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [visible, setVisible] = useState(false); // fade-in
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const swipeStartX = useRef<number | null>(null);

  const total = photos.length;
  const photo = photos[clamp(index, 0, total - 1)];

  /* ── Preload vizinhos ────────────────────────────────────────────────── */
  useEffect(() => {
    const prev = photos[clamp(index - 1, 0, total - 1)];
    const next = photos[clamp(index + 1, 0, total - 1)];
    [prev, next].forEach((p) => {
      if (!p) return;
      const img = new Image();
      img.src = p.src;
    });
  }, [index, photos, total]);

  useEffect(() => {
    setPortalTarget(document.body);
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(query.matches);
    updateMotion();
    query.addEventListener('change', updateMotion);
    return () => query.removeEventListener('change', updateMotion);
  }, []);

  /* ── Fade-in ao abrir ────────────────────────────────────────────────── */
  useEffect(() => {
    if (!portalTarget) return undefined;
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [portalTarget]);

  /* ── Foco inicial no botão fechar ─────────────────────────────────────── */
  useEffect(() => {
    if (!portalTarget) return;
    closeRef.current?.focus();
  }, [portalTarget]);

  /* ── Bloquear rolagem da página compensando scrollbar ────────────────── */
  useEffect(() => {
    if (!portalTarget) return undefined;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const prev = document.body.style.overflow;
    const prevPad = document.body.style.paddingRight;
    const computedPad = Number.parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${computedPad + scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = prev;
      document.body.style.paddingRight = prevPad;
    };
  }, [portalTarget]);

  /* ── Restaurar foco ao fechar ────────────────────────────────────────── */
  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      onClose();
      triggerRef?.current?.focus();
    }, reducedMotion ? 0 : 210);
  }, [onClose, reducedMotion, triggerRef]);

  /* ── Navegação ───────────────────────────────────────────────────────── */
  const goTo = useCallback(
    (next: number) => setIndex(clamp(next, 0, total - 1)),
    [total],
  );
  const prev = useCallback(() => goTo(index - 1), [index, goTo]);
  const next_ = useCallback(() => goTo(index + 1), [index, goTo]);

  /* ── Teclado ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!portalTarget) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
        return;
      }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); next_(); return; }

      // Foco preso no diálogo (Tab / Shift+Tab)
      if (e.key === 'Tab') {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusables = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (!focusables.length) { e.preventDefault(); return; }
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        if (e.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose, next_, portalTarget, prev]);

  /* ── Swipe touch ─────────────────────────────────────────────────────── */
  const handleTouchStart = (e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0]?.clientX ?? null;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (swipeStartX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - swipeStartX.current;
    swipeStartX.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) next_(); else prev();
  };

  /* ── JSX ─────────────────────────────────────────────────────────────── */
  if (!photo || !portalTarget) return null;

  const overlay = (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Foto ampliada"
      tabIndex={-1}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(58,36,29,0.92)',
        opacity: visible ? 1 : 0,
        transition: reducedMotion ? 'none' : 'opacity 0.2s ease',
        padding: '16px',
      }}
      onClick={event => {
        if (event.target === event.currentTarget) handleClose();
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Botão fechar */}
      <button
        ref={closeRef}
        type="button"
        aria-label="Fechar"
        title="Fechar foto ampliada"
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(255,249,240,0.15)',
          color: '#FFF9F0',
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
          fontSize: 20,
          lineHeight: 1,
          backdropFilter: 'blur(4px)',
          zIndex: 1,
        }}
      >
        <X size={22} aria-hidden="true" />
      </button>

      {/* Botão anterior */}
      {total > 1 && (
        <button
          type="button"
          aria-label="Foto anterior"
          title="Foto anterior"
          onClick={prev}
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255,249,240,0.15)',
            color: '#FFF9F0',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            fontSize: 18,
            backdropFilter: 'blur(4px)',
            zIndex: 1,
          }}
        >
          <ChevronLeft size={24} aria-hidden="true" />
        </button>
      )}

      {/* Botão próxima */}
      {total > 1 && (
        <button
          type="button"
          aria-label="Próxima foto"
          title="Próxima foto"
          onClick={next_}
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255,249,240,0.15)',
            color: '#FFF9F0',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            fontSize: 18,
            backdropFilter: 'blur(4px)',
            zIndex: 1,
          }}
        >
          <ChevronRight size={24} aria-hidden="true" />
        </button>
      )}

      {/* Figura — stopPropagation para não fechar ao clicar na foto */}
      <figure
        onClick={(e) => e.stopPropagation()}
        style={{
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          maxWidth: '92vw',
          maxHeight: '92vh',
        }}
      >
        <img
          src={photo.src}
          alt={photo.alt}
          style={{
            maxWidth: '92vw',
            maxHeight: '85vh',
            objectFit: 'contain',
            borderRadius: 8,
            display: 'block',
          }}
          decoding="async"
          loading="eager"
        />
        <figcaption
          style={{
            color: 'rgba(255,249,240,0.85)',
            fontSize: 13,
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          <span>{photo.alt}</span>
          {total > 1 && (
            <span style={{ marginLeft: 8, opacity: 0.6 }}>
              {' '}
              {index + 1} / {total}
            </span>
          )}
        </figcaption>
      </figure>
    </div>
  );

  return createPortal(overlay, portalTarget);
}
