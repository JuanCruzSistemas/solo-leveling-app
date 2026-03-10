/* ============================================================
    SISTEMA SOLO LEVELING - profile.js
    Sección de perfil y estadísticas
    ============================================================
*/

async function renderProfile() {
    try {
        EstadoApp.perfil = await API.obtenerPerfil();
        const p = EstadoApp.perfil;

        // ── Nombre y nivel ───────────────────────────────────────
        document.getElementById('profile-name').textContent  = p.displayName;
        document.getElementById('profile-level').textContent = p.level;

        // ── Barra de EXP ─────────────────────────────────────────
        const porcentaje = Math.min(100, Math.round((p.currentExp / p.expToNext) * 100));
        document.getElementById('exp-current').textContent = p.currentExp;
        document.getElementById('exp-next').textContent    = p.expToNext;
        document.getElementById('exp-pct').textContent     = `${porcentaje}%`;

        const barra = document.getElementById('exp-bar-fill');
        setTimeout(() => { barra.style.width = `${porcentaje}%`; }, 100);

        // ── Racha ────────────────────────────────────────────────
        document.getElementById('streak-value').textContent = p.streakDays;

        // ── Estadísticas ─────────────────────────────────────────
        const maxStat = 100; // referencia visual para la barra
        const estadisticas = [
            { id: 'stat-int', valor: p.intelligence, cls: 'int' },
            { id: 'stat-str', valor: p.strength,     cls: 'str' },
            { id: 'stat-end', valor: p.endurance,    cls: 'end' },
            { id: 'stat-dis', valor: p.discipline,   cls: 'dis' },
            { id: 'stat-skl', valor: p.skill,        cls: 'skl' },
        ];

        estadisticas.forEach(st => {
            const elValor = document.getElementById(`${st.id}-val`);
            const elBarra = document.getElementById(`${st.id}-bar`);
            if (elValor) elValor.textContent = st.valor;
            if (elBarra) {
                const pctStat = Math.min(100, Math.round((st.valor / maxStat) * 100));
                setTimeout(() => {
                    elBarra.style.width = `${Math.max(pctStat, st.valor > 0 ? 3 : 0)}%`;
                }, 150);
            }
        });

    } catch (err) {
        console.error('Error al renderizar perfil:', err);
    }
}