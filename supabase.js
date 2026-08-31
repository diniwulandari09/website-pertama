// ============================================
// SUPABASE CONFIGURATION
// ============================================

// IMPORTANT: Replace these with your Supabase project credentials
// Get these from: https://app.supabase.com

const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'your_anon_public_key_here';

// Initialize Supabase client (using CDN)
// Add this to your HTML if not already there:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

let supabase;

// Initialize after the Supabase library loads
if (typeof supabase === 'undefined') {
    // Supabase will be available when the library loads
    // For now, we'll initialize it when it's available
    
    // Check if Supabase library is loaded
    if (typeof window.supabase !== 'undefined') {
        supabase = window.supabase;
    }
}

// Function to initialize Supabase client
function initializeSupabase() {
    if (!window.supabase) {
        console.error('Supabase library not loaded. Add this to your HTML head:');
        console.error('<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
        return false;
    }
    
    // Create Supabase client
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    if (!supabaseClient) {
        console.error('Failed to initialize Supabase client. Check your URL and key.');
        return false;
    }
    
    return supabaseClient;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Check if Supabase is configured
function isSupabaseConfigured() {
    return SUPABASE_URL !== 'https://YOUR_PROJECT_ID.supabase.co' && 
           SUPABASE_ANON_KEY !== 'your_anon_public_key_here';
}

// Get Supabase client (lazy initialize)
function getSupabase() {
    if (!supabase && isSupabaseConfigured()) {
        supabase = initializeSupabase();
    }
    return supabase;
}

// ============================================
// DATABASE SCHEMA REFERENCE
// ============================================

/*
PROFILES TABLE:
- id (uuid, primary key, linked to auth.users.id)
- name (text)
- attendance_number (integer, unique, 1-37)
- email (text)
- avatar_url (text)
- bio (text)
- quote (text)
- role (text, default: 'student')
- created_at (timestamp)
- updated_at (timestamp)

GALLERY TABLE:
- id (uuid, primary key)
- user_id (uuid, foreign key to profiles.id)
- image_url (text)
- caption (text)
- category (text)
- created_at (timestamp)

STORAGE:
- Bucket: student-photos
- Bucket: student-avatars
*/

// ============================================
// ROW LEVEL SECURITY POLICIES (Must be set in Supabase)
// ============================================

/*
PROFILES:
- SELECT: Public read (for viewing student directory)
- INSERT: Auth users can insert (register)
- UPDATE: Users can only update their own profile (auth.uid() = id)
- DELETE: Admin only (disabled for students)

GALLERY:
- SELECT: Public read (for viewing gallery)
- INSERT: Authenticated users can insert (upload)
- UPDATE: Users can update their own photos
- DELETE: Users can delete their own photos

STORAGE (student-photos):
- Users can upload to their own folder
- Users can delete their own files
- Public read access with restrictions

STORAGE (student-avatars):
- Similar to student-photos
*/

// ============================================
// EXPORT FOR USE
// ============================================

// Make available globally
window.supabaseConfig = {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    isConfigured: isSupabaseConfigured(),
    initialize: initializeSupabase,
    getClient: getSupabase
};

console.log('Supabase configuration loaded');
console.log('Configured:', isSupabaseConfigured() ? 'Yes' : 'No - Please add your Supabase credentials to js/supabase.js');
