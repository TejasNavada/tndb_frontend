// src/components/Clone.tsx (or your path)
import React, { useState, useEffect, type ReactNode } from 'react';
import {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { type DatabaseInstanceResponse } from "~/types/dto";
import { clone } from "~/lib/instanceService";
import { useDatabaseInstances } from "~/context/DatabaseInstanceContext";

interface CloneProps {
    sourceId: number;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const Clone = ({ sourceId, isOpen, onOpenChange  }: CloneProps) => {
    const { addPromise } = useDatabaseInstances();
    const [dbName, setDBName] = useState('');
    const [dbUser, setDBUser] = useState('');
    const [dbPassword, setDBPassword] = useState('');
    const [internalDbName, setInternalDbName] = useState('');
    const [loading, setLoading] = useState(false);
    const [resp, setResp] = useState<DatabaseInstanceResponse | undefined>();

    useEffect(() => {
        if (isOpen) {
            setDBName('');
            setDBUser('');
            setDBPassword('');
            setInternalDbName('');
            setLoading(false);
            setResp(undefined);
        }
    }, [isOpen]);
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogPortal>
                <DialogOverlay className="fixed inset-0 bg-black/50" />
                <DialogContent className="flex flex-col fixed transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-[90vw] max-w-[425px] gap-3">
                    {loading ? (
                        <div className="flex h-40 items-center justify-center" role="status">
                            {/* SVG Spinner */}
                            <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg><span className="sr-only">Loading...</span>
                        </div>
                    ) : resp?.dbId === -1 ? (
                        <div className="flex h-40 items-center justify-center" role="status">Clone Failed</div>
                    ) : resp && resp.dbId !== -1 ? (
                        <div className="flex flex-col gap-2 text-sm items-center justify-center h-40 break-all p-4">
                            <p className="font-semibold text-lg">Clone Successful!</p>
                            {resp.dbEngine === "postgresql" && (<div>Connect using: <br /><code className="bg-gray-100 p-1 rounded text-xs">{"postgresql://" + encodeURIComponent(resp.dbUser) + ":" + encodeURIComponent(resp.dbPassword) + "@" + import.meta.env.VITE_HOST + ":" + resp.hostPort + "/" + resp.internalDbName}</code></div>)}
                            {resp.dbEngine === "mongodb" && (<div>Connect using: <br /><code className="bg-gray-100 p-1 rounded text-xs">{"mongodb://" + encodeURIComponent(resp.dbUser) + ":" + encodeURIComponent(resp.dbPassword) + "@" + import.meta.env.VITE_HOST + ":" + resp.hostPort + "/" + resp.internalDbName + "?ssl=true"}</code></div>)}
                        </div>
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle className='text-center'>Clone Database</DialogTitle>
                                <DialogDescription className='font-bold text-center'>Configure the new database instance</DialogDescription>
                            </DialogHeader>
                            <div><Label htmlFor="clone-dialog-name">New DB Name (Display)</Label><Input id="clone-dialog-name" value={dbName} onChange={(e) => setDBName(e.target.value)} className="rounded border px-2 py-1 w-full" /></div>
                            <div><Label htmlFor="clone-dialog-user">New DB Username</Label><Input id="clone-dialog-user" value={dbUser} onChange={(e) => setDBUser(e.target.value)} className="rounded border px-2 py-1 w-full" /></div>
                            <div><Label htmlFor="clone-dialog-password">New DB Password</Label><Input id="clone-dialog-password" type="password" value={dbPassword} onChange={(e) => setDBPassword(e.target.value)} className="rounded border px-2 py-1 w-full" /></div>
                            <div><Label htmlFor="clone-dialog-dbname">New DB Internal Name</Label><Input id="clone-dialog-dbname" value={internalDbName} onChange={(e) => setInternalDbName(e.target.value)} className="rounded border px-2 py-1 w-full" /></div>
                            <DialogFooter>
                                <button type="button" className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 w-full" onClick={() => {
                                    setLoading(true);
                                    const newPromise = clone(sourceId, dbName, dbUser, dbPassword, internalDbName)
                                        .then((apiResponse) => { setResp(apiResponse); setLoading(false); return apiResponse; })
                                        
                                    addPromise(newPromise);
                                }}>Clone</button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
};

export default Clone;