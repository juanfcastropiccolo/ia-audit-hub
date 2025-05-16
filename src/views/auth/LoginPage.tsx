
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

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
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-soft-background to-accent/20">
      <div className="w-full max-w-5xl bg-white dark:bg-deep-indigo rounded-2xl overflow-hidden shadow-xl flex flex-col md:flex-row">
        {/* Left side - Illustration */}
        <div className="w-full md:w-1/2 bg-primary p-8 text-center flex flex-col justify-between relative">
          <div className="absolute top-6 left-6 flex items-center">
            <div className="bg-accent rounded-md p-2 mr-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#213448"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-accent">audit-ia</h2>
          </div>
          
          <div className="hidden md:flex flex-col items-center justify-center flex-grow">
            {/* Here you would add an illustration similar to the reference image */}
            <div className="w-64 h-64 bg-soft-background/20 rounded-full flex items-center justify-center">
              <div className="text-6xl text-accent">AI</div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">{t('ai_audit_platform')}</h3>
            <p className="text-accent/80">{t('ai_audit_description')}</p>
          </div>
        </div>
        
        {/* Right side - Login form */}
        <div className="w-full md:w-1/2 p-8 flex items-center">
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-primary dark:text-white">
                {t('welcome_back')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {t('login_to_continue')}
              </p>
            </div>
            
            {error && (
              <div className="mb-6 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200 rounded-lg text-sm animate-fade-in">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium" htmlFor="email">
                  {t('email')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="ejemplo@empresa.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium" htmlFor="password">
                  {t('password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    {t('remember_me')}
                  </label>
                </div>
                
                <div className="text-sm">
                  <a href="#" className="font-medium text-primary hover:text-primary/80 dark:text-accent dark:hover:text-accent/80">
                    {t('forgot_password')}
                  </a>
                </div>
              </div>
              
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 sm:justify-around">
                  <div className="flex items-center">
                    <input
                      id="role-client"
                      type="radio"
                      name="role"
                      value="client"
                      checked={selectedRole === 'client'}
                      onChange={() => setSelectedRole('client')}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
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
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
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
                  className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg
                          transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                          disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('logging_in')}
                    </div>
                  ) : t('login')}
                </button>
              </div>
            </form>
            
            <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              <p>{t('demo_credentials')}</p>
              <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 mt-2 rounded-lg space-y-1 text-left">
                <p><strong>{t('role_admin')}:</strong> admin@example.com / password</p>
                <p><strong>{t('role_client')}:</strong> client@example.com / password</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
