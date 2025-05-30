export interface DatabaseInstanceResponse {
    kind: string;
    dbId: number; 
    userGivenName: string;
    containerName: string;
    dbEngine: string;
    engineVersion: string;
    status: string;
    hostPort: number;
    dbUser: string;
    dbPassword: string;
    internalDbName: string;
  }

  
export interface RestoreResponse {
    kind?: string;
}
export interface DeleteResponse {
    kind?: string;
}


export interface DatabaseInstanceWithBackupsResponse {
    kind: string;
    dbId: number; 
    userGivenName: string;
    containerName: string;
    dbEngine: string;
    engineVersion: string;
    status: string;
    hostPort: number;
    dbUser: string;
    dbPassword: string;
    internalDbName: string;
    backups: Array<BackupRecord>;
  }

  export interface MetricsResponse {
    kind?: string;
    instanceId: number; 
    status: string;
    connectable: boolean;
    containerCpuPercentage?: number;
    containerMemUsageBytes: number;
    containerMemLimitBytes: number;
    containerMemPercentage: number;
    containerNetRxBytes: number;
    containerNetTxBytes: number;
    containerBlockReadBytes: number;
    containerBlockWriteBytes: number;
    pidsCurrent: number;
    dbCacheHitRate: number;
    dbThroughput: number;
    containerStatsError?: string;
    
    dbActiveConnections: number;
    dbSizeBytes: number;
    dbMetricsError?: string;
  }

export interface BackupRecord {
    kind: string;
    backupId: number; 
    dbId: number;
    userGivenName: string;
    filePath: string;
    createdAt: string;
}

export interface QueryablePromise<T> extends Promise<T> {
  isFulfilled: () => boolean;
  isPending: () => boolean;
  isRejected: () => boolean;
  getValue: () => T | undefined;
  getError: () => any | undefined;
}

export function MakeQuerablePromise<T>(
    promise: Promise<T>,
    onSettled?: () => void
): QueryablePromise<T> {
    
    if ((promise as QueryablePromise<T>).isFulfilled) {
        
        const qPromise = promise as QueryablePromise<T>;
        if (onSettled && !qPromise.isPending()) {
            onSettled();
        }
        return qPromise;
    }

    
    let isPending = true;
    let isRejected = false;
    let isFulfilled = false;
    let resolvedValue: T | undefined = undefined;
    let rejectionError: any | undefined = undefined;

    
    const result = promise.then(
        (v: T) => {
            isFulfilled = true;
            isPending = false;
            resolvedValue = v;
            if (onSettled) {
                onSettled();
            }
            return v;
        },
        (e: any) => {
            isRejected = true;
            isPending = false;
            rejectionError = e;
            if (onSettled) {
                onSettled();
            }
            throw e;
        }
    ) as QueryablePromise<T>; 

    result.isFulfilled = () => isFulfilled;
    result.isPending = () => isPending;
    result.isRejected = () => isRejected;
    result.getValue = () => resolvedValue;
    result.getError = () => rejectionError;

    return result;
}