
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { login } from '../../api/auth';

interface LoginPageProps {
  onLoginSuccess: (role: 'admin' | 'client') => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'client'>('client');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // For demo purposes, we'll check the hardcoded credentials based on role
      if (selectedRole === 'admin' && email === 'admin@example.com' && password === 'password') {
        // Simulate API response delay
        await new Promise(resolve => setTimeout(resolve, 800));
        // Handle admin login success
        onLoginSuccess('admin');
        return;
      }
      
      if (selectedRole === 'client' && email === 'client@example.com' && password === 'password') {
        // Simulate API response delay
        await new Promise(resolve => setTimeout(resolve, 800));
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-primary dark:bg-gray-700 px-6 py-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            AUDIT<span className="text-accent">IA</span>
          </h1>
          <p className="text-gray-200 text-sm">
            {t('platform_slogan')}
          </p>
        </div>
        
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6 text-primary dark:text-white">
            {t('welcome')}
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200 rounded-lg text-sm animate-fade-in">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1 text-sm font-medium" htmlFor="email">
                {t('email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                          bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                          focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="ejemplo@empresa.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1 text-sm font-medium" htmlFor="password">
                {t('password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                          bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                          focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"></path>
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"></path>
                      <path d="M1 1l22 22"></path>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
              <div className="flex items-center">
                <input
                  id="role-client"
                  type="radio"
                  name="role"
                  value="client"
                  checked={selectedRole === 'client'}
                  onChange={() => setSelectedRole('client')}
                  className="h-4 w-4 text-accent focus:ring-accent border-gray-300"
                  disabled={loading}
                />
                <label htmlFor="role-client" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  {t('role_client')}
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="role-admin"
                  type="radio"
                  name="role"
                  value="admin"
                  checked={selectedRole === 'admin'}
                  onChange={() => setSelectedRole('admin')}
                  className="h-4 w-4 text-accent focus:ring-accent border-gray-300"
                  disabled={loading}
                />
                <label htmlFor="role-admin" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  {t('role_admin')}
                </label>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-accent hover:bg-accent/80 text-primary font-medium rounded-lg
                      transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                      disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('logging_in')}
                </div>
              ) : t('login')}
            </button>
            
            <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              <p className="mb-1">{t('demo_credentials')}</p>
              <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg space-y-1 text-left">
                <p><strong>{t('role_admin')}:</strong> admin@example.com / password</p>
                <p><strong>{t('role_client')}:</strong> client@example.com / password</p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
