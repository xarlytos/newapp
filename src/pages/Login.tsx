import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({ email: '', password: '' });
  
  const { login, error, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  // Redirect to dashboard or previous location after login
  const from = state?.from?.pathname || '/dashboard';

  const validateForm = (): boolean => {
    const errors = { email: '', password: '' };
    let isValid = true;

    if (!email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      // Error is handled in AuthContext
      console.error('Login failed', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Dumbbell size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">FitTrack</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={formErrors.email}
              fullWidth
              required
              autoFocus
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={formErrors.password}
              fullWidth
              required
            />

            <div className="mt-6">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Demo credentials: any email/password will work</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;