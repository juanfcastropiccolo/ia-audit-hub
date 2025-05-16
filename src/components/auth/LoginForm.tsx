
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

export function LoginForm() {
  const { t } = useTranslation();
  const { login, loading, error } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm" role="alert">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">
          {t('login.email')}
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder={t('login.email')}
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium">
          {t('login.password')}
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent pr-10"
            placeholder={t('login.password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm"
          >
            {showPassword ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
      </div>
      
      <button
        type="submit"
        className="btn-primary w-full"
        disabled={loading}
      >
        {loading ? t('login.loading') : t('login.submit')}
      </button>
      
      {/* Demo instructions for testing */}
      <div className="text-center mt-4 text-sm text-muted-foreground">
        <p>Demo admin: admin@example.com / password</p>
        <p>Demo cliente: client@example.com / password</p>
      </div>
    </form>
  );
}

export default LoginForm;
