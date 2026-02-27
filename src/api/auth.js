import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export async function login(employeeId) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      employeeId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
}