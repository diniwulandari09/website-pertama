// ============================================
// DASHBOARD FUNCTIONALITY
// ============================================

class DashboardManager {
    constructor() {
        this.user = null;
        this.profile = null;
        this.userPhotos = [];
        this.photoToDelete = null;
        this.init();
    }

    async init() {
        // Load user data
        await this.loadUserData();
        
        // Setup event listeners
        this.setupNavigation();
        this.setupProfileForm();
        this.setupUploadForm();
        this.setupGallery();
        this.setupDeleteModal();
        
        // Load initial data
        await this.loadProfile();
        await this.loadUserPhotos();
        
        // Update UI
        this.updateDashboard();
    }

    async loadUserData() {
        // Get user from auth manager
        if (window.authManager) {
            this.user = window.authManager.user;
            this.profile = window.authManager.profile;
        }

        if (!this.user) {
            window.location.href = 'login.html';
            return;
        }
    }

    async loadProfile() {
        const supabase = window.supabaseConfig?.getClient?.();
        if (!supabase || !this.user) return;

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

    async loadUserPhotos() {
        const supabase = window.supabaseConfig?.getClient?.();
        if (!supabase || !this.user) return;

        try {
            const { data, error } = await supabase
                .from('gallery')
                .select('*')
                .eq('user_id', this.user.id)
                .order('created_at', { ascending: false });

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            this.userPhotos = data || [];
        } catch (error) {
            console.error('Error loading photos:', error);
            this.userPhotos = [];
        }
    }

    setupNavigation() {
        const links = document.querySelectorAll('.sidebar-link');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href').substring(1);
                this.showView(target);
                
                // Update active state
                links.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    showView(viewName) {
        const views = document.querySelectorAll('.dashboard-view');
        views.forEach(view => {
            view.style.display = 'none';
        });

        const targetView = document.getElementById(viewName);
        if (targetView) {
            targetView.style.display = 'block';
            
            // Load gallery if switching to it
            if (viewName === 'dashboard-gallery') {
                this.renderUserGallery();
            }
        }
    }

    updateDashboard() {
        if (!this.profile) return;

        // Update sidebar
        const avatar = document.getElementById('sidebar-avatar');
        const name = document.getElementById('sidebar-name');
        
        if (avatar) avatar.src = this.profile.avatar_url || this.getPlaceholderImage();
        if (name) name.textContent = this.profile.name || 'User';

        // Update main dashboard
        document.getElementById('welcome-name').textContent = this.profile.name || 'User';
        document.getElementById('dashboard-name').textContent = this.profile.name || '-';
        document.getElementById('dashboard-attendance').textContent = this.profile.attendance_number || '-';
        document.getElementById('dashboard-email').textContent = this.profile.email || '-';
        document.getElementById('dashboard-photo-count').textContent = `Anda telah mengunggah ${this.userPhotos.length} foto`;

        // Update profile view
        const profileAvatar = document.getElementById('profile-avatar-large');
        if (profileAvatar) profileAvatar.src = this.profile.avatar_url || this.getPlaceholderImage();
        document.getElementById('profile-name').textContent = this.profile.name || '-';
        document.getElementById('profile-attendance').textContent = `Absen: ${this.profile.attendance_number || '-'}`;
        document.getElementById('profile-email').textContent = `Email: ${this.profile.email || '-'}`;
        document.getElementById('profile-bio').textContent = this.profile.bio || 'Belum ada bio';
        document.getElementById('profile-quote').textContent = this.profile.quote || 'Belum ada quote';

        // Update edit form
        document.getElementById('edit-name').value = this.profile.name || '';
        document.getElementById('edit-bio').value = this.profile.bio || '';
        document.getElementById('edit-quote').value = this.profile.quote || '';
    }

    setupProfileForm() {
        const form = document.getElementById('edit-profile-form');
        if (!form) return;

        form.addEventListener('submit', (e) => this.handleProfileSubmit(e));

        // Avatar preview
        const avatarInput = document.getElementById('edit-avatar');
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => this.previewAvatar(e));
        }
    }

    previewAvatar(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const preview = document.getElementById('avatar-preview');
            preview.src = event.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    async handleProfileSubmit(e) {
        e.preventDefault();

        const supabase = window.supabaseConfig?.getClient?.();
        if (!supabase || !this.user) {
            this.showProfileError('Supabase belum dikonfigurasi');
            return;
        }

        const errorDiv = document.getElementById('edit-error');
        if (errorDiv) errorDiv.textContent = '';

        const submitBtn = document.getElementById('edit-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Loading...';

        try {
            const name = document.getElementById('edit-name').value.trim();
            const bio = document.getElementById('edit-bio').value.trim();
            const quote = document.getElementById('edit-quote').value.trim();
            const avatarInput = document.getElementById('edit-avatar');

            if (!name) {
                this.showProfileError('Nama harus diisi');
                return;
            }

            let avatarUrl = this.profile.avatar_url;

            // Upload avatar if provided
            if (avatarInput.files.length > 0) {
                const file = avatarInput.files[0];
                
                // Validate file
                if (!this.isValidImageFile(file)) {
                    this.showProfileError('File harus berupa JPG, JPEG, PNG, atau WebP');
                    return;
                }

                if (file.size > 5 * 1024 * 1024) {
                    this.showProfileError('File maksimal 5MB');
                    return;
                }

                // Upload to storage
                const fileName = `${this.user.id}-${Date.now()}.jpg`;
                const { data: uploadData, error: uploadError } = await supabase
                    .storage
                    .from('student-avatars')
                    .upload(`avatars/${this.user.id}/${fileName}`, file, {
                        upsert: true
                    });

                if (uploadError) {
                    this.showProfileError('Gagal upload foto');
                    console.error('Upload error:', uploadError);
                    return;
                }

                // Get public URL
                const { data: urlData } = supabase
                    .storage
                    .from('student-avatars')
                    .getPublicUrl(`avatars/${this.user.id}/${fileName}`);

                avatarUrl = urlData.publicUrl;
            }

            // Update profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    name,
                    bio,
                    quote,
                    avatar_url: avatarUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', this.user.id);

            if (updateError) {
                throw updateError;
            }

            // Update local profile
            this.profile = {
                ...this.profile,
                name,
                bio,
                quote,
                avatar_url: avatarUrl
            };

            // Update UI
            this.updateDashboard();
            this.showProfileSuccess('Profil berhasil diupdate');
            
            // Reset form
            avatarInput.value = '';
            document.getElementById('avatar-preview').style.display = 'none';

        } catch (error) {
            this.showProfileError('Terjadi kesalahan: ' + error.message);
            console.error('Profile update error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Changes';
        }
    }

    setupUploadForm() {
        const form = document.getElementById('upload-form');
        if (!form) return;

        form.addEventListener('submit', (e) => this.handleUpload(e));

        // Image preview
        const imageInput = document.getElementById('upload-image');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => this.previewUpload(e));
        }
    }

    previewUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const preview = document.getElementById('upload-preview');
            preview.src = event.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    async handleUpload(e) {
        e.preventDefault();

        const supabase = window.supabaseConfig?.getClient?.();
        if (!supabase || !this.user) {
            this.showUploadError('Supabase belum dikonfigurasi');
            return;
        }

        const errorDiv = document.getElementById('upload-error');
        const successDiv = document.getElementById('upload-success');
        if (errorDiv) errorDiv.textContent = '';
        if (successDiv) successDiv.style.display = 'none';

        const submitBtn = document.getElementById('upload-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Loading...';

        try {
            const imageInput = document.getElementById('upload-image');
            const captionInput = document.getElementById('upload-caption');
            const categoryInput = document.getElementById('upload-category');

            const file = imageInput.files[0];
            const caption = captionInput.value.trim();
            const category = categoryInput.value;

            if (!file) {
                this.showUploadError('Pilih foto terlebih dahulu');
                return;
            }

            if (!category) {
                this.showUploadError('Pilih kategori');
                return;
            }

            // Validate file
            if (!this.isValidImageFile(file)) {
                this.showUploadError('File harus berupa JPG, JPEG, PNG, atau WebP');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                this.showUploadError('File maksimal 10MB');
                return;
            }

            // Upload to storage
            const fileName = `${this.user.id}-${Date.now()}.jpg`;
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('student-photos')
                .upload(`photos/${this.user.id}/${fileName}`, file);

            if (uploadError) {
                this.showUploadError('Gagal upload foto');
                console.error('Upload error:', uploadError);
                return;
            }

            // Get public URL
            const { data: urlData } = supabase
                .storage
                .from('student-photos')
                .getPublicUrl(`photos/${this.user.id}/${fileName}`);

            const imageUrl = urlData.publicUrl;

            // Save to gallery table
            const { error: insertError } = await supabase
                .from('gallery')
                .insert([
                    {
                        user_id: this.user.id,
                        image_url: imageUrl,
                        caption: caption,
                        category: category,
                        created_at: new Date().toISOString()
                    }
                ]);

            if (insertError) {
                throw insertError;
            }

            // Reload photos
            await this.loadUserPhotos();
            this.updateDashboard();

            // Show success
            this.showUploadSuccess('Foto berhasil diupload');

            // Reset form
            document.getElementById('upload-form').reset();
            document.getElementById('upload-preview').style.display = 'none';

        } catch (error) {
            this.showUploadError('Terjadi kesalahan: ' + error.message);
            console.error('Upload error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Upload Foto';
        }
    }

    setupGallery() {
        this.renderUserGallery();
    }

    renderUserGallery() {
        const grid = document.getElementById('my-gallery-grid');
        const emptyState = document.getElementById('my-gallery-empty');

        if (this.userPhotos.length === 0) {
            if (grid) grid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        if (grid) {
            grid.innerHTML = this.userPhotos.map((photo, index) => `
                <div class="my-gallery-item">
                    <img 
                        src="${photo.image_url}" 
                        alt="${photo.caption}" 
                        class="my-gallery-item-image"
                        loading="lazy"
                    >
                    <div class="my-gallery-item-actions">
                        <button class="delete-photo-btn" data-id="${photo.id}" data-index="${index}">🗑️</button>
                    </div>
                    <div class="my-gallery-item-caption">${photo.caption}</div>
                </div>
            `).join('');

            // Add delete listeners
            grid.querySelectorAll('.delete-photo-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const photoId = btn.dataset.id;
                    this.showDeleteModal(photoId);
                });
            });
        }
    }

    setupDeleteModal() {
        const modal = document.getElementById('delete-photo-modal');
        const cancelBtn = document.getElementById('delete-cancel');
        const confirmBtn = document.getElementById('delete-confirm');

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideDeleteModal());
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.confirmDelete());
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideDeleteModal();
                }
            });
        }
    }

    showDeleteModal(photoId) {
        this.photoToDelete = photoId;
        const modal = document.getElementById('delete-photo-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    hideDeleteModal() {
        this.photoToDelete = null;
        const modal = document.getElementById('delete-photo-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    async confirmDelete() {
        if (!this.photoToDelete) return;

        const supabase = window.supabaseConfig?.getClient?.();
        if (!supabase || !this.user) {
            console.error('Supabase not configured');
            return;
        }

        const photoId = this.photoToDelete;

        try {
            // Delete from database
            const { error: deleteError } = await supabase
                .from('gallery')
                .delete()
                .eq('id', photoId)
                .eq('user_id', this.user.id); // Ownership check

            if (deleteError) {
                throw deleteError;
            }

            // Reload photos
            await this.loadUserPhotos();
            this.renderUserGallery();
            this.hideDeleteModal();

            // Show success
            const successDiv = document.getElementById('upload-success');
            if (successDiv) {
                successDiv.textContent = 'Foto berhasil dihapus';
                successDiv.style.display = 'block';
                setTimeout(() => {
                    successDiv.style.display = 'none';
                }, 3000);
            }

        } catch (error) {
            console.error('Delete error:', error);
            const errorDiv = document.getElementById('upload-error');
            if (errorDiv) {
                errorDiv.textContent = 'Gagal menghapus foto';
            }
            this.hideDeleteModal();
        }
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    getPlaceholderImage() {
        if (!this.profile) return '';
        return window.studentsData?.getPlaceholderImageUrl(this.profile.name) || '';
    }

    isValidImageFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        return validTypes.includes(file.type);
    }

    showProfileError(message) {
        const errorDiv = document.getElementById('edit-error');
        if (errorDiv) {
            errorDiv.textContent = message;
        }
    }

    showProfileSuccess(message) {
        const errorDiv = document.getElementById('edit-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.color = '#10b981';
            setTimeout(() => {
                errorDiv.textContent = '';
                errorDiv.style.color = '';
            }, 3000);
        }
    }

    showUploadError(message) {
        const errorDiv = document.getElementById('upload-error');
        if (errorDiv) {
            errorDiv.textContent = message;
        }
    }

    showUploadSuccess(message) {
        const successDiv = document.getElementById('upload-success');
        if (successDiv) {
            successDiv.textContent = message;
            successDiv.style.display = 'block';
            setTimeout(() => {
                successDiv.style.display = 'none';
            }, 3000);
        }
    }
}

// ============================================
// INITIALIZE DASHBOARD
// ============================================

let dashboardManager;

async function initDashboard() {
    dashboardManager = new DashboardManager();
}

// Auto-init on dashboard page
if (window.location.pathname.includes('dashboard')) {
    document.addEventListener('DOMContentLoaded', initDashboard);
}

console.log('Dashboard script loaded');
