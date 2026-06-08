import axios from 'axios';

export const BACKEND_URL = import.meta.env.VITE_API_URL || '';
const API_BASE_URL = `${BACKEND_URL}/api`;

export const predictEmotion = async (
  file,
  sessionId = null,
  detectionType = 'upload'
) => {
  const formData = new FormData();
  formData.append('file', file);

  let url = `${API_BASE_URL}/predict?detection_type=${detectionType}`;

  if (sessionId) {
    url += `&session_id=${sessionId}`;
  }

  try {
    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Predict API error:', error);

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }

    throw error;
  }
};

export const checkSessionStatus = async (sessionId) => {
  const response = await axios.get(`${API_BASE_URL}/session/${sessionId}`);
  return response.data;
};

export const getHistory = async () => {
  const response = await axios.get(`${API_BASE_URL}/history`);
  return response.data;
};

export const deleteAllHistory = async () => {
  const response = await axios.delete(`${API_BASE_URL}/history`);
  return response.data;
};