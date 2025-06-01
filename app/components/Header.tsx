

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel, 
  SelectTrigger,
  SelectValue,
} from "./ui/select"; 
import { Separator } from "./ui/separator"; 
import { signOut } from '~/lib/authService';
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover"
import { useDatabaseInstances } from '~/context/DatabaseInstanceContext';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { promises } = useDatabaseInstances();
  const [currentSection ,setCurrentSection] = useState<string>()


  useEffect(()=>{
    if (location.pathname.startsWith("/dashboard/metrics")) {
      setCurrentSection("metrics")
    }
    else if (location.pathname.startsWith("/dashboard/roles")){
      setCurrentSection("roles")
    } 
    else if (location.pathname.startsWith("/dashboard/instances") || location.pathname === "/dashboard" || location.pathname === "/dashboard/"){
      setCurrentSection("instances")
    }

  }, [location])
  

  const handleValueChange = (value: string) => {
    navigate(`/dashboard/${value}`);
  };

    const bgColors: Record<string, string> = {
    success: "bg-green-500",
    danger: "bg-red-500",
    info: "bg-yellow-500",
    };

    let overallStatusColorKey = "success"; 
    if (promises.length > 0) {
        const hasRejected = promises.some(p => p.isRejected());
        const hasPending = promises.some(p => p.isPending());

    if (hasRejected) {
        overallStatusColorKey = "danger";
    } else if (hasPending) {
        overallStatusColorKey = "info";
    } else {
        overallStatusColorKey = "success";
    }
    } else { 
        overallStatusColorKey = "success";
    }

  return (
    <div className="flex sticky top-0 z-50 justify-between items-center bg-[#22252E] px-6 py-3 shadow-md h-16"> 
      <div className="flex items-center h-full"> 
        <h1 className="text-white font-black text-2xl">TN</h1>
        <Separator
          orientation="vertical"
          className="bg-slate-700 w-px h-6 mx-4" 
          decorative
        />
        <div className="mx-0"> 
          <Select
            value={currentSection} 
            onValueChange={handleValueChange}
          >
            <SelectTrigger className="w-[180px] shadow-none border-none text-white focus:ring-0 bg-[#22252E] hover:bg-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#22252E] text-white border-slate-700">
              <SelectGroup>
                <SelectItem
                  value="instances"
                  className="hover:bg-slate-700 focus:bg-slate-600 cursor-pointer"
                >
                  Instances
                </SelectItem>
                <SelectItem
                  value="roles"
                  className="hover:bg-slate-700 focus:bg-slate-600 cursor-pointer"
                >
                  Roles
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Separator
          orientation="vertical"
          className="bg-slate-700 w-px h-6 mx-4"
          decorative
        />
        <Popover>
            <PopoverTrigger asChild>
                <div className="flex items-center gap-2">
                    <div className={`rounded-full w-9 h-9 text-white flex items-center justify-center ${bgColors[overallStatusColorKey]}`}>
                        {promises.length}
                    </div>
                    <div className="flex items-center">
                        <span className="text-gray-600 text-lg">▼</span>
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-100 bg-[#22252E] border-none text-gray-300 rounded-sm">
                <div className="grid gap-4 bg">
                    <div>Recent Tasks</div>
                    <div className='overflow-y-auto max-h-50 '>
                        {promises.map((promise, index) => {
                            // Determine status and resolved value
                            const isFulfilled = promise.isFulfilled();
                            const isPending = promise.isPending();
                            const isRejected = promise.isRejected();
                            const value = promise.getValue(); 

                            let statusText = '';
                            let statusColorClass = 'bg-gray-400'; 

                            if (isFulfilled) {
                            statusColorClass = 'bg-green-500';
                            if (value) {
                                if (value.kind === 'BackupRecordResponse') {
                                statusText = 'Backup DB';
                                } else if (value.kind === 'DatabaseInstanceResponse') {
                                statusText = 'Provision DB';
                                } else if (value.kind === 'RestoreResponse') {
                                statusText = 'Restore DB';
                                } else if (value.kind === 'DeleteResponse') {
                                statusText = 'Delete DB';
                                } else {
                                statusText = 'Completed (Unknown Type)';
                                }
                            } else {
                                statusText = 'Completed (Value Missing)';
                            }
                            } else if (isPending) {
                            statusColorClass = 'bg-yellow-500'; 
                            statusText = 'In Progress...';
                            } else if (isRejected) {
                            statusColorClass = 'bg-red-500'; 
                            statusText = 'Failed';
                            }

                            return (
                            <div key={index} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow mb-2">
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {statusText}
                                </div>
                                <div className="flex items-center">
                                {/* Donut representing status */}
                                <div className={`w-3 h-3 rounded-full ${statusColorClass}`}></div>
                                </div>
                            </div>
                            );
                        })}

                    </div>
                    
                </div>
            </PopoverContent>
            </Popover>
      </div>
      <div className="flex items-center">
        {/* User menu, logout button, etc. */}
        <button
          onClick={() => {
            signOut(); 
            navigate('/login');
          }}
          className="text-white hover:text-gray-300"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;