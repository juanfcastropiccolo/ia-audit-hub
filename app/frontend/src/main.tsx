
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Check for user dark mode preference
const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme');

// Apply dark mode if user prefers it or has it saved
if (savedTheme === 'dark' || (savedTheme === null && userPrefersDark)) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
