import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export async function login(employeeId, password) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      employeeId,
      password,
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
}