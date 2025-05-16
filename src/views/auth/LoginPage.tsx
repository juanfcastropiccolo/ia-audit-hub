
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from 'lucide-react';
import { login } from '../../api/auth';
import { useTranslation } from 'react-i18next';

// Define UserRole type matching App.tsx
type UserRole = 'admin' | 'client';

interface LoginFormData {
  email: string;
  password: string;
  role: UserRole;
  remember: boolean;
}

interface LoginPageProps {
  onLoginSuccess: (role: UserRole) => void;
}

function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    role: 'client',
    remember: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await login(formData.email, formData.password);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        name: data.name,
        email: data.email,
        role: data.role
      }));

      onLoginSuccess(data.role as UserRole);
      
      if (data.role === 'admin') {
        navigate('/admin/clients');
      } else {
        navigate('/chat');
      }

    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : t('invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      {/* Left side - Illustration */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-accent to-primary flex-col justify-between p-12 relative overflow-hidden">
        <div className="z-10">
          <img src="/logo.png" alt="AUDIT-IA Logo" className="h-10 w-auto mb-6" />
        </div>
        
        <div className="z-10 flex flex-col space-y-6">
          <h1 className="text-4xl font-bold text-white">
            {t('ai_audit_platform')}
          </h1>
          <p className="text-xl text-soft-background/90 max-w-md">
            {t('ai_audit_description')}
          </p>
          <div className="h-1 w-20 bg-soft-background rounded"></div>
        </div>
        
        <div className="z-10 text-soft-background/80 text-sm">
          © {new Date().getFullYear()} AUDIT-IA
        </div>
        
        {/* Background decoration elements */}
        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-secondary/20 blur-3xl"></div>
        <div className="absolute bottom-[-50px] right-[-50px] w-[300px] h-[300px] rounded-full bg-accent/20 blur-3xl"></div>
      </div>
      
      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white dark:bg-deep-indigo">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 md:hidden">
            <img src="/logo.png" alt="AUDIT-IA Logo" className="h-12 w-auto mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-primary dark:text-white">
              AUDIT-IA
            </h1>
          </div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {t('welcome_back')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {t('login_to_continue')}
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="email">
                {t('email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MailIcon size={18} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-accent"
                  placeholder="nombre@empresa.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">
                  {t('password')}
                </label>
                <a href="#" className="text-xs text-primary dark:text-accent hover:underline">
                  {t('forgot_password')}
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon size={18} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-accent"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button 
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-300"
                >
                  {showPassword ? 
                    <EyeOffIcon size={18} className="text-gray-400 hover:text-gray-600" /> : 
                    <EyeIcon size={18} className="text-gray-400 hover:text-gray-600" />
                  }
                </button>
              </div>
            </div>

            <div className="pt-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('role_selection')}</div>
              <div className="flex space-x-4">
                <label className="relative flex items-center bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="client"
                    checked={formData.role === 'client'}
                    onChange={handleChange}
                    className="form-radio text-primary focus:ring-primary mr-2"
                    disabled={isLoading}
                  />
                  <span className="text-gray-700 dark:text-gray-300">{t('role_client')}</span>
                </label>
                <label className="relative flex items-center bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === 'admin'}
                    onChange={handleChange}
                    className="form-radio text-primary focus:ring-primary mr-2"
                    disabled={isLoading}
                  />
                  <span className="text-gray-700 dark:text-gray-300">{t('role_admin')}</span>
                </label>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={formData.remember}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                {t('remember_me')}
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('logging_in')}
                </>
              ) : t('login')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
