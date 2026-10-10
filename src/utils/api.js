const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
    get: async (endpoint) => {
        const token = localStorage.getItem('gymshood_token');
        console.log(`🌐 API GET Request: ${BASE_URL}${endpoint}`);
        const response = await fetch(`${BASE_URL}${endpoint}`, {
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
            const error = new Error(data.message || 'Something went wrong');
            error.response = data;
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
            const error = new Error(data.message || 'Something went wrong');
            error.response = data;
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
            const error = new Error(data.message || 'Something went wrong');
            error.response = data;
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
            const error = new Error(data.message || 'Something went wrong');
            error.response = data;
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

        if (!response.ok) throw new Error(data.message || 'Upload failed');
        return data;
    }
};

export const getMediaUrl = (url) => {
    if (!url) return "";

    if (url.startsWith('http') && !url.includes('localhost:8000') && !url.includes('147.93.30.41')) {
        return url;
    }

    let path = url;
    if (url.includes('localhost:8000')) {
        path = url.split('localhost:8000')[1];
    } else if (url.includes('147.93.30.41')) {
        path = url.split('147.93.30.41')[1];
        if (path.includes(':8000')) {
            path = path.split(':8000')[1];
        }
    }

    if (!path.startsWith('/')) {
        path = '/' + path;
    }

    const cleanBaseUrl = BASE_URL.replace(/\/+$/, "");
    return `${cleanBaseUrl}${path}`;
};

const apiWrapper = {
    ...api,
    getMediaUrl
};

export default apiWrapper;
