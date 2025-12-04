// API Service for backend integration
// Change API_BASE to your backend URL (localhost for dev, deployed URL for prod)

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';

let authToken: string | null = null;

const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem('authToken', token);
};

const getAuthToken = () => {
  if (!authToken) {
    authToken = localStorage.getItem('authToken');
  }
  return authToken;
};

const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('authToken');
};

const apiCall = async (endpoint: string, method: string = 'GET', body?: any) => {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const token = getAuthToken();
  if (token) {
    options.headers = { ...options.headers, Authorization: `Bearer ${token}` };
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    if (response.status === 401) {
      clearAuthToken();
      window.location.href = '/login';
    }
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.error('API call failed:', error);
    return { success: false, data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const api = {
  // Auth
  login: (username: string, password: string) =>
    apiCall('/auth/login', 'POST', { username, password }).then(res => {
      if (res.success && res.data.access_token) {
        setAuthToken(res.data.access_token);
      }
      return res;
    }),

  register: (username: string, password: string, name: string, branchId?: string) =>
    apiCall('/auth/register', 'POST', { username, password, name, branchId }),

  getProfile: () => apiCall('/auth/me'),

  // Inventory
  getInventory: (branchId?: string) => {
    const query = branchId ? `?branchId=${branchId}` : '';
    return apiCall(`/inventory${query}`);
  },

  // Products & Branches
  getProducts: () => apiCall('/products'),
  getBranches: () => apiCall('/branches'),

  // Orders & Requisitions
  listRequisitions: () => apiCall('/orders/requisitions'),
  createRequisition: (data: any) => apiCall('/orders/requisition', 'POST', data),

  listTransfers: () => apiCall('/orders/transfers'),
  createTransfer: (data: any) => apiCall('/orders/transfer', 'POST', data),

  listDisposals: () => apiCall('/orders/disposals'),
  createDisposal: (data: any) => apiCall('/orders/disposal', 'POST', data),

  // Logout
  logout: () => {
    clearAuthToken();
  },
};

export { setAuthToken, getAuthToken, clearAuthToken };
