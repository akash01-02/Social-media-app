import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const loginCall = async (userCredential, dispatch) => {
  dispatch({ type: "LOGIN_START" });
  try {
    const res = await axios.post(`${API_URL}/users/login`, userCredential);
    dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
    return res.data;
  } catch (err) {
    dispatch({ type: "LOGIN_FAILURE", payload: err.response?.data });
    if (!err.response) {
      throw new Error('Unable to connect to server. Please make sure the server is running.');
    }
    if (err.response.status === 404) {
      throw new Error('Login service not available. Please try again later.');
    }
    throw err;
  }
};

export const registerCall = async (userCredential) => {
  try {
    const res = await axios.post(`${API_URL}/users/register`, userCredential);
    return res.data;
  } catch (err) {
    throw err;
  }
};
