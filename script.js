// ============================================
// MAIN SCRIPT - HOME PAGE FUNCTIONALITY
// ============================================

// ============================================
// THEME SYSTEM
// ============================================

class ThemeManager {
    constructor() {
        this.themes = ['dark', 'light', 'blackpink'];
        this.defaultTheme = 'dark';
        this.currentTheme = this.loadTheme();
        this.init();
    }

    loadTheme() {
        const saved = localStorage.getItem('theme');
        if (saved && this.themes.includes(saved)) {
            return saved;
        }
        return this.defaultTheme;
    }

    saveTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    setTheme(theme) {
        if (!this.themes.includes(theme)) {
            console.error(`Theme '${theme}' tidak tersedia`);
            return;
        }

        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        this.saveTheme(theme);
        this.updateThemeToggle();
        console.log(`Theme berubah ke: ${theme}`);
    }

    getNextTheme() {
        const currentIndex = this.themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        return this.themes[nextIndex];
    }

    getThemeEmoji() {
        switch (this.currentTheme) {
            case 'light': return '☀️';
            case 'dark': return '🌙';
            case 'blackpink': return '🩷';
            default: return '🌙';
        }
    }

    updateThemeToggle() {
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.textContent = this.getThemeEmoji();
        }
    }

    init() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeToggle();
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// ============================================
// NAVBAR FUNCTIONALITY
// ============================================

class NavbarManager {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('navbar-menu');
        this.themeToggle = document.getElementById('theme-toggle');
        this.init();
    }

    init() {
        // Hamburger menu toggle
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => this.toggleMenu());
        }

        // Close menu when clicking nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Theme toggle
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Scroll effect on navbar
        window.addEventListener('scroll', () => this.handleScroll());

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.navbar-container')) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.hamburger.classList.toggle('active');
        this.navMenu.classList.toggle('active');
    }

    closeMenu() {
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
    }

    toggleTheme() {
        const nextTheme = themeManager.getNextTheme();
        themeManager.setTheme(nextTheme);
    }

    handleScroll() {
        if (window.scrollY > 100) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }

    updateAuthButton(isLoggedIn, userName) {
        const navButton = document.getElementById('nav-button');
        if (navButton) {
            if (isLoggedIn) {
                navButton.textContent = 'Dashboard';
                navButton.href = 'dashboard.html';
            } else {
                navButton.textContent = 'Login';
                navButton.href = 'login.html';
            }
        }
    }
}

// Initialize navbar
const navbarManager = new NavbarManager();

// ============================================
// STUDENTS SECTION
// ============================================

class StudentsSection {
    constructor() {
        this.container = document.getElementById('students-grid');
        this.searchInput = document.getElementById('search-input');
        this.emptyState = document.getElementById('empty-state');
        this.allStudents = window.studentsData.students;
        this.filteredStudents = this.allStudents;
        this.init();
    }

    init() {
        this.render();
        this.setupSearch();
        this.setupModal();
    }

    render() {
        if (this.filteredStudents.length === 0) {
            this.container.innerHTML = '';
            this.emptyState.style.display = 'block';
            return;
        }

        this.emptyState.style.display = 'none';
        this.container.innerHTML = this.filteredStudents.map(student => `
            <div class="student-card" data-id="${student.id}">
                <img 
                    src="${this.getStudentImage(student)}" 
                    alt="${student.name}" 
                    class="student-card-image"
                    loading="lazy"
                >
                <div class="student-card-body">
                    <div class="student-card-number">#${student.attendance}</div>
                    <h3 class="student-card-name">${student.name}</h3>
                    <span class="student-card-status ${this.getStatusClass(student)}">${student.status}</span>
                </div>
            </div>
        `).join('');

        // Add click listeners
        this.container.querySelectorAll('.student-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = parseInt(card.dataset.id);
                const student = window.studentsData.getStudentById(id);
                this.showModal(student);
            });
        });
    }

    setupSearch() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                this.filteredStudents = this.allStudents.filter(student => {
                    return student.name.toLowerCase().includes(query) ||
                           student.attendance.includes(query);
                });
                this.render();
            });
        }
    }

    setupModal() {
        const modal = document.getElementById('student-modal');
        const modalClose = document.getElementById('modal-close');

        if (modalClose) {
            modalClose.addEventListener('click', () => this.hideModal());
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
            }
        });
    }

    showModal(student) {
        const modal = document.getElementById('student-modal');
        const profile = document.getElementById('student-profile');

        const statusClass = this.getStatusClass(student);
        
        profile.innerHTML = `
            <div class="student-profile-header">
                <img 
                    src="${this.getStudentImage(student)}" 
                    alt="${student.name}" 
                    class="student-profile-image"
                >
                <h2 class="student-profile-name">${student.name}</h2>
                <div class="student-profile-meta">
                    <span><strong>Nomor Absen:</strong> ${student.attendance}</span>
                    <span><strong>Kelas:</strong> 11 RPL 1</span>
                </div>
                <div class="student-profile-status ${statusClass}">
                    ${student.status}
                </div>
            </div>

            ${student.bio ? `
                <div class="student-profile-section">
                    <h4>Bio</h4>
                    <p>${student.bio}</p>
                </div>
            ` : ''}

            ${student.quote ? `
                <div class="student-profile-section">
                    <h4>Quote</h4>
                    <p><em>"${student.quote}"</em></p>
                </div>
            ` : ''}
        `;

        modal.classList.add('active');
    }

    hideModal() {
        const modal = document.getElementById('student-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    getStudentImage(student) {
        // Try to load student photo, fall back to placeholder
        return `${student.photo}`;
    }

    getStatusClass(student) {
        return student.status === 'Member' ? 'member' : '';
    }
}

// Initialize students section
const studentsSection = new StudentsSection();

// ============================================
// GALLERY SECTION
// ============================================

class GallerySection {
    constructor() {
        this.container = document.getElementById('gallery-grid');
        this.emptyState = document.getElementById('gallery-empty');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.currentFilter = 'all';
        this.gallery = [];
        this.init();
    }

    init() {
        this.setupFilters();
        this.loadGallery();
    }

    setupFilters() {
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.render();
            });
        });
    }

    loadGallery() {
        // Gallery will be loaded from Supabase when configured
        // For now, show empty state
        this.gallery = [];
        this.render();
    }

    render() {
        const filtered = this.currentFilter === 'all' 
            ? this.gallery 
            : this.gallery.filter(item => item.category === this.currentFilter);

        if (filtered.length === 0) {
            this.container.innerHTML = '';
            this.emptyState.style.display = 'block';
            return;
        }

        this.emptyState.style.display = 'none';
        this.container.innerHTML = filtered.map((item, index) => `
            <div class="gallery-item" data-index="${index}">
                <img 
                    src="${item.image_url}" 
                    alt="${item.caption}" 
                    class="gallery-item-image"
                    loading="lazy"
                >
                <div class="gallery-item-overlay">
                    <p class="gallery-item-caption">${item.caption}</p>
                    <p class="gallery-item-uploader">by ${item.uploader}</p>
                </div>
            </div>
        `).join('');

        // Add click listeners for lightbox
        this.container.querySelectorAll('.gallery-item').forEach((item) => {
            item.addEventListener('click', (e) => {
                const index = parseInt(item.dataset.index);
                this.showLightbox(index, filtered);
            });
        });
    }

    showLightbox(index, items) {
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.classList.add('active');
            this.updateLightbox(index, items);
            this.setupLightboxControls(index, items);
        }
    }

    updateLightbox(index, items) {
        const img = document.getElementById('lightbox-img');
        const caption = document.getElementById('lightbox-caption');
        const uploader = document.getElementById('lightbox-uploader');

        const item = items[index];
        img.src = item.image_url;
        caption.textContent = item.caption;
        uploader.textContent = `by ${item.uploader}`;
    }

    setupLightboxControls(index, items) {
        const lightbox = document.getElementById('lightbox');
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');

        closeBtn.onclick = () => lightbox.classList.remove('active');

        prevBtn.onclick = () => {
            const newIndex = (index - 1 + items.length) % items.length;
            this.updateLightbox(newIndex, items);
            index = newIndex;
        };

        nextBtn.onclick = () => {
            const newIndex = (index + 1) % items.length;
            this.updateLightbox(newIndex, items);
            index = newIndex;
        };

        lightbox.onclick = (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
            }
        };
    }
}

// Initialize gallery section
const gallerySection = new GallerySection();

// ============================================
// RANDOM ZONE
// ============================================

class RandomZone {
    constructor() {
        this.init();
    }

    init() {
        this.setupRandomStudent();
        this.setupRandomQuote();
        this.setupRandomFact();
        this.setupRandomChallenge();
    }

    setupRandomStudent() {
        const btn = document.getElementById('random-student-btn');
        const display = document.getElementById('random-student-display');

        if (btn) {
            btn.addEventListener('click', () => {
                const student = window.studentsData.getRandomStudent();
                display.innerHTML = `
                    <div class="random-student-result">
                        <img 
                            src="${this.getStudentImage(student)}" 
                            alt="${student.name}" 
                            class="random-student-image"
                        >
                        <div class="random-student-name">${student.name}</div>
                        <div class="random-student-attendance">Absen: ${student.attendance}</div>
                    </div>
                `;
            });
        }
    }

    setupRandomQuote() {
        const btn = document.getElementById('random-quote-btn');
        const display = document.getElementById('random-quote-display');

        if (btn) {
            btn.addEventListener('click', () => {
                const quote = window.studentsData.getRandomQuote();
                display.innerHTML = `<p class="quote-text">"${quote}"</p>`;
            });
        }
    }

    setupRandomFact() {
        const btn = document.getElementById('random-fact-btn');
        const display = document.getElementById('random-fact-display');

        if (btn) {
            btn.addEventListener('click', () => {
                const fact = window.studentsData.getRandomFact();
                display.innerHTML = `<p class="fact-text">${fact}</p>`;
            });
        }
    }

    setupRandomChallenge() {
        const btn = document.getElementById('random-challenge-btn');
        const display = document.getElementById('random-challenge-display');

        if (btn) {
            btn.addEventListener('click', () => {
                const challenge = window.studentsData.getRandomChallenge();
                display.innerHTML = `<p class="challenge-text">${challenge}</p>`;
            });
        }
    }

    getStudentImage(student) {
        return window.studentsData.getPlaceholderImageUrl(student.name, 120);
    }
}

// Initialize random zone
const randomZone = new RandomZone();

// ============================================
// LIVE MOMENT - CLOCK & QUOTE
// ============================================

class LiveMoment {
    constructor() {
        this.clockElement = document.getElementById('clock-time');
        this.dateElement = document.getElementById('clock-date');
        this.quoteElement = document.getElementById('moment-quote-text');
        this.init();
    }

    init() {
        this.updateClock();
        this.updateQuote();

        // Update clock every second
        setInterval(() => this.updateClock(), 1000);

        // Update quote every minute
        setInterval(() => this.updateQuote(), 60000);
    }

    updateClock() {
        if (!this.clockElement) return;

        const now = new Date();
        const time = now.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const date = now.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        if (this.clockElement) this.clockElement.textContent = time;
        if (this.dateElement) this.dateElement.textContent = date;
    }

    updateQuote() {
        if (!this.quoteElement) return;
        const quote = window.studentsData.getRandomQuote();
        this.quoteElement.textContent = `"${quote}"`;
    }
}

// Initialize live moment
const liveMoment = new LiveMoment();

// ============================================
// HERO PARTICLES ANIMATION
// ============================================

class ParticlesAnimation {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (this.container) {
            this.init();
        }
    }

    init() {
        const particleCount = Math.floor(Math.random() * 30) + 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 4 + 2;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            
            particle.style.animationDuration = Math.random() * 6 + 4 + 's';
            particle.style.animationDelay = Math.random() * 2 + 's';
            
            this.container.appendChild(particle);
        }
    }
}

// Initialize particles
new ParticlesAnimation('particles');
new ParticlesAnimation('auth-particles');

// ============================================
// SCROLL ANIMATIONS
// ============================================

class ScrollAnimation {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        // Observe all stat cards and sections
        document.querySelectorAll('.stat-card, .intro-card, .timeline-content').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });
    }
}

// Initialize scroll animations
new ScrollAnimation();

// ============================================
// INIT - CHECK LOGIN STATUS
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in (from auth.js)
    if (typeof checkLoginStatus === 'function') {
        checkLoginStatus();
    }
});

console.log('Main script loaded');
