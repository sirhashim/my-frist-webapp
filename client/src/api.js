// client/src/api.js

const BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const apiRequest = async (url, method = 'GET', data = null, isFormData = false) => {
  const headers = {
    ...getAuthHeaders(),
  };

  const config = {
    method,
    headers,
  };

  if (data) {
    if (isFormData) {
      config.body = data;
      delete config.headers['Content-Type']; // Browser sets Content-Type for FormData
    } else {
      config.headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(data);
    }
  }

  try {
    const response = await fetch(`${BASE_URL}${url}`, config);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Something went wrong');
    }

    return responseData;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};
