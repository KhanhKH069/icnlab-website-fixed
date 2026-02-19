// API Service for Frontend

class APIService {
    constructor() {
        // Get API URL from config.js
        this.baseURL = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://localhost:5000/api';
    }

    // Helper method for fetch
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // News APIs
    async getNews(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/news?${queryString}`);
    }

    async getNewsById(id) {
        return this.request(`/news/${id}`);
    }

    // Publications APIs
    async getPublications(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/publications?${queryString}`);
    }

    async getPublicationById(id) {
        return this.request(`/publications/${id}`);
    }

    async getPublicationStats() {
        return this.request('/publications/stats/summary');
    }

    // Projects APIs
    async getProjects(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/projects?${queryString}`);
    }

    async getProjectById(id) {
        return this.request(`/projects/${id}`);
    }

    // Members APIs
    async getMembers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/members?${queryString}`);
    }

    async getMemberById(id) {
        return this.request(`/members/${id}`);
    }

    // Health check
    async healthCheck() {
        return this.request('/health');
    }
}

// Create singleton instance
const api = new APIService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
}
