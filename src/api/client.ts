import axios from "axios";
import { API_BASE_URL } from "./config";

// In proxy mode API_BASE_URL is "/api". Many request helpers already include
// "/api/..." prefixes, so using "/api" as axios baseURL would produce "/api/api/...".
const axiosBaseURL = API_BASE_URL === "/api" ? "" : API_BASE_URL;

export const api = axios.create({
  baseURL: axiosBaseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});