import { component$, Slot, $ } from "@builder.io/qwik";
import type { PropFunction } from "@builder.io/qwik";

export type ModalProps = {
  open: boolean;
  title?: string;
  onClose$: PropFunction<() => void>;
};

/**
 * Simple modal dialog with backdrop. Controlled via props.open.
 */
// PUBLIC_INTERFACE
export const Modal = component$<ModalProps>(({ open, title, onClose$ }) => {
  if (!open) return null;
  const handleBackdropClick$ = $((e: MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains("modal-backdrop")) {
      onClose$();
    }
  });

  return (
    <div class="modal-backdrop" onClick$={handleBackdropClick$} role="dialog" aria-modal="true">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">{title || "Dialog"}</h3>
          <button class="icon-btn" aria-label="Close dialog" onClick$={onClose$}>✕</button>
        </div>
        <div class="modal-body">
          <Slot />
        </div>
        <div class="modal-footer">
          <button class="btn secondary" onClick$={onClose$}>Close</button>
        </div>
      </div>
    </div>
  );
});

export default Modal;
