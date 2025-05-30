import axios from 'axios';
import Cookies from 'js-cookie';

const url = `${import.meta.env.VITE_HOST_API}/auth`; 

const initializeAxiosHeader = () => {
  const token = Cookies.get('tndb_token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

initializeAxiosHeader(); 

export const signInWithUsernameAndPassword = async (username: string, password: string): Promise<string> => {
  let newToken: string;
  try {
    const res = await axios.post<{ token: string }>(`${url}/login`, {
      username: username,
      password: password
    });
    newToken = res.data.token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    Cookies.set('tndb_token', newToken, { expires: 1 }); // Expires in 1 day
    return newToken;
  } catch (e) {
    console.error("Sign-in error:", e);
    throw e;
  }
};

export const validateToken = async (tokenToValidate?: string): Promise<boolean> => {
  if (!tokenToValidate) {
    console.log("validateToken: Called without a token to validate.");
    return false;
  }

  try {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${tokenToValidate}`
    };
    const response = await axios.get(`${url}/validate`, { headers: headers }); 
    return true;
  } catch (error: any) {
    console.error(error);
    return false;
  }
};

export const register = async (email: string, username: string, password: string): Promise<any> => { // Define a more specific return type if available
  try {
    const res = await axios.post(`${url}/register`, {
      email: email,
      username: username,
      password: password
    });
    return res.data;
  } catch (e) {
    console.error("Registration error:", e);
    throw e;
  }
};

export const signOut = (): void => { 
  Cookies.remove('tndb_token');
  delete axios.defaults.headers.common['Authorization'];
};