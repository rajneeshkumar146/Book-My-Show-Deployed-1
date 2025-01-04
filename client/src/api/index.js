import axios from "axios";
const BASE_URL = "https://book-my-show-deployed-1.onrender.com"

export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
    }
});