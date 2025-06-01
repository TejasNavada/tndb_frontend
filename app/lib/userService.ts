import axios from 'axios';
import Cookies from 'js-cookie';
import { socket } from "./socketIO"
import type { UserResponse} from '~/types/dto';

const url = `${import.meta.env.VITE_HOST_API}/users`; 

const initializeAxiosHeader = () => {
  if (typeof window !== 'undefined') { 
    console.log("CLIENT BROWSER: initializeAxiosHeader running");
    const token = Cookies.get('tndb_token');
    console.log("CLIENT BROWSER: Token from Cookies.get():", token);
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  } else {
    console.log("SERVER TERMINAL: initializeAxiosHeader running (Cookies.get won't work here for browser cookies)");
    const token = Cookies.get('tndb_token'); // This will be undefined
    console.log("SERVER TERMINAL: Token from Cookies.get():", token);
  }
};


export const getAllUsers = async (): Promise<UserResponse[]> => {
  try {
    initializeAxiosHeader();
    const res = await axios.get(`${url}`);
    return res.data;
  } catch (e) {
    console.error("Error fetching users:", e);
    throw e; 
  }
};

