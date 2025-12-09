// File: /src/services/axiosInstance.js
import axios from 'axios';

// Create axios instance with environment-based API URL
// Note: Backend routes already include /api/ prefix, so we don't add it here
const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Function to get token from localStorage (fallback to Redux store)
const getAuthToken = () => {
    try {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            return user.token;
        }
    } catch (error) {
        console.error('Error getting token from localStorage:', error);
    }
    return null;
};

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear user data from localStorage
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
