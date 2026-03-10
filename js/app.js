/* ============================================================
    SISTEMA SOLO LEVELING - app.js
    Lógica principal: navegación, toasts, overlays, utilidades
    ============================================================
*/

// ── Estado global ────────────────────────────────────────────
const EstadoApp = {
  perfil:          null,
  tiposActividad:  [],
  seccionActual:   'profile',
};

// ── Partículas ───────────────────────────────────────────────
let particulas;

// ── Sistema de audio ─────────────────────────────────────────
const Sonidos = {
  navegacion:          new Audio('assets/sounds/navegacion.mp3'),
  completar_mision:    new Audio('assets/sounds/completar_mision.mp3'),
  notificacion_normal: new Audio('assets/sounds/notificacion_normal.mp3'),
  notificacion_nivel:  new Audio('assets/sounds/notificacion_nivel.mp3'),
};

Object.values(Sonidos).forEach(s => {
  s.load();
  s.volume = 0.7;
});

function reproducirSonido(nombre) {
  try {
      const sonido = Sonidos[nombre];
      if (sonido) {
          sonido.currentTime = 0;
          sonido.play().catch(() => {});
      }
  } catch (e) {}
}

// ── Inicialización ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  particulas = new ParticleSystem('particles-canvas');

  try {
      await cargarDatosIniciales();
      ocultarLoader();
      setTimeout(() => mostrarPantallaBienvenida(), 1300);
  } catch (err) {
      console.error('Error al inicializar:', err);
      ocultarLoader();
      mostrarToast('ERROR', 'No se pudo conectar al servidor', 'error');
      navegarA('profile');
  }

  configurarNavegacion();
});

// ── Carga inicial ────────────────────────────────────────────
async function cargarDatosIniciales() {
  const [perfil, tipos] = await Promise.all([
      API.obtenerPerfil(),
      API.obtenerTiposActividad(),
  ]);
  EstadoApp.perfil         = perfil;
  EstadoApp.tiposActividad = tipos;
}

// ── Pantalla de bienvenida ───────────────────────────────────
function mostrarPantallaBienvenida() {
  const nombre = EstadoApp.perfil?.displayName || 'JUGADOR';

  const overlay = document.createElement('div');
  overlay.className = 'levelup-overlay welcome-overlay';
  overlay.innerHTML = `
      <div class="levelup-rays"></div>
      <div class="levelup-box welcome-box">
          <div class="levelup-header">
              <div class="levelup-alert-icon">!</div>
              <div class="levelup-notification-label">NOTIFICACIÓN</div>
          </div>
          <div class="levelup-divider"></div>
          <div class="welcome-text">
              Bienvenido <em><strong>${nombre}</strong></em>
          </div>
          <div class="welcome-hint">[ toca para continuar ]</div>
      </div>
  `;

  document.body.appendChild(overlay);
  reproducirSonido('notificacion_nivel');

  overlay.addEventListener('click', () => cerrarBienvenida(overlay), { once: true });

  setTimeout(() => {
      if (document.body.contains(overlay)) cerrarBienvenida(overlay);
  }, 4000);
}

function cerrarBienvenida(overlay) {
  if (!overlay.classList.contains('hiding')) {
      reproducirSonido('notificacion_normal');
      overlay.classList.add('hiding');
      setTimeout(() => {
          overlay.remove();
          navegarA('profile');
      }, 500);
  }
}

// ── Navegación ───────────────────────────────────────────────
function configurarNavegacion() {
  document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
          const destino = item.dataset.section;
          navegarA(destino);
      });
  });
}

function navegarA(seccionId) {
  if (EstadoApp.seccionActual !== seccionId) {
      reproducirSonido('navegacion');
  }

  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const seccion = document.getElementById(`section-${seccionId}`);
  const itemNav = document.querySelector(`[data-section="${seccionId}"]`);

  if (seccion) seccion.classList.add('active');
  if (itemNav) itemNav.classList.add('active');

  EstadoApp.seccionActual = seccionId;

  switch (seccionId) {
      case 'profile':  renderProfile();  break;
      case 'quests':   renderQuests();   break;
      case 'activity': renderActivity(); break;
      case 'history':  renderHistory();  break;
      case 'dungeon':  renderDungeon();  break;
  }
}

// ── Loader ───────────────────────────────────────────────────
function ocultarLoader() {
  setTimeout(() => {
      const loader = document.getElementById('loader');
      if (loader) loader.classList.add('hidden');
      setTimeout(() => { if (loader) loader.remove(); }, 500);
  }, 1200);
}

// ── Sistema de toasts ────────────────────────────────────────
function mostrarToast(titulo, cuerpo, tipo = 'default', stats = null) {
  if (tipo === 'levelup') {
      reproducirSonido('notificacion_nivel');
  } else if (tipo !== 'error') {
      reproducirSonido('notificacion_normal');
  }

  const contenedor = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${tipo === 'levelup' ? 'level-up' : ''}`;

  let htmlStats = '';
  if (stats) {
      const entradas = [];
      if (stats.expEarned) entradas.push(`+${stats.expEarned} EXP`);
      if (stats.intGained) entradas.push(`+${stats.intGained} INT`);
      if (stats.strGained) entradas.push(`+${stats.strGained} STR`);
      if (stats.endGained) entradas.push(`+${stats.endGained} END`);
      if (stats.disGained) entradas.push(`+${stats.disGained} DIS`);
      if (stats.sklGained) entradas.push(`+${stats.sklGained} SKL`);
      if (entradas.length) {
          htmlStats = `<div class="toast-stats">
              ${entradas.map(e => `<span class="toast-stat">${e}</span>`).join('')}
          </div>`;
      }
  }

  toast.innerHTML = `
      <div class="toast-title">${titulo}</div>
      <div class="toast-body">${cuerpo}</div>
      ${htmlStats}
  `;

  contenedor.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ── Overlay de subida de nivel ───────────────────────────────
function mostrarSubidaNivel(nivelAnterior, nivelNuevo) {
  reproducirSonido('notificacion_nivel');

  const overlay = document.createElement('div');
  overlay.className = 'levelup-overlay';
  overlay.innerHTML = `
      <div class="levelup-rays"></div>
      <div class="levelup-box">
          <div class="levelup-header">
              <div class="levelup-alert-icon">!</div>
              <div class="levelup-notification-label">NOTIFICACIÓN</div>
          </div>
          <div class="levelup-divider"></div>
          <div class="levelup-title-text">LEVEL UP</div>
          <div class="levelup-levels">
              <span class="levelup-from">${nivelAnterior}</span>
              <span class="levelup-arrow">&nbsp;&gt;&gt;&nbsp;</span>
              <span class="levelup-to">${nivelNuevo}</span>
          </div>
      </div>
  `;

  const cerrarSubidaNivel = () => {
      if (!overlay.classList.contains('hiding')) {
          reproducirSonido('notificacion_normal');
          overlay.classList.add('hiding');
          setTimeout(() => overlay.remove(), 500);
      }
  };

  overlay.addEventListener('click', cerrarSubidaNivel, { once: true });
  document.body.appendChild(overlay);
  setTimeout(cerrarSubidaNivel, 5000);
}

// ── Popup flotante de estadística ────────────────────────────
function mostrarPopupStat(texto, x, y) {
  const popup = document.createElement('div');
  popup.className = 'stat-popup';
  popup.style.left = `${x}px`;
  popup.style.top  = `${y}px`;
  popup.textContent = texto;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 1500);
}

// ── Utilidades ───────────────────────────────────────────────
function formatearTiempo(segundos) {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatearFecha(fechaStr) {
  if (!fechaStr) return '';
  const d = new Date(fechaStr);
  return d.toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit'
  });
}