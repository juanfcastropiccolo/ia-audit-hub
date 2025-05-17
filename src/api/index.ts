
import axios from "axios";
import type { AxiosResponse, AxiosError } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false, // change if you set cookies
});

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  (err: AxiosError) => {
    // centralised error handling
    console.error(err.response?.data || err.message);
    return Promise.reject(err);
  },
);

export default api;
