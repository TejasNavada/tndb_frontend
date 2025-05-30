import { createContext, useState, type Dispatch, type SetStateAction, type ReactNode, useContext, useEffect } from "react";
import { initSocketConnection } from "~/lib/socketIO";
import Cookies from 'js-cookie';

export interface AuthContextType {
  token: string | null;
  setToken: Dispatch<SetStateAction<string | null>>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (Cookies.get('tndb_token')) {
      console.log(Cookies.get('tndb_token'))
      initSocketConnection();
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider. Make sure AuthContextProvider is a parent component.');
  }
  return context;
};