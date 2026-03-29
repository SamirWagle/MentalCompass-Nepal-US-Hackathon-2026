import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from '@hooks/useApp';
import { GlobalStyles } from '@styles/global';
import App from './App';

// Inject global styles
const styleSheet = document.createElement('style');
styleSheet.textContent = GlobalStyles;
document.head.appendChild(styleSheet);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>,
);
