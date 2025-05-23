// TEST PATCH
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../integrations/supabase/client';

type UserRole = 'admin' | 'client';

interface LoginPageProps {
  onLoginSuccess: (role: UserRole) => void;
}

function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { t } = useTranslation();
  const { signIn, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('/logo.png');
  const navigate = useNavigate();

  // Fetch logo URL from Supabase Storage with proper error handling
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        // First try to get the logo from pictures bucket
        const { data: publicUrl } = supabase
          .storage
          .from('pictures')
          .getPublicUrl('trimmed_logo.png');
        
        if (publicUrl?.publicUrl) {
          setLogoUrl(publicUrl.publicUrl + '?v=' + new Date().getTime());
          console.log('Using Supabase logo from URL:', publicUrl.publicUrl);
          return;
        }
        
        // If no public URL, use the local logo as fallback
        console.log('No Supabase URL found, using local logo as fallback');
      } catch (error) {
        console.error('Error fetching logo from Supabase:', error);
        // Keep using local logo as fallback
      }
    };

    fetchLogo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        setError(error.message || t('invalidCredentials'));
      } else {
        try {
          // Fetch current session to get user ID
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          const userId = sessionData?.session?.user?.id;
          let role: UserRole = 'client';
          if (userId) {
            // Fetch role from users table
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('role')
              .eq('id', userId)
              .single();
            if (!profileError && profile?.role) {
              role = profile.role as UserRole;
            }
            // Store user info in localStorage
            localStorage.setItem('user', JSON.stringify({ id: userId, email: formData.email, role }));
          }
          onLoginSuccess(role);
          // Redirect based on role
          if (role === 'admin') {
            navigate('/admin/clients');
          } else {
            navigate('/chat');
          }
        } catch (fetchErr) {
          console.error('Error retrieving user role:', fetchErr);
          // Fallback redirect
          onLoginSuccess('client');
          navigate('/chat');
        }
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
    <div className="w-screen h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left side - Brand panel with gradient */}
      <div className="hidden md:flex md:flex-col md:w-1/2 relative bg-gradient-to-br from-indigo via-purple to-lavender">
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[50%] rounded-full bg-purple/20 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full bg-softYellow/20 blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-6 md:p-10 h-full">
          <div className="flex items-center">
            <img 
              src={logoUrl} 
              alt="AUDIT-IA Logo" 
              className="h-10 md:h-16 w-auto max-w-[160px] object-contain"
              aria-label="AUDIT-IA company logo"
              onError={(e) => {
                console.error('Error loading logo from Supabase, falling back to local logo');
                e.currentTarget.onerror = null; // Prevent infinite error loops
                setLogoUrl('/logo.png');
              }}
            />
          </div>
          
          <div className="z-10 flex flex-col space-y-4 md:space-y-6">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
              {t('ai_audit_platform')}
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-100 max-w-full">
              {t('ai_audit_description')}
            </p>
            <div className="h-1 w-20 bg-softYellow rounded"></div>
          </div>
          
          <div className="z-10 text-gray-200 text-sm">
            © {new Date().getFullYear()} AUDIT-IA
          </div>
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 bg-white dark:bg-gray-900">
        {/* Logo for mobile view only */}
        <div className="md:hidden absolute top-0 left-0 w-full flex justify-center py-6">
          <img 
            src={logoUrl} 
            alt="AUDIT-IA Logo" 
            className="h-12 w-auto object-contain"
            aria-label="AUDIT-IA company logo - mobile view"
            onError={(e) => {
              console.error('Error loading logo from Supabase, falling back to local logo');
              e.currentTarget.onerror = null; // Prevent infinite error loops
              setLogoUrl('/logo.png');
            }}
          />
        </div>

        <div className="w-full max-w-md p-4 sm:p-6 rounded-xl transition-all duration-300 
                      border border-gray-100 dark:border-gray-800 
                      shadow-xl dark:shadow-2xl dark:shadow-gray-900/30
                      bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm
                      md:mt-0 mt-16">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-indigo dark:text-lavender">
              {t('welcome_back')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {t('login_to_continue')}
            </p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-softYellow/20 border-l-4 border-softYellow text-indigo dark:bg-softYellow/10 dark:text-softYellow rounded">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="email">
                {t('email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MailIcon size={18} className="text-gray-400 group-hover:text-indigo transition-colors duration-200" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg 
                          focus:ring-2 focus:ring-indigo focus:border-indigo 
                          dark:bg-gray-800/50 dark:border-gray-700 dark:text-white dark:focus:ring-purple
                          transition-colors duration-200"
                  placeholder="name@company.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="group">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">
                  {t('password')}
                </label>
                <a href="#" className="text-xs text-indigo hover:text-indigo/80 dark:text-purple dark:hover:text-purple/80 hover:underline transition-colors duration-200">
                  {t('forgot_password')}
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon size={18} className="text-gray-400 group-hover:text-indigo transition-colors duration-200" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg 
                          focus:ring-2 focus:ring-indigo focus:border-indigo 
                          dark:bg-gray-800/50 dark:border-gray-700 dark:text-white dark:focus:ring-purple
                          transition-colors duration-200"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button 
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-300"
                >
                  {showPassword ? 
                    <EyeOffIcon size={18} className="text-gray-400 hover:text-gray-600 transition-colors duration-200" /> : 
                    <EyeIcon size={18} className="text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                  }
                </button>
              </div>
            </div>

            <div className="pt-1 space-y-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('role_selection')}</div>
              <div className="flex space-x-3">
                <label className="relative flex items-center bg-gray-50 dark:bg-gray-800/50 px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer w-1/2 
                              transition-all hover:border-indigo dark:hover:border-purple hover:shadow-md">
                  <input
                    type="radio"
                    name="role"
                    value="client"
                    checked={formData.role === 'client'}
                    onChange={handleChange}
                    className="form-radio text-indigo focus:ring-indigo mr-1"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('role_client')}</span>
                </label>
                <label className="relative flex items-center bg-gray-50 dark:bg-gray-800/50 px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer w-1/2 
                              transition-all hover:border-indigo dark:hover:border-purple hover:shadow-md">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === 'admin'}
                    onChange={handleChange}
                    className="form-radio text-indigo focus:ring-indigo mr-1"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('role_admin')}</span>
                </label>
              </div>
            </div>

            <div className="flex items-center">
              <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors 
                          bg-gray-200 dark:bg-gray-700 cursor-pointer"
                   onClick={() => handleChange({
                     target: {
                       name: 'remember',
                       type: 'checkbox',
                       checked: !formData.remember
                     }
                   } as React.ChangeEvent<HTMLInputElement>)}>
                <span className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform
                              ${formData.remember ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer" 
                    onClick={() => handleChange({
                      target: {
                        name: 'remember',
                        type: 'checkbox',
                        checked: !formData.remember
                      }
                    } as React.ChangeEvent<HTMLInputElement>)}>
                {t('remember_me')}
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center py-2 px-4 
                      bg-indigo hover:bg-indigo/90 text-white font-medium rounded-lg 
                      shadow transition duration-150 ease-in-out 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo 
                      disabled:opacity-50 hover:shadow-lg transform hover:-translate-y-0.5"
              disabled={isLoading || authLoading}
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
