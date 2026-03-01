import api from './api';

export const borrowerService = {
  // Fetch the aggregated dashboard summary
  getDashboardSummary: async () => {
    const response = await api.get('/borrower/dashboard');
    return response;
  },
  
  // Future endpoints you'll need
  getProperties: async () => {
    const response = await api.get('/borrower/properties');
    return response;
  },
  
  deleteProperty: async (id) => {
    const response = await api.delete(`/borrower/properties/${id}`);
    return response;
  }
};