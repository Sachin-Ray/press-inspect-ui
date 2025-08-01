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

export const updateUserStatus = (userId: number, newStatus: boolean) => api.patch(`/users/update-user-status-by-id/${userId}`, { is_active: newStatus });


export const downloadCv = (userId: number) => api.get(`/users/download/cv/${userId}`, { responseType: 'blob' });

export const downloadPassport = (userId: number) => api.get(`/users/download/passport/${userId}`, { responseType: 'blob' });

export const downloadPhoto = (userId: number) => api.get(`/users/download/photo/${userId}`, { responseType: 'blob' });

// Register a new user
export const registerUser = (formData: FormData) => {
  return api.post('/users/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
};

export const updateUserById = (userId: number, formData: FormData) => {
  return api.patch(`/users/update-user-by-id/${userId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
};

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
export const fetchAllMachine  = () => api.get('/models/all');

export const createMachine  = (data: any) => api.post('/models/create', data);

export const updateMachineById  = (machineId: number, data: any) =>
  api.patch(`/models/update/${machineId}`, data);

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

// Control Station APIs
export const fetchAllControlStation  = () => api.get('/reports/getAll/controlStations');

export const createControlStation  = (data: any) => api.post('/reports/create/controlStation', data);

export const updateControlStationById  = (currentStationId: number, data: any) =>
  api.patch(`/reports/update/controlStation/${currentStationId}`, data);

// Control Station Thing To Be Checked APIs
export const fetchAllControlStationThingsToCheck  = () => api.get('/reports/getAll/controlStationThingsToCheck');

export const createControlStationThingsToCheck  = (data: any) => api.post('/reports/create/controlStationThingsToCheck', data);

export const updateControlStationThingsToCheckById  = (currentStationThingToBeCheckedId: number, data: any) =>
  api.patch(`/reports/update/controlStationThingsToCheck/${currentStationThingToBeCheckedId}`, data);

// Color Measuring APIs
export const fetchAllColorMeasuringDevices = () => api.get('/reports/getAll/colorMeasurments');

export const createColorMeasuringDevice = (data: any) => api.post('/reports/create/colorMeasurments', data);

export const updateColorMeasuringDeviceById  = (deviceId: number, data: any) => api.patch(`/reports/update/colorMeasuringDevice/${deviceId}`, data);

// General Question APIs
export const fetchAllGeneralInfoQuestions = () => api.get('/reports/getAll/questions');

export const createGeneralInfoQuestion = (data: any) => api.post('/reports/create/generalInfoQuestion', data);

export const updateGeneralInfoQuestionById  = (deviceId: number, data: any) => api.patch(`/reports/update/questions/${deviceId}`, data);


export const fetchAllGroups  = () => api.get('/groups');

export const updatePassword = (userId: number, payload: {
  oldPassword: string;
  newPassword: string;
  resetPassword: boolean;
}) => {
  return api.patch(`/users/${userId}`, payload);
};

// Tech Specification APIs
export const createTechSpecification = (formData: FormData) => {
  return api.post('/models/create-tech-specification', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
};

export const updateTechSpecificationById = (specId: number, formData: FormData) => {
  return api.patch(`/models/updateTechSpecfication/${specId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
};

export const fetchAllTechSpecifications = () => api.get('/models/getAllTechSpecficationPdf');
