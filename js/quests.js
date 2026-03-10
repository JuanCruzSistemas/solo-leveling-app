/* ============================================================
    SISTEMA SOLO LEVELING - quests.js
    Misiones diarias, semanales y de historia
    ============================================================
*/

let tabMisionActual = 'daily';

async function renderQuests() {
    configurarTabsMisiones();
    cargarTabMision(tabMisionActual);
}

function configurarTabsMisiones() {
    document.querySelectorAll('#section-quests .tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('#section-quests .tab-btn')
                .forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            tabMisionActual = btn.dataset.tab;
            cargarTabMision(tabMisionActual);
        };
    });
}

async function cargarTabMision(tab) {
    const contenedor = document.getElementById('quest-list-container');
    contenedor.innerHTML = '<div class="spinner" style="margin-top:32px"></div>';

    try {
        let misiones = [];
        if (tab === 'daily')  misiones = await API.obtenerMisionesDialias();
        if (tab === 'weekly') misiones = await API.obtenerMisionesSemanales();
        if (tab === 'story')  misiones = await API.obtenerMisionesHistoria();

        renderizarListaMisiones(misiones, tab, contenedor);
    } catch (err) {
        contenedor.innerHTML = `<div class="empty-state">Error al cargar misiones</div>`;
    }
}

function renderizarListaMisiones(misiones, tab, contenedor) {
    if (!misiones.length) {
        contenedor.innerHTML = `<div class="empty-state">— SIN MISIONES ACTIVAS —</div>`;
        return;
    }

    const esHistoria = tab === 'story';

    contenedor.innerHTML = misiones.map((m) => {
        const completada = m.status === 'COMPLETED';
        return `
            <div class="quest-item ${completada ? 'completed' : ''} ${esHistoria ? 'story-quest' : ''} stagger-item"
                data-uq-id="${m.id}"
                onclick="${!completada ? `completarMisionUI(${m.id}, this)` : ''}">
                <div class="quest-checkbox">
                    <span class="quest-check-icon">✓</span>
                </div>
                <div class="quest-info">
                    <div class="quest-title">${m.title}</div>
                    <div class="quest-reward">
                        ${esHistoria ? '<span class="story-badge">HISTORIA</span> ' : ''}
                        ${m.expReward > 0 ? `+${m.expReward} EXP` : 'RECOMPENSA ESPECIAL'}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function completarMisionUI(userQuestId, elemento) {
    try {
        reproducirSonido('completar_mision');
        elemento.style.pointerEvents = 'none';

        await API.completarMision(userQuestId);
        elemento.classList.add('completed', 'just-completed');

        const rect = elemento.getBoundingClientRect();
        particulas.burst(rect.left + rect.width / 2, rect.top + rect.height / 2);

        // Recargar perfil y verificar si hubo subida de nivel
        const nivelAnterior = EstadoApp.perfil?.level || 1;
        await renderProfile();
        const nivelNuevo = EstadoApp.perfil?.level || 1;

        mostrarToast('MISIÓN COMPLETADA', elemento.querySelector('.quest-title').textContent);

        if (nivelNuevo > nivelAnterior) {
            mostrarSubidaNivel(nivelAnterior, nivelNuevo);
        }

    } catch (err) {
        mostrarToast('ERROR', 'No se pudo completar la misión', 'error');
        elemento.style.pointerEvents = '';
    }
}