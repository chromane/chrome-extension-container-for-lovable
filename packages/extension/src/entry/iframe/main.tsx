import { createRoot } from 'react-dom/client';
import App from '@src/react/App';
import '@src/styles/global.css';
import '@src/css/App.css';
import ctrl_frame from '@src/ts/ctrl_frame';

ctrl_frame.init();

createRoot(document.getElementById('root')!).render(<App />);
