const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = {
  getSummary: async () => {
    const res = await fetch(`${API_BASE}/summary`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to fetch summary');
    }
    return res.json();
  },

  getApplication: async (id) => {
    const res = await fetch(`${API_BASE}/applications/${id}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to fetch application');
    }
    return res.json();
  },

  getApplications: async (status = '', search = '') => {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    
    const res = await fetch(`${API_BASE}/applications?${params.toString()}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to fetch applications');
    }
    return res.json();
  },

  submitApplication: async (data) => {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to submit application');
    }
    return res.json();
  },

  updateStatus: async (id, status) => {
    const res = await fetch(`${API_BASE}/applications/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to update status');
    }
    return res.json();
  }
};
