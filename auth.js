// ============================================
// AUTHENTICATION & SESSION MANAGEMENT
// ============================================

// ============================================
// AUTH MANAGER
// ============================================

class AuthManager {
    constructor() {
        this.user = null;
        this.profile = null;
        this.sessionCheckInterval = null;
    }

    async init() {
        // Get Supabase client
        const supabase = window.supabaseConfig?.getClient?.();
        
        if (!supabase) {
            console.warn('Supabase not configured. Auth features disabled.');
            return;
        }

        // Check current session
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                this.user = session.user;
                await this.loadProfile();
            }
        } catch (error) {
            console.error('Error checking session:', error);
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (session) {
                this.user = session.user;
                await this.loadProfile();
                this.updateUI();
            } else {
                this.user = null;
                this.profile = null;
                this.updateUI();
            }
        });

        // Check session every 5 minutes
        this.sessionCheckInterval = setInterval(() => this.checkSession(), 300000);
    }

    async loadProfile() {
        if (!this.user) return;

        const supabase = window.supabaseConfig?.getClient?.();
        if (!supabase) return;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', this.user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            this.profile = data || null;
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    async checkSession() {
        const supabase = window.supabaseConfig?.getClient?.();
        if (!supabase) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session && this.user) {
                // Session expired
                this.logout();
            }
        } catch (error) {
            console.error('Error checking session:', error);
        }
    }

    async logout() {
        const supabase = window.supabaseConfig?.getClient?.();
        if (!supabase) return;

        try {
            await supabase.auth.signOut();
            this.user = null;
            this.profile = null;
            this.updateUI();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error logging out:', error);
        }
    }

    isLoggedIn() {
        return this.user !== null;
    }

    updateUI() {
        // Update navbar button
        if (typeof navbarManager !== 'undefined') {
            navbarManager.updateAuthButton(this.isLoggedIn(), this.profile?.name);
        }
    }

    clearSessionCheck() {
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval);
        }
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// ============================================
// LOGIN PAGE
// ============================================

class LoginPage {
    constructor() {
        this.form = document.getElementById('login-form');
        this.emailInput = document.getElementById('login-email');
        this.passwordInput = document.getElementById('login-password');
        this.passwordToggle = document.getElementById('login-password-toggle');
        this.submitBtn = document.getElementById('login-submit');
        this.errorDiv = document.getElementById('login-error');

        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        if (this.passwordToggle) {
            this.passwordToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.togglePasswordVisibility();
            });
        }

        // Clear error on input
        [this.emailInput, this.passwordInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => this.clearError());
            }
        });
    }

    togglePasswordVisibility() {
        const type = this.passwordInput.type === 'password' ? 'text' : 'password';
        this.passwordInput.type = type;
        this.passwordToggle.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
    }

    clearError() {
        if (this.errorDiv) {
            this.errorDiv.textContent = '';
        }
    }

    showError(message) {
        if (this.errorDiv) {
            this.errorDiv.textContent = message;
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        this.clearError();

        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;

        // Validation
        if (!email || !password) {
            this.showError('Email dan password harus diisi');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showError('Format email tidak valid');
            return;
        }

        // Disable button
        this.submitBtn.disabled = true;
        this.submitBtn.textContent = 'Loading...';

        try {
            const supabase = window.supabaseConfig?.getClient?.();
            if (!supabase) {
                this.showError('Supabase belum dikonfigurasi. Hubungi admin.');
                return;
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                // Friendly error messages
                if (error.message.includes('Invalid login credentials')) {
                    this.showError('Email atau password salah');
                } else if (error.message.includes('Email not confirmed')) {
                    this.showError('Silakan verifikasi email Anda terlebih dahulu');
                } else {
                    this.showError(error.message || 'Login gagal. Silakan coba lagi.');
                }
                console.error('Login error:', error);
                return;
            }

            if (data.user) {
                // Load auth manager
                await authManager.init();
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            }
        } catch (error) {
            this.showError('Terjadi kesalahan. Silakan coba lagi.');
            console.error('Unexpected error:', error);
        } finally {
            this.submitBtn.disabled = false;
            this.submitBtn.textContent = 'Login';
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// ============================================
// REGISTER PAGE
// ============================================

class RegisterPage {
    constructor() {
        this.form = document.getElementById('register-form');
        this.nameInput = document.getElementById('register-name');
        this.attendanceSelect = document.getElementById('register-attendance');
        this.emailInput = document.getElementById('register-email');
        this.passwordInput = document.getElementById('register-password');
        this.confirmPasswordInput = document.getElementById('register-confirm-password');
        this.passwordToggle = document.getElementById('register-password-toggle');
        this.confirmPasswordToggle = document.getElementById('register-confirm-password-toggle');
        this.submitBtn = document.getElementById('register-submit');
        this.errorDiv = document.getElementById('register-error');
        this.attendanceError = document.getElementById('attendance-error');

        if (this.form) {
            this.init();
        }
    }

    init() {
        this.populateAttendanceSelect();
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        if (this.passwordToggle) {
            this.passwordToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.togglePasswordVisibility('register-password');
            });
        }

        if (this.confirmPasswordToggle) {
            this.confirmPasswordToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.togglePasswordVisibility('register-confirm-password');
            });
        }

        // Clear error on input
        [this.nameInput, this.attendanceSelect, this.emailInput, this.passwordInput, this.confirmPasswordInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => this.clearError());
            }
        });
    }

    populateAttendanceSelect() {
        const attendances = window.studentsData?.attendanceNumbers || [];
        
        attendances.forEach(num => {
            const option = document.createElement('option');
            option.value = num;
            option.textContent = `${num} - Siswa ${num}`;
            this.attendanceSelect.appendChild(option);
        });
    }

    togglePasswordVisibility(inputId) {
        const input = document.getElementById(inputId);
        const toggle = document.getElementById(`${inputId}-toggle`);
        
        if (input) {
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            if (toggle) {
                toggle.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
            }
        }
    }

    clearError() {
        if (this.errorDiv) {
            this.errorDiv.textContent = '';
        }
        if (this.attendanceError) {
            this.attendanceError.style.display = 'none';
            this.attendanceError.textContent = '';
        }
    }

    showError(message, field = 'general') {
        if (field === 'attendance') {
            if (this.attendanceError) {
                this.attendanceError.textContent = message;
                this.attendanceError.style.display = 'block';
            }
        } else {
            if (this.errorDiv) {
                this.errorDiv.textContent = message;
            }
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        this.clearError();

        const name = this.nameInput.value.trim();
        const attendance = this.attendanceSelect.value;
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;
        const confirmPassword = this.confirmPasswordInput.value;

        // Validation
        if (!name || !attendance || !email || !password || !confirmPassword) {
            this.showError('Semua field harus diisi');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showError('Format email tidak valid');
            return;
        }

        if (password.length < 6) {
            this.showError('Password minimal 6 karakter');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('Password tidak cocok');
            return;
        }

        // Disable button
        this.submitBtn.disabled = true;
        this.submitBtn.textContent = 'Loading...';

        try {
            const supabase = window.supabaseConfig?.getClient?.();
            if (!supabase) {
                this.showError('Supabase belum dikonfigurasi. Hubungi admin.');
                return;
            }

            // Check if attendance number already exists
            const { data: existingProfiles, error: checkError } = await supabase
                .from('profiles')
                .select('id')
                .eq('attendance_number', parseInt(attendance))
                .limit(1);

            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError;
            }

            if (existingProfiles && existingProfiles.length > 0) {
                this.showError('Nomor absen tersebut sudah digunakan', 'attendance');
                this.submitBtn.disabled = false;
                this.submitBtn.textContent = 'Register';
                return;
            }

            // Sign up
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name,
                        attendance_number: parseInt(attendance)
                    }
                }
            });

            if (error) {
                if (error.message.includes('already registered')) {
                    this.showError('Email sudah terdaftar');
                } else {
                    this.showError(error.message || 'Register gagal. Silakan coba lagi.');
                }
                console.error('Register error:', error);
                return;
            }

            if (data.user) {
                // Create profile
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            id: data.user.id,
                            name: name,
                            attendance_number: parseInt(attendance),
                            email: email,
                            role: 'student',
                            avatar_url: null,
                            bio: '',
                            quote: ''
                        }
                    ]);

                if (profileError) {
                    console.error('Profile creation error:', profileError);
                    // User created but profile failed - still allow login
                }

                // Show success and redirect
                this.showSuccess('Akun berhasil dibuat! Silakan login.');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
        } catch (error) {
            this.showError('Terjadi kesalahan. Silakan coba lagi.');
            console.error('Unexpected error:', error);
        } finally {
            this.submitBtn.disabled = false;
            this.submitBtn.textContent = 'Register';
        }
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'form-success';
        successDiv.textContent = message;
        this.form.prepend(successDiv);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// ============================================
// PAGE TYPE DETECTION & INITIALIZATION
// ============================================

function detectPageType() {
    const path = window.location.pathname;
    if (path.includes('login')) return 'login';
    if (path.includes('register')) return 'register';
    if (path.includes('dashboard')) return 'dashboard';
    return 'home';
}

// ============================================
// CHECK LOGIN STATUS
// ============================================

async function checkLoginStatus() {
    const pageType = detectPageType();
    
    // Initialize auth manager
    await authManager.init();

    const isLoggedIn = authManager.isLoggedIn();
    
    // Redirect logic
    if (pageType === 'login' || pageType === 'register') {
        if (isLoggedIn) {
            window.location.href = 'dashboard.html';
        }
    } else if (pageType === 'dashboard') {
        if (!isLoggedIn) {
            window.location.href = 'login.html';
        }
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Check if Supabase is configured
    if (!window.supabaseConfig?.isConfigured) {
        console.warn('⚠️ Supabase belum dikonfigurasi. Silakan ikuti langkah di README.md');
    }

    // Initialize auth
    await checkLoginStatus();

    // Initialize page-specific components
    const pageType = detectPageType();
    
    if (pageType === 'login') {
        new LoginPage();
    } else if (pageType === 'register') {
        new RegisterPage();
    } else if (pageType === 'dashboard') {
        if (typeof initDashboard === 'function') {
            initDashboard();
        }
    }
});

// ============================================
// LOGOUT HANDLER
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            authManager.logout();
        });
    }
});

console.log('Auth script loaded');
