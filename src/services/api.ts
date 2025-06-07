import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  // baseURL: 'https://press-inspect-api.onrender.com/api',
  
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

export const getCountries = () => api.get('/country/findAll');

export const updateUserStatus = (userId: number, newStatus: boolean) => api.patch(`/users/${userId}/status`, { isActive: newStatus });

// Register a new user
export const registerUser = (data: any) => api.post('/users/create', data);

// Get all users
export const getUsers = () => api.get('/users');

//Get user by ID
export const getUserById = (id: string) => api.get(`/users/${id}`);

// Buyer APIs
export const fetchAllBuyers = () => api.get('/reports/all/buyer');

export const createBuyer = (data: any) => api.post('/reports/create/buyer', data);

export const updateBuyerById = (buyerId: number, data: any) =>
  api.patch(`/reports/updateBuyerById/${buyerId}`, data);

// Seller APIs
export const fetchAllSellers  = () => api.get('/reports/all/seller');

export const createSeller  = (data: any) => api.post('/reports/create/seller', data);

export const updateSellerById  = (sellerId: number, data: any) =>
  api.patch(`/reports/updateSellerById/${sellerId}`, data);

// Machine APIs
export const fetchAllMachine  = () => api.get('/models/models');

export const createMachine  = (data: any) => api.post('/models/create/model', data);

export const updateMachineById  = (machineId: number, data: any) =>
  api.patch(`/models/update/model/${machineId}`, data);

// Units APIs
export const fetchAllUnits  = () => api.get('/units/read/units');

export const createUnit  = (data: any) => api.post('/units/create/units', data);

export const updateUnitById  = (unitId: number, data: any) =>
  api.patch(`/units/update/units/${unitId}`, data);

// Sub-Units APIs
export const fetchAllSubUnits  = () => api.get('/units/read/sub-units');

export const createSubUnit  = (data: any) => api.post('/units/create/sub-units', data);

export const updateSubUnitById  = (subUnitId: number, data: any) =>
  api.patch(`/units/update/sub-units/${subUnitId}`, data);

export const fetchAllGroups  = () => api.get('/groups');
