import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Performance monitoring
if (typeof window !== 'undefined') {
  // Web Vitals tracking
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    function sendToAnalytics({ name, delta, value, id }: any) {
      // Send to analytics service
      console.log(`${name}: ${delta}ms`);
    }

    getCLS(sendToAnalytics);
    getFID(sendToAnalytics);
    getFCP(sendToAnalytics);
    getLCP(sendToAnalytics);
    getTTFB(sendToAnalytics);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);