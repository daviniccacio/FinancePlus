// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 🌟 O Toaster no nível principal garante que ele nunca desmonta durante carregamentos ou trocas de página */}
      <Toaster 
        position="bottom-right" 
        gutter={8}
        toastOptions={{ duration: 3500 }} 
      />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);