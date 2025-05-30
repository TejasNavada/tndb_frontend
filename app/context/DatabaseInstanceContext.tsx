import { createContext, useState, type Dispatch, type SetStateAction, type ReactNode, useContext, useEffect, useCallback } from "react";
import { MakeQuerablePromise, type BackupRecord, type DatabaseInstanceResponse, type MetricsResponse, type QueryablePromise, type RestoreResponse } from "~/types/dto";
import { AuthContext, useAuth } from "./AuthContext";
import { subscribeUserInstances } from "~/lib/instanceService";
import Cookies from "js-cookie";
import { socket } from "../lib/socketIO"

export interface DatabaseInstanceContextType {
  instances: DatabaseInstanceResponse[];
  setInstances: Dispatch<SetStateAction<DatabaseInstanceResponse[]>>;
  metrics: MetricsResponse[];
  setMetrics: Dispatch<SetStateAction<MetricsResponse[]>>;
  promises: QueryablePromise<BackupRecord|DatabaseInstanceResponse|RestoreResponse>[];
  addPromise: (promise: Promise<BackupRecord|DatabaseInstanceResponse|RestoreResponse>, metadata?: any) => void;
}

export const DatabaseInstanceContext = createContext<DatabaseInstanceContextType | undefined>(undefined);

interface DatabaseInstanceProviderProps {
  children: ReactNode;
}

export const DatabaseInstanceProvider = ({ children }: DatabaseInstanceProviderProps) => {
  const [instances, setInstances] = useState<DatabaseInstanceResponse[]>([])
  const [metrics, setMetrics] = useState<MetricsResponse[]>([])
  const [promises, setPromises] = useState<QueryablePromise<BackupRecord|DatabaseInstanceResponse|RestoreResponse>[]>([])
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const forceUpdate = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);
  const {token} = useAuth()

  useEffect(() => {
  if (Cookies.get('tndb_token')) {
    console.log(Cookies.get('tndb_token'))
    const interval = setInterval(() => {
        const token = Cookies.get('tndb_token');
        if (token && socket?.connected) {
            let result = subscribeUserInstances(setInstances)
            clearInterval(interval);
            return result
        }
    }, 500);

  return () => clearInterval(interval);
    
  }
  
}, [token]);

    const addPromise = useCallback((newPromise: Promise<any>) => {
        const queryable = MakeQuerablePromise(newPromise, () => {
        forceUpdate();
        });

        setPromises(prevPromises => [...prevPromises, queryable]);
    }, [forceUpdate]);


  return (
    <DatabaseInstanceContext.Provider value={{ instances, setInstances, metrics, setMetrics, promises, addPromise  }}>
      {children}
    </DatabaseInstanceContext.Provider>
  );
};

export const useDatabaseInstances = () => {
  const context = useContext(DatabaseInstanceContext);
  if (!context) {
    throw new Error("useDatabaseInstances must be used within a DatabaseInstanceProvider");
  }
  return context;
};