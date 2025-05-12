import axios from 'axios';

export const api = axios.create({
  // baseURL: 'http://localhost:4000/api',
  baseURL: 'https://press-inspect-api.onrender.com/api',
  
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Get all roles
export const getRoles = () => api.get('/roles');

// Register a new user
export const registerUser = (data: any) => api.post('/users/create', data);

// Get all users
export const getUsers = () => api.get('/users');

//Get user by ID
export const getUserById = (id: string) => api.get(`/users/${id}`);
