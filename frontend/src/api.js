import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
});

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

API.interceptors.response.use(
    (res)=>res,
    (err)=>{
        if(err.response?.status===401){
            localStorage.removeItem("user")
            window.location.href="/"
        }
        return Promise.reject(err)
    }
)

export default API