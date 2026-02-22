// Auto-detect API URL based on current host
function getAPIBaseURL() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5000/api';
    }

    // Production: API ở subdomain api.<domain>
    const apiHost = 'api.' + hostname.replace(/^www\./, '');
    return `${protocol}//${apiHost}/api`;
}

const API_BASE_URL = getAPIBaseURL();

console.log('🌐 API Base URL:', API_BASE_URL);
console.log('📍 Current Host:', window.location.hostname);
