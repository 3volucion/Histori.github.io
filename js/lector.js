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
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.offsetX = 0;
        this.offsetY = 0;

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

        this.setupTouch();
        this.setupMouse();
    }

    setupTouch() {
        const target = this.readerPaged;

        target.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                this.lastTouchDistance = this.getTouchDistance(e.touches);
            } else if (e.touches.length === 1 && this.zoomLevel > 1) {
                this.isDragging = true;
                this.startX = e.touches[0].clientX - this.offsetX;
                this.startY = e.touches[0].clientY - this.offsetY;
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
            } else if (e.touches.length === 1 && this.isDragging) {
                e.preventDefault();
                this.offsetX = e.touches[0].clientX - this.startX;
                this.offsetY = e.touches[0].clientY - this.startY;
                this.clampOffset();
                this.applyTransform();
            }
        }, { passive: false });

        target.addEventListener('touchend', () => {
            this.isDragging = false;
        });
    }

    setupMouse() {
        const target = this.readerPaged;

        target.addEventListener('mousedown', (e) => {
            if (this.zoomLevel > 1) {
                e.preventDefault();
                this.isDragging = true;
                this.startX = e.clientX - this.offsetX;
                this.startY = e.clientY - this.offsetY;
                target.style.cursor = 'grabbing';
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.offsetX = e.clientX - this.startX;
                this.offsetY = e.clientY - this.startY;
                this.clampOffset();
                this.applyTransform();
            }
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.readerPaged.style.cursor = this.zoomLevel > 1 ? 'grab' : 'default';
        });
    }

    clampOffset() {
        const container = this.readerPaged;
        const img = container.querySelector('img');
        if (!img) return;

        const containerW = container.clientWidth;
        const containerH = container.clientHeight;
        const imgW = img.offsetWidth * this.zoomLevel;
        const imgH = img.offsetHeight * this.zoomLevel;

        const maxX = Math.max(0, imgW - containerW);
        const maxY = Math.max(0, imgH - containerH);

        this.offsetX = Math.max(-maxX, Math.min(0, this.offsetX));
        this.offsetY = Math.max(-maxY, Math.min(0, this.offsetY));
    }

    getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    zoom(delta) {
        this.zoomLevel = Math.max(1, Math.min(3, this.zoomLevel + delta));
        if (this.zoomLevel === 1) {
            this.offsetX = 0;
            this.offsetY = 0;
        }
        this.clampOffset();
        this.applyTransform();
        this.updateZoomDisplay();
    }

    resetZoom() {
        this.zoomLevel = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.applyTransform();
        this.updateZoomDisplay();
    }

    applyTransform() {
        const img = this.readerPaged.querySelector('img');
        if (img) {
            img.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.zoomLevel})`;
        }
        this.readerPaged.style.cursor = this.zoomLevel > 1 ? 'grab' : 'default';
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
        this.resetZoom();
        this.readerPaged.innerHTML = `<img src="${paginas[0]}" alt="Página 1">`;
        this.pageCounter.textContent = `1 / ${paginas.length}`;
        this.prevBtn.disabled = true;
        this.nextBtn.disabled = paginas.length <= 1;
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
