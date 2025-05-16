
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    // Check for system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Check for stored preference
    const storedTheme = localStorage.getItem('audit-ia-theme');
    
    // Set initial theme based on stored preference or system preference
    const initialTheme = storedTheme ? storedTheme === 'dark' : prefersDark;
    setIsDarkMode(initialTheme);
    
    if (initialTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newTheme = !prev;
      
      // Update DOM
      if (newTheme) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('audit-ia-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('audit-ia-theme', 'light');
      }
      
      return newTheme;
    });
  };

  return (
    <button
      className="w-10 h-10 p-2 rounded-full hover:bg-primary/10 dark:hover:bg-accent/10 transition-colors"
      onClick={toggleTheme}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}

export default ThemeToggle;
