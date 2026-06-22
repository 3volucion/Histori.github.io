class Lector {
    constructor() {
        this.paginas = [];
        this.paginaActual = 0;
        this.readerPaged = document.querySelector('.reader-paged');
        this.pageCounter = document.querySelector('.page-counter');
        this.prevBtn = document.querySelector('.page-nav-btn.prev');
        this.nextBtn = document.querySelector('.page-nav-btn.next');
        this.zoomLevel = 1;
        this.lastTouchDistance = 0;

        this.init();
    }

    init() {
        const zoomInBtn = document.querySelector('.reader-btn[data-action="zoom-in"]');
        const zoomOutBtn = document.querySelector('.reader-btn[data-action="zoom-out"]');
        const zoomResetBtn = document.querySelector('.reader-btn[data-action="zoom-reset"]');

        if (zoomInBtn) zoomInBtn.addEventListener('click', () => this.zoom(0.3));
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => this.zoom(-0.3));
        if (zoomResetBtn) zoomResetBtn.addEventListener('click', () => this.resetZoom());

        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.paginaAnterior());
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.paginaSiguiente());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.paginaAnterior();
            if (e.key === 'ArrowRight') this.paginaSiguiente();
            if (e.key === '+' || e.key === '=') this.zoom(0.3);
            if (e.key === '-') this.zoom(-0.3);
            if (e.key === '0') this.resetZoom();
        });

        this.setupPinchZoom();
    }

    setupPinchZoom() {
        const target = this.readerPaged;
        if (!target) return;

        target.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                this.lastTouchDistance = this.getTouchDistance(e.touches);
            }
        }, { passive: false });

        target.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const dist = this.getTouchDistance(e.touches);
                const delta = dist - this.lastTouchDistance;
                if (Math.abs(delta) > 10) {
                    this.zoom(delta > 0 ? 0.1 : -0.1);
                    this.lastTouchDistance = dist;
                }
            }
        }, { passive: false });
    }

    getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    zoom(delta) {
        this.zoomLevel = Math.max(1, Math.min(3, this.zoomLevel + delta));
        this.applyZoom();
    }

    resetZoom() {
        this.zoomLevel = 1;
        this.applyZoom();
    }

    applyZoom() {
        const img = this.readerPaged.querySelector('img');
        if (img) {
            img.style.transform = `scale(${this.zoomLevel})`;
            img.style.transformOrigin = 'top center';
        }
        this.readerPaged.style.overflow = this.zoomLevel > 1 ? 'auto' : 'hidden';
        this.updateZoomDisplay();
    }

    updateZoomDisplay() {
        const display = document.querySelector('.zoom-level');
        if (display) {
            display.textContent = `${Math.round(this.zoomLevel * 100)}%`;
        }
    }

    loadPaginas(paginas) {
        this.paginas = paginas;
        this.paginaActual = 0;
        this.readerPaged.innerHTML = `<img src="${paginas[0]}" alt="Página 1">`;
        this.updatePaged();
    }

    updatePaged() {
        if (this.paginas.length === 0) return;

        const img = this.readerPaged.querySelector('img');
        if (img) img.src = this.paginas[this.paginaActual];

        this.pageCounter.textContent = `${this.paginaActual + 1} / ${this.paginas.length}`;
        this.prevBtn.disabled = this.paginaActual === 0;
        this.nextBtn.disabled = this.paginaActual === this.paginas.length - 1;
        this.resetZoom();
    }

    paginaAnterior() {
        if (this.paginaActual > 0) {
            this.paginaActual--;
            this.updatePaged();
        }
    }

    paginaSiguiente() {
        if (this.paginaActual < this.paginas.length - 1) {
            this.paginaActual++;
            this.updatePaged();
        }
    }
}

const lector = new Lector();
