// ==================== UI FEEDBACK HELPERS ====================
// Sleek toast notifications, accessible confirmation modal, and safe clipboard helper
// Replaces all window.alert() and window.confirm() calls across the IDE.

let _toastStack = null;

function ensureToastStack() {
  if (_toastStack && document.body.contains(_toastStack)) return _toastStack;
  _toastStack = document.createElement('div');
  _toastStack.id = 'cc-toast-stack';
  _toastStack.className = 'cc-toast-stack';
  _toastStack.setAttribute('aria-live', 'polite');
  document.body.appendChild(_toastStack);
  return _toastStack;
}

export function showToast(message, type = 'info', duration = 2800) {
  const stack = ensureToastStack();
  const toast = document.createElement('div');
  toast.className = `cc-toast cc-toast-${type}`;

  const icons = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'i',
  };

  const iconEl = document.createElement('span');
  iconEl.className = 'cc-toast-icon';
  iconEl.textContent = icons[type] || icons.info;

  const textEl = document.createElement('span');
  textEl.className = 'cc-toast-text';
  textEl.textContent = message;

  toast.appendChild(iconEl);
  toast.appendChild(textEl);
  stack.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('visible'));

  const dismiss = () => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 220);
  };

  toast.addEventListener('click', dismiss);
  setTimeout(dismiss, duration);
}

export function showConfirm({
  title = 'Confirmar ação',
  message = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  danger = false,
} = {}) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay cc-confirm-overlay';
    overlay.style.display = 'flex';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    const box = document.createElement('div');
    box.className = 'modal-box cc-confirm-box';

    const h = document.createElement('h3');
    h.className = 'cc-confirm-title';
    h.textContent = title;

    const p = document.createElement('p');
    p.className = 'cc-confirm-msg';
    p.textContent = message;

    const actions = document.createElement('div');
    actions.className = 'cc-confirm-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn';
    cancelBtn.textContent = cancelText;

    const okBtn = document.createElement('button');
    okBtn.type = 'button';
    okBtn.className = danger ? 'btn btn-danger' : 'btn btn-run';
    okBtn.textContent = confirmText;

    const close = (result) => {
      document.removeEventListener('keydown', onKey);
      overlay.remove();
      resolve(result);
    };

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close(false);
      } else if (e.key === 'Enter' && document.activeElement !== cancelBtn) {
        e.preventDefault();
        close(true);
      }
    };

    cancelBtn.addEventListener('click', () => close(false));
    okBtn.addEventListener('click', () => close(true));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
    document.addEventListener('keydown', onKey);

    actions.appendChild(cancelBtn);
    actions.appendChild(okBtn);
    box.appendChild(h);
    box.appendChild(p);
    box.appendChild(actions);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    okBtn.focus();
  });
}

export async function copyText(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* fall through */ }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch { ok = false; }
  document.body.removeChild(ta);
  return ok;
}
