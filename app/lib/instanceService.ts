import axios from 'axios';
import Cookies from 'js-cookie';
import { socket } from "./socketIO"
import type { BackupRecord, DatabaseInstanceResponse, DatabaseInstanceWithBackupsResponse, DeleteResponse, MetricsResponse, RestoreResponse } from '~/types/dto';
import type { SetStateAction } from 'react';

const url = `${import.meta.env.VITE_HOST_API}/databases`; 

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


export const getAllInstances = async (): Promise<DatabaseInstanceResponse[]> => {
  try {
    initializeAxiosHeader();
    const res = await axios.get(`${url}`);
    return res.data;
  } catch (e) {
    console.error("Error fetching databases:", e);
    throw e; 
  }
};
export const provisionDB = async (dbName :string, dbEngine :string, engineVersion :string, dbUser :string, dbPassword :string, internalDbName :string): Promise<DatabaseInstanceResponse> => {
  try {
    initializeAxiosHeader();
    const res = await axios.post(`${url}`,{
        dbName: dbName,
        dbEngine: dbEngine,
        engineVersion: engineVersion,
        dbUser: dbUser,
        dbPassword: dbPassword,
        internalDbName: internalDbName,
    })
    return res.data;
  } catch (e) {
    console.error("Error fetching databases:", e);
    return {
        dbId: -1,
        userGivenName: "",
        containerName: "",
        dbEngine: "",
        engineVersion: "",
        status: "",
        hostPort: 0,
        dbUser: "",
        internalDbName: "",
    } as DatabaseInstanceResponse
  } 
};

export const clone = async (sourceId:number, dbName :string, dbUser :string, dbPassword :string, internalDbName :string): Promise<DatabaseInstanceResponse> => {
  try {
    initializeAxiosHeader();
    const res = await axios.post(`${url}/${sourceId}/clone`,{
        dbName: dbName,
        dbEngine: null,
        engineVersion: null,
        dbUser: dbUser,
        dbPassword: dbPassword,
        internalDbName: internalDbName,
    })
    return res.data;
  } catch (e) {
    console.error("Error fetching databases:", e);
    return {
        dbId: -1,
        userGivenName: "",
        containerName: "",
        dbEngine: "",
        engineVersion: "",
        status: "",
        hostPort: 0,
        dbUser: "",
        internalDbName: "",
    } as DatabaseInstanceResponse
  } 
};

export const backupDB = async (dbId: number): Promise<BackupRecord> => {
  try {
    initializeAxiosHeader();
    const res = await axios.post(`${url}/${dbId}/backup`)
    return res.data;
  } catch (e) {
    console.error("Error fetching databases:", e);
    return {
        backupId: -1,
        dbId: -1,
        userGivenName: "",
        filePath: "",
        createdAt: "",
    } as BackupRecord
  } 
};

export const deleteDB = async (dbId:number): Promise<DeleteResponse> => {
  try {
    initializeAxiosHeader();
    const res = await axios.delete(`${url}/${dbId}`)
    console.log(res)
    
  } catch (e) {
    console.error("Error fetching databases:", e);
  } 
  return {kind: "DeleteResponse"} as RestoreResponse
};


export const getDbWithBackups = async (): Promise<DatabaseInstanceWithBackupsResponse[]> => {
  try {
    initializeAxiosHeader();
    const res = await axios.get(`${url}/with-backups`)
    return res.data;
  } catch (e) {
    console.error("Error fetching databases:", e);
    return []
  } 
};

export const restore = async (dbId:number,backupRecordId:number): Promise<RestoreResponse> => {
  try {
    initializeAxiosHeader();
    const res = await axios.post(`${url}/${dbId}/restore/${backupRecordId}`)
    console.log(res)
    
  } catch (e) {
    console.error("Error fetching databases:", e);
  } 
  return {kind: "RestoreResponse"} as RestoreResponse
};




export const subscribeUserInstances = (updateDbInstances: (arg0: (prevdbInstances: any) => any) => void) => {
    console.log("subscribing to dbInstances")
    console.log(socket)
    socket?.emit("subscribe_user_db_updates", null, (ack: any) => console.log(ack));

    const handleUpdateDbInstances = (res: { data: { dbId: any; }; operation: string; }) => {
        console.log(res)
        let dbInstance = convertToDBInstanceResponse(res.data)
        updateDbInstances((prevdbInstances: any[])=>{
            let dbIndex = prevdbInstances?.findIndex((db => db.dbId === dbInstance.dbId))
            if (dbIndex !== -1) {
                if (res.operation === "INSERT") {
                    let newdbInstances = [...prevdbInstances]
                    newdbInstances.push(dbInstance)
                    return newdbInstances
                } else if (res.operation === "UPDATE") {
                    let newdbInstances = [...prevdbInstances]
                    newdbInstances[dbIndex] = dbInstance
                    return newdbInstances
                } else if (res.operation === "DELETE") {
                    let newdbInstances = [...prevdbInstances]
                    newdbInstances.splice(dbIndex, 1)
                    return newdbInstances
                }
            } else {
                if (res.operation === "INSERT") {
                    let newdbInstances = [...prevdbInstances]
                    newdbInstances.push(dbInstance)
                    return newdbInstances
                }
                return prevdbInstances
            }
        })
    }

    socket?.on("db_instance_update", handleUpdateDbInstances)
    socket?.on("disconnect", handleUpdateDbInstances)

    

    return () => {
        socket?.off("db_instance_update", handleUpdateDbInstances)
        socket?.emit("unsubscribe_user_db_updates")
    }
}
export const convertToDBInstanceResponse =  (obj: any): DatabaseInstanceResponse => {
    return {
        dbId: obj.db_id,
        userGivenName: obj.user_given_name,
        containerName: obj.container_name,
        dbEngine: obj.db_engine,
        engineVersion: obj.engine_version,
        status: obj.status,
        hostPort: obj.host_port,
        dbUser:obj.db_user,
        dbPassword:obj.db_password,
        internalDbName: obj.internal_db_name,

    } as DatabaseInstanceResponse
}

export const subscribeInstanceMetrics = (
  dbInstanceIdToWatch: number | undefined,
  metricsUpdateHandler: { (value: SetStateAction<MetricsResponse[]>): void; (arg0: any[]): void; } // (metrics: MetricsResponse | MetricsResponse[]) => void
) => {
  if (!socket || !socket.connected) {
    console.warn(`[Subscribe ${dbInstanceIdToWatch}] Socket not connected or available. Cannot subscribe to metrics.`);
    return () => { 
      console.log(`[Unsubscribe ${dbInstanceIdToWatch}] NO-OP cleanup (socket was not connected/available at subscribe time).`);
    };
  }

  console.log(`[Subscribe ${dbInstanceIdToWatch}] Setting up metrics subscription.`);

  const handleInitialBacklog = (backlog:  MetricsResponse[]) => {
    console.log(`[Metrics Backlog ${dbInstanceIdToWatch}] Received:`, backlog);
    if (Array.isArray(backlog) && backlog.length > 0) {
      metricsUpdateHandler(backlog); // Send the whole array
    } else if (Array.isArray(backlog) && backlog.length === 0) {
      metricsUpdateHandler([]); // Send empty array if backlog is empty
    }
  };

  const handleLiveUpdate = (metric: MetricsResponse) => {
    if (metric.instanceId === dbInstanceIdToWatch) {
      console.log(`[Metrics Live Update ${dbInstanceIdToWatch}] Received:`, metric);
      //metricsUpdateHandler([metric]); 
      metricsUpdateHandler((prevMetrics: MetricsResponse[]) => [...prevMetrics, metric]);
    }
  };

  const handleMetricsError = (errorData: { instanceId?: number, message: string }) => {
    if (errorData.instanceId === dbInstanceIdToWatch || !errorData.instanceId) {
        console.error(`[Metrics Error ${dbInstanceIdToWatch}] Received:`, errorData.message);
    }
  };
  

  socket.on("db_metrics_initial_backlog", handleInitialBacklog); //event for backlog
  socket.on("db_metrics_update", handleLiveUpdate);
  socket.on("db_metrics_error", handleMetricsError); 

  socket.emit("subscribe_db_metrics", dbInstanceIdToWatch, (ack: any) => {
    console.log(`[Subscribe Ack ${dbInstanceIdToWatch}]`, ack);
  });

  return () => {
    console.log(`[Unsubscribe ${dbInstanceIdToWatch}] Cleaning up metrics subscription.`);
    if (!socket) {
      console.warn(`[Unsubscribe ${dbInstanceIdToWatch}] Socket instance is null during cleanup. Cannot fully unsubscribe.`);
      return;
    }
    socket.off("db_metrics_initial_backlog", handleInitialBacklog);
    socket.off("db_metrics_update", handleLiveUpdate);
    socket.off("db_metrics_error", handleMetricsError); 

    if (socket.connected) {
      socket.emit("unsubscribe_db_metrics", dbInstanceIdToWatch, (ack: any) => {
        console.log(`[Unsubscribe Ack ${dbInstanceIdToWatch}] Server ack:`, ack);
      });
    } else {
      console.warn(`[Unsubscribe ${dbInstanceIdToWatch}] Socket not connected during cleanup. Cannot emit unsubscribe event to server.`);
    }
  };
};

export const subscribeInstanceMetrics1 = (
  dbInstanceIdToWatch: number,
  updateMetricsCallback: (updater: (prevMetrics: MetricsResponse[]) => MetricsResponse[]) => void
): (() => void) => { 

  if (!socket || !socket.connected) {
    console.warn(`[Subscribe ${dbInstanceIdToWatch}] Socket not connected or available. Cannot subscribe to metrics.`);
    return () => { 
      console.log(`[Unsubscribe ${dbInstanceIdToWatch}] NO-OP cleanup (socket was not connected/available at subscribe time).`);
    };
  }

  console.log(`[Subscribe ${dbInstanceIdToWatch}] Setting up metrics subscription.`);

  const handleUpdateDbMetrics = (res: MetricsResponse) => { 
    if (res.instanceId === dbInstanceIdToWatch) { 
        console.log(dbInstanceIdToWatch)
        console.log(res)
        updateMetricsCallback((prevMetrics: MetricsResponse[]) => {
        const updated = [...prevMetrics, res];
        return updated.length > 500 ? updated.slice(1) : updated;
        });
    }
  };

  const handleMetricsError = (errorData: { instanceId?: number, message: string }) => {
    if (errorData.instanceId === dbInstanceIdToWatch || !errorData.instanceId) {
        console.error(`[Metrics Error ${dbInstanceIdToWatch}] Received:`, errorData.message);
    }
  };

  socket.on("db_metrics_update", handleUpdateDbMetrics);
  socket.on("db_metrics_error", handleMetricsError); 

  socket.emit("subscribe_db_metrics", dbInstanceIdToWatch, (ack: any) => {
    console.log(`[Subscribe Ack ${dbInstanceIdToWatch}]`, ack);
  });

  return () => {
    console.log(`[Unsubscribe ${dbInstanceIdToWatch}] Attempting to clean up metrics subscription.`);
    
    if (!socket) {
      console.warn(`[Unsubscribe ${dbInstanceIdToWatch}] Socket instance is null during cleanup. Cannot fully unsubscribe.`);
      return;
    }

    socket.off("db_metrics_update", handleUpdateDbMetrics);
    socket.off("db_metrics_error", handleMetricsError); 

    if (socket.connected) {
      socket.emit("unsubscribe_db_metrics", dbInstanceIdToWatch, (ack: any) => {
        console.log(`[Unsubscribe Ack ${dbInstanceIdToWatch}] Server ack:`, ack);
      });
    } else {
      console.warn(`[Unsubscribe ${dbInstanceIdToWatch}] Socket not connected during cleanup. Cannot emit unsubscribe event to server.`);
    }
  };
};