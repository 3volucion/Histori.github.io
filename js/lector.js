class Lector {
    constructor() {
        this.paginas = [];
        this.paginaActual = 0;
        this.modo = 'scroll';
        this.readerScroll = document.querySelector('.reader-scroll');
        this.readerPaged = document.querySelector('.reader-paged');
        this.pageCounter = document.querySelector('.page-counter');
        this.prevBtn = document.querySelector('.page-nav-btn.prev');
        this.nextBtn = document.querySelector('.page-nav-btn.next');
        this.zoomLevel = 1;
        this.lastTouchDistance = 0;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.translateX = 0;
        this.translateY = 0;

        this.init();
    }

    init() {
        const scrollBtn = document.querySelector('.reader-btn[data-mode="scroll"]');
        const pagedBtn = document.querySelector('.reader-btn[data-mode="paged"]');
        const zoomInBtn = document.querySelector('.reader-btn[data-action="zoom-in"]');
        const zoomOutBtn = document.querySelector('.reader-btn[data-action="zoom-out"]');
        const zoomResetBtn = document.querySelector('.reader-btn[data-action="zoom-reset"]');

        if (scrollBtn) {
            scrollBtn.addEventListener('click', () => this.setModo('scroll'));
        }

        if (pagedBtn) {
            pagedBtn.addEventListener('click', () => this.setModo('paged'));
        }

        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => this.zoom(0.2));
        }

        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => this.zoom(-0.2));
        }

        if (zoomResetBtn) {
            zoomResetBtn.addEventListener('click', () => this.resetZoom());
        }

        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.paginaAnterior());
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.paginaSiguiente());
        }

        document.addEventListener('keydown', (e) => {
            if (this.modo === 'paged') {
                if (e.key === 'ArrowLeft') this.paginaAnterior();
                if (e.key === 'ArrowRight') this.paginaSiguiente();
            }
            if (e.key === '+' || e.key === '=') this.zoom(0.2);
            if (e.key === '-') this.zoom(-0.2);
            if (e.key === '0') this.resetZoom();
        });

        this.setupTouchZoom();
        this.setupDoubleClickZoom();
        this.setupDrag();
    }

    setupTouchZoom() {
        const container = document.querySelector('.reader-zoom-container');
        if (!container) return;

        container.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                this.lastTouchDistance = this.getTouchDistance(e.touches);
            }
        }, { passive: false });

        container.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const currentDistance = this.getTouchDistance(e.touches);
                const delta = currentDistance - this.lastTouchDistance;
                if (Math.abs(delta) > 10) {
                    this.zoom(delta > 0 ? 0.1 : -0.1);
                    this.lastTouchDistance = currentDistance;
                }
            }
        }, { passive: false });
    }

    getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    setupDoubleClickZoom() {
        const container = document.querySelector('.reader-zoom-container');
        if (!container) return;

        container.addEventListener('dblclick', (e) => {
            e.preventDefault();
            if (this.zoomLevel > 1) {
                this.resetZoom();
            } else {
                this.zoom(1);
            }
        });
    }

    setupDrag() {
        const container = document.querySelector('.reader-zoom-container');
        if (!container) return;

        container.addEventListener('mousedown', (e) => {
            if (this.zoomLevel > 1) {
                this.isDragging = true;
                this.startX = e.clientX - this.translateX;
                this.startY = e.clientY - this.translateY;
                container.style.cursor = 'grabbing';
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.translateX = e.clientX - this.startX;
                this.translateY = e.clientY - this.startY;
                this.updateTransform();
            }
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            const container = document.querySelector('.reader-zoom-container');
            if (container) container.style.cursor = this.zoomLevel > 1 ? 'grab' : 'default';
        });

        container.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1 && this.zoomLevel > 1) {
                this.isDragging = true;
                this.startX = e.touches[0].clientX - this.translateX;
                this.startY = e.touches[0].clientY - this.translateY;
            }
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            if (this.isDragging && e.touches.length === 1) {
                this.translateX = e.touches[0].clientX - this.startX;
                this.translateY = e.touches[0].clientY - this.startY;
                this.updateTransform();
            }
        }, { passive: true });

        container.addEventListener('touchend', () => {
            this.isDragging = false;
        });
    }

    zoom(delta) {
        this.zoomLevel = Math.max(0.5, Math.min(3, this.zoomLevel + delta));
        this.updateTransform();
        this.updateZoomDisplay();
    }

    resetZoom() {
        this.zoomLevel = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.updateTransform();
        this.updateZoomDisplay();
    }

    updateTransform() {
        const img = document.querySelector('.reader-zoom-container img');
        if (img) {
            img.style.transform = `scale(${this.zoomLevel}) translate(${this.translateX / this.zoomLevel}px, ${this.translateY / this.zoomLevel}px)`;
            const container = document.querySelector('.reader-zoom-container');
            if (container) {
                container.style.cursor = this.zoomLevel > 1 ? 'grab' : 'default';
            }
        }
    }

    updateZoomDisplay() {
        const zoomDisplay = document.querySelector('.zoom-level');
        if (zoomDisplay) {
            zoomDisplay.textContent = `${Math.round(this.zoomLevel * 100)}%`;
        }
    }

    setModo(modo) {
        this.modo = modo;

        document.querySelectorAll('.reader-btn[data-mode]').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.querySelector(`.reader-btn[data-mode="${modo}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        if (modo === 'scroll') {
            this.readerScroll.style.display = 'block';
            this.readerPaged.classList.remove('active');
            this.readerPaged.style.display = 'none';
            document.querySelector('.page-nav').style.display = 'none';
        } else {
            this.readerScroll.style.display = 'none';
            this.readerPaged.style.display = 'block';
            this.readerPaged.classList.add('active');
            document.querySelector('.page-nav').style.display = 'flex';
            this.updatePaged();
        }

        this.resetZoom();
    }

    loadPaginas(paginas) {
        this.paginas = paginas;
        this.paginaActual = 0;

        this.readerScroll.innerHTML = paginas.map(p => `
            <div class="reader-zoom-container">
                <img src="${p}" alt="Página">
            </div>
        `).join('');

        this.readerPaged.innerHTML = `
            <div class="reader-zoom-container">
                <img src="${paginas[0]}" alt="Página">
            </div>
        `;

        this.setupTouchZoom();
        this.setupDoubleClickZoom();
        this.setupDrag();

        this.setModo(this.modo);
    }

    updatePaged() {
        if (this.paginas.length === 0) return;

        const img = this.readerPaged.querySelector('img');
        if (img) {
            img.src = this.paginas[this.paginaActual];
        }

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
