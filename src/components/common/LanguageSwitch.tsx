
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const languages = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' }
];

export function LanguageSwitch() {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);
  
  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setCurrentLang(langCode);
  };
  
  return (
    <div className="flex space-x-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          className={`px-2 py-1 text-xs font-medium rounded ${
            currentLang === lang.code 
              ? 'bg-accent text-accent-foreground' 
              : 'bg-transparent hover:bg-primary/10 dark:hover:bg-accent/10'
          }`}
          onClick={() => changeLanguage(lang.code)}
          aria-label={`Switch to ${lang.code === 'es' ? 'Spanish' : 'English'}`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}

export default LanguageSwitch;
