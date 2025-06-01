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
  DialogClose,
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
import PropTypes from 'prop-types';
import useAutocomplete from '@mui/material/useAutocomplete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import { autocompleteClasses } from '@mui/material/Autocomplete';
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Separator } from "./ui/separator"; // Adjust this path
import { signOut } from '~/lib/authService';
import { MakeQuerablePromise, type DatabaseInstanceResponse, type UserResponse } from "~/types/dto";
import { provisionDB } from "~/lib/instanceService";
import { useDatabaseInstances } from "~/context/DatabaseInstanceContext";
import { getUsersWithoutPermisions, grantPermission } from "~/lib/permissionService";

const AddRole = ({dbName,dbId, reGrabPermissions}:any) => {
    const [role, setRole] = useState<"ADMIN"|"VIEWER">(); 
    const [users, setUsers] = useState<UserResponse[]>([]); 
    const [selectedUsers, setSelectedUsers] = useState<UserResponse[]>([]);
    const {
        getRootProps,
        getInputLabelProps,
        getInputProps,
        getTagProps,
        getListboxProps,
        getOptionProps,
        groupedOptions,
        value,
        focused,
        setAnchorEl,
    } = useAutocomplete({
        id: 'customized-hook-demo'+dbId,
        multiple: true,
        options: users,
        value: selectedUsers,
        onChange: (_event, newValue) => {
            setSelectedUsers(newValue);
        },
        getOptionLabel: (option) => option.username,
    });


    useEffect(()=>{
        console.log(dbId)
        if(dbId){
            getUsersWithoutPermisions(dbId).then((res)=>{
                console.log(res)
                setUsers(res)
            })
        }
    },[dbId, dbName])

    const reGrabWithoutPremissions = () => {
        if(dbId){
            getUsersWithoutPermisions(dbId).then((res)=>{
                console.log(res)
                setUsers(res)
            })
        }
    }

    return (
        <Dialog>
            <DialogTrigger onClick={()=>{
                reGrabWithoutPremissions()
                setRole(undefined)
                setSelectedUsers([]);
            }} asChild>
            <button className="text-blue-500 hover:text-gray-300">
                Manage Assignment
            </button>
            </DialogTrigger>
            <DialogPortal >
                <DialogOverlay className="fixed inset-0 bg-black/50 w-full" /> 

            
                <DialogContent className="flex flex-col fixed min-w-full min-h-full fixed bg-white rounded-lg shadow-xl p-6 ">
                    
                    <DialogHeader>
                        <DialogTitle className='text-center'>{dbName} Role Assignment</DialogTitle>
                        
                    </DialogHeader>

                    <Separator/>
                        <div className=" mx-50">
                            <div className="flex">
                                <div className="grow">
                                    <h2 className="font-bold">Users</h2>
                                    <span>Select the users on whom this role will be applied</span>
                                </div>
                                <div className="grow">
                                    <h2 className="font-bold">Role</h2>
                                    <span>Select the role to apply</span>
                                </div>

                            </div>

                            <div className="flex mt-15 border p-10">
                                <div className="grow">
                                    <h2 className="font-bold">Users</h2>
                                    <Root>
                                        <div {...getRootProps()}>
                                            <InputWrapper ref={setAnchorEl} className={focused ? 'focused' : ''}>
                                            {value.map((option, index) => {
                                                const { key, ...tagProps } = getTagProps({ index });
                                                return <StyledTag key={key} {...tagProps} label={option.username} />;
                                            })}
                                            <input {...getInputProps()} />
                                            </InputWrapper>
                                        </div>
                                        {groupedOptions.length > 0 ? (
                                            <Listbox {...getListboxProps()}>
                                            {groupedOptions.map((option, index) => {
                                                const { key, ...optionProps } = getOptionProps({ option, index });
                                                return (
                                                <li key={key} {...optionProps}>
                                                    <span>{option.username}</span>
                                                    <CheckIcon fontSize="small" />
                                                </li>
                                                );
                                            })}
                                            </Listbox>
                                        ) : null}
                                        </Root>
                                </div>
                                <div className="grow ">
                                    <h2 className="text-gray-500">Roles</h2>
                                    <Select value={role}
                                        onValueChange={(e)=>{
                                            if(e!="ADMIN" && e!="VIEWER"){return}(setRole(e))}} >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                            <SelectItem value="VIEWER">Viewer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                            </div>

                            
                            

                        </div>
                        

                    <Separator className="mt-auto"/>
                    <DialogFooter className="flex ">
                        <DialogClose 
                            type="reset"
                            className="rounded border px-4 py-2 hover:bg-gray-100" 
                            
                        >
                            Close
                        </DialogClose >
                        <DialogClose 
                            type="submit"
                            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600" 
                            onClick={(e)=>{
                                if(role){
                                    grantPermission(dbId,value.map((user)=>user.userId),role).then(()=>reGrabPermissions())
                                    
                                }
                                console.log(value)
                            }}
                        >
                            Save
                        </DialogClose >
                    </DialogFooter>
                </DialogContent>
            

            
            </DialogPortal>
        </Dialog>
    );
};

export default AddRole;


const Root = styled('div')(({ theme }) => ({
  color: 'rgba(0,0,0,0.85)',
  fontSize: '14px',
  ...theme.applyStyles('dark', {
    color: 'rgba(255,255,255,0.65)',
  }),
}));

const LabelStyle = styled('label')`
  padding: 0 0 4px;
  line-height: 1.5;
  display: block;
`;

const InputWrapper = styled('div')(({ theme }) => ({
  width: '300px',
  border: '1px solid #d9d9d9',
  backgroundColor: '#fff',
  borderRadius: '4px',
  padding: '1px',
  display: 'flex',
  flexWrap: 'wrap',
  ...theme.applyStyles('dark', {
    borderColor: '#434343',
    backgroundColor: '#141414',
  }),
  '&:hover': {
    borderColor: '#40a9ff',
    ...theme.applyStyles('dark', {
      borderColor: '#177ddc',
    }),
  },
  '&.focused': {
    borderColor: '#40a9ff',
    boxShadow: '0 0 0 2px rgb(24 144 255 / 0.2)',
    ...theme.applyStyles('dark', {
      borderColor: '#177ddc',
    }),
  },
  '& input': {
    backgroundColor: '#fff',
    color: 'rgba(0,0,0,.85)',
    height: '30px',
    boxSizing: 'border-box',
    padding: '4px 6px',
    width: '0',
    minWidth: '30px',
    flexGrow: 1,
    border: 0,
    margin: 0,
    outline: 0,
    ...theme.applyStyles('dark', {
      color: 'rgba(255,255,255,0.65)',
      backgroundColor: '#141414',
    }),
  },
}));

function Tag(props: any) {
  const { label, onDelete, ...other } = props;
  return (
    <div {...other} >
      <span >{label}</span>
      <CloseIcon fontSize="large"  onClick={onDelete} />
    </div>
  );
}

Tag.propTypes = {
  label: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
};

const StyledTag = styled(Tag)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  height: '24px',
  margin: '2px',
  lineHeight: '22px',
  backgroundColor: '#fafafa',
  border: `1px solid #e8e8e8`,
  borderRadius: '2px',
  boxSizing: 'content-box',
  padding: '0 4px 0 10px',
  outline: 0,
  overflow: 'hidden',
  ...theme.applyStyles('dark', {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: '#303030',
  }),
  '&:focus': {
    borderColor: '#40a9ff',
    backgroundColor: '#e6f7ff',
    ...theme.applyStyles('dark', {
      backgroundColor: '#003b57',
      borderColor: '#177ddc',
    }),
  },
  '& span': {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  '& svg': {
    fontSize: '12px',
    cursor: 'pointer',
    padding: '4px',
  },
}));

const Listbox = styled('ul')(({ theme }) => ({
  width: '300px',
  margin: '2px 0 0',
  padding: 0,
  position: 'absolute',
  listStyle: 'none',
  backgroundColor: '#fff',
  overflow: 'auto',
  maxHeight: '250px',
  borderRadius: '4px',
  boxShadow: '0 2px 8px rgb(0 0 0 / 0.15)',
  zIndex: 1,
  ...theme.applyStyles('dark', {
    backgroundColor: '#141414',
  }),
  '& li': {
    padding: '5px 12px',
    display: 'flex',
    '& span': {
      flexGrow: 1,
    },
    '& svg': {
      color: 'transparent',
    },
  },
  "& li[aria-selected='true']": {
    backgroundColor: '#fafafa',
    fontWeight: 600,
    ...theme.applyStyles('dark', {
      backgroundColor: '#2b2b2b',
    }),
    '& svg': {
      color: '#1890ff',
    },
  },
  [`& li.${autocompleteClasses.focused}`]: {
    backgroundColor: '#e6f7ff',
    cursor: 'pointer',
    ...theme.applyStyles('dark', {
      backgroundColor: '#003b57',
    }),
    '& svg': {
      color: 'currentColor',
    },
  },
}));