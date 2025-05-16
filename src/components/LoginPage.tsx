import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';

// Define UserRole type matching App.tsx
type UserRole = 'admin' | 'client';

interface LoginFormData {
  email: string;
  password: string;
  role: UserRole; // Use UserRole type here
}

interface LoginPageProps {
  onLoginSuccess: (role: UserRole) => void;
}

function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    role: 'client' // Default role
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // Keep navigate for now, though App.tsx will handle redirection

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
      
      // Navigation will now be primarily driven by App.tsx state change,
      // but explicit navigation here can act as a fallback or quicker update.
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      // Ensure role is correctly typed when coming from radio buttons
      [name]: name === 'role' ? value as UserRole : value 
    }));
  };

  return (
    <div className="min-h-screen flex flex-row bg-gray-100 dark:bg-gray-900">
      {/* Left sidebar - Purple brand area */}
      <div className="hidden md:flex w-1/3 bg-deepIndigo flex-col justify-between">
        <div className="px-8 pt-12">
          <h1 className="text-4xl font-bold text-white">
            Auditoría<span className="text-lavenderMist">IA</span>
          </h1>
          <p className="mt-4 text-purpleTint text-lg">
            Plataforma inteligente de auditoría
          </p>
          <div className="mt-8 h-1 w-16 bg-purpleTint rounded"></div>
        </div>
        <div className="p-8">
          <p className="text-purpleTint text-sm">
            © 2023 AuditoríaIA. Todos los derechos reservados.
          </p>
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="w-full md:w-2/3 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="md:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-deepIndigo dark:text-purpleTint">
              Auditoría<span className="text-purpleTint dark:text-lavenderMist">IA</span>
            </h1>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
            Iniciar sesión
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg dark:bg-red-900 dark:text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="email">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deepIndigo dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="ejemplo@empresa.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deepIndigo dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <div>
              <div className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">Tipo de usuario</div>
              <div className="flex space-x-6">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="client"
                    checked={formData.role === 'client'}
                    onChange={handleChange}
                    className="form-radio text-deepIndigo focus:ring-deepIndigo"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Cliente</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === 'admin'}
                    onChange={handleChange}
                    className="form-radio text-deepIndigo focus:ring-deepIndigo"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Administrador</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-deepIndigo hover:bg-indigo-800 text-white font-medium rounded-lg shadow-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deepIndigo disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
            Para pruebas: admin@audit.com / cliente@empresa.com (contraseña: password)
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
