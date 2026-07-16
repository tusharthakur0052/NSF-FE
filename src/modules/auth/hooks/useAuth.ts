import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = (onLoginSuccess: () => void) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const login = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.VITE_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Please check your login credentials');
      }

      setSuccess(true);

      // Store tokens
      const tokens = data.data;
      if (tokens && tokens.accessToken) {
        localStorage.setItem('accessToken', tokens.accessToken);
      }
      if (tokens && tokens.refreshToken) {
        localStorage.setItem('refreshToken', tokens.refreshToken);
      }

      // Success delay for nice animation experience
      setTimeout(() => {
        onLoginSuccess();
        navigate('/');
      }, 1000);

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, onLoginSuccess, navigate]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isLoading,
    error,
    success,
    login,
  };
};
