export const API_BASE_URL = "http://127.0.0.1:8000";

export const getApiUrl = (path: string) => {
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${API_BASE_URL}/api/${cleanPath}`;
};
