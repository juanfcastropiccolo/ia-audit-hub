
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
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
      
      // Cast data to ensure token property access
      const authToken = data as unknown as { token: string };
      localStorage.setItem('token', authToken.token);
      localStorage.setItem('user', JSON.stringify({
        name: data.name,
        email: data.email,
        role: data.role
      }));

      // Call the callback to update App.tsx state
      onLoginSuccess(data.role as UserRole);
      
      if (data.role === 'admin') {
        navigate('/admin/clients');
      } else {
        navigate('/chat');
      }

    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Error al iniciar sesión');
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
    <div className="min-h-screen flex flex-row bg-soft-background dark:bg-deep-indigo">
      {/* Left sidebar - Brand area */}
      <div className="hidden md:flex w-1/3 bg-primary flex-col justify-between">
        <div className="px-8 pt-12">
          <div className="flex items-center">
            <img src="/logo.png" alt="AUDIT-IA Logo" className="h-10 w-auto" />
            <h1 className="text-4xl font-bold text-white ml-2">
              AUDIT<span className="text-accent">IA</span>
            </h1>
          </div>
          <p className="mt-4 text-accent text-lg">
            {t('platform_slogan')}
          </p>
          <div className="mt-8 h-1 w-16 bg-accent rounded"></div>
        </div>
        <div className="p-8">
          <p className="text-soft-background text-sm">
            © {new Date().getFullYear()} AUDIT-IA. Todos los derechos reservados.
          </p>
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="w-full md:w-2/3 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="md:hidden text-center mb-8">
            <div className="flex items-center justify-center">
              <img src="/logo.png" alt="AUDIT-IA Logo" className="h-10 w-auto" />
              <h1 className="text-3xl font-bold text-primary dark:text-soft-background ml-2">
                AUDIT<span className="text-accent">IA</span>
              </h1>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-primary dark:text-white mb-2">
            {t('welcome_back')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t('login_to_continue')}
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg dark:bg-red-900 dark:text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="email">
                {t('email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="ejemplo@empresa.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="password">
                {t('password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button 
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 dark:text-gray-300"
                >
                  {showPassword ? 
                    <EyeOffIcon size={18} className="text-gray-500" /> : 
                    <EyeIcon size={18} className="text-gray-500" />
                  }
                </button>
              </div>
            </div>

            <div>
              <div className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">{t('role_selection')}</div>
              <div className="flex space-x-6">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="client"
                    checked={formData.role === 'client'}
                    onChange={handleChange}
                    className="form-radio text-primary focus:ring-primary"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">{t('role_client')}</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === 'admin'}
                    onChange={handleChange}
                    className="form-radio text-primary focus:ring-primary"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">{t('role_admin')}</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="form-checkbox text-primary focus:ring-primary"
                  disabled={isLoading}
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300 text-sm">{t('remember_me')}</span>
              </label>
              <a href="#" className="text-sm text-primary dark:text-accent hover:underline">
                {t('forgot_password')}
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? t('logging_in') : t('login')}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
            {t('demo_credentials')} admin@audit.com / cliente@empresa.com (password)
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
