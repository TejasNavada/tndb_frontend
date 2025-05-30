import React, { useContext, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { register, signInWithUsernameAndPassword } from "../lib/authService"; // Adjusted path
import { cn } from '~/lib/utils';

function Register() {
  const { token, setToken } = useAuth();
  const navigate = useNavigate();

  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const getInputClass = (name: string) =>
    cn(
      "w-full px-4 py-3 my-2 border-none rounded bg-white/10 text-white text-base outline-none shadow-none transition-colors duration-300 ease-in-out placeholder-gray-400",
      focusedInput === name ? "bg-white/90 text-black placeholder-gray-600" : "hover:bg-white/20"
    );

  const handleSubmit = async () => {
    setError("");
    try {
      const registered = await register(email, username, password);
      if (registered) { // Assuming 'registered' is a success indicator
        const newToken = await signInWithUsernameAndPassword(username, password);
        setToken(newToken);
        navigate("/dashboard");
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (e: any) {
      setError(e.response?.data?.message || "Invalid email or username, or registration failed.");
    }
  };

  const onPasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };
  
  const svgStrokeColor = focusedInput === "password" ? "rgba(55,55,55,0.7)" : "rgba(255,255,255,0.7)";

  return (
    <div className="p-10 rounded-lg flex flex-col items-center min-w-[320px] sm:min-w-[380px] ">
      <h2 className="text-white text-center mb-5 tracking-[6px] font-thin text-3xl">SPHERE</h2>

      <div className="w-full relative flex items-center mb-2">
        <input
          className={getInputClass("email")}
          type="email" 
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setFocusedInput("email")}
          onBlur={() => setFocusedInput(null)}
        />
      </div>
      
      <div className="w-full relative flex items-center mb-2">
        <input
          className={getInputClass("username")}
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onFocus={() => setFocusedInput("username")}
          onBlur={() => setFocusedInput(null)}
        />
      </div>
      
      <div className="w-full relative flex items-center">
        <input
          className={getInputClass("password")}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={onPasswordKeyDown}
          onFocus={() => setFocusedInput("password")}
          onBlur={() => setFocusedInput(null)}
        />
        <div 
            className="absolute right-3 cursor-pointer p-1" 
            onClick={handleSubmit}
            aria-label="Register"
            role="button"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="11" stroke={svgStrokeColor} strokeWidth="2" />
            <path d="M10 8L14 12L10 16" stroke={svgStrokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
      
      <p className="mt-4 text-gray-400 text-xs">
        Already have an account?{' '}
        <Link to="/login" className="text-gray-300 hover:text-white underline">
          Log In
        </Link>
      </p>
      <p className="mt-2 text-gray-400 text-xs cursor-pointer hover:underline">Having issues registering?</p>
    </div>
  );
}

export default Register;