import axios from "axios";

export const api = axios.create({
  baseURL:
    "http://newhope-env-v2.eba-kcsug8jx.us-east-1.elasticbeanstalk.com",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
