/* ============================================================
    SISTEMA SOLO LEVELING - particles.js
    Fondo animado con partículas tipo sistema RPG
    ============================================================
*/

class ParticleSystem {
    constructor(canvasId) {
        this.canvas     = document.getElementById(canvasId);
        this.ctx        = this.canvas.getContext('2d');
        this.particulas = [];
        this.resize();
        this.init();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {
        this.canvas.width  = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        const cantidad = Math.min(60, Math.floor(window.innerWidth / 20));
        for (let i = 0; i < cantidad; i++) {
            this.particulas.push(this.crearParticula(true));
        }
    }

    crearParticula(aleatoria = false) {
        const colores = [
            'rgba(0, 180, 255,',
            'rgba(123, 47, 255,',
            'rgba(0, 255, 247,',
            'rgba(100, 150, 255,',
        ];
        const color  = colores[Math.floor(Math.random() * colores.length)];
        const tamaño = Math.random() * 2 + 0.5;

        return {
            x:          aleatoria ? Math.random() * this.canvas.width : Math.random() * this.canvas.width,
            y:          aleatoria ? Math.random() * this.canvas.height : this.canvas.height + 10,
            tamaño,
            velocidadX: (Math.random() - 0.5) * 0.3,
            velocidadY: -(Math.random() * 0.4 + 0.1),
            color,
            alpha:       Math.random() * 0.5 + 0.1,
            dirAlpha:    Math.random() > 0.5 ? 1 : -1,
            velocidadAlpha: Math.random() * 0.005 + 0.002,
            // algunos son cuadraditos (estilo HUD)
            esCuadrado: Math.random() > 0.7,
        };
    }

    dibujarParticula(p) {
        this.ctx.save();
        this.ctx.globalAlpha = p.alpha;
        this.ctx.fillStyle   = `${p.color} ${p.alpha})`;
        this.ctx.shadowBlur  = 6;
        this.ctx.shadowColor = `${p.color} 0.8)`;

        if (p.esCuadrado) {
            this.ctx.fillRect(p.x - p.tamaño / 2, p.y - p.tamaño / 2, p.tamaño, p.tamaño);
        } else {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.tamaño, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.restore();
    }

    actualizar() {
        this.particulas.forEach((p, i) => {
            p.x     += p.velocidadX;
            p.y     += p.velocidadY;
            p.alpha += p.velocidadAlpha * p.dirAlpha;

            if (p.alpha >= 0.6 || p.alpha <= 0.05) {
                p.dirAlpha *= -1;
            }

            // Reciclar partícula si sale del canvas
            if (p.y < -10 || p.x < -10 || p.x > this.canvas.width + 10) {
                this.particulas[i] = this.crearParticula(false);
            }
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particulas.forEach(p => this.dibujarParticula(p));
        this.actualizar();
        requestAnimationFrame(() => this.animate());
    }

    // Explosión de partículas en una posición (ej: al completar una misión)
    burst(x, y, cantidad = 12) {
        for (let i = 0; i < cantidad; i++) {
            const angulo    = (Math.PI * 2 / cantidad) * i;
            const velocidad = Math.random() * 2 + 1;
            this.particulas.push({
                x, y,
                tamaño:         Math.random() * 3 + 1,
                velocidadX:     Math.cos(angulo) * velocidad,
                velocidadY:     Math.sin(angulo) * velocidad - 1,
                color:          'rgba(0, 255, 136,',
                alpha:          0.9,
                dirAlpha:       -1,
                velocidadAlpha: 0.02,
                esCuadrado:     false,
                burst:          true,
            });
        }
    }
}