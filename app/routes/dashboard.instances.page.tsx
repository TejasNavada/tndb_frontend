import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom'; // useNavigate was imported but not used
import { backupDB, deleteDB, getAllInstances, setAutoBackup } from '~/lib/instanceService';
import { MakeQuerablePromise, type DatabaseInstanceResponse } from '~/types/dto';
import {
  MRT_GlobalFilterTextField,
  MRT_TableBodyCellValue,
  MRT_TablePagination,
  MRT_ToolbarAlertBanner,
  flexRender,
  type MRT_ColumnDef,
  useMaterialReactTable,
} from 'material-react-table';
import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Separator } from '~/components/ui/separator';

import Provision from '~/components/Provision';
import {useDatabaseInstances } from '~/context/DatabaseInstanceContext';
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "../components/ui/context-menu"
import Clone from '~/components/Clone';







const InstancesPage = () => {
    
    const navigate = useNavigate();
    const {instances, setInstances, addPromise} = useDatabaseInstances()
    const [cloneDialogContext, setCloneDialogContext] = useState<{ sourceId: number } | null>(null);

    const columns = useMemo<MRT_ColumnDef<DatabaseInstanceResponse >[]>( //TS helps with the autocomplete while writing columns
    () => [
        {
            id: 'statusDot',
            header: 'Status Dot',        // required string for TS
            Header: () => (
                <i style={{ color: 'gray', fontSize: '1.25rem' }}>●</i>
            ),
            Cell: ({ row }) => {
                const isRunning = row.original.status === 'RUNNING';
                return (
                <span
                    style={{
                    color: isRunning ? 'lightgreen' : 'red',
                    fontSize: '1.25rem',
                    }}
                >
                    ●
                </span>
                );
            },
        },
        {
            accessorKey: 'userGivenName',
            header: 'Name',
        },
        {
            accessorKey: 'containerName',
            header: 'VM Name',
        },
        {
            accessorKey: 'dbEngine',
            header: 'DB Engine',
        },
        {
            accessorKey: 'engineVersion',
            header: 'Engine Version',
        },
        {
            accessorKey: 'status',
            header: 'Status',
        },
        {
            accessorKey: 'hostPort',
            header: 'Host Port',
        },
        {
            accessorKey: 'dbUser',
            header: 'DB User',
        },
        {
            accessorKey: 'internalDbName',
            header: 'DB Name',
        },
        {
            accessorKey: 'permissionLevel',
            header: 'Role',
        },
    ],
    [],
    );
    const table = useMaterialReactTable({
        columns,
        data: instances, 
        initialState: {
            pagination: { pageSize: 10, pageIndex: 0 },
            showGlobalFilter: true,
        },
        muiPaginationProps: {
            showRowsPerPage: false,
        },
        paginationDisplayMode: 'pages',
    });

    useEffect(()=>{
        getAllInstances().then((resp)=>{
            setInstances(resp)
            console.log(resp)
        })
    },[])

    return (
        <div className=""> 
            <div className="flex justify-between items-center  px-6 shadow-lg h-16 border-b-2 bg-white"> 
                <div className="flex items-center h-full "> 
                    <h1 className="text-grey ">Overview</h1>
                    <Separator
                    orientation="vertical"
                    className="bg-slate-700 w-px h-6 mx-4" 
                    decorative
                    />
                    <h1 className="text-grey ">Table</h1>
                </div>
                <div >
                    {/* User menu, logout button, etc. */}
                    
                    <Provision/>
                </div>
            </div>
            <div className='mx-5'>
                <Stack  sx={{ marginTop: '2rem' }}>
                    <Box className= ""
                        sx={{
                        display: 'flex',
                        justifyContent: "space-between",
                        alignItems: 'center',
                        }}
                    >
                        <div className='bg-gray-800 px-4 py-1 mx-2 my-3 text-white rounded-sm'>DB</div>
                        <div className='flex'>
                            <MRT_TablePagination table={table} />
                            <MRT_GlobalFilterTextField table={table} />
                        </div>
                        
                    </Box>
                    <TableContainer className='border border-gray-300 shadow-lg p-4 rounded-lg bg-white'>
                        <Table>
                        <TableHead>
                            {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                <TableCell align="center" variant="head" key={header.id}>
                                    {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.Header ??
                                            header.column.columnDef.header,
                                        header.getContext(),
                                        )}
                                </TableCell>
                                ))}
                            </TableRow>
                            ))}
                        </TableHead>
                        <TableBody>
                            {table.getRowModel().rows.map((row, rowIndex) => (
                            
                            <ContextMenu>
                                <ContextMenuTrigger onClick={()=>navigate("/dashboard/instances/"+row.original.dbId)} asChild className="">
                                    <TableRow key={row.id} selected={row.getIsSelected()}>
                                        {row.getVisibleCells().map((cell, _columnIndex) => (
                                        <TableCell align="center" variant="body" key={cell.id}>
                                            
                                            <MRT_TableBodyCellValue
                                            cell={cell}
                                            table={table}
                                            staticRowIndex={rowIndex} 
                                            />
                                        </TableCell>
                                        ))}
                                    </TableRow>
                                </ContextMenuTrigger>
                                <ContextMenuContent className="w-48">
                                    <ContextMenuLabel>{row.original.userGivenName}</ContextMenuLabel>
                                    {row.original.permissionLevel!="VIEWER" && (
                                        <>
                                        <ContextMenuSeparator />
                                            <ContextMenuItem
                                            inset
                                            onClick={()=>{
                                                const newPromise = backupDB(row.original.dbId)
                                                    .then((resp) => {
                                                    console.log(resp)
                                                    return resp; 
                                                    });
                                                addPromise(newPromise);
                                                
                                            }}
                                            >
                                            Backup
                                            </ContextMenuItem>

                                            <ContextMenuSub>
                                                <ContextMenuSubTrigger inset>Autobackup</ContextMenuSubTrigger>
                                                <ContextMenuSubContent className="w-44">
                                                    <ContextMenuCheckboxItem
                                                    onClick={()=>{
                                                        let toAdd = !row.original.autoBackupSchedules?.includes("HOURLY")
                                                        setInstances(prevData => {
                                                            return prevData.map(item => {
                                                                if (item.dbId === row.original.dbId ) {
                                                                    // Type assertion to satisfy TypeScript
                                                                    const newSchedules = (toAdd
                                                                    ? [...(item.autoBackupSchedules ?? []), "HOURLY"]
                                                                    : item.autoBackupSchedules?.filter(s => s !== "HOURLY")) as (
                                                                    | "HOURLY"
                                                                    | "DAILY"
                                                                    | "WEEKLY"
                                                                    | "MONTHLY"
                                                                    )[];

                                                                    return {
                                                                    ...item,
                                                                    autoBackupSchedules: newSchedules,
                                                                    };
                                                                }
                                                                return item;
                                                            });
                                                        });
                                                        setAutoBackup(row.original.dbId,"HOURLY",toAdd)
                                                            .then((resp) => {
                                                                console.log(resp)
                                                            });
                                                    }}
                                                     checked={row.original.autoBackupSchedules?.includes("HOURLY")}>
                                                        Hourly
                                                    </ContextMenuCheckboxItem>
                                                    <ContextMenuCheckboxItem 
                                                    onClick={()=>{
                                                        let toAdd = !row.original.autoBackupSchedules?.includes("DAILY")
                                                        setInstances(prevData => {
                                                            return prevData.map(item => {
                                                                if (item.dbId === row.original.dbId) {
                                                                    // Type assertion to satisfy TypeScript
                                                                    const newSchedules = (toAdd
                                                                    ? [...(item.autoBackupSchedules ?? []), "DAILY"]
                                                                    : item.autoBackupSchedules?.filter(s => s !== "DAILY")) as (
                                                                    | "HOURLY"
                                                                    | "DAILY"
                                                                    | "WEEKLY"
                                                                    | "MONTHLY"
                                                                    )[];

                                                                    return {
                                                                    ...item,
                                                                    autoBackupSchedules: newSchedules,
                                                                    };
                                                                }
                                                                return item;
                                                            });
                                                        });
                                                        setAutoBackup(row.original.dbId,"DAILY",toAdd)
                                                            .then((resp) => {
                                                                console.log(resp)
                                                            });
                                                    }}
                                                    checked={row.original.autoBackupSchedules?.includes("DAILY")}>
                                                        Daily
                                                    </ContextMenuCheckboxItem>
                                                    <ContextMenuCheckboxItem 
                                                    onClick={()=>{
                                                        let toAdd = !row.original?.autoBackupSchedules?.includes("WEEKLY")
                                                        setInstances(prevData => {
                                                            return prevData.map(item => {
                                                                if (item.dbId === row.original.dbId) {
                                                                    // Type assertion to satisfy TypeScript
                                                                    const newSchedules = (toAdd
                                                                    ? [...(item.autoBackupSchedules ?? []), "WEEKLY"]
                                                                    : item.autoBackupSchedules?.filter(s => s !== "WEEKLY")) as (
                                                                    | "HOURLY"
                                                                    | "DAILY"
                                                                    | "WEEKLY"
                                                                    | "MONTHLY"
                                                                    )[];

                                                                    return {
                                                                    ...item,
                                                                    autoBackupSchedules: newSchedules,
                                                                    };
                                                                }
                                                                return item;
                                                            });
                                                        });
                                                        setAutoBackup(row.original.dbId,"WEEKLY",toAdd)
                                                            .then((resp) => {
                                                                console.log(resp)
                                                            });
                                                    }}
                                                    checked={row.original.autoBackupSchedules?.includes("WEEKLY")}>
                                                        Weekly
                                                    </ContextMenuCheckboxItem>
                                                    <ContextMenuCheckboxItem 
                                                    onClick={()=>{
                                                        let toAdd = !row.original.autoBackupSchedules?.includes("MONTHLY")
                                                        setInstances(prevData => {
                                                            return prevData.map(item => {
                                                                if (item.dbId === row.original.dbId) {
                                                                    // Type assertion to satisfy TypeScript
                                                                    const newSchedules = (toAdd
                                                                    ? [...(item.autoBackupSchedules ?? []), "MONTHLY"]
                                                                    : item.autoBackupSchedules?.filter(s => s !== "MONTHLY")) as (
                                                                    | "HOURLY"
                                                                    | "DAILY"
                                                                    | "WEEKLY"
                                                                    | "MONTHLY"
                                                                    )[];

                                                                    return {
                                                                    ...item,
                                                                    autoBackupSchedules: newSchedules,
                                                                    };
                                                                }
                                                                return item;
                                                            });
                                                        });
                                                        setAutoBackup(row.original.dbId,"MONTHLY",toAdd)
                                                            .then((resp) => {
                                                                console.log(resp)
                                                            });
                                                    }}
                                                    checked={row.original.autoBackupSchedules?.includes("MONTHLY")}>
                                                        Monthly
                                                    </ContextMenuCheckboxItem>
                                                </ContextMenuSubContent>
                                            </ContextMenuSub>
                                            <ContextMenuItem 
                                            inset
                                            onClick={()=>{
                                                navigate("/dashboard/instances/"+row.original.dbId+"/restore")
                                                
                                            }}
                                            >
                                            Restore
                                            </ContextMenuItem>
                                            <ContextMenuItem 
                                            inset
                                            onSelect={() => {
                                                    setCloneDialogContext({ sourceId: row.original.dbId });
                                                }}
                                            >
                                            Clone
                                            </ContextMenuItem>
                                            
                                            <ContextMenuItem
                                            variant="destructive" 
                                            inset
                                            onClick={()=>{
                                                const newPromise = deleteDB(row.original.dbId)
                                                    .then((resp) => {
                                                    console.log(resp)
                                                    return resp; 
                                                    });
                                                addPromise(newPromise);
                                                
                                            }}
                                            >
                                            Delete
                                            </ContextMenuItem>
                                        </>
                                    )}
                                    
                                </ContextMenuContent>
                                </ContextMenu>
                            ))}
                        </TableBody>
                        </Table>
                    </TableContainer>
                    <MRT_ToolbarAlertBanner stackAlertBanner table={table} />
                </Stack>
                
            <Outlet />
            </div>
            {cloneDialogContext && (
                <Clone
                    sourceId={cloneDialogContext.sourceId}
                    isOpen={!!cloneDialogContext}
                    onOpenChange={(open) => {
                        if (!open) {
                            setCloneDialogContext(null); 
                        }
                    }}
                />
            )}
        </div>
    );
}

export default InstancesPage;