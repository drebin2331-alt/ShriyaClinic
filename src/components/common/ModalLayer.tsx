import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import '../dental/clinical-controls.css';

let openLayers = 0;
let previousOverflow = '';
const stack: HTMLElement[] = [];

export function lockBodyScroll() {
  if (openLayers++ === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  return () => { if (--openLayers === 0) document.body.style.overflow = previousOverflow; };
}

/** Shared viewport, scroll locking and keyboard behavior for existing dialogs. */
export const ModalLayer: React.FC<React.HTMLAttributes<HTMLDivElement> & { onDismiss?: () => void }> = ({ children, className = '', onDismiss, ...props }) => {
  const ref = useRef<HTMLDivElement>(null);
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;
  useEffect(() => {
    const layer = ref.current!;
    const updateViewport = () => {
      const height = window.visualViewport?.height || window.innerHeight;
      layer.style.setProperty('--dialog-height', `${height}px`);
      const availableOffset = Math.max(0, window.innerHeight - height);
      layer.style.setProperty('--dialog-top', `${Math.min(availableOffset, Math.max(0, window.visualViewport?.offsetTop || 0))}px`);
      layer.dataset.compact = String(height < 500);
    };
    updateViewport();
    window.visualViewport?.addEventListener('resize', updateViewport);
    window.visualViewport?.addEventListener('scroll', updateViewport);
    const previousFocus = document.activeElement as HTMLElement | null;
    const releaseScroll = lockBodyScroll();
    stack.push(layer);
    const controls = () => Array.from(layer.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]')).filter(el => el.getClientRects().length && !el.closest('[inert]'));
    const timer = window.setTimeout(() => {
      if (!layer.contains(document.activeElement)) (controls()[0] || layer).focus();
    }, 0);
    const keyboard = (event: KeyboardEvent) => {
      if (stack.at(-1) !== layer) return;
      if (event.key === 'Escape' && dismiss.current) {
        event.preventDefault();
        event.stopPropagation();
        dismiss.current();
      }
      if (event.key === 'Tab') {
        const items = controls();
        const first = items[0] || layer;
        const last = items.at(-1) || layer;
        if (!layer.contains(document.activeElement) || (event.shiftKey ? document.activeElement === first : document.activeElement === last)) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
        }
      }
    };
    document.addEventListener('keydown', keyboard);
    return () => {
      clearTimeout(timer);
      window.visualViewport?.removeEventListener('resize', updateViewport);
      window.visualViewport?.removeEventListener('scroll', updateViewport);
      stack.splice(stack.indexOf(layer), 1);
      releaseScroll();
      document.removeEventListener('keydown', keyboard);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);
  // Headers use backdrop filters, which otherwise make fixed descendants relative
  // to the header instead of the viewport. A portal also keeps nested dialogs on top.
  return createPortal(<div ref={ref} role="dialog" aria-modal="true" aria-label="Clinic dialog" tabIndex={-1} {...props} className={`clinic-modal-layer ${className}`}>{children}</div>, document.body);
};
