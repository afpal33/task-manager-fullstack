import axios from 'axios';

const API = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || ''}/api/v1/auth`,
})

export const registerUser = (data: {
    name: string;
    email: string;
    password: string;
})=> API.post("/register", data);

export const loginUser = (data: {
    email: string;
    password: string;
})=> API.post("/login", data);