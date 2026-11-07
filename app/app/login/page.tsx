import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

const LoginDashboard = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex font-sans text-gray-900">
      {/* Left Side: Branding */}
      <div className="hidden lg:flex w-3/5 bg-emerald-900 p-12 flex-col justify-between text-white">
        <div>
          <h1 className="text-4xl font-bold mb-4">Dollar Fetch</h1>
          <p className="text-emerald-100 text-lg">Your wealth, within reach.</p>
        </div>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <p className="font-medium">Bank-level 256-bit encryption for your data.</p>
          </div>
          <blockquote className="border-l-4 border-emerald-500 pl-4 italic">
            "The easiest way to track, fetch, and grow your portfolio."
          </blockquote>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold">Welcome back</h2>
            <p className="text-gray-500 mt-2">Sign in to manage your Dollar Fetch account.</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input 
                  type="email" 
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none" 
                  placeholder="name@company.com" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Password</label>
                <a href="#" className="text-sm text-emerald-700 hover:underline">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none" 
                  placeholder="••••••••" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button className="w-full bg-emerald-700 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-800 transition flex items-center justify-center gap-2">
              Sign In <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-sm text-gray-600">
            Don't have an account? <a href="#" className="text-emerald-700 font-bold hover:underline">Sign up now</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginDashboard;
