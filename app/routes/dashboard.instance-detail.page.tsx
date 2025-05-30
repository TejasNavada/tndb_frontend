import React, { useEffect, useState } from 'react';
import { useParams, Outlet, Link, useNavigate } from 'react-router-dom';
import { useDatabaseInstances } from '~/context/DatabaseInstanceContext';
import { subscribeInstanceMetrics } from '~/lib/instanceService';
import type { DatabaseInstanceResponse } from '~/types/dto';
import { Button } from "../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs"
import { LineChart } from '@mui/x-charts/LineChart';

const InstanceDetailPage = () => {
  const {instances, metrics, setMetrics} = useDatabaseInstances();
  const { dbId } = useParams<{ dbId: string }>();
  const[ instance, setInstance] = useState<DatabaseInstanceResponse>()
  const navigate = useNavigate();

  useEffect(()=>{
    if(dbId){
      setMetrics([])
      setInstance(instances.find((db)=>db.dbId==parseInt(dbId)))
      let unsubscribe = subscribeInstanceMetrics(parseInt(dbId),setMetrics)
      return () => {
        unsubscribe();
    };
    }
  },[dbId, setMetrics, instances])

  

  return (
    <div>
      <Outlet />
      <h2 className="flex text-blue-500 hover:text-blue-700 my-2">
        <div onClick={()=>navigate("/dashboard/instances")}>Summary</div>
        <h2 className="mx-2 text-gray-500 hover:underline-none"> {">"} {instance?.userGivenName}</h2>
      </h2>
      <div className="flex">
        <div className="bg-white p-2 mr-3 w-100 rounded-sm">
          <h2 className="mb-4">DB DETAILS</h2>
          <div className="flex justify-between">
            <div className='text-gray-500 min-w-30'>Name</div>
            <div className='text-right break-all'>{instance?.userGivenName}</div>
          </div>
          <div className="flex justify-between">
            <div className='text-gray-500 min-w-30'>VM Name</div>
            <div className='text-right break-all'>{instance?.containerName}</div>
          </div>
          <div className="flex justify-between">
            <div className='text-gray-500 min-w-30'>Engine</div>
            <div className='text-right break-all'>{instance?.dbEngine}</div>
          </div>
          <div className="flex justify-between">
            <div className='text-gray-500 min-w-30'>Engine Version</div>
            <div className='text-right break-all'>{instance?.engineVersion}</div>
          </div>
          <div className="flex justify-between">
            <div className='text-gray-500 min-w-30'>Host</div>
            {instance?.dbEngine === "postgresql" && (
              <div className='break-all text-sm max-w-full text-right'>
                {"postgresql://" +
                  encodeURIComponent(instance.dbUser) + ":" +
                  encodeURIComponent(instance.dbPassword) + "@" +
                  import.meta.env.VITE_HOST + ":" +
                  instance.hostPort + "/" +
                  instance.internalDbName}
              </div>
            )}

            {instance?.dbEngine === "mongodb" && (
              <div className='break-all text-sm max-w-full text-right'>
                {"mongodb://" +
                  encodeURIComponent(instance.dbUser) + ":" +
                  encodeURIComponent(instance.dbPassword) + "@" +
                  import.meta.env.VITE_HOST + ":" +
                  instance.hostPort + "/" +
                  instance.internalDbName + "?ssl=true"}
              </div>
            )}
          </div>
          <div className="flex justify-between">
            <div className='text-gray-500 min-w-30'>Status</div>
            <div className='text-right break-all'>{instance?.status}</div>
          </div>
        </div>
        <div className="bg-white p-2 flex-1 rounded-sm">
          <Tabs defaultValue="compute" className="">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="compute">VM Compute</TabsTrigger>
              <TabsTrigger value="network">VM Network IO</TabsTrigger>
              <TabsTrigger value="db">DB Stats</TabsTrigger>
              <TabsTrigger value="db mem">DB Mem</TabsTrigger>
            </TabsList>
            <TabsContent value="compute">
              <Card className='flex gap-4 p-4'>
                <div className='flex-1'>
                  <div className='flex justify-between ml-17'>
                    <div className='font-bold truncate'>
                      CPU Usage
                    </div>
                    <div className='text-gray-500 mr-10 flex '>
                      <div className='mx-4 truncate'>
                        Peak: {(() => {
                        const values = metrics
                          .map((val) => val?.containerCpuPercentage)
                          .filter((val) => val != null);

                        return values.length > 0 ? `${Math.max(...values).toFixed(2)}%` : "N/A"; 
                      })()}
                      </div>
                      <div className='truncate'>
                        Current: {
                          (() => {
                            const last = metrics[metrics.length - 1];
                            const value = last?.containerCpuPercentage;
                            return value != null ? `${value.toFixed(2)}%` : 'N/A';
                          })()
                        }

                      </div>
                        
                    </div>
                  </div>
                  <LineChart
                    xAxis={[
                      {
                        data: metrics.map((_, idx) => idx + 1),
                        // scaleType: 'point',
                        tickLabelStyle: { display: 'none' }, 
                      },
                    ]}
                    series={[
                      {
                        data: metrics.map((val)=>val?.containerCpuPercentage).filter((val)=>val!=null),
                        area: true,
                        color: 'rgba(53, 162, 235, 0.3)',
                        showMark: false,
                      },
                    ]}
                    height={300}
                  />

                </div>
                <div className='flex-1'>
                  <div className='flex justify-between ml-17'>
                    <div className='font-bold truncate'>
                      Mem %
                    </div>
                    <div className='text-gray-500 mr-10 flex '>
                      <div className='mx-4 truncate'>
                        Peak: {(() => {
                        const values = metrics
                          .map((val) => val?.containerMemPercentage)
                          .filter((val) => val != null);

                        return values.length > 0 ? `${Math.max(...values).toFixed(2)}%` : "N/A"; 
                      })()}
                      </div>
                      <div className='truncate'>
                        Current: {
                          (() => {
                            const last = metrics[metrics.length - 1];
                            const value = last?.containerMemPercentage;
                            return value != null ? `${value.toFixed(2)}%` : 'N/A';
                          })()
                        }

                      </div>
                        
                    </div>
                  </div>
                  <LineChart
                    xAxis={[
                      {
                        data: metrics.map((_, idx) => idx + 1),
                        // scaleType: 'point',
                        tickLabelStyle: { display: 'none' }, 
                      },
                    ]}
                    series={[
                      {
                        data: metrics.map((val)=>val?.containerMemPercentage).filter((val)=>val!=null),
                        area: true,
                        color: 'rgba(53, 162, 235, 0.3)',
                        showMark: false,
                      },
                    ]}
                    height={300}
                  />

                </div>
                
              </Card>
              
            </TabsContent>
            
            
            <TabsContent value="network">
              <Card className='flex gap-4 p-4'>
                <div className='flex-1'>
                  <div className='flex justify-between ml-17'>
                    <div className='font-bold truncate'>
                      Bytes Received
                    </div>
                    <div className='text-gray-500 mr-10 flex '>
                      <div className='mx-4 truncate'>
                        Peak: {(() => {
                        const values = metrics
                          .map((val) => val?.containerNetRxBytes)
                          .filter((val) => val != null);

                        return values.length > 0 ? Math.max(...values) : "N/A"; 
                      })()}
                      </div>
                      <div className='truncate'>
                        Current: {
                          (() => {
                            const last = metrics[metrics.length - 1];
                            const value = last?.containerNetRxBytes;
                            return value != null ? `${value}` : 'N/A';
                          })()
                        }

                      </div>
                        
                    </div>
                  </div>
                  <LineChart
                    xAxis={[
                      {
                        data: metrics.map((_, idx) => idx + 1),
                        // scaleType: 'point',
                        tickLabelStyle: { display: 'none' }, 
                      },
                    ]}
                    series={[
                      {
                        data: metrics.map((val)=>val?.containerNetRxBytes).filter((val)=>val!=null),
                        area: true,
                        color: 'rgba(53, 162, 235, 0.3)',
                        showMark: false,
                      },
                    ]}
                    height={300}
                  />

                </div>
                <div className='flex-1'>
                  <div className='flex justify-between ml-17'>
                    <div className='font-bold truncate'>
                      Bytes Transmitted
                    </div>
                    <div className='text-gray-500 mr-10 flex '>
                      <div className='mx-4 truncate'>
                        Peak: {(() => {
                        const values = metrics
                          .map((val) => val?.containerNetTxBytes)
                          .filter((val) => val != null);

                        return values.length > 0 ? Math.max(...values) : "N/A"; 
                      })()}
                      </div>
                      <div className='truncate'>
                        Current: {
                          (() => {
                            const last = metrics[metrics.length - 1];
                            const value = last?.containerNetTxBytes;
                            return value != null ? `${value}` : 'N/A';
                          })()
                        }

                      </div>
                        
                    </div>
                  </div>
                  <LineChart
                    xAxis={[
                      {
                        data: metrics.map((_, idx) => idx + 1),
                        // scaleType: 'point',
                        tickLabelStyle: { display: 'none' },
                      },
                    ]}
                    series={[
                      {
                        data: metrics.map((val)=>val?.containerNetTxBytes).filter((val)=>val!=null),
                        area: true,
                        color: 'rgba(53, 162, 235, 0.3)',
                        showMark: false,
                      },
                    ]}
                    height={300}
                  />

                </div>
                
              </Card>
            </TabsContent>
            <TabsContent value="db">
              <Card className='flex gap-4 p-4'>
                <div className='flex-1'>
                  <div className='flex justify-between ml-17'>
                    <div className='font-bold truncate'>
                      Active Connections
                    </div>
                    <div className='text-gray-500 mr-10 flex '>
                      <div className='mx-4 truncate'>
                        Peak: {(() => {
                        const values = metrics
                          .map((val) => val?.dbActiveConnections)
                          .filter((val) => val != null);

                        return values.length > 0 ? Math.max(...values) : "N/A";
                      })()}
                      </div>
                      <div className='truncate'>
                        Current: {
                          (() => {
                            const last = metrics[metrics.length - 1];
                            const value = last?.dbActiveConnections;
                            return value != null ? `${value}` : 'N/A';
                          })()
                        }

                      </div>
                        
                    </div>
                  </div>
                  <LineChart
                    xAxis={[
                      {
                        data: metrics.map((_, idx) => idx + 1),
                        // scaleType: 'point',
                        tickLabelStyle: { display: 'none' }, 
                      },
                    ]}
                    series={[
                      {
                        data: metrics.map((val)=>val?.dbActiveConnections).filter((val)=>val!=null),
                        area: true,
                        color: 'rgba(53, 162, 235, 0.3)',
                        showMark: false,
                      },
                    ]}
                    height={300}
                  />

                </div>
                <div className='flex-1'>
                  <div className='flex justify-between ml-17'>
                    <div className='font-bold truncate'>
                      Throughput
                    </div>
                    <div className='text-gray-500 mr-10 flex '>
                      <div className='mx-4 truncate'>
                        Peak: {(() => {
                        const values = metrics
                          .map((val) => val?.dbThroughput)
                          .filter((val) => val != null);

                        return values.length > 0 ? Math.max(...values) : "N/A"; 
                      })()}
                      </div>
                      <div className='truncate'>
                        Current: {
                          (() => {
                            const last = metrics[metrics.length - 1];
                            const value = last?.dbThroughput;
                            return value != null ? `${value}` : 'N/A';
                          })()
                        }

                      </div>
                        
                    </div>
                  </div>
                  <LineChart
                    xAxis={[
                      {
                        data: metrics.map((_, idx) => idx + 1),
                        // scaleType: 'point',
                        tickLabelStyle: { display: 'none' }, 
                      },
                    ]}
                    series={[
                      {
                        data: metrics.map((val)=>val?.dbThroughput).filter((val)=>val!=null),
                        area: true,
                        color: 'rgba(53, 162, 235, 0.3)',
                        showMark: false,
                      },
                    ]}
                    height={300}
                  />

                </div>
                
              </Card>
            </TabsContent>

            <TabsContent value="db mem">
              <Card className='flex gap-4 p-4'>
                <div className='flex-1'>
                  <div className='flex justify-between ml-17'>
                    <div className='font-bold truncate'>
                      Cache Hit Rate
                    </div>
                    <div className='text-gray-500 mr-10 flex '>
                      <div className='mx-4 truncate'>
                        Peak: {(() => {
                        const values = metrics
                          .map((val) => val?.dbCacheHitRate)
                          .filter((val) => val != null);

                        return values.length > 0 ? `${Math.max(...values).toFixed(2)}%` : "N/A";
                      })()}
                      </div>
                      <div className='truncate'>
                        Current: {
                          (() => {
                            const last = metrics[metrics.length - 1];
                            const value = last?.dbCacheHitRate;
                            return value != null ? `${value}%` : 'N/A';
                          })()
                        }

                      </div>
                        
                    </div>
                  </div>
                  <LineChart
                    xAxis={[
                      {
                        data: metrics.map((_, idx) => idx + 1),
                        // scaleType: 'point',
                        tickLabelStyle: { display: 'none' }, 
                      },
                    ]}
                    series={[
                      {
                        data: metrics.map((val)=>val?.dbCacheHitRate).filter((val)=>val!=null),
                        area: true,
                        color: 'rgba(53, 162, 235, 0.3)',
                        showMark: false,
                      },
                    ]}
                    height={300}
                  />

                </div>
                <div className='flex-1'>
                  <div className='flex justify-between ml-17'>
                    <div className='font-bold truncate'>
                      DB Size (B)
                    </div>
                    <div className='text-gray-500 mr-10 flex '>
                      <div className='mx-4 truncate'>
                        Peak: {(() => {
                        const values = metrics
                          .map((val) => val?.dbSizeBytes)
                          .filter((val) => val != null);

                        return values.length > 0 ? Math.max(...values) : "N/A"; 
                      })()}
                      </div>
                      <div className='truncate'>
                        Current: {
                          (() => {
                            const last = metrics[metrics.length - 1];
                            const value = last?.dbSizeBytes;
                            return value != null ? `${value}` : 'N/A';
                          })()
                        }

                      </div>
                        
                    </div>
                  </div>
                  <LineChart
                    xAxis={[
                      {
                        data: metrics.map((_, idx) => idx + 1),
                        // scaleType: 'point',
                        tickLabelStyle: { display: 'none' }, 
                      },
                    ]}
                    series={[
                      {
                        data: metrics.map((val)=>val?.dbSizeBytes).filter((val)=>val!=null),
                        area: true,
                        color: 'rgba(53, 162, 235, 0.3)',
                        showMark: false,
                      },
                    ]}
                    height={300}
                  />

                </div>
                
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        
        

      </div>
      
    </div>
  );
};

export default InstanceDetailPage;