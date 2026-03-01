import api from './api';

// 🟢 FIX: Standardized Native Error Handling
const handleApiError = (error, defaultMessage) => {
  // If it's a 401 or 403, we want the UI to know it's a permission/session issue
  if (error.response?.status === 401) return new Error("Session expired. Please log in again.");
  if (error.response?.status === 403) return new Error("Access Denied. Insufficient permissions.");
  
  const message = error.response?.data?.message || error.message || defaultMessage;
  return new Error(message);
};

export const adminService = {
  
  // ==========================
  // 📊 DASHBOARD & ANALYTICS
  // ==========================

  getStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error("Admin Service Error (getStats):", error);
      return { 
        totalUsers: 0, borrowers: 0, lenders: 0, pendingLenders: 0,
        aiInteractions: 0, chartData: [], recentActivity: []
      };
    }
  },

  getSarahLogs: async () => {
    try {
      const aiUrl = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000';
      const response = await fetch(`${aiUrl}/api/v1/chat/analytics`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error(`AI Engine rejected connection: ${response.status}`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Sarah Telemetry Error:", error);
      return []; 
    }
  },

  getSystemHealth: async () => {
    try {
      const response = await api.get('/admin/health');
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to sync with telemetry nodes.');
    }
  },

  // ==========================
  // ⚙️ SYSTEM SETTINGS
  // ==========================

  getSystemSettings: async () => {
    try {
      const response = await api.get('/admin/settings');
      return response.data;
    } catch (error) {
      // 🟢 FIX: Handle 403/401 properly instead of silently failing
      if (error.response?.status === 401 || error.response?.status === 403) {
         throw handleApiError(error);
      }
      console.warn("Could not fetch settings (may not exist yet):", error);
      return null;
    }
  },

  updateSystemSettings: async (settingsData) => {
    try {
      const response = await api.put('/admin/settings', settingsData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to update system settings.");
    }
  },

  // Legacy fallback mapping
  getSettings: async () => adminService.getSystemSettings(),
  updateSettings: async (settings) => adminService.updateSystemSettings(settings),

  // ==========================
  // 👥 USER MANAGEMENT
  // ==========================

  getUsers: async (filters = {}) => {
    try {
      const response = await api.get('/admin/users', { params: filters });
      return response.data;
    } catch (error) {
      console.error("Admin Service Error (getUsers):", error);
      return { users: [], total: 0, page: 1, totalPages: 1 };
    }
  },

  verifyLender: async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/verify`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Verification failed.");
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Delete operation failed.");
    }
  },

  updateRole: async (userId, newRole) => {
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Role update failed.");
    }
  },

  impersonate: async (userId) => {
    try {
      const response = await api.post(`/admin/users/${userId}/impersonate`);
      return response.data; 
    } catch (error) {
      throw handleApiError(error, "Impersonation failed.");
    }
  },

  // ==========================
  // 🛡️ SECURITY & AUDIT
  // ==========================

  getAuditLogs: async () => {
    try {
      const response = await api.get('/admin/audit-logs');
      return response.data;
    } catch (error) {
      console.warn("Audit Logs Error:", error.response?.data?.message || error.message);
      return []; 
    }
  },

  // ==========================
  // 📧 EMAIL & AUTOMATION
  // ==========================

  getEmailSettings: async () => {
    try {
      const response = await api.get('/admin/emails/settings');
      return response.data;
    } catch (error) {
      console.warn("Email settings unreachable.");
      // 🟢 FIX: Fallback aligned exactly with your React State variables to prevent uncontrolled input errors
      return { provider: 'brevo', fromName: '', fromEmail: '', smtpUser: '', smtpPass: '' };
    }
  },

  updateEmailSettings: async (settings) => {
    try {
      const response = await api.put('/admin/emails/settings', settings);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to update SMTP settings.");
    }
  },

  getEmailTemplates: async () => {
    try {
      const response = await api.get('/admin/emails/templates');
      return response.data;
    } catch (error) {
      console.error("Failed to load email templates.");
      return []; 
    }
  },

  updateEmailTemplate: async (templateId, templateData) => {
    try {
      const response = await api.put(`/admin/emails/templates/${templateId}`, templateData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to save template design.");
    }
  },

  sendTestEmail: async (testEmailPayload) => {
    try {
      const response = await api.post('/admin/emails/test', testEmailPayload);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Test email failed to send. Check SMTP logs.");
    }
  },

  // ==========================
  // 🏦 GLOBAL LOAN PIPELINE
  // ==========================

  getAllLoans: async (filters = {}) => {
    try {
      const response = await api.get('/admin/loans', { params: filters });
      return response.data;
    } catch (error) {
      console.error("Admin Service Error (getAllLoans):", error);
      return { loans: [], total: 0, page: 1, totalPages: 1 };
    }
  },

  getLoanById: async (id) => {
    try {
      const response = await api.get(`/admin/loans/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Failed to load loan details.");
    }
  },

  updateLoanStatus: async (id, status, reason) => {
    try {
      const payload = { status, adminNotes: "System Administrator Override" };
      if (reason) payload.rejectionReason = reason;

      const response = await api.put(`/admin/loans/${id}/status`, payload);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "Status update failed.");
    }
  },

  runAus: async (loanId) => {
    try {
      const response = await api.post(`/admin/loans/${loanId}/run-aus`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "AUS Engine failed to run.");
    }
  },

  downloadPreApproval: async (loanId) => {
    try {
      const response = await api.get(`/admin/loans/${loanId}/document/pre-approval`, {
        responseType: 'blob' 
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PreApproval_Loan_${loanId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        link.remove();
      }, 100);
      
      return true;
    } catch (error) {
      console.error("PDF Download Error:", error);
      throw new Error("Failed to generate or retrieve document.");
    }
  }
};