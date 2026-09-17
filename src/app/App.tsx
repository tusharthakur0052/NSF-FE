import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar, Topbar, toast } from '@/shared';
import { DashboardPage } from '@/modules/dashboard';
import { MembersPage } from '@/modules/members';
import { PlansPage } from '@/modules/plans';
import { ProfilePage } from '@/modules/profile';
import { LoginPage } from '@/modules/auth';
import { EntriesPage } from '@/modules/entries';

const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (typeof payload.exp !== 'number') return false;
    return Date.now() >= payload.exp * 1000;
  } catch (e) {
    return true;
  }
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = localStorage.getItem('accessToken');
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return false;
    }
    return true;
  });

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
  };

  // Intercept window.fetch to automatically handle API errors, 401 logout, and network issues
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);

        // Allow callers to opt out of global error toast with 'x-skip-toast' header
        let skipToast = false;
        const requestInit = args[1];
        if (requestInit && requestInit.headers) {
          if (requestInit.headers instanceof Headers) {
            skipToast = requestInit.headers.get('x-skip-toast') === 'true';
          } else if (typeof requestInit.headers === 'object') {
            skipToast = (requestInit.headers as Record<string, string>)['x-skip-toast'] === 'true';
          }
        }

        if (!response.ok && !skipToast) {
          const requestUrl = typeof args[0] === 'string' ? args[0] : (args[0] as Request)?.url || '';
          const isLoginRequest = requestUrl.includes('/auth/login');

          let errorMessage: string | null = null;
          try {
            const clone = response.clone();
            const errData = await clone.json();
            errorMessage =
              (Array.isArray(errData.message) ? errData.message.join(', ') : errData.message) ||
              errData.error ||
              (Array.isArray(errData.errors) ? errData.errors.join(', ') : null);
          } catch {
            // response was not JSON
          }

          if (response.status === 401) {
            if (isLoginRequest) {
              toast.error(errorMessage || 'Please check your login credentials', {
                title: 'Authentication Failed',
              });
            } else {
              toast.error(errorMessage || 'Your session has expired. Please log in again.', {
                title: 'Session Expired',
              });
              handleLogout();
            }
          } else {
            const fallbackMessage = `Request failed with status ${response.status} (${response.statusText || 'Error'})`;
            const errorTitle =
              response.status >= 500
                ? 'Server Error'
                : response.status === 403
                ? 'Access Denied'
                : response.status === 404
                ? 'Not Found'
                : `API Error (${response.status})`;

            toast.error(errorMessage || fallbackMessage, { title: errorTitle });
          }
        }

        return response;
      } catch (error: any) {
        const isNetworkError =
          error?.name === 'TypeError' ||
          error?.message?.includes('fetch') ||
          error?.message?.includes('NetworkError') ||
          !navigator.onLine;

        if (isNetworkError) {
          toast.error(
            !navigator.onLine
              ? 'You are currently offline. Please check your internet connection.'
              : 'Unable to connect to the server. Please check your network or server status.',
            { title: 'Network Connection Error' }
          );
        } else {
          toast.error(error?.message || 'An unexpected request error occurred.', {
            title: 'Request Failed',
          });
        }
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // Global listeners for unhandled frontend runtime errors & promise rejections
  useEffect(() => {
    const isIgnoredOrExtensionError = (
      errorOrMessage: any,
      stack?: string,
      filename?: string
    ): boolean => {
      const text = `${typeof errorOrMessage === 'string' ? errorOrMessage : errorOrMessage?.message || ''} ${stack || ''} ${filename || ''}`.toLowerCase();

      const ignoredPatterns = [
        'metamask',
        'ethereum',
        'solana',
        'phantom',
        'coinbase',
        'web3',
        'chrome-extension://',
        'moz-extension://',
        'safari-web-extension://',
        'safari-extension://',
        'extension context invalidated',
        'could not establish connection',
        'receiving end does not exist',
        'the message port closed',
        'resizeobserver loop',
      ];

      return ignoredPatterns.some((pattern) => text.includes(pattern));
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      const reason = event.reason;
      const message =
        reason instanceof Error
          ? reason.message
          : typeof reason === 'string'
          ? reason
          : 'An unhandled promise rejection occurred in the application.';
      const stack = reason instanceof Error ? reason.stack : undefined;

      // Filter out browser extension noise (e.g., MetaMask, Coinbase, Phantom)
      if (isIgnoredOrExtensionError(message, stack)) {
        return;
      }

      // Avoid double-toasting network/fetch errors handled by the fetch interceptor
      if (
        message.includes('Failed to fetch') ||
        message.includes('NetworkError') ||
        message.includes('Request failed with status')
      ) {
        return;
      }

      toast.error(message, {
        title: 'Frontend Runtime Error',
      });
    };

    const handleWindowError = (event: ErrorEvent) => {
      console.error('Uncaught Frontend Error:', event.error || event.message);
      if (event.message === 'Script error.') return;

      if (isIgnoredOrExtensionError(event.message, event.error?.stack, event.filename)) {
        return;
      }

      toast.error(event.message || 'An unexpected frontend script error occurred.', {
        title: 'JavaScript Error',
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleWindowError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleWindowError);
    };
  }, []);


  // Periodically check access token expiration
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      const token = localStorage.getItem('accessToken');
      if (isTokenExpired(token)) {
        handleLogout();
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-slate-800 font-sans">
      {/* Sidebar Component */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">

        {/* Topbar Component */}
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        {/* Content Body */}
        <main className="flex-1 md:p-8 space-y-8 w-full">
          <Routes>
            {/* Dashboard Route */}
            <Route path="/" element={<DashboardPage />} />

            {/* Members Route */}
            <Route path="/member" element={<MembersPage />} />

            {/* Plans Route */}
            <Route path="/plans" element={<PlansPage />} />

            {/* Entries Route */}
            <Route path="/entries" element={<EntriesPage />} />

            {/* Profile Route */}
            <Route path="/profile" element={<ProfilePage />} />

            {/* If logged in, redirect /login to dashboard */}
            <Route path="/login" element={<Navigate to="/" replace />} />

            {/* Coming Soon Fallback for other routes */}
            <Route path="*" element={
              <div className="text-center py-20 bg-white border border-slate-100 rounded-2xl shadow-soft">
                <h3 className="text-lg font-semibold text-slate-600">Coming Soon</h3>
                <p className="text-slate-400 text-sm mt-1">This section is currently under construction.</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
}
