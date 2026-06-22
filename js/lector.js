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

        this.init();
    }

    init() {
        const scrollBtn = document.querySelector('.reader-btn[data-mode="scroll"]');
        const pagedBtn = document.querySelector('.reader-btn[data-mode="paged"]');

        if (scrollBtn) scrollBtn.addEventListener('click', () => this.setModo('scroll'));
        if (pagedBtn) pagedBtn.addEventListener('click', () => this.setModo('paged'));
        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.paginaAnterior());
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.paginaSiguiente());

        document.addEventListener('keydown', (e) => {
            if (this.modo === 'paged') {
                if (e.key === 'ArrowLeft') this.paginaAnterior();
                if (e.key === 'ArrowRight') this.paginaSiguiente();
            }
        });
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
    }

    loadPaginas(paginas) {
        this.paginas = paginas;
        this.paginaActual = 0;

        this.readerScroll.innerHTML = paginas.map((p, i) => `<img src="${p}" alt="Página ${i + 1}">`).join('');
        this.readerPaged.innerHTML = `<img src="${paginas[0]}" alt="Página 1">`;

        this.setModo(this.modo);
    }

    updatePaged() {
        if (this.paginas.length === 0) return;

        const img = this.readerPaged.querySelector('img');
        if (img) img.src = this.paginas[this.paginaActual];

        this.pageCounter.textContent = `${this.paginaActual + 1} / ${this.paginas.length}`;
        this.prevBtn.disabled = this.paginaActual === 0;
        this.nextBtn.disabled = this.paginaActual === this.paginas.length - 1;
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
