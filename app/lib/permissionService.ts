import axios from 'axios';
import Cookies from 'js-cookie';
import { socket } from "./socketIO"
import type { UserResponse} from '~/types/dto';

const url = `${import.meta.env.VITE_HOST_API}/permissions`; 

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



export const getUsersWithPermisions = async (dbId: number): Promise<UserResponse[]> => {
  try {
    initializeAxiosHeader();
    const res = await axios.get(`${url}/${dbId}`);
    return res.data;
  } catch (e) {
    console.error("Error fetching users:", e);
    throw e; 
  }
};
export const getUsersWithoutPermisions = async (dbId: number): Promise<UserResponse[]> => {
  try {
    initializeAxiosHeader();
    const res = await axios.get(`${url}/${dbId}/none`);
    return res.data;
  } catch (e) {
    console.error("Error fetching users:", e);
    throw e; 
  }
};

export const grantPermission = async (dbId: number, userIds: number[], permLevel: "ADMIN"|"VIEWER"): Promise<boolean> => {
  try {
    initializeAxiosHeader();
    const res = await axios.post(`${url}/${dbId}`,{
      targetUserIds: userIds,
      level: permLevel
    });
    console.log(res.data)
    return true;
  } catch (e) {
    console.error("Error fetching users:", e);
    throw e; 
  }
};

export const revokePermission = async (dbId: number, userId:number): Promise<boolean> => {
  try {
    initializeAxiosHeader();
    const res = await axios.delete(`${url}/${dbId}/${userId}`);
    console.log(res.data)
    return true;
  } catch (e) {
    console.error("Error fetching users:", e);
    throw e; 
  }
};

