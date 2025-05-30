import {
  Dialog,
  DialogTrigger,
  DialogPortal,     
  DialogOverlay,   
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Separator } from "./ui/separator"; // Adjust this path
import { signOut } from '~/lib/authService';
import { MakeQuerablePromise, type DatabaseInstanceResponse } from "~/types/dto";
import { provisionDB } from "~/lib/instanceService";
import { useDatabaseInstances } from "~/context/DatabaseInstanceContext";

const Provision = () => {
    const { addPromise } = useDatabaseInstances()
    const [dbName, setDBName] = useState('');
    const [dbEngine, setDBEngine] = useState(''); // e.g., "postgresql", "mongodb"
    const [engineVersion, setEngineVersion] = useState(''); // e.g., "15", "16"
    const [dbUser, setDBUser] = useState(''); // optional, can be empty string/null
    const [dbPassword, setDBPassword] = useState(''); // optional
    const [internalDbName, setInternalDbName] = useState(''); // optional
    const [loading, setLoading] = useState(false); // optional

    const[ resp, setResp ] = useState<DatabaseInstanceResponse>()

    return (
        <Dialog>
            <DialogTrigger onClick={()=>{
                setDBName("")
                setDBEngine("")
                setEngineVersion("")
                setDBUser("")
                setDBPassword("")
                setInternalDbName("")
                setLoading(false)
                setResp(undefined)
            }} asChild>
            <button className="text-blue-500 hover:text-gray-300">
                + Create DB
            </button>
            </DialogTrigger>
            <DialogPortal>
            <DialogOverlay className="fixed inset-0 bg-black/50" /> 

            {loading==true?
            
            <DialogContent className="flex flex-col fixed  transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-[90vw] max-w-[425px]">
                
                <div className="mx-50 my-70 justify-center flex" role="status">
                    <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                    <span className="sr-only">Loading...</span>
                </div>
            </DialogContent>
            :
            <div>
                {resp?.dbId==-1 &&(
                    <DialogContent className="flex flex-col fixed  transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-[90vw] max-w-[425px]">
                
                        <div className="mx-50 my-70 justify-center flex" role="status">
                            Provision Failed
                        </div>
                    </DialogContent>
                )}
                {resp!=null && resp?.dbId!=-1 &&(
                    <DialogContent className="flex flex-col fixed  transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-[90vw] max-w-[425px]">
                
                        {resp?.dbEngine === "postgresql" && (
                            <div className='mx-50 my-70 justify-center flex'>
                                DB Hosted at {"postgresql://" +
                                encodeURIComponent(resp.dbUser) + ":" +
                                encodeURIComponent(resp.dbPassword) + "@" +
                                import.meta.env.VITE_HOST + ":" +
                                resp.hostPort + "/" +
                                resp.internalDbName}
                            </div>
                            )}

                            {resp?.dbEngine === "mongodb" && (
                            <div className='mx-50 my-70 justify-center flex'>
                                DB Hosted at {"mongodb://" +
                                encodeURIComponent(resp.dbUser) + ":" +
                                encodeURIComponent(resp.dbPassword) + "@" +
                                import.meta.env.VITE_HOST + ":" +
                                resp.hostPort + "/" +
                                resp.internalDbName + "?ssl=true"}
                            </div>
                            )}
                    </DialogContent>
                )}

                {resp==null &&(
                    <DialogContent className="flex flex-col fixed  transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-[90vw] max-w-[425px]">
                
                        <DialogHeader>
                            <DialogTitle className='text-center'>Create DB</DialogTitle>
                            <DialogDescription className='font-bold'>
                                General Configuration
                            </DialogDescription>
                        </DialogHeader>

                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input
                                id="name"
                                value={dbName}
                                onChange={(e)=>(setDBName(e.target.value))}
                                className="col-span-3 rounded border px-2 py-1" /* Added basic input styling */
                            />

                            <Label htmlFor="username" className="text-right">DB Engine</Label>
                            <Select value={dbEngine}
                                onValueChange={(e)=>(setDBEngine(e))} >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                                    <SelectItem value="mongodb">MongoDB</SelectItem>
                                </SelectContent>
                            </Select>

                            <Label htmlFor="name" className="text-right">Engine Version</Label>
                            <Input
                                id="version"
                                value={engineVersion}
                                onChange={(e)=>(setEngineVersion(e.target.value))}
                                className="col-span-3 rounded border px-2 py-1"
                            />

                            <Label htmlFor="name" className="text-right">Username</Label>
                            <Input
                                id="user"
                                value={dbUser}
                                onChange={(e)=>(setDBUser(e.target.value))}
                                className="col-span-3 rounded border px-2 py-1" 
                            />

                            <Label htmlFor="name" className="text-right">Password</Label>
                            <Input
                                id="version"
                                value={dbPassword}
                                onChange={(e)=>(setDBPassword(e.target.value))}
                                className="col-span-3 rounded border px-2 py-1"
                            />
                            <Label htmlFor="name" className="text-right">DB Name</Label>
                            <Input
                                id="version"
                                value={internalDbName}
                                onChange={(e)=>(setInternalDbName(e.target.value))}
                                className="col-span-3 rounded border px-2 py-1" 
                            />


                        <DialogFooter>
                        <button
                            type="submit"
                            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600" 
                            onClick={()=>{
                                setLoading(true)
                                const newPromise = provisionDB(dbName, dbEngine, engineVersion, dbUser, dbPassword, internalDbName)
                                    .then((resp) => {
                                    setResp(resp);
                                    setLoading(false);
                                    return resp; 
                                    });

                                addPromise(newPromise);
                                
                            }}
                        >
                            Provision
                        </button>
                        </DialogFooter>
                    </DialogContent>
                )}
            

            </div>
            
            }

            
            </DialogPortal>
        </Dialog>
    );
};

export default Provision;