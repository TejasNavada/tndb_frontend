import React, { useEffect, useState } from 'react';
import { useParams, Outlet, Link, useNavigate } from 'react-router-dom';
import { useDatabaseInstances } from '~/context/DatabaseInstanceContext';
import { subscribeInstanceMetrics } from '~/lib/instanceService';
import type { DatabaseInstanceResponse, UserResponse } from '~/types/dto';
import { Button } from "../components/ui/button"

import CloseIcon from '@mui/icons-material/Close';
import AddRole from '~/components/AddRole';
import { getUsersWithPermisions, revokePermission } from '~/lib/permissionService';
import { Separator } from '../components/ui/separator';

const RoleDetailPage = () => {
  const { dbId } = useParams<{ dbId: string }>();
  const {instances} = useDatabaseInstances();
  const[ instance, setInstance] = useState<DatabaseInstanceResponse>()
  const[ admins, setAdmins] = useState<UserResponse[]>()
  const[ viewers, setViewers] = useState<UserResponse[]>()
  const navigate = useNavigate();

  useEffect(()=>{
    if(dbId){
      setInstance(instances.find((db)=>db.dbId==parseInt(dbId)))
      getUsersWithPermisions(parseInt(dbId)).then((users)=>{
        setAdmins(users.filter((user)=>user.permissionLevel=="ADMIN"))
        setViewers(users.filter((user)=>user.permissionLevel=="VIEWER"))
      })

    }
  },[dbId,setAdmins, setViewers])

  const reGrabPermissions = () => {
    if(dbId){
      getUsersWithPermisions(parseInt(dbId)).then((users)=>{
        setAdmins(users.filter((user)=>user.permissionLevel=="ADMIN"))
        setViewers(users.filter((user)=>user.permissionLevel=="VIEWER"))
      })

    }
  }

  

  return (
    <div className=''>
      <h2 className="flex text-blue-500 hover:text-blue-700 my-2">
        <div onClick={()=>navigate("/dashboard/roles")}>Summary</div>
        <h2 className="mx-2 text-gray-500 hover:underline-none"> {">"} {instance?.userGivenName}</h2>
      </h2>
      <div className=" flex justify-end py-5 px-6 shadow-lg  bg-white rounded-lg "> 
        <div className="flex flex-grow-1 justify-evenly h-full text-center grid grid-cols-15 gap-4"> 

          <div className='col-span-7'>
            <h1 className="text-grey pb-5">Admin</h1>
            <div>
              {admins?.map((user)=>(
                <div className='my-1 py-1 rounded-sm border flex'>
                  <div className='grow'>{user.username}</div>
                  <CloseIcon sx={{cursor:"pointer"}}
                  onClick={()=>{
                    if(dbId){
                      revokePermission(parseInt(dbId),user.userId).then(()=>reGrabPermissions())
                    }
                  }}
                  />
                </div>
              ))}
            </div>
          </div>
            <Separator orientation="vertical" className='mx-auto w-1' />
          <div className='col-span-7'>
            <h1 className="text-grey pb-5">Viewer</h1>
            <div>
              {viewers?.map((user)=>(
                <div className='my-1 py-1 rounded-sm border flex'>
                  <div className='grow'>{user.username}</div>
                  <CloseIcon sx={{cursor:"pointer"}}
                  onClick={()=>{
                    if(dbId){
                      revokePermission(parseInt(dbId),user.userId).then(()=>reGrabPermissions())
                    }
                  }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
          <div >
              {/* User menu, logout button, etc. */}
              
              <AddRole dbName={instance?.userGivenName} dbId={instance?.dbId} reGrabPermissions={reGrabPermissions}/>
          </div>
      </div>
      
      
      
    </div>
  );
};

export default RoleDetailPage;