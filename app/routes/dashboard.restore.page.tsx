
import React, { useEffect, useState } from 'react';
import { useParams, Outlet, Link } from 'react-router-dom';
import { Card } from '~/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Separator } from '~/components/ui/separator';
import { useDatabaseInstances } from '~/context/DatabaseInstanceContext';
import { getDbWithBackups, restore } from '~/lib/instanceService';
import type { DatabaseInstanceWithBackupsResponse } from '~/types/dto';


const InstanceRestorePage = () => {
    const { dbId } = useParams<{ dbId: string }>();
    const {promises, addPromise} = useDatabaseInstances()
    const {instances} = useDatabaseInstances();
    const [dbWithBackups, setDbWithBackups] = useState<DatabaseInstanceWithBackupsResponse[]>([])
    const [backups, setBackups] = useState([])


    useEffect(()=>{
        console.log(dbId)
        if(dbId){
            console.log(dbId)
            let thisInstance = instances.find((db)=>db.dbId === parseInt(dbId))
            getDbWithBackups().then((response)=>{
                console.log(response)
                console.log()
                setDbWithBackups(response.filter((val)=>val.dbEngine==thisInstance?.dbEngine))
                
            })
        }
    },[dbId, promises, instances])

    useEffect(()=>{
        console.log(dbWithBackups)
    },[dbWithBackups])


  return (
    <div className='my-5'>
      <div className='grid grid-cols-4'>
        {dbWithBackups.map((db)=>(
            <Popover>
            <PopoverTrigger asChild>
                <Card className='p-5'>
                    <div className="flex justify-between">
                        <div className='text-gray-500 min-w-30'>Name</div>
                        <div className='text-right break-all'>{db?.userGivenName}</div>
                    </div>
                    <div className="flex justify-between">
                        <div className='text-gray-500 min-w-30'>DB Name</div>
                        <div className='text-right break-all'>{db?.internalDbName}</div>
                    </div>
                    <div className="flex justify-between">
                        <div className='text-gray-500 min-w-30'>Engine</div>
                        <div className='text-right break-all'>{db?.dbEngine}</div>
                    </div>
                    <div className="flex justify-between">
                        <div className='text-gray-500 min-w-30'>Engine Version</div>
                        <div className='text-right break-all'>{db?.engineVersion}</div>
                    </div>
                    <div className="flex justify-between">
                        <div className='text-gray-500 min-w-30'>Status</div>
                        <div className='text-right break-all'>{db?.status}</div>
                    </div>
                </Card>
            </PopoverTrigger>
            <PopoverContent className="w-100  border-none text-gray-300 rounded-sm">
                <div>
                    {db.backups.map((backup)=>(
                        <div>
                            <div className="flex justify-between"
                            onClick={()=>{
                                if(dbId){
                                    const newPromise = restore(parseInt(dbId),backup.backupId)
                                        .then((resp) => {
                                        return resp; 
                                        });

                                    addPromise(newPromise);
                                }
                                
                                
                            }}
                            >
                                <div className='text-gray-500 max-w-30'>{backup.userGivenName}</div>
                                <div className='text-gray-500 text-right break-all'>{new Date(backup.createdAt).toDateString()} {new Date(backup.createdAt).toLocaleTimeString()}</div>
                            </div>
                            <Separator/>
                        </div>
                        
                    ))}
                </div>
            </PopoverContent>
            </Popover>
        ))}
      </div>
      <Outlet />
    </div>
  );
};

export default InstanceRestorePage;