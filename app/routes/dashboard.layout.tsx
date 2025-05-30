
import React from 'react';
import { Outlet, redirect, useLoaderData, type LoaderFunctionArgs } from 'react-router-dom'; 
import Cookies from 'js-cookie';
import { parse } from 'cookie'; 
import { validateToken, signOut } from '../lib/authService';
import Header from '../components/Header';
import { DatabaseInstanceProvider } from '~/context/DatabaseInstanceContext';

export async function loader({ request }: LoaderFunctionArgs) {
  let token: string | undefined;

  if (typeof document !== 'undefined' && typeof document.cookie !== 'undefined') {
    token = Cookies.get("tndb_token");
  } else if (request && request.headers.get("Cookie")) {
    const cookieHeader = request.headers.get("Cookie");
    if (cookieHeader) {
      const parsedCookies = parse(cookieHeader);
      token = parsedCookies.tndb_token;
    }
  } else {
  }
  if (!token) {
    return redirect("/login"); 
  }

  const isValid = await validateToken(token);
  console.log("Loader: Token validation result:", isValid);

  if (!isValid) {
    if (typeof document !== 'undefined') {
        signOut(); 
    }
    return redirect("/login"); 
  }

  return { isAuthenticated: true }; 
}

export default function DashboardLayout() {
    const loaderData = useLoaderData() as { isAuthenticated: boolean }; 
  console.log("DashboardLayout rendering. Loader should have protected this route.");

  return (
    <DatabaseInstanceProvider>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Header />
            <main className="">
                <Outlet />
            </main>
        </div>
    </DatabaseInstanceProvider>
    
  );
}