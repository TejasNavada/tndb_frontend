// File: app/routes/login.page.tsx
import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import type { Engine } from "tsparticles-engine";
import Cookies from "js-cookie";

import LoginComponent from '../components/Login'; 
import { validateToken } from '../lib/authService';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const t = Cookies.get("tndb_token");
    if (t) {
      validateToken(t).then((ok) => {
        setIsAuthenticated(ok);
        if (!ok) Cookies.remove("tndb_token"); 
      });
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const particlesInit = useCallback(async (engineImpl: Engine) => {
    await loadFull(engineImpl);
  }, []);

  const particleOptions: any = {
    background: { color: { value: "transparent" } },
    fpsLimit: 60,
    interactivity: { events: { resize: true } },
    particles: {
      color: { value: "#ffffff" },
      links: { color: "#ffffff", distance: 100, enable: true, opacity: 0.2, width: 0.5 },
      collisions: { enable: true },
      move: { direction: "none", enable: true, outModes: { default: "bounce" }, random: false, speed: 2, straight: false },
      number: { density: { enable: true, area: 800 }, value: 100 },
      opacity: { value: 1},
      shape: { type: "circle" },
      size: { value: .5 },
    },
    detectRetina: true,
  };

  if (isAuthenticated === true) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isAuthenticated === null) { 
    return <div className="relative h-screen overflow-hidden bg-gradient-to-bl from-[#001F23] to-[#2C2339] flex justify-center items-center"><p className="text-white">Loading...</p></div>;
  }

  return (
    <div className="relative h-screen overflow-hidden bg-gradient-to-bl from-[#001F23] to-[#2C2339] flex justify-center items-center">
      <Particles id="tsparticles-login" init={particlesInit} options={particleOptions} />
      <div className="z-10">
        <LoginComponent />
      </div>
    </div>
  );
}