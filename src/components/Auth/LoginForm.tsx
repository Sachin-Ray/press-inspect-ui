import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import logo from '../../Images/logo.png';

const LoginForm: React.FC = () => {
  const { login, state, clearError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/dashboard');
    }
  }, [state.isAuthenticated, navigate]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (state.error) clearError();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (state.error) clearError();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 sm:p-10 w-full max-w-md space-y-8">

        {/* Logo and Heading */}
        <div className="text-center space-y-3">
          <img src={logo} alt="Company Logo" className="mx-auto h-16 w-auto" />
          <h2 className="text-3xl sm:text-3xl font-extrabold text-blue-800 tracking-tight">
            Printocare <span className="text-blue-500">Inspection</span> System
          </h2>
          <p className="text-sm text-gray-500">Sign in to your account</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={handleEmailChange}
                placeholder="Email address"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-600 focus:ring focus:ring-blue-100 text-gray-700 placeholder-gray-400 text-sm transition"
              />
            </div>

            {/* Password Field with Show/Hide */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={handlePasswordChange}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:border-blue-600 focus:ring focus:ring-blue-100 text-gray-700 placeholder-gray-400 text-sm transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {state.error && (
            <div className="text-red-500 text-sm text-center">{state.error}</div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={state.isLoading}
              className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              {state.isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
