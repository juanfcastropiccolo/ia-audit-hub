
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
// Removed unused login import

interface LoginPageProps {
  onLoginSuccess: (role: 'admin' | 'client') => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // For demo purposes, we'll simulate a login
      // In a real app, you would call your API here
      // const response = await login(email, password);
      
      // Mock login for development - remove in production
      if (email === 'admin@example.com' && password === 'password') {
        // Simulate API response delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // Handle admin login success
        onLoginSuccess('admin');
        return;
      }
      
      if (email === 'client@example.com' && password === 'password') {
        // Simulate API response delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // Handle client login success
        onLoginSuccess('client');
        return;
      }
      
      // If no matching credentials, show error
      setError(t('invalidCredentials'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-6 py-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary dark:text-white">
        {t('welcome')}
      </h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="email">
            {t('email')}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded 
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="password">
            {t('password')}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-accent hover:bg-accent/90 text-primary font-medium rounded
                    transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                    disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('login')}...
            </span>
          ) : t('login')}
        </button>
        
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Demo credentials:
          <div className="mt-1">Admin: admin@example.com / password</div>
          <div>Client: client@example.com / password</div>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
