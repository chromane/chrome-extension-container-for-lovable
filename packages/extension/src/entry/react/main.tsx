import { createRoot } from 'react-dom/client';
import App from './App';
// import '@src/css/tailwind.css';
import '@src/styles/global.css';
import './App.css';

createRoot(document.getElementById('root')!).render(<App />);
