import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom'; // ✅ import ajouté

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* ✅ Ajout du BrowserRouter avec basename */}
    <BrowserRouter basename="/bac2street">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
