
import React, { useEffect } from 'react';
import { Outlet, redirect, useLoaderData, type LoaderFunctionArgs } from 'react-router-dom'; 
import Cookies from 'js-cookie';
import { parse } from 'cookie'; 
import { validateToken, signOut } from '../lib/authService';
import Header from '../components/Header';
import { DatabaseInstanceProvider } from '~/context/DatabaseInstanceContext';
import { useNavigate } from 'react-router-dom';


export default function DashboardLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("tndb_token");
    validateToken(token).then((isValid) => {
      if (!isValid) {
        signOut();
        navigate("/login");
      }
    });
  }, []);

  return (
    <DatabaseInstanceProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <main>
          <Outlet />
        </main>
      </div>
    </DatabaseInstanceProvider>
  );

}