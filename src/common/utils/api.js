const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const clearAuthCookies = () => {
    try {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            if (name) {
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
            }
        }
    } catch (_) {}
};

let isLoggingOut = false;
const handleUnauthorized = () => {
    if (isLoggingOut) return;
    isLoggingOut = true;

    // Check if the current route is within the admin section
    const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    const targetLogin = isAdminPath ? '/admin/login' : '/login';

    // Clear all auth and session keys in localStorage
    const authKeys = [
        'gymshood_token',
        'token',
        'user',
        'admin',
        'admin_profile',
        'session_id',
        'company',
        'client_company',
        'group',
        'role',
        'rights',
        'user_rights',
        'menus',
        'client_menus',
        'db_menus',
        'active_gym_id',
        'gym_id',
        'active_branch_id',
        'branch_id'
    ];
    authKeys.forEach((key) => localStorage.removeItem(key));

    // Clear session storage & cookies
    try {
        sessionStorage.clear();
    } catch (_) {}
    clearAuthCookies();

    // Prevent endless redirects if already on the login page
    if (typeof window !== 'undefined' && !window.location.pathname.endsWith('/login')) {
        window.location.href = targetLogin;
    }
};

let lastForbiddenNotice = 0;
const handleForbidden = (data) => {
    const now = Date.now();
    if (now - lastForbiddenNotice < 3000) return;
    lastForbiddenNotice = now;

    const message = data?.message || "Access denied: Admin privileges required. Client company users cannot access the admin portal.";
    console.warn('⛔ Access Restricted (403 Forbidden):', message);

    // If client user is on an /admin path, redirect back to partner /dashboard
    if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path.startsWith('/admin') && !path.includes('/login')) {
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        }
    }
};

const getHeaders = (token) => {
    const headers = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const gymId = localStorage.getItem('active_gym_id');
    const branchId = localStorage.getItem('active_branch_id');
    if (gymId) headers['x-gym-id'] = gymId;
    
    if (branchId) headers['x-branch-id'] = branchId;
    return headers;
};

const api = {
    get: async (endpoint, options = {}) => {
        let finalEndpoint = endpoint;
        if (options && options.params) {
            const query = new URLSearchParams();
            Object.entries(options.params).forEach(([key, val]) => {
                if (val !== undefined && val !== null) {
                    query.append(key, val);
                }
            });
            const qs = query.toString();
            if (qs) {
                finalEndpoint += (finalEndpoint.includes('?') ? '&' : '?') + qs;
            }
        }
        const token = localStorage.getItem('gymshood_token');
        console.log(`🌐 API GET Request: ${BASE_URL}${finalEndpoint}`);
        const response = await fetch(`${BASE_URL}${finalEndpoint}`, {
            method: 'GET',
            headers: getHeaders(token)
        });

        const contentType = response.headers.get("content-type");
        let data;
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            console.error(`❌ API Error (Non-JSON): ${response.status} ${response.statusText}`, text);
            throw new Error(`Server returned ${response.status} (${response.statusText}). Please check if API URL is correct.`);
        }

        if (!response.ok) {
            if (response.status === 401) {
                handleUnauthorized();
            } else if (response.status === 403) {
                handleForbidden(data);
            }
            const error = new Error(data.message || 'Something went wrong');
            error.status = response.status;
            error.response = data;
            error.data = data;
            throw error;
        }
        return data;
    },
    post: async (endpoint, body) => {
        const token = localStorage.getItem('gymshood_token');
        console.log(`🌐 API POST Request: ${BASE_URL}${endpoint}`, body);
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify(body)
        });

        const contentType = response.headers.get("content-type");
        let data;
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            console.error(`❌ API Error (Non-JSON): ${response.status} ${response.statusText}`, text);
            throw new Error(`Server returned ${response.status} (${response.statusText}). Please check if API URL is correct.`);
        }

        if (!response.ok) {
            if (response.status === 401) {
                handleUnauthorized();
            } else if (response.status === 403) {
                handleForbidden(data);
            }
            const error = new Error(data.message || 'Something went wrong');
            error.status = response.status;
            error.response = data;
            error.data = data;
            throw error;
        }
        return data;
    },
    put: async (endpoint, body) => {
        const token = localStorage.getItem('gymshood_token');
        console.log(`🌐 API PUT Request: ${BASE_URL}${endpoint}`, body);
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: getHeaders(token),
            body: JSON.stringify(body)
        });

        const contentType = response.headers.get("content-type");
        let data;
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            console.error(`❌ API Error (Non-JSON): ${response.status} ${response.statusText}`, text);
            throw new Error(`Server returned ${response.status} (${response.statusText}). Please check if API URL is correct.`);
        }

        if (!response.ok) {
            if (response.status === 401) {
                handleUnauthorized();
            } else if (response.status === 403) {
                handleForbidden(data);
            }
            const error = new Error(data.message || 'Something went wrong');
            error.status = response.status;
            error.response = data;
            error.data = data;
            throw error;
        }
        return data;
    },
    delete: async (endpoint, body) => {
        const token = localStorage.getItem('gymshood_token');
        console.log(`🌐 API DELETE Request: ${BASE_URL}${endpoint}`, body);
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders(token),
            body: body ? JSON.stringify(body) : undefined
        });

        const contentType = response.headers.get("content-type");
        let data;
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            console.error(`❌ API Error (Non-JSON): ${response.status} ${response.statusText}`, text);
            throw new Error(`Server returned ${response.status} (${response.statusText}). Please check if API URL is correct.`);
        }

        if (!response.ok) {
            if (response.status === 401) {
                handleUnauthorized();
            } else if (response.status === 403) {
                handleForbidden(data);
            }
            const error = new Error(data.message || 'Something went wrong');
            error.status = response.status;
            error.response = data;
            error.data = data;
            throw error;
        }
        return data;
    },
    upload: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('gymshood_token');

        console.log(`🌐 API UPLOAD Request: ${BASE_URL}/upload`);
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const gymId = localStorage.getItem('active_gym_id');
        const branchId = localStorage.getItem('active_branch_id');
        if (gymId) headers['x-gym-id'] = gymId;
        if (branchId) headers['x-branch-id'] = branchId;

        const response = await fetch(`${BASE_URL}/upload`, {
            method: 'POST',
            headers,
            body: formData
        });

        const contentType = response.headers.get("content-type");
        let data;
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            console.error(`❌ API Error (Non-JSON): ${response.status} ${response.statusText}`, text);
            throw new Error(`Server returned ${response.status} (${response.statusText}). Please check if API URL is correct.`);
        }

        if (!response.ok) {
            if (response.status === 401) {
                handleUnauthorized();
            }
            const error = new Error(data.message || 'Upload failed');
            error.status = response.status;
            error.response = data;
            error.data = data;
            throw error;
        }
        return data;
    }
};

export const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    // If already full http(s) URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    const backendBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    return `${backendBase.replace(/\/api\/v1\/?$/, '')}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

export const getMediaUrl = (url) => {
    return getImageUrl(url);
};

const apiWrapper = {
    ...api,
    getMediaUrl,
    getImageUrl
};

export default apiWrapper;
