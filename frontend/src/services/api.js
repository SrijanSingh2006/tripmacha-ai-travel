import axios from 'axios';

// Configurable backend URL with local fallback
const BASE_HOST = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE_URL = `${BASE_HOST}/api`;

export const travelApi = {
  /**
   * Sends the user's prompt to the backend.
   * The backend should trigger the google.genai model to parse the intent,
   * and simultaneously fire off the Celery scraping tasks.
   */
  sendTripRequest: async (userPrompt) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/plan-trip`, {
        prompt: userPrompt
      });
      return response.data;
    } catch (error) {
      console.error("API Error: Backend might be offline.", error);
      throw error;
    }
  },

  /**
   * Polls the backend to check if the background scrapers are finished.
   */
  checkScraperStatus: async (taskId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/status/${taskId}`);
      return response.data;
    } catch (error) {
      console.error("Status Check Error:", error);
      throw error;
    }
  }
};