// Auto-detect API URL based on current host
function getAPIBaseURL() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // If accessing via localhost, use localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5000/api';
    }
    
    // Otherwise use the same hostname with port 5000
    return `${protocol}//${hostname}:5000/api`;
}

const API_BASE_URL = getAPIBaseURL();

console.log('🌐 API Base URL:', API_BASE_URL);
