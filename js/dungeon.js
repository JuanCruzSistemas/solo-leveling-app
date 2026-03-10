/* ============================================================
    SISTEMA SOLO LEVELING - dungeon.js
    Sección de mazmorras
    ============================================================
*/

async function renderDungeon() {
    const contenedor = document.getElementById('dungeon-container');
    contenedor.innerHTML = '<div class="spinner" style="margin-top:48px"></div>';

    try {
        const mazmorra = await API.obtenerMazmorraActiva();

        if (!mazmorra) {
            renderizarSinMazmorra(contenedor);
            return;
        }

        if (mazmorra.status === 'ACTIVE') {
            renderizarMazmorraActiva(contenedor, mazmorra);
        } else {
            renderizarSinMazmorra(contenedor);
        }

    } catch (err) {
        contenedor.innerHTML = `<div class="empty-state">Error al cargar mazmorra</div>`;
    }
}

function renderizarSinMazmorra(contenedor) {
    contenedor.innerHTML = `
        <div class="dungeon-empty">
            <div class="dungeon-empty-icon">🏰</div>
            <div class="dungeon-empty-title">SIN MAZMORRA ACTIVA</div>
            <div class="dungeon-empty-sub">
                Las mazmorras se desbloquean al alcanzar<br>
                los niveles 20 · 50 · 70 · 100
            </div>
        </div>
    `;
}

function renderizarMazmorraActiva(contenedor, d) {
    const dias   = Math.floor(d.hoursRemaining / 24);
    const horas  = d.hoursRemaining % 24;
    const tiempo = dias > 0 ? `${dias}d ${horas}h` : `${horas}h`;

    const esUrgente  = d.hoursRemaining <= 24;
    const recompensa = construirTextoRecompensa(d);
    const penalizacion = construirTextoPenalizacion(d);

    contenedor.innerHTML = `
        <div class="dungeon-window ${esUrgente ? 'dungeon-urgent' : ''}">
            <div class="dungeon-window-corner-bl"></div>

            <div class="dungeon-top-bar">
                <span class="dungeon-type-badge">
                    ${d.dungeonType === 'SURPRISE' ? '⚠ SORPRESA' : '🏰 MAZMORRA'}
                </span>
                <span class="dungeon-timer ${esUrgente ? 'dungeon-timer-urgent' : ''}">
                    ⏱ ${tiempo} restante${esUrgente ? ' ⚠' : ''}
                </span>
            </div>

            <div class="dungeon-body">
                <div class="dungeon-name">${d.name}</div>
                <div class="dungeon-description">${d.description}</div>

                <div class="dungeon-info-grid">
                    <div class="dungeon-info-item">
                        <span class="dungeon-info-label">TIEMPO LÍMITE</span>
                        <span class="dungeon-info-value">${d.timeLimitDays} días</span>
                    </div>
                    <div class="dungeon-info-item">
                        <span class="dungeon-info-label">RECOMPENSA</span>
                        <span class="dungeon-info-value reward-text">${recompensa}</span>
                    </div>
                    <div class="dungeon-info-item">
                        <span class="dungeon-info-label">PENALIZACIÓN</span>
                        <span class="dungeon-info-value penalty-text">${penalizacion}</span>
                    </div>
                </div>

                <div class="dungeon-actions">
                    <button class="btn-primary btn-complete"
                        onclick="completarMazmorraUI(${d.userDungeonId})">
                        ⚔ MISIÓN CUMPLIDA
                    </button>
                    <button class="btn-primary btn-reject"
                        onclick="abandonarMazmorraUI(${d.userDungeonId})">
                        ✕ ABANDONAR
                    </button>
                </div>
            </div>
        </div>

        <div class="dungeon-history-header">
            <span class="dungeon-history-label">— HISTORIAL —</span>
        </div>
        <div id="dungeon-history-list"></div>
    `;

    cargarHistorialMazmorras();
}

async function cargarHistorialMazmorras() {
    const lista = document.getElementById('dungeon-history-list');
    if (!lista) return;

    try {
        const historial = await API.obtenerHistorialMazmorras();
        const anteriores = historial.filter(d => d.status !== 'ACTIVE');

        if (!anteriores.length) {
            lista.innerHTML = `<div class="empty-state">— SIN HISTORIAL —</div>`;
            return;
        }

        lista.innerHTML = anteriores.map(d => {
            const icono = d.status === 'COMPLETED' ? '✅' :
                            d.status === 'FAILED'    ? '💀' : '🚫';
            const cls   = d.status === 'COMPLETED' ? 'history-completed' :
                            d.status === 'FAILED'    ? 'history-failed'    : 'history-rejected';
            return `
                <div class="dungeon-history-item ${cls}">
                    <span class="dh-icon">${icono}</span>
                    <div class="dh-info">
                        <div class="dh-name">${d.name}</div>
                        <div class="dh-status">${d.status}</div>
                    </div>
                    ${d.expReward > 0 ? `<span class="dh-exp">+${d.expReward} EXP</span>` : ''}
                </div>
            `;
        }).join('');
    } catch (err) {
        lista.innerHTML = '';
    }
}

async function completarMazmorraUI(userDungeonId) {
    try {
        const resultado = await API.completarMazmorra(userDungeonId);
        mostrarToast('⚔ MAZMORRA COMPLETADA', resultado.name, 'default',
            { expEarned: resultado.expReward });

        if (resultado.levelReward > 0) {
            const nivelActual = EstadoApp.perfil?.level || 0;
            mostrarSubidaNivel(nivelActual, nivelActual + resultado.levelReward);
        }

        await renderProfile();
        await renderDungeon();
    } catch (err) {
        mostrarToast('ERROR', 'No se pudo completar la mazmorra', 'error');
    }
}

async function abandonarMazmorraUI(userDungeonId) {
    if (!confirm('¿Seguro que querés abandonar la mazmorra? No podrás recuperarla.')) return;

    try {
        await API.rechazarMazmorra(userDungeonId);
        mostrarToast('MAZMORRA ABANDONADA', 'La misión fue rechazada', 'error');
        await renderDungeon();
    } catch (err) {
        mostrarToast('ERROR', 'No se pudo rechazar la mazmorra', 'error');
    }
}

function construirTextoRecompensa(d) {
    const partes = [];
    if (d.expReward > 0)    partes.push(`+${d.expReward} EXP`);
    if (d.levelReward > 0)  partes.push(`+${d.levelReward} NIV`);
    if (d.statRewardType)   partes.push(`+${d.statRewardAmt} ${d.statRewardType.toUpperCase()}`);
    if (d.titleReward)      partes.push(`Título: ${d.titleReward}`);
    return partes.join(' · ') || 'Sin recompensa';
}

function construirTextoPenalizacion(d) {
    const partes = [];
    if (d.penaltyExp > 0)  partes.push(`-${d.penaltyExp} EXP`);
    if (d.penaltyStreak)   partes.push('Racha reiniciada');
    return partes.join(' · ') || 'Sin penalización';
}