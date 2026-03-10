/* ============================================================
    SISTEMA SOLO LEVELING - activity.js
    Registro de actividades y temporizador
    ============================================================
*/

let intervaloTemporizador = null;
let segundosTemporizador  = 0;
let actividadTemporizador = null;
let temporizadorActivo    = false;

async function renderActivity() {
    // Si no hay tipos de actividad cargados, recargarlos
    if (!EstadoApp.tiposActividad.length) {
        try {
            EstadoApp.tiposActividad = await API.obtenerTiposActividad();
        } catch (err) {
            console.error('Error al cargar tipos de actividad:', err);
        }
    }
    renderizarBotonesActividad();
    renderizarSeccionTemporizador();
}

// ── Botones de acción rápida ─────────────────────────────────
function renderizarBotonesActividad() {
    const grilla = document.getElementById('activity-grid');
    if (!EstadoApp.tiposActividad.length) {
        grilla.innerHTML = '<div class="empty-state">Cargando...</div>';
        return;
    }

    grilla.innerHTML = EstadoApp.tiposActividad.map(tipo => `
        <button class="activity-btn stagger-item" onclick="registroRapido(${tipo.id}, this)">
            <span class="activity-btn-icon">${tipo.icono || '⚡'}</span>
            <span class="activity-btn-name">${tipo.nombre}</span>
            <span class="activity-btn-exp">+${tipo.expBase} EXP</span>
        </button>
    `).join('');
}

async function registroRapido(activityTypeId, btn) {
    reproducirSonido('completar_mision');

    btn.disabled = true;
    btn.style.opacity = '0.5';

    try {
        const resultado = await API.registrarActividad(activityTypeId);
        await renderProfile();

        mostrarToast(
            `${resultado.icon || '⚡'} ${resultado.activityName}`,
            'Actividad registrada',
            'default',
            resultado
        );

        if (resultado.leveledUp) {
            mostrarSubidaNivel(resultado.newLevel - 1, resultado.newLevel);
        }

        // Popup flotante sobre el botón
        const rect = btn.getBoundingClientRect();
        mostrarPopupStat(`+${resultado.expEarned} EXP`, rect.left + rect.width / 2, rect.top);

    } catch (err) {
        mostrarToast('ERROR', 'No se pudo registrar la actividad', 'error');
    } finally {
        setTimeout(() => {
            btn.disabled = false;
            btn.style.opacity = '';
        }, 1500);
    }
}

// ── Temporizador ─────────────────────────────────────────────
function renderizarSeccionTemporizador() {
    actualizarDisplayTemporizador();

    const select = document.getElementById('timer-activity-select');
    if (select && select.options.length <= 1) {
        EstadoApp.tiposActividad.forEach(tipo => {
            const opcion = document.createElement('option');
            opcion.value = tipo.id;
            opcion.textContent = `${tipo.icono || ''} ${tipo.nombre}`;
            select.appendChild(opcion);
        });

        // Sonido al cambiar la actividad seleccionada
        select.addEventListener('change', () => reproducirSonido('navegacion'));
    }
}

function actualizarDisplayTemporizador() {
    const display = document.getElementById('timer-display');
    if (display) display.textContent = formatearTiempo(segundosTemporizador);

    const btn = document.getElementById('timer-btn');
    if (btn) {
        if (temporizadorActivo) {
            btn.textContent = '⏹ DETENER Y GUARDAR';
            btn.classList.add('btn-stop');
        } else {
            btn.textContent = segundosTemporizador > 0 ? '▶ CONTINUAR' : '▶ INICIAR';
            btn.classList.remove('btn-stop');
        }
    }

    const nombreActividad = document.getElementById('timer-activity-name');
    if (nombreActividad && actividadTemporizador) {
        const tipo = EstadoApp.tiposActividad.find(t => t.id === actividadTemporizador);
        if (tipo) nombreActividad.textContent = `— ${tipo.nombre.toUpperCase()} —`;
    }
}

function alternarTemporizador() {
    if (temporizadorActivo) {
        detenerTemporizador();
    } else {
        iniciarTemporizador();
    }
}

function iniciarTemporizador() {
    const select = document.getElementById('timer-activity-select');
    if (!select || !select.value) {
        mostrarToast('AVISO', 'Seleccioná una actividad primero', 'error');
        return;
    }

    actividadTemporizador = parseInt(select.value);
    temporizadorActivo    = true;

    reproducirSonido('notificacion_normal');

    intervaloTemporizador = setInterval(() => {
        segundosTemporizador++;
        actualizarDisplayTemporizador();
    }, 1000);

    actualizarDisplayTemporizador();
    mostrarToast('TEMPORIZADOR', 'Sesión iniciada', 'default');
}

async function detenerTemporizador() {
    if (!temporizadorActivo) return;

    clearInterval(intervaloTemporizador);
    temporizadorActivo = false;

    reproducirSonido('notificacion_normal');

    const minutos = Math.max(1, Math.floor(segundosTemporizador / 60));

    try {
        const resultado = await API.registrarActividad(actividadTemporizador, minutos);
        await renderProfile();

        mostrarToast(
            `${resultado.icon || '⚡'} ${resultado.activityName}`,
            `${minutos}m registrados`,
            'default',
            resultado
        );

        if (resultado.leveledUp) {
            mostrarSubidaNivel(resultado.newLevel - 1, resultado.newLevel);
        }

    } catch (err) {
        mostrarToast('ERROR', 'No se pudo guardar la sesión', 'error');
    }

    // Reiniciar temporizador
    segundosTemporizador  = 0;
    actividadTemporizador = null;
    actualizarDisplayTemporizador();

    const nombreActividad = document.getElementById('timer-activity-name');
    if (nombreActividad) nombreActividad.textContent = '';
}

function reiniciarTemporizador() {
    if (temporizadorActivo) {
        clearInterval(intervaloTemporizador);
        temporizadorActivo = false;
    }
    segundosTemporizador  = 0;
    actividadTemporizador = null;
    actualizarDisplayTemporizador();

    const nombreActividad = document.getElementById('timer-activity-name');
    if (nombreActividad) nombreActividad.textContent = '';
}