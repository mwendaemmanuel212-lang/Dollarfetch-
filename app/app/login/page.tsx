"use client";

import React, { useState } from 'react';

// Simplified version without icon library to ensure build stability
export default function LoginDashboard() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex font-sans text-gray-900">
      <div className="hidden lg:flex w-3/5 bg-emerald-900 p-12 flex-col justify-between text-white">
        <div>
          <h1 className="text-4xl font-bold mb-4">Dollar Fetch</h1>
          <p className="text-emerald-100 text-lg">Your wealth, within reach.</p>
        </div>
      </div>

      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold">Welcome back</h2>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <input 
                type="email" 
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none" 
                placeholder="name@company.com" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none" 
                  placeholder="••••••••" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-sm text-emerald-700 font-medium"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button className="w-full bg-emerald-700 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-800 transition">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
