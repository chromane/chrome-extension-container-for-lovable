import { createRoot } from 'react-dom/client';
import App from '@src/react/App';
import '@src/styles/global.css';
import '@src/css/App.css';

createRoot(document.getElementById('root')!).render(<App />);
