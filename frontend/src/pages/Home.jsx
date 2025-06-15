import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google/login`;
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-600 flex items-center justify-center overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="0.5" viewBox="0 0 800 600">
          <path d="M0 300 Q200 200 400 300 T800 300" stroke="white" />
          <path d="M0 400 Q200 300 400 400 T800 400" stroke="white" />
          <circle cx="100" cy="100" r="50" stroke="white" />
          <circle cx="700" cy="500" r="70" stroke="white" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 bg-white bg-opacity-90 p-10 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-8">
        {/* Viettel Logo */}
        <div className="flex justify-center">
          <img
            src="/img/viettel.png"
            alt="Viettel Logo"
            className="h-16 mb-4"
          />
        </div>

        {/* Title and Subtitle */}
        <h1 className="text-4xl font-bold text-red-800 tracking-tight">
          VProCheck
        </h1>
        <p className="text-gray-600 text-lg">
          Effortlessly manage projects with effort estimation features
        </p>

        {/* Google Sign-In Button */}
        <button
          onClick={handleLogin}
          className="flex items-center justify-center w-full bg-red-600 text-white font-semibold text-lg py-3 px-6 rounded-lg hover:bg-red-700 transition duration-300 shadow-md"
        >
          <img
            src="/img/google.png"
            alt="Google Logo"
            className="h-6 w-6 mr-2"
          />
          Sign in with Google
        </button>

        {/* Decorative Dots */}
        <div className="mt-6">
          <div className="flex justify-center space-x-4">
            <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
            <div className="h-3 w-3 bg-red-400 rounded-full animate-pulse delay-100"></div>
            <div className="h-3 w-3 bg-red-300 rounded-full animate-pulse delay-200"></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      {/* <footer className="absolute bottom-4 text-white text-sm opacity-80">
        © 2025 Viettel Group. All rights reserved.
      </footer> */}
    </div>
  );
}

export default Home;