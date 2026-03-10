/* ============================================================
    SISTEMA SOLO LEVELING - history.js
    Historial de actividades
    ============================================================
*/

async function renderHistory() {
    const contenedor = document.getElementById('history-container');
    contenedor.innerHTML = '<div class="spinner" style="margin-top:32px"></div>';

    try {
        const registros = await API.obtenerHistorialActividad();

        if (!registros.length) {
            contenedor.innerHTML = `<div class="empty-state">— SIN ACTIVIDAD REGISTRADA —</div>`;
            return;
        }

        contenedor.innerHTML = registros.slice(0, 30).map((registro) => {
            const duracion = registro.durationMinutes ? `${registro.durationMinutes}m` : 'Rápido';
            const fecha    = formatearFecha(registro.loggedAt);

            return `
                <div class="history-item stagger-item">
                    <div class="history-icon">${registro.activityType?.icono || '⚡'}</div>
                    <div class="history-info">
                        <div class="history-name">${registro.activityType?.nombre || 'Actividad'}</div>
                        <div class="history-meta">${fecha} · ${duracion}</div>
                    </div>
                    <div class="history-exp">+${registro.expEarned}</div>
                </div>
            `;
        }).join('');

    } catch (err) {
        contenedor.innerHTML = `<div class="empty-state">Error al cargar historial</div>`;
    }
}