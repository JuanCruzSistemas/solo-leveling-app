/* ============================================================
    SISTEMA SOLO LEVELING - api.js
    Todas las llamadas al backend Spring Boot
    ============================================================
*/

const API_BASE = 'https://solo-leveling-api-production.up.railway.app/api';
//const API_BASE = 'http://localhost:8080/api';
const ID_USUARIO = 1; // Juanchi - usuario fijo

const API = {

    // ── Usuario ──────────────────────────────────────────────────
    async obtenerPerfil() {
        const res = await fetch(`${API_BASE}/users/${ID_USUARIO}/profile`);
        if (!res.ok) throw new Error('Error al obtener perfil');
        return res.json();
    },

    // ── Actividades ──────────────────────────────────────────────
    async obtenerTiposActividad() {
        const res = await fetch(`${API_BASE}/activities/types`);
        if (!res.ok) throw new Error('Error al obtener tipos de actividad');
        return res.json();
    },

    async registrarActividad(activityTypeId, durationMinutes = null, notes = null) {
        const cuerpo = { activityTypeId };
        if (durationMinutes) cuerpo.durationMinutes = durationMinutes;
        if (notes) cuerpo.notes = notes;

        const res = await fetch(`${API_BASE}/activities/log/${ID_USUARIO}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cuerpo),
        });
        if (!res.ok) throw new Error('Error al registrar actividad');
        return res.json();
    },

    async obtenerHistorialActividad() {
        const res = await fetch(`${API_BASE}/activities/history/${ID_USUARIO}`);
        if (!res.ok) throw new Error('Error al obtener historial de actividad');
        return res.json();
    },

    // ── Misiones ─────────────────────────────────────────────────
    async obtenerMisionesDialias() {
        const res = await fetch(`${API_BASE}/quests/daily/${ID_USUARIO}`);
        if (!res.ok) throw new Error('Error al obtener misiones diarias');
        return res.json();
    },

    async obtenerMisionesSemanales() {
        const res = await fetch(`${API_BASE}/quests/weekly/${ID_USUARIO}`);
        if (!res.ok) throw new Error('Error al obtener misiones semanales');
        return res.json();
    },

    async obtenerMisionesHistoria() {
        const res = await fetch(`${API_BASE}/quests/story/${ID_USUARIO}`);
        if (!res.ok) throw new Error('Error al obtener misiones de historia');
        return res.json();
    },

    async completarMision(userQuestId) {
        const res = await fetch(`${API_BASE}/quests/complete/${ID_USUARIO}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userQuestId }),
        });
        if (!res.ok) throw new Error('Error al completar misión');
        return res.text();
    },

    // ── Estadísticas ─────────────────────────────────────────────
    async obtenerEstadisticas() {
        const res = await fetch(`${API_BASE}/stats/${ID_USUARIO}`);
        if (!res.ok) throw new Error('Error al obtener estadísticas');
        return res.json();
    },

    async obtenerHistorialNivel() {
        const res = await fetch(`${API_BASE}/stats/${ID_USUARIO}/level-history`);
        if (!res.ok) throw new Error('Error al obtener historial de niveles');
        return res.json();
    },

    // ── Mazmorras ────────────────────────────────────────────────
    async obtenerMazmorraActiva() {
        const res = await fetch(`${API_BASE}/dungeons/active/${ID_USUARIO}`);
        if (res.status === 204) return null;
        if (!res.ok) throw new Error('Error al obtener mazmorra activa');
        return res.json();
    },

    async completarMazmorra(userDungeonId) {
        const res = await fetch(
            `${API_BASE}/dungeons/complete/${ID_USUARIO}/${userDungeonId}`,
            { method: 'POST' }
        );
        if (!res.ok) throw new Error('Error al completar mazmorra');
        return res.json();
    },

    async rechazarMazmorra(userDungeonId) {
        const res = await fetch(
            `${API_BASE}/dungeons/reject/${ID_USUARIO}/${userDungeonId}`,
            { method: 'POST' }
        );
        if (!res.ok) throw new Error('Error al rechazar mazmorra');
    },

    async obtenerHistorialMazmorras() {
        const res = await fetch(`${API_BASE}/dungeons/history/${ID_USUARIO}`);
        if (!res.ok) throw new Error('Error al obtener historial de mazmorras');
        return res.json();
    },
};