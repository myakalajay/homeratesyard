/**
 * @file src/services/loan.service.js
 * @description Enterprise-grade service handling loan application data state.
 * Currently uses async Promises and localStorage to simulate a real database/API.
 */

// Helper function to simulate network latency (API calls)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const LoanService = {
  /**
   * Initializes a new loan application session.
   * @param {Object} initialData - Base data to start the application (e.g., loan intent)
   */
  async createApplication(initialData = {}) {
    await delay(800); // Simulate API call latency
    
    // Generate a secure-looking Application ID
    const applicationId = `APP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    
    const newApp = {
      id: applicationId,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: initialData,
    };
    
    // Persist securely to browser storage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`hry_loan_app_${applicationId}`, JSON.stringify(newApp));
      // Save the active ID so the user can resume if they accidentally refresh
      localStorage.setItem('hry_active_app_id', applicationId);
    }
    
    return newApp;
  },

  /**
   * Updates an existing application with new step data.
   * @param {string} id - The Application ID
   * @param {Object} updateData - The new form data to merge
   */
  async updateApplication(id, updateData) {
    await delay(500); 

    if (typeof window === 'undefined') return null;

    const existing = localStorage.getItem(`hry_loan_app_${id}`);
    if (!existing) throw new Error("Application session expired or not found.");

    const parsedApp = JSON.parse(existing);
    
    // Merge the new data with the existing data
    const updatedApp = {
      ...parsedApp,
      updatedAt: new Date().toISOString(),
      data: { ...parsedApp.data, ...updateData },
    };

    localStorage.setItem(`hry_loan_app_${id}`, JSON.stringify(updatedApp));
    return updatedApp;
  },

  /**
   * Retrieves an application by ID (useful for resuming applications).
   * @param {string} id - The Application ID
   */
  async getApplication(id) {
    await delay(400);

    if (typeof window === 'undefined') return null;

    const existing = localStorage.getItem(`hry_loan_app_${id}`);
    if (!existing) return null;
    
    return JSON.parse(existing);
  },

  /**
   * Finalizes and submits the application.
   * @param {string} id - The Application ID
   */
  async submitApplication(id) {
    await delay(1500); // Simulate heavier processing/underwriting checks

    if (typeof window === 'undefined') return null;

    const existing = localStorage.getItem(`hry_loan_app_${id}`);
    if (!existing) throw new Error("Cannot submit. Application not found.");

    const parsedApp = JSON.parse(existing);
    const submittedApp = {
      ...parsedApp,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
    };

    localStorage.setItem(`hry_loan_app_${id}`, JSON.stringify(submittedApp));
    
    // Clear the active session so the user starts fresh next time
    localStorage.removeItem('hry_active_app_id');

    return submittedApp;
  }
};

// Export as both named and default to catch any variation of imports in your app
export default LoanService;