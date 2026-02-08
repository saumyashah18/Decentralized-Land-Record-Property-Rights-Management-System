export const APP_NAME = 'BhoomiSetu';
export const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000/api'
    : 'https://bhoomisetu-api.loca.lt/api';
