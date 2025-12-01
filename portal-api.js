// ============================================
// API CLIENT FOR BACKEND INTEGRATION
// ============================================

// Detect API URL based on environment
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : `${window.location.protocol}//${window.location.hostname}:5000/api`;

// Get Supabase URL from backend
let SUPABASE_URL = null;

async function initializeConfig() {
    try {
        const response = await fetch(`${API_BASE_URL.replace('/api', '')}/config`);
        const data = await response.json();
        SUPABASE_URL = data.supabaseUrl;
        window.SUPABASE_URL = SUPABASE_URL;
        console.log('Config loaded:', { SUPABASE_URL });
    } catch (error) {
        console.error('Failed to load config:', error);
        // Fallback to environment variable or default
        SUPABASE_URL = window.SUPABASE_URL || 'https://your-supabase-url.supabase.co';
    }
}

// Get auth token from session
function getAuthToken() {
    const session = JSON.parse(localStorage.getItem('portal_session') || 'null');
    return session?.access_token || null;
}

// Set auth token
function setAuthToken(token) {
    localStorage.setItem('portal_session', JSON.stringify({ access_token: token }));
}

// Clear auth token
function clearAuthToken() {
    localStorage.removeItem('portal_session');
}

// API request helper
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ============================================
// AUTH API
// ============================================

const AuthAPI = {
    async login(email, password) {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (data.success && data.data.session) {
            setAuthToken(data.data.session.access_token);
        }
        
        return data;
    },
    
    async logout() {
        try {
            await apiRequest('/auth/logout', { method: 'POST' });
        } finally {
            clearAuthToken();
        }
    },
    
    async changePassword(currentPassword, newPassword) {
        return await apiRequest('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword })
        });
    }
};

// ============================================
// COMPANIES API
// ============================================

const CompaniesAPI = {
    async getAll() {
        return await apiRequest('/companies');
    },
    
    async create(companyData) {
        return await apiRequest('/companies', {
            method: 'POST',
            body: JSON.stringify(companyData)
        });
    },
    
    async update(id, companyData) {
        return await apiRequest(`/companies/${id}`, {
            method: 'PUT',
            body: JSON.stringify(companyData)
        });
    },
    
    async delete(id) {
        return await apiRequest(`/companies/${id}`, {
            method: 'DELETE'
        });
    }
};

// ============================================
// FILES API
// ============================================

const FilesAPI = {
    async getAll() {
        return await apiRequest('/files');
    },
    
    async upload(formData) {
        const token = getAuthToken();
        
        const response = await fetch(`${API_BASE_URL}/files/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Upload failed');
        }
        
        return data;
    },
    
    async delete(id) {
        return await apiRequest(`/files/${id}`, {
            method: 'DELETE'
        });
    },
    
    async markAsRead(id) {
        return await apiRequest(`/files/${id}/mark-read`, {
            method: 'POST'
        });
    }
};

// ============================================
// NOTIFICATIONS API
// ============================================

const NotificationsAPI = {
    async getAll() {
        return await apiRequest('/notifications');
    },
    
    async send(notificationData) {
        return await apiRequest('/notifications', {
            method: 'POST',
            body: JSON.stringify(notificationData)
        });
    }
};

// ============================================
// REQUESTS API
// ============================================

const RequestsAPI = {
    async getAll() {
        return await apiRequest('/requests');
    },
    
    async create(requestData) {
        return await apiRequest('/requests', {
            method: 'POST',
            body: JSON.stringify(requestData)
        });
    },
    
    async updateStatus(id, status) {
        return await apiRequest(`/requests/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }
};

// ============================================
// ACTIVITY API
// ============================================

const ActivityAPI = {
    async getAll(limit = 100) {
        return await apiRequest(`/activity?limit=${limit}`);
    },
    
    async clear() {
        return await apiRequest('/activity', {
            method: 'DELETE'
        });
    }
};

// Export APIs
window.API = {
    Auth: AuthAPI,
    Companies: CompaniesAPI,
    Files: FilesAPI,
    Notifications: NotificationsAPI,
    Requests: RequestsAPI,
    Activity: ActivityAPI
};
